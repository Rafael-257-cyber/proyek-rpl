<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Payment status separate from order status
            if (!Schema::hasColumn('orders', 'payment_status')) {
                $table->enum('payment_status', ['pending', 'pending_verification', 'paid', 'failed', 'refunded'])->default('pending');
            }

            if (!Schema::hasColumn('orders', 'payment_proof_uploaded_by')) {
                $table->string('payment_proof_uploaded_by')->nullable();
            }

            if (!Schema::hasColumn('orders', 'payment_proof_uploaded_at')) {
                $table->timestamp('payment_proof_uploaded_at')->nullable();
            }

            if (!Schema::hasColumn('orders', 'payment_due_at')) {
                $table->timestamp('payment_due_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'payment_due_at')) {
                $table->dropColumn('payment_due_at');
            }
            if (Schema::hasColumn('orders', 'payment_proof_uploaded_at')) {
                $table->dropColumn('payment_proof_uploaded_at');
            }
            if (Schema::hasColumn('orders', 'payment_proof_uploaded_by')) {
                $table->dropColumn('payment_proof_uploaded_by');
            }
            if (Schema::hasColumn('orders', 'payment_status')) {
                $table->dropColumn('payment_status');
            }
        });
    }
};
