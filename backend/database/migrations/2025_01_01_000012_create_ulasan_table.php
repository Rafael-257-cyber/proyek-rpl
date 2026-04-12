<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ulasan', function (Blueprint $table) {
            $table->id('id_ulasan');
            $table->unsignedBigInteger('id_pelanggan');
            $table->unsignedBigInteger('kode_produk');
            $table->unsignedBigInteger('id_order')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->text('komentar')->nullable();
            $table->timestamp('tanggal')->useCurrent();

            // Satu pelanggan hanya bisa ulasan sekali per produk
            $table->unique(['id_pelanggan', 'kode_produk']);

            $table->foreign('id_pelanggan')
                  ->references('id_pelanggan')->on('pelanggan')
                  ->onDelete('cascade');

            $table->foreign('kode_produk')
                  ->references('kode_produk')->on('produk')
                  ->onDelete('cascade');

            $table->foreign('id_order')
                  ->references('id_order')->on('orders')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ulasan');
    }
};
