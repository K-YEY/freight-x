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
        Schema::create('vessels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('imo_number', 20)->nullable()->unique()->index();
            $table->string('mmsi', 20)->nullable();
            $table->string('call_sign', 20)->nullable();
            $table->string('flag_country')->nullable();
            $table->string('vessel_type')->default('Container Ship');
            $table->foreignId('carrier_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vessels');
    }
};
