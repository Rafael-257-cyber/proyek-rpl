<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('id_order');
            $table->unsignedBigInteger('id_pelanggan');
            $table->unsignedBigInteger('id_alamat')->nullable();
            $table->decimal('total_harga', 15, 2)->default(0);
            $table->decimal('ongkir', 15, 2)->default(0);
            $table->enum('status', [
                'menunggu',
                'diproses',
                'dikirim',
                'selesai',
                'ditolak',
            ])->default('menunggu');
            $table->string('metode_bayar', 50)->default('transfer');
            $table->string('bukti_bayar', 255)->nullable();
            $table->string('no_resi', 100)->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->foreign('id_pelanggan')
                  ->references('id_pelanggan')->on('pelanggan')
                  ->onDelete('cascade');

            $table->foreign('id_alamat')
                  ->references('id_alamat')->on('alamat_pelanggan')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
