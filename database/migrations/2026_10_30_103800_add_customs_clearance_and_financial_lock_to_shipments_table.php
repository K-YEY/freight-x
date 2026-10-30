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
        Schema::table('shipments', function (Blueprint $table) {
            // Customs Clearance & Single Window (ACID / Bayan / D.O.)
            $table->string('acid_number', 50)->nullable()->index()->after('hbl_number');
            $table->string('bayan_number', 50)->nullable()->index()->after('acid_number');
            $table->string('customs_office', 100)->nullable()->after('bayan_number');
            $table->string('customs_stage', 40)->default('not_started')->index()->after('customs_office');
            $table->decimal('customs_duty_amount', 15, 2)->default(0)->after('customs_stage');
            $table->decimal('customs_vat_amount', 15, 2)->default(0)->after('customs_duty_amount');
            $table->decimal('customs_fees_amount', 15, 2)->default(0)->after('customs_vat_amount');
            $table->date('customs_assessment_date')->nullable()->after('customs_fees_amount');
            $table->date('customs_payment_date')->nullable()->after('customs_assessment_date');

            // Shipping Line Delivery Order (D/O - إذن التسليم)
            $table->string('delivery_order_number', 50)->nullable()->after('customs_payment_date');
            $table->date('delivery_order_date')->nullable()->after('delivery_order_number');
            $table->string('delivery_order_status', 30)->default('pending')->after('delivery_order_date');

            // Overseas Agent Profit Sharing & Multi-Currency Settlement
            $table->foreignId('overseas_agent_id')->nullable()->after('trucker_id')->constrained('companies')->nullOnDelete();
            $table->string('agent_share_type', 30)->default('none')->after('overseas_agent_id');
            $table->decimal('agent_share_percentage', 5, 2)->default(50.00)->after('agent_share_type');
            $table->decimal('agent_profit_share_amount', 15, 2)->default(0)->after('agent_share_percentage');
            $table->string('agent_debit_credit_type', 30)->default('debit')->after('agent_profit_share_amount');
            $table->string('agent_settlement_status', 30)->default('pending')->after('agent_debit_credit_type');
            $table->string('agent_settlement_reference', 50)->nullable()->after('agent_settlement_status');

            // Financial Audit & Locking (Job Costing Closure)
            $table->string('financial_status', 30)->default('open')->index()->after('margin_percentage');
            $table->timestamp('financial_closed_at')->nullable()->after('financial_status');
            $table->foreignId('financial_closed_by')->nullable()->after('financial_closed_at')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropForeign(['overseas_agent_id']);
            $table->dropForeign(['financial_closed_by']);
            $table->dropColumn([
                'acid_number',
                'bayan_number',
                'customs_office',
                'customs_stage',
                'customs_duty_amount',
                'customs_vat_amount',
                'customs_fees_amount',
                'customs_assessment_date',
                'customs_payment_date',
                'delivery_order_number',
                'delivery_order_date',
                'delivery_order_status',
                'overseas_agent_id',
                'agent_share_type',
                'agent_share_percentage',
                'agent_profit_share_amount',
                'agent_debit_credit_type',
                'agent_settlement_status',
                'agent_settlement_reference',
                'financial_status',
                'financial_closed_at',
                'financial_closed_by',
            ]);
        });
    }
};
