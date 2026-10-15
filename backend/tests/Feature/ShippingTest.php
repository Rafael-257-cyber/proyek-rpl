<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Mockery;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use Tests\TestCase;

class ShippingTest extends TestCase
{
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        config(['rajaongkir.api_key' => 'test-key', 'rajaongkir.origin_id' => 70289,
            'rajaongkir.base_url' => 'https://rajaongkir.komerce.id/api/v1', 'rajaongkir.couriers' => ['jne']]);
        Http::preventStrayRequests();
        Mail::fake();
        $this->actingAs(User::factory()->create());
        $category = Category::create(['name' => 'Reel']);
        $this->product = Product::create(['category_id' => $category->id, 'name' => 'Test Reel',
            'description' => 'Test product', 'price' => 25000, 'stock' => 10, 'weight_grams' => 400]);
    }

    private function payload(): array
    {
        return ['destination_id' => 69243, 'courier' => 'jne',
            'items' => [['product_id' => $this->product->id, 'quantity' => 2]]];
    }

    private function provider(array $data = [], int $status = 200): void
    {
        Http::fake(['*' => Http::response(['meta' => ['code' => $status], 'data' => $data], $status)]);
    }

    private function rates(): array
    {
        return [['code' => 'jne', 'name' => 'JNE', 'service' => 'REG', 'cost' => 9000, 'etd' => '3 day']];
    }

    private function checkout(): array
    {
        return ['items' => $this->payload()['items'], 'shipping_name' => 'Tester', 'shipping_phone' => '0800000000',
            'shipping_address' => 'Test Street', 'shipping_city' => 'Surabaya', 'payment_method' => 'transfer',
            'shipping_destination_id' => 69243, 'shipping_cost' => 9000, 'shipping_courier' => 'jne',
            'shipping_service' => 'REG', 'shipping_estimate' => 'fake estimate'];
    }

    public function test_destination_search_uses_backend_key(): void
    {
        $this->provider([['id' => 69243, 'label' => 'GUBENG, SURABAYA']]);
        $this->getJson('/api/shipping/destinations?search=Gubeng')->assertOk()->assertJsonPath('data.0.id', 69243);
        Http::assertSent(fn ($request) => $request->hasHeader('key', 'test-key') && $request['search'] === 'Gubeng');
    }

    public function test_weight_is_computed_from_database_not_client(): void
    {
        $this->provider($this->rates());
        $this->postJson('/api/shipping/rates', $this->payload() + ['weight' => 1])
            ->assertOk()->assertJsonPath('weight_grams', 800)->assertJsonPath('rates.0.cost', 9000);
        Http::assertSent(fn ($request) => (int) $request['weight'] === 800 && (int) $request['origin'] === 70289);
    }

    public function test_missing_weight_is_rejected_without_provider_call(): void
    {
        $this->product->update(['weight_grams' => null]);
        $this->postJson('/api/shipping/rates', $this->payload())->assertUnprocessable()->assertJsonValidationErrors('items');
        Http::assertNothingSent();
    }

    public function test_provider_failure_never_falls_back_to_zero_shipping(): void
    {
        $this->provider([], 500);
        $this->postJson('/api/shipping/rates', $this->payload())->assertStatus(502)->assertJsonMissingPath('rates');
        $this->assertSame(0, Order::count());
    }

    public function test_empty_services_stay_empty(): void
    {
        $this->provider([]);
        $this->postJson('/api/shipping/rates', $this->payload())->assertOk()->assertJsonCount(0, 'rates');
    }

    public function test_admin_form_update_persists_weight_and_returns_it_on_reload(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->post('/api/admin/products/'.$this->product->id, ['_method' => 'PUT', 'weight_grams' => '750'], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('product.weight_grams', 750);
        $this->assertSame(750, $this->product->fresh()->weight_grams);
        $this->getJson('/api/admin/products/'.$this->product->id)->assertOk()->assertJsonPath('product.weight_grams', 750);
    }

    public function test_empty_admin_update_does_not_report_success(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->putJson('/api/admin/products/'.$this->product->id, [])->assertUnprocessable();
        $this->assertSame(400, $this->product->fresh()->weight_grams);
    }

    public function test_admin_update_rejects_zero_weight(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->post('/api/admin/products/'.$this->product->id, ['_method' => 'PUT', 'weight_grams' => '0'], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('weight_grams');
        $this->assertSame(400, $this->product->fresh()->weight_grams);
    }

    public function test_duplicate_items_and_unsupported_couriers_are_rejected(): void
    {
        $payload = $this->payload();
        $payload['items'][] = $payload['items'][0];
        $this->postJson('/api/shipping/rates', $payload)->assertUnprocessable();
        $payload = $this->payload();
        $payload['courier'] = 'fake';
        $this->postJson('/api/shipping/rates', $payload)->assertUnprocessable();
        Http::assertNothingSent();
    }

    public function test_checkout_rejects_manipulated_shipping_without_changing_stock(): void
    {
        $this->provider($this->rates());
        $payload = $this->checkout();
        $payload['shipping_cost'] = 1;
        $this->postJson('/api/orders/checkout', $payload)->assertUnprocessable()->assertJsonValidationErrors('shipping_cost');
        $this->assertSame(0, Order::count());
        $this->assertSame(10, $this->product->fresh()->stock);
    }

    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function test_checkout_saves_verified_shipping_and_uses_correct_midtrans_total(): void
    {
        $this->provider($this->rates());
        Mockery::mock('alias:Midtrans\Snap')->shouldReceive('getSnapToken')->once()->withArgs(
            fn ($params) => $params['transaction_details']['gross_amount'] === 59000
        )->andReturn('test-snap-token');
        $this->postJson('/api/orders/checkout', $this->checkout())->assertCreated()
            ->assertJsonPath('order.shipping_destination_id', 69243)
            ->assertJsonPath('order.shipping_weight_grams', 800)
            ->assertJsonPath('order.shipping_estimate', '3 day');
        $this->assertEquals(59000, Order::firstOrFail()->total_price);
        $this->assertSame(8, $this->product->fresh()->stock);
    }
}
