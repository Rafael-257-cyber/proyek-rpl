<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite receives the full allowed enum values in the base migration.
        if (DB::getDriverName() !== 'mysql') return;
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('transfer','cod','ewallet','bank_transfer','credit_card','qris','midtrans') NOT NULL DEFAULT 'transfer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // SQLite receives the full allowed enum values in the base migration.
        if (DB::getDriverName() !== 'mysql') return;
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('transfer','cod') NOT NULL DEFAULT 'transfer'");
    }
};
