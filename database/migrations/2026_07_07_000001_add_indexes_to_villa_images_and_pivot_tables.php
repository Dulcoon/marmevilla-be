<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('villa_images', function (Blueprint $table) {
            $table->index(['villa_id', 'is_primary', 'created_at'], 'idx_villa_images_villa_primary_created');
        });

        Schema::table('villa_facility_items', function (Blueprint $table) {
            $table->index(['villa_id', 'facility_id'], 'idx_facility_items_villa_facility');
        });
    }

    public function down(): void
    {
        Schema::table('villa_images', function (Blueprint $table) {
            $table->dropIndex('idx_villa_images_villa_primary_created');
        });

        Schema::table('villa_facility_items', function (Blueprint $table) {
            $table->dropIndex('idx_facility_items_villa_facility');
        });
    }
};
