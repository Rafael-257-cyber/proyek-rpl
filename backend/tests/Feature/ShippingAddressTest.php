<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Tests\TestCase;

class ShippingAddressTest extends TestCase
{
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        $this->user = User::factory()->create();
    }

    private function address(): array
    {
        return [
            'shipping_name' => 'Penerima Tes', 'shipping_phone' => '081234567890',
            'shipping_address' => 'Jalan Contoh No. 10',
            'destination' => ['id' => 69243, 'label' => 'GUBENG, GUBENG, SURABAYA, JAWA TIMUR, 60281',
                'city_name' => 'SURABAYA', 'district_name' => 'GUBENG', 'zip_code' => '60281'],
        ];
    }

    public function test_guests_cannot_read_or_save_addresses(): void
    {
        $this->getJson('/api/shipping/addresses')->assertUnauthorized();
        $this->postJson('/api/shipping/addresses', $this->address())->assertUnauthorized();
    }

    public function test_address_is_saved_with_destination_and_survives_reload(): void
    {
        $this->actingAs($this->user);
        $data = $this->address();
        $data['user_id'] = 999;
        $id = $this->postJson('/api/shipping/addresses', $data)->assertCreated()
            ->assertJsonPath('address.shipping_city', 'SURABAYA')->json('address.id');
        $this->getJson('/api/shipping/addresses')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.destination.id', 69243)
            ->assertJsonPath('data.0.shipping_name', $data['shipping_name'])
            ->assertJsonPath('data.0.shipping_phone', $data['shipping_phone'])
            ->assertJsonPath('data.0.shipping_address', $data['shipping_address'])
            ->assertJsonMissingPath('data.0.fingerprint');
        $this->assertDatabaseHas('shipping_addresses', ['id' => $id, 'user_id' => $this->user->id]);
    }

    public function test_repeated_save_does_not_duplicate_address(): void
    {
        $this->actingAs($this->user);
        $this->postJson('/api/shipping/addresses', $this->address())->assertCreated();
        $this->postJson('/api/shipping/addresses', $this->address())->assertOk();
        $this->assertSame(1, $this->user->shippingAddresses()->count());
    }

    public function test_another_account_cannot_list_edit_or_delete_address(): void
    {
        $this->actingAs($this->user);
        $id = $this->postJson('/api/shipping/addresses', $this->address())->json('address.id');
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/shipping/addresses')->assertOk()->assertJsonCount(0, 'data');
        $this->putJson('/api/shipping/addresses/'.$id, $this->address())->assertNotFound();
        $this->deleteJson('/api/shipping/addresses/'.$id)->assertNotFound();
        $this->assertDatabaseHas('shipping_addresses', ['id' => $id, 'user_id' => $this->user->id]);
    }

    public function test_owner_can_update_and_delete_address(): void
    {
        $this->actingAs($this->user);
        $id = $this->postJson('/api/shipping/addresses', $this->address())->json('address.id');
        $data = $this->address();
        $data['shipping_phone'] = '089999999999';
        $this->putJson('/api/shipping/addresses/'.$id, $data)->assertOk()->assertJsonPath('address.shipping_phone', '089999999999');
        $this->deleteJson('/api/shipping/addresses/'.$id)->assertNoContent();
        $this->assertDatabaseMissing('shipping_addresses', ['id' => $id]);
    }

    public function test_destination_is_required_to_save_address(): void
    {
        $this->actingAs($this->user);
        $data = $this->address();
        unset($data['destination']);
        $this->postJson('/api/shipping/addresses', $data)->assertUnprocessable()->assertJsonValidationErrors('destination');
    }

    public function test_only_own_previous_orders_are_available_and_duplicates_are_collapsed(): void
    {
        $data = $this->address();
        $attributes = [
            'shipping_name' => $data['shipping_name'], 'shipping_phone' => $data['shipping_phone'],
            'shipping_address' => $data['shipping_address'], 'shipping_city' => 'SURABAYA',
            'shipping_destination_id' => 69243, 'total_price' => 10000,
        ];
        Order::create($attributes + ['user_id' => $this->user->id]);
        Order::create($attributes + ['user_id' => $this->user->id]);
        Order::create($attributes + ['user_id' => User::factory()->create()->id]);
        $this->actingAs($this->user);
        $this->getJson('/api/shipping/addresses')->assertOk()->assertJsonCount(1, 'recent')->assertJsonPath('recent.0.destination.id', 69243);
        $this->postJson('/api/shipping/addresses', $data)->assertCreated();
        $this->getJson('/api/shipping/addresses')->assertOk()->assertJsonCount(0, 'recent')->assertJsonCount(1, 'data');
    }
}
