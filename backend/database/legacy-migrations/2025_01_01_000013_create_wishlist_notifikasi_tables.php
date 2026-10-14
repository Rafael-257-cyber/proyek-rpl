<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishlist', function (Blueprint $table) {
            $table->id('id_wishlist');
            $table->unsignedBigInteger('id_pelanggan');
            $table->unsignedBigInteger('kode_produk');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['id_pelanggan', 'kode_produk']);

            $table->foreign('id_pelanggan')
                  ->references('id_pelanggan')->on('pelanggan')
                  ->onDelete('cascade');

            $table->foreign('kode_produk')
                  ->references('kode_produk')->on('produk')
                  ->onDelete('cascade');
        });

        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id('id_notif');
            $table->enum('tipe_user', ['pelanggan', 'admin']);
            $table->unsignedBigInteger('id_user');
            $table->string('judul', 100);
            $table->text('pesan');
            $table->string('url_target', 255)->nullable();
            $table->tinyInteger('is_read')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
        Schema::dropIfExists('wishlist');
    }
};
