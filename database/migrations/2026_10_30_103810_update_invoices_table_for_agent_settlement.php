<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Convert enum columns to string/varchar to support debit_note, credit_note and agent categories
        DB::statement("ALTER TABLE invoices MODIFY COLUMN `type` VARCHAR(30) NOT NULL DEFAULT 'receivable'");
        DB::statement("ALTER TABLE invoices MODIFY COLUMN `category` VARCHAR(50) NOT NULL DEFAULT 'customer_billing'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE invoices MODIFY COLUMN `type` ENUM('receivable', 'payable') NOT NULL DEFAULT 'receivable'");
        DB::statement("ALTER TABLE invoices MODIFY COLUMN `category` ENUM('customer_billing', 'ocean_freight', 'air_freight', 'customs_brokerage', 'trucking_drayage', 'port_storage', 'warehousing', 'insurance', 'misc') NOT NULL DEFAULT 'customer_billing'");
    }
};
