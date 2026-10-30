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
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained('quotations')->cascadeOnDelete();
            $table->string('charge_code', 30)->nullable(); // OFRT, THC, CUST, TRK, DOC
            $table->string('description', 255);
            $table->string('category', 50)->default('ocean_freight'); // ocean_freight, air_freight, origin_charges, destination_charges, customs, trucking, insurance, misc
            $table->string('unit_type', 30)->default('per_container'); // per_container, per_cbm, per_kg, per_bl, per_shipment, lump_sum
            $table->decimal('quantity', 12, 2)->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
    }
};
