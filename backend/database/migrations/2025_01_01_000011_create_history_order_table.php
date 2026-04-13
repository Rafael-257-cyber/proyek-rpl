<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('history_order', function (Blueprint $table) {
            $table->id('id_history');
            $table->unsignedBigInteger('id_order');
            $table->enum('status_lama', [
                'menunggu', 'diproses', 'dikirim', 'selesai', 'ditolak',
            ])->nullable();
            $table->enum('status_baru', [
                'menunggu', 'diproses', 'dikirim', 'selesai', 'ditolak',
            ]);
            $table->text('keterangan')->nullable();
            $table->string('diubah_oleh', 50)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_order')
                  ->references('id_order')->on('orders')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('history_order');
    }
};
