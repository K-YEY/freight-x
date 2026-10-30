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
        Schema::create('employee_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('type', 20); // salary, advance, bonus, deduction, payment, allowance
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('EGP');
            $table->date('transaction_date');
            $table->string('payment_method', 30)->default('cash'); // cash, bank_transfer, instapay, cheque
            $table->string('status', 20)->default('completed'); // completed, pending, cancelled
            $table->string('reference_number', 50)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_transactions');
    }
};
