<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_orders', function (Blueprint $table) {
            $table->id('id_detail_order');
            $table->unsignedBigInteger('id_order');
            $table->unsignedBigInteger('kode_produk');
            // Snapshot nama & harga saat checkout agar tidak berubah jika produk diedit
            $table->string('nama_produk', 100);
            $table->decimal('harga_satuan', 15, 2);
            $table->unsignedInteger('jumlah')->default(1);
            $table->decimal('subtotal', 15, 2)->default(0);

            $table->foreign('id_order')
                  ->references('id_order')->on('orders')
                  ->onDelete('cascade');

            $table->foreign('kode_produk')
                  ->references('kode_produk')->on('produk')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_orders');
    }
};
