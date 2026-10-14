<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('total_price', 12, 2);
            $table->enum('status', ['pending_payment', 'pending_verification', 'payment_confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending_payment');
            $table->enum('payment_method', ['transfer', 'cod', 'ewallet', 'bank_transfer', 'credit_card', 'qris', 'midtrans'])->default('transfer');
            $table->string('payment_proof')->nullable();
            $table->text('shipping_address');
            $table->string('shipping_city');
            $table->string('shipping_phone');
            $table->string('tracking_number')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
