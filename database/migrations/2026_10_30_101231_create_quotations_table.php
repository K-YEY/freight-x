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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_number', 40)->unique()->index();
            $table->foreignId('customer_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->nullOnDelete();

            // Mode & Routing
            $table->enum('mode', ['sea', 'air', 'land'])->default('sea')->index();
            $table->string('service_type', 30)->default('fcl'); // fcl, lcl, ftl, ltl, air_standard, air_express
            $table->string('incoterm', 20)->default('FOB');
            $table->foreignId('origin_port_id')->nullable()->constrained('ports')->nullOnDelete();
            $table->foreignId('destination_port_id')->nullable()->constrained('ports')->nullOnDelete();

            // Cargo details
            $table->string('commodity')->nullable();
            $table->integer('estimated_transit_days')->nullable();
            $table->date('cargo_ready_date')->nullable();
            $table->date('valid_until')->nullable();

            // Financials
            $table->string('currency', 3)->default('USD');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);

            // Status
            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'])->default('draft')->index();
            $table->string('payment_terms')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();

            // Conversion tracking
            $table->foreignId('converted_shipment_id')->nullable()->constrained('shipments')->nullOnDelete();
            $table->timestamp('converted_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
