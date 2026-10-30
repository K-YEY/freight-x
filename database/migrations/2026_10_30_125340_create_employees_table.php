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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('employee_code', 20)->unique()->index();
            $table->string('name');
            $table->string('job_title');
            $table->string('department')->default('operations'); // operations, finance, sales, customs, management, logistics
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('national_id', 30)->nullable();
            $table->date('hire_date')->nullable();
            $table->decimal('basic_salary', 12, 2)->default(0.00);
            $table->string('currency', 3)->default('EGP');
            $table->string('status', 20)->default('active'); // active, inactive, on_leave, terminated
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
