<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('office_expenses', function (Blueprint $table) {
            $table->id();
            $table->string('expense_number', 30)->unique()->index();
            $table->string('title');
            $table->string('category', 50)->default('other'); // rent, utilities, hospitality, stationery, maintenance_it, government_fees, bank_charges, transportation, other
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('EGP');
            $table->date('expense_date');
            $table->string('payment_method', 30)->default('cash'); // cash, bank_transfer, credit_card, cheque, instapay
            $table->string('paid_to')->nullable();
            $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('receipt_number', 50)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('office_expenses');
    }
};
