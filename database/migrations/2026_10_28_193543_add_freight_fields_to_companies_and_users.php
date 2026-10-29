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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('partner_type')->default('customer')->index()->after('name'); // customer, shipping_line, customs_broker, trucker, airline, warehouse_operator, forwarder
            $table->string('tax_number')->nullable()->after('domain');
            $table->string('code', 20)->nullable()->index()->after('id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('job_title')->nullable()->after('email');
            $table->string('phone')->nullable()->after('job_title');
            $table->string('status')->default('active')->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['partner_type', 'tax_number', 'code']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['job_title', 'phone', 'status']);
        });
    }
};
