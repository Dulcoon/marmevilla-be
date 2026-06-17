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
        Schema::create('villa_facility_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('villa_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('villa_facilities')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('villa_facility_items');
    }
};
