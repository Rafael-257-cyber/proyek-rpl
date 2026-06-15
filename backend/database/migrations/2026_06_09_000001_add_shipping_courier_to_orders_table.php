<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'shipping_courier')) {
                $table->string('shipping_courier', 100)->nullable()->after('ongkir');
            }
            if (!Schema::hasColumn('orders', 'shipping_service')) {
                $table->string('shipping_service', 100)->nullable()->after('shipping_courier');
            }
            if (!Schema::hasColumn('orders', 'shipping_estimate')) {
                $table->string('shipping_estimate', 100)->nullable()->after('shipping_service');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'shipping_estimate')) {
                $table->dropColumn('shipping_estimate');
            }
            if (Schema::hasColumn('orders', 'shipping_service')) {
                $table->dropColumn('shipping_service');
            }
            if (Schema::hasColumn('orders', 'shipping_courier')) {
                $table->dropColumn('shipping_courier');
            }
        });
    }
};
