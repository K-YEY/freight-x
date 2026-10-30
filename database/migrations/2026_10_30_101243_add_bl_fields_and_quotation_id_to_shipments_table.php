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
            $table->foreignId('quotation_id')->nullable()->after('id')->constrained('quotations')->nullOnDelete();
            $table->string('bl_type', 30)->default('house')->after('hbl_number'); // house, master, direct, sea_waybill
            $table->string('freight_term', 20)->default('Prepaid')->after('bl_type'); // Prepaid, Collect
            $table->string('shipper_name')->nullable()->after('shipper_id');
            $table->text('shipper_address')->nullable()->after('shipper_name');
            $table->string('consignee_name')->nullable()->after('consignee_id');
            $table->text('consignee_address')->nullable()->after('consignee_name');
            $table->string('notify_party_name')->nullable()->after('notify_party_id');
            $table->text('notify_party_address')->nullable()->after('notify_party_name');
            $table->string('place_of_receipt')->nullable()->after('origin_port_id');
            $table->string('place_of_delivery')->nullable()->after('destination_port_id');
            $table->string('bl_issue_place')->nullable()->after('delivery_date');
            $table->date('bl_issue_date')->nullable()->after('bl_issue_place');
            $table->text('marks_and_numbers')->nullable()->after('hs_code');
            $table->text('cargo_description')->nullable()->after('marks_and_numbers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropForeign(['quotation_id']);
            $table->dropColumn([
                'quotation_id', 'bl_type', 'freight_term',
                'shipper_name', 'shipper_address',
                'consignee_name', 'consignee_address',
                'notify_party_name', 'notify_party_address',
                'place_of_receipt', 'place_of_delivery',
                'bl_issue_place', 'bl_issue_date',
                'marks_and_numbers', 'cargo_description',
            ]);
        });
    }
};
