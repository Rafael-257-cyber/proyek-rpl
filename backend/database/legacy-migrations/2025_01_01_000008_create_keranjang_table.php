<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('keranjang', function (Blueprint $table) {
            $table->id('id_keranjang');
            $table->unsignedBigInteger('id_pelanggan');
            $table->unsignedBigInteger('kode_produk');
            $table->unsignedInteger('jumlah')->default(1);
            $table->timestamps();

            // Satu pelanggan hanya boleh punya satu baris per produk
            $table->unique(['id_pelanggan', 'kode_produk']);

            $table->foreign('id_pelanggan')
                  ->references('id_pelanggan')->on('pelanggan')
                  ->onDelete('cascade');

            $table->foreign('kode_produk')
                  ->references('kode_produk')->on('produk')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keranjang');
    }
};
