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
        Schema::create('truck_dispatches', function (Blueprint $table) {
            $table->id();
            $table->string('dispatch_number', 30)->unique()->index();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->foreignId('shipment_container_id')->nullable()->constrained('shipment_containers')->nullOnDelete();
            $table->foreignId('trucking_company_id')->nullable()->constrained('companies')->nullOnDelete();

            // Driver & Vehicle details
            $table->string('driver_name', 100);
            $table->string('driver_phone', 50)->nullable();
            $table->string('driver_national_id', 50)->nullable();
            $table->string('truck_plate', 50);
            $table->string('trailer_plate', 50)->nullable();

            // Drayage Route & Depot
            $table->string('origin_address', 255);
            $table->string('delivery_address', 255);
            $table->string('empty_return_depot', 255)->nullable();
            $table->string('empty_return_receipt', 100)->nullable(); // EIR #

            // Operation Lifecycle
            $table->string('status', 30)->default('assigned')->index(); // assigned, loading_port, in_transit, at_destination, unloaded, empty_returned, completed
            $table->dateTime('dispatched_at')->nullable();
            $table->dateTime('loaded_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->dateTime('empty_returned_at')->nullable();

            // Financials per trip
            $table->decimal('driver_cost', 12, 2)->default(0);
            $table->decimal('client_charge', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');

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
        Schema::dropIfExists('truck_dispatches');
    }
};
