<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produk', function (Blueprint $table) {
            $table->id('kode_produk');
            $table->string('nama_produk', 100);
            $table->unsignedBigInteger('id_kategori')->nullable();
            $table->decimal('harga', 15, 2)->default(0);
            $table->integer('stok')->default(0);
            $table->text('deskripsi')->nullable();
            $table->string('gambar', 255)->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            // Spesifikasi teknis untuk filter lanjutan (sesuai SKPL)
            $table->enum('lokasi_mancing', ['air_tawar', 'air_laut', 'kolam', 'semua'])
                  ->default('semua');
            $table->decimal('berat_g', 8, 2)->nullable();
            $table->decimal('panjang_cm', 8, 2)->nullable();
            $table->timestamps();

            $table->foreign('id_kategori')
                  ->references('id_kategori')->on('kategori')
                  ->onDelete('set null')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk');
    }
};
