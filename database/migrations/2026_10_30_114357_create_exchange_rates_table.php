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
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('symbol', 10);
            $table->string('flag', 10);
            $table->decimal('rate_to_usd', 14, 6)->default(1.000000);
            $table->boolean('is_auto_sync')->default(true);
            $table->timestamp('last_synced_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
