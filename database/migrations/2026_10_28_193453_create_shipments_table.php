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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->string('shipment_number', 30)->unique()->index();
            $table->string('booking_number', 50)->nullable()->index();
            $table->string('mbl_number', 50)->nullable()->index(); // Master Bill of Lading or AWB
            $table->string('hbl_number', 50)->nullable()->index(); // House Bill of Lading

            // Mode & Service
            $table->enum('mode', ['sea', 'air', 'land'])->default('sea')->index();
            $table->enum('service_type', ['fcl', 'lcl', 'ftl', 'ltl', 'air_standard', 'air_express'])->default('fcl')->index();
            $table->enum('direction', ['import', 'export', 'transit', 'domestic'])->default('import');

            // Parties (Foreign Keys to companies)
            $table->foreignId('customer_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('shipper_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('consignee_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('notify_party_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('carrier_id')->nullable()->constrained('companies')->nullOnDelete(); // Shipping Line / Airline
            $table->foreignId('customs_broker_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('trucker_id')->nullable()->constrained('companies')->nullOnDelete();

            // Routing & Locations
            $table->foreignId('origin_port_id')->nullable()->constrained('ports')->nullOnDelete();
            $table->foreignId('destination_port_id')->nullable()->constrained('ports')->nullOnDelete();
            $table->foreignId('loading_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('discharge_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('vessel_id')->nullable()->constrained('vessels')->nullOnDelete();
            $table->string('voyage_flight_number', 50)->nullable();

            // Trade Terms
            $table->enum('incoterm', ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'])->default('FOB');
            $table->enum('move_type', ['Door-to-Door', 'Port-to-Port', 'Door-to-Port', 'Port-to-Door', 'Airport-to-Airport', 'CFS-to-CFS', 'CFS-to-Door'])->default('Port-to-Port');

            // Cargo & Goods
            $table->string('commodity')->nullable();
            $table->string('hs_code', 30)->nullable();
            $table->integer('total_packages')->default(0);
            $table->string('package_type')->default('carton');
            $table->decimal('total_gross_weight_kg', 12, 2)->default(0);
            $table->decimal('total_net_weight_kg', 12, 2)->default(0);
            $table->decimal('total_volume_cbm', 12, 3)->default(0);

            // Operational Status
            $table->enum('status', [
                'draft', 'booked', 'cargo_received', 'customs_export',
                'loaded', 'departed', 'in_transit', 'arrived',
                'customs_import', 'out_for_delivery', 'delivered', 'completed', 'cancelled',
            ])->default('booked')->index();

            // Key Dates
            $table->date('booking_date')->nullable();
            $table->date('cargo_ready_date')->nullable();
            $table->date('etd')->nullable(); // Estimated Departure
            $table->date('atd')->nullable(); // Actual Departure
            $table->date('eta')->nullable(); // Estimated Arrival
            $table->date('ata')->nullable(); // Actual Arrival
            $table->date('customs_cleared_date')->nullable();
            $table->date('delivery_date')->nullable();

            // Financial Totals (Cached from Invoices)
            $table->string('currency', 3)->default('USD');
            $table->decimal('total_revenue', 15, 2)->default(0); // Total Client Invoices
            $table->decimal('total_cost', 15, 2)->default(0);    // Total Vendor Costs
            $table->decimal('gross_profit', 15, 2)->default(0);  // Revenue - Cost
            $table->decimal('margin_percentage', 6, 2)->default(0);

            // Metadata & Ownership
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
