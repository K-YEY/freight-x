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
        Schema::create('incoterms', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique()->index();
            $table->string('name', 100);
            $table->string('name_ar', 100)->nullable();
            $table->text('description')->nullable();
            $table->string('applicable_modes', 50)->default('all'); // all, sea, air, land
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('package_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique()->index();
            $table->string('name', 100);
            $table->string('name_ar', 100)->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('move_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->index();
            $table->string('name', 100);
            $table->string('name_ar', 100)->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Convert enum in shipments to string to allow user-defined terms
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('incoterm', 50)->default('FOB')->change();
            $table->string('move_type', 50)->default('Port-to-Port')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incoterms');
        Schema::dropIfExists('package_types');
        Schema::dropIfExists('move_types');
    }
};
