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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 40)->unique()->index();
            $table->enum('type', ['receivable', 'payable'])->default('receivable')->index(); // receivable = client invoice, payable = vendor bill
            $table->enum('category', [
                'customer_billing', 'ocean_freight', 'air_freight',
                'customs_brokerage', 'trucking_drayage', 'port_storage',
                'warehousing', 'insurance', 'misc',
            ])->default('customer_billing')->index();

            $table->foreignId('shipment_id')->nullable()->constrained('shipments')->cascadeOnDelete();
            $table->foreignId('partner_id')->constrained('companies')->cascadeOnDelete(); // Client (for receivable) or Vendor (for payable)

            // Financial Calculations
            $table->string('currency', 3)->default('USD');
            $table->decimal('exchange_rate', 12, 4)->default(1.0000);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('balance_due', 15, 2)->default(0);

            // Status & Dates
            $table->enum('status', ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'])->default('draft')->index();
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->string('payment_terms')->nullable(); // Net 15, Net 30, Cash on Delivery
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
        Schema::dropIfExists('invoices');
    }
};
