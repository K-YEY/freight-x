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
        Schema::create('shipment_containers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->string('container_number', 25)->index(); // Standard ISO 6346 (e.g. MSCU1234567)
            $table->enum('type', [
                '20GP', '40GP', '40HC', '45HC',
                '20RF', '40RF', '20OT', '40FR',
                'LCL_CARGO', 'AIR_ULD', 'TRUCK_TRAILER',
            ])->default('40HC');
            $table->string('seal_number', 30)->nullable();
            $table->decimal('tare_weight_kg', 10, 2)->default(0);
            $table->decimal('cargo_weight_kg', 10, 2)->default(0);
            $table->decimal('vgm_weight_kg', 10, 2)->default(0); // Verified Gross Mass
            $table->decimal('cbm', 10, 3)->default(0);
            $table->integer('packages_count')->default(0);
            $table->decimal('temperature_celsius', 5, 2)->nullable();
            $table->string('status')->default('loaded');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_containers');
    }
};
