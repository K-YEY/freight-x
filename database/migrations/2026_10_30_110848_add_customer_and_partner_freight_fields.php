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
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('last_name');
            $table->string('customer_type')->default('importer')->index()->after('company_name'); // importer, exporter, trader, broker_client, individual
            $table->string('tax_id', 50)->nullable()->index()->after('phone');
            $table->string('commercial_registry', 50)->nullable()->after('tax_id');
            $table->string('customs_card_number', 50)->nullable()->after('commercial_registry');
            $table->string('nafeza_id', 50)->nullable()->after('customs_card_number');
            $table->text('billing_address')->nullable()->after('city');
            $table->string('country', 100)->default('Egypt')->after('billing_address');
            $table->string('payment_terms', 30)->default('cash')->after('status'); // cash, credit_15, credit_30, credit_60
            $table->decimal('credit_limit', 12, 2)->default(0)->after('payment_terms');
            $table->text('notes')->nullable()->after('credit_limit');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->string('contact_person')->nullable()->after('tax_number');
            $table->string('phone', 50)->nullable()->after('contact_person');
            $table->string('email')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'customer_type',
                'tax_id',
                'commercial_registry',
                'customs_card_number',
                'nafeza_id',
                'billing_address',
                'country',
                'payment_terms',
                'credit_limit',
                'notes',
            ]);
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['contact_person', 'phone', 'email']);
        });
    }
};
