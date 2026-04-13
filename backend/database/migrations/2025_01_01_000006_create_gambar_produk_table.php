<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gambar_produk', function (Blueprint $table) {
            $table->id('id_gambar');
            $table->unsignedBigInteger('kode_produk');
            $table->string('path_gambar', 255);
            $table->unsignedTinyInteger('urutan')->default(0)
                  ->comment('0 = foto utama');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('kode_produk')
                  ->references('kode_produk')->on('produk')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gambar_produk');
    }
};
