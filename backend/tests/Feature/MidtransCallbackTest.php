<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MidtransCallbackTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['midtrans.server_key' => 'test-server-key']);
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->decimal('total_price', 15, 2);
            $table->string('status');
            $table->string('payment_status');
            $table->string('midtrans_order_id')->nullable();
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('orders');
        parent::tearDown();
    }

    private function payload(Order $order, string $status = 'settlement'): array
    {
        $payload = [
            'order_id' => 'INV-'.$order->id,
            'status_code' => '200',
            'gross_amount' => '25000.00',
            'transaction_status' => $status,
        ];
        $payload['signature_key'] = hash('sha512', $payload['order_id'].'20025000.00test-server-key');
        return $payload;
    }

    private function order(): Order
    {
        return Order::create(['total_price' => 25000, 'status' => 'pending_payment', 'payment_status' => 'pending']);
    }

    public function test_settlement_updates_order_using_prefixed_id(): void
    {
        $order = $this->order();
        $this->postJson('/api/midtrans/callback', $this->payload($order))->assertOk();
        $this->assertSame('paid', $order->fresh()->payment_status);
        $this->assertSame('processing', $order->fresh()->status);
    }

    public function test_invalid_signature_does_not_mark_order_paid(): void
    {
        $order = $this->order();
        $payload = $this->payload($order);
        $payload['signature_key'] = 'invalid';
        $this->postJson('/api/midtrans/callback', $payload)->assertForbidden();
        $this->assertSame('pending', $order->fresh()->payment_status);
    }

    public function test_repeated_and_delayed_notifications_preserve_shipping_progress(): void
    {
        $order = $this->order();
        $order->update(['status' => 'shipped', 'payment_status' => 'paid']);
        foreach (['settlement', 'pending', 'expire'] as $status) {
            $this->postJson('/api/midtrans/callback', $this->payload($order, $status))->assertOk();
        }
        $this->assertSame('paid', $order->fresh()->payment_status);
        $this->assertSame('shipped', $order->fresh()->status);
    }

    public function test_malformed_notification_is_rejected(): void
    {
        $this->postJson('/api/midtrans/callback', [])->assertUnprocessable();
    }

    public function test_old_cancellation_does_not_cancel_replacement_session(): void
    {
        $order = $this->order();
        $order->update(['midtrans_order_id' => 'INV-'.$order->id.'-0123456789abcdef']);
        $this->postJson('/api/midtrans/callback', $this->payload($order, 'cancel'))->assertOk();
        $this->assertSame('pending', $order->fresh()->payment_status);
        $this->assertSame('pending_payment', $order->fresh()->status);
    }

    public function test_replacement_invoice_can_confirm_payment(): void
    {
        $order = $this->order();
        $invoice = 'INV-'.$order->id.'-0123456789abcdef';
        $order->update(['midtrans_order_id' => $invoice]);
        $payload = $this->payload($order);
        $payload['order_id'] = $invoice;
        $payload['signature_key'] = hash('sha512', $invoice.'20025000.00test-server-key');
        $this->postJson('/api/midtrans/callback', $payload)->assertOk();
        $this->assertSame('paid', $order->fresh()->payment_status);
    }
}
