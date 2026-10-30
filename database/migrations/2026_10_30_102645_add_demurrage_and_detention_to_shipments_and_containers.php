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
            $table->integer('demurrage_free_days')->default(14)->after('delivery_date');
            $table->integer('detention_free_days')->default(7)->after('demurrage_free_days');
            $table->decimal('demurrage_daily_rate', 10, 2)->default(50.00)->after('detention_free_days');
            $table->decimal('detention_daily_rate', 10, 2)->default(75.00)->after('demurrage_daily_rate');
        });

        Schema::table('shipment_containers', function (Blueprint $table) {
            $table->date('discharged_at')->nullable()->after('status');
            $table->date('gate_out_at')->nullable()->after('discharged_at');
            $table->date('empty_returned_at')->nullable()->after('gate_out_at');
            $table->integer('demurrage_days_incurred')->default(0)->after('empty_returned_at');
            $table->integer('detention_days_incurred')->default(0)->after('demurrage_days_incurred');
            $table->decimal('demurrage_amount', 10, 2)->default(0)->after('detention_days_incurred');
            $table->decimal('detention_amount', 10, 2)->default(0)->after('demurrage_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn([
                'demurrage_free_days',
                'detention_free_days',
                'demurrage_daily_rate',
                'detention_daily_rate',
            ]);
        });

        Schema::table('shipment_containers', function (Blueprint $table) {
            $table->dropColumn([
                'discharged_at',
                'gate_out_at',
                'empty_returned_at',
                'demurrage_days_incurred',
                'detention_days_incurred',
                'demurrage_amount',
                'detention_amount',
            ]);
        });
    }
};
