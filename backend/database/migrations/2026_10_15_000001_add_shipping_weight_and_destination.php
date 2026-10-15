<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('weight_grams')->nullable();
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('shipping_destination_id')->nullable();
            $table->unsignedInteger('shipping_weight_grams')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_destination_id', 'shipping_weight_grams']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('weight_grams');
        });
    }
};
