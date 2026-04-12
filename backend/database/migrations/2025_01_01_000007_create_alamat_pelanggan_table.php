<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alamat_pelanggan', function (Blueprint $table) {
            $table->id('id_alamat');
            $table->unsignedBigInteger('id_pelanggan');
            $table->string('label', 50)->default('Rumah');
            $table->string('nama_penerima', 100);
            $table->string('no_telp', 15);
            $table->string('provinsi', 100)->nullable();
            $table->string('kota', 100)->nullable();
            $table->string('kecamatan', 100)->nullable();
            $table->text('detail');
            $table->string('kode_pos', 10)->nullable();
            $table->tinyInteger('is_utama')->default(0);
            $table->timestamps();

            $table->foreign('id_pelanggan')
                  ->references('id_pelanggan')->on('pelanggan')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alamat_pelanggan');
    }
};
