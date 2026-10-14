<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Mockery;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use Tests\TestCase;

class PaymentSessionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('password');
            $table->timestamps();
        });
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->decimal('total_price', 15, 2);
            $table->string('status');
            $table->string('payment_status');
            $table->string('midtrans_order_id')->nullable();
            $table->string('snap_token');
            $table->timestamps();
        });
    }

    private function order(): Order
    {
        $user = User::create(['name' => 'Tester', 'email' => 'tester@example.com', 'password' => 'password']);
        $this->actingAs($user);
        return Order::create(['user_id' => $user->id, 'total_price' => 25000, 'status' => 'pending_payment', 'payment_status' => 'pending', 'snap_token' => 'old-token']);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_pending_session_uses_new_invoice_and_cancels_old_attempt(): void
    {
        $order = $this->order();
        $transaction = Mockery::mock('alias:Midtrans\Transaction');
        $transaction->shouldReceive('status')->once()->with('INV-'.$order->id)->andReturn((object) ['transaction_status' => 'pending', 'order_id' => 'INV-'.$order->id, 'gross_amount' => '25000.00']);
        $transaction->shouldReceive('cancel')->once()->with('INV-'.$order->id)->andReturn('200');
        Mockery::mock('alias:Midtrans\Snap')->shouldReceive('getSnapToken')->once()->withArgs(function ($params) use ($order) {
            return preg_match('/^INV-'.$order->id.'-[a-f0-9]{16}$/', $params['transaction_details']['order_id']) && $params['transaction_details']['gross_amount'] === 25000;
        })->andReturn('new-token');
        $this->postJson('/api/orders/'.$order->id.'/payment-session')->assertOk()->assertJsonPath('snap_token', 'new-token');
        $this->assertSame('new-token', $order->fresh()->snap_token);
        $this->assertStringStartsWith('INV-'.$order->id.'-', $order->fresh()->midtrans_order_id);
        $this->assertSame(1, Order::count());
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_midtrans_paid_transaction_cannot_be_restarted(): void
    {
        $order = $this->order();
        Mockery::mock('alias:Midtrans\Transaction')->shouldReceive('status')->once()->andReturn((object) ['transaction_status' => 'settlement', 'order_id' => 'INV-'.$order->id, 'gross_amount' => '25000.00']);
        Mockery::mock('alias:Midtrans\Snap')->shouldNotReceive('getSnapToken');
        $this->postJson('/api/orders/'.$order->id.'/payment-session')->assertStatus(409);
        $this->assertSame('old-token', $order->fresh()->snap_token);
    }

    public function test_other_users_cannot_renew_order(): void
    {
        $order = $this->order();
        $other = User::create(['name' => 'Other', 'email' => 'other@example.com', 'password' => 'password']);
        $this->actingAs($other)->postJson('/api/orders/'.$order->id.'/payment-session')->assertNotFound();
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_token_failure_keeps_existing_payment_usable(): void
    {
        $order = $this->order();
        $transaction = Mockery::mock('alias:Midtrans\Transaction');
        $transaction->shouldReceive('status')->once()->andReturn((object) ['transaction_status' => 'pending', 'order_id' => 'INV-'.$order->id, 'gross_amount' => '25000.00']);
        $transaction->shouldNotReceive('cancel');
        Mockery::mock('alias:Midtrans\Snap')->shouldReceive('getSnapToken')->once()->andThrow(new \Exception('Unavailable', 500));
        $this->postJson('/api/orders/'.$order->id.'/payment-session')->assertStatus(502);
        $this->assertSame('old-token', $order->fresh()->snap_token);
        $this->assertNull($order->fresh()->midtrans_order_id);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_cancellation_failure_does_not_expose_second_payment(): void
    {
        $order = $this->order();
        $transaction = Mockery::mock('alias:Midtrans\Transaction');
        $transaction->shouldReceive('status')->once()->andReturn((object) ['transaction_status' => 'pending', 'order_id' => 'INV-'.$order->id, 'gross_amount' => '25000.00']);
        $transaction->shouldReceive('cancel')->once()->andThrow(new \Exception('Already settled', 412));
        Mockery::mock('alias:Midtrans\Snap')->shouldReceive('getSnapToken')->once()->andReturn('unexposed-token');
        $this->postJson('/api/orders/'.$order->id.'/payment-session')->assertStatus(502)->assertJsonMissing(['snap_token' => 'unexposed-token']);
        $this->assertSame('old-token', $order->fresh()->snap_token);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_snap_transaction_id_confirms_verified_payment(): void
    {
        $order = $this->order();
        Mockery::mock('alias:Midtrans\Transaction')->shouldReceive('status')->once()->with('transaction-uuid')->andReturn((object) [
            'order_id' => 'INV-'.$order->id, 'gross_amount' => '25000.00', 'transaction_status' => 'settlement',
        ]);
        $this->postJson('/api/orders/'.$order->id.'/sync', ['transaction_id' => 'transaction-uuid'])
            ->assertOk()->assertJsonPath('order.payment_status', 'paid')->assertJsonPath('order.status', 'processing');
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_unrelated_transaction_cannot_confirm_payment(): void
    {
        $order = $this->order();
        Mockery::mock('alias:Midtrans\Transaction')->shouldReceive('status')->once()->andReturn((object) [
            'order_id' => 'INV-999', 'gross_amount' => '25000.00', 'transaction_status' => 'settlement',
        ]);
        $this->postJson('/api/orders/'.$order->id.'/sync', ['transaction_id' => 'other-transaction'])->assertStatus(409);
        $this->assertSame('pending', $order->fresh()->payment_status);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_unverified_client_success_does_not_mark_order_paid(): void
    {
        \Illuminate\Support\Facades\Http::fake(['*' => \Illuminate\Support\Facades\Http::response([], 404)]);
        $order = $this->order();
        Mockery::mock('alias:Midtrans\Transaction')->shouldReceive('status')->once()->andThrow(new \Exception('Not found', 404));
        $this->postJson('/api/orders/'.$order->id.'/sync', ['transaction_status' => 'settlement'])->assertStatus(502);
        $this->assertSame('pending', $order->fresh()->payment_status);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_snap_server_status_confirms_payment_when_core_returns_404(): void
    {
        $order = $this->order();
        Mockery::mock('alias:Midtrans\Transaction')->shouldReceive('status')->once()->andThrow(new \Exception('Not found', 404));
        \Illuminate\Support\Facades\Http::fake([
            'https://app.sandbox.midtrans.com/snap/v1/transactions/old-token/status' => \Illuminate\Support\Facades\Http::response([
                'order_id' => 'INV-'.$order->id, 'gross_amount' => '25000.00', 'transaction_status' => 'settlement',
            ]),
        ]);
        $this->postJson('/api/orders/'.$order->id.'/sync')->assertOk()->assertJsonPath('order.payment_status', 'paid');
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_snap_fallback_rejects_wrong_payment_amount(): void
    {
        $order = $this->order();
        Mockery::mock('alias:Midtrans\Transaction')->shouldReceive('status')->once()->andThrow(new \Exception('Not found', 404));
        \Illuminate\Support\Facades\Http::fake([
            '*' => \Illuminate\Support\Facades\Http::response([
                'order_id' => 'INV-'.$order->id, 'gross_amount' => '1.00', 'transaction_status' => 'settlement',
            ]),
        ]);
        $this->postJson('/api/orders/'.$order->id.'/sync')->assertStatus(409);
        $this->assertSame('pending', $order->fresh()->payment_status);
    }
}
