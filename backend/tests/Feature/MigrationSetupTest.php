<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigrationSetupTest extends TestCase
{
    public function test_empty_database_migrates_seeds_repeatedly_and_rolls_back(): void
    {
        $this->assertSame('sqlite', DB::getDriverName());
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        $this->artisan('db:seed', ['--force' => true])->assertExitCode(0);

        $user = User::where('email', 'admin@example.com')->firstOrFail();
        $user->update(['name' => 'Existing Admin', 'password' => 'changed-password']);
        $password = $user->fresh()->password;
        $product = Product::create([
            'category_id' => Category::firstOrFail()->id, 'name' => 'Test Rod',
            'description' => 'Migration test', 'price' => 25000, 'stock' => 3,
        ]);
        $this->artisan('db:seed', ['--force' => true])->assertExitCode(0);
        $this->artisan('db:seed', ['--force' => true])->assertExitCode(0);
        $this->assertSame(2, User::count());
        $this->assertSame(5, Category::count());
        $this->assertSame(3, DB::table('promos')->count());
        $this->assertSame(1, DB::table('product_promo')->count());
        $this->assertSame('Existing Admin', $user->fresh()->name);
        $this->assertSame($password, $user->fresh()->password);

        $order = Order::create([
            'user_id' => $user->id, 'total_price' => 25000, 'payment_method' => 'qris',
            'shipping_name' => 'Tester', 'shipping_address' => 'Test Street',
            'shipping_city' => 'Jakarta', 'shipping_phone' => '0800000000',
            'snap_token' => 'test-token', 'midtrans_order_id' => 'INV-test',
        ]);
        OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => 1, 'price' => 25000]);
        $this->assertSame($product->id, $order->items()->firstOrFail()->product->id);
        $this->assertTrue(Schema::hasColumns('ratings', ['order_item_id', 'image']));
        $this->assertFalse(Schema::hasTable('pelanggan'));
        $this->assertFalse(Schema::hasTable('detail_orders'));
        $this->artisan('migrate:reset', ['--force' => true])->assertExitCode(0);
        $this->assertFalse(Schema::hasTable('orders'));
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        $this->assertTrue(Schema::hasColumns('orders', ['id', 'midtrans_order_id', 'shipping_name']));
    }
}
