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
        Schema::table('villas', function (Blueprint $table) {
            $table->string('tagline')->nullable()->after('name');
            $table->json('long_description')->nullable()->after('description');
            $table->string('size')->nullable()->after('location');
            $table->integer('bed_count')->nullable()->after('size');
            $table->integer('bathroom_count')->nullable()->after('bed_count');
            $table->string('view_description')->nullable()->after('bathroom_count');
            $table->integer('max_guests')->nullable()->after('capacity');
            $table->json('features')->nullable()->after('max_guests');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villas', function (Blueprint $table) {
            $table->dropColumn([
                'tagline',
                'long_description',
                'size',
                'bed_count',
                'bathroom_count',
                'view_description',
                'max_guests',
                'features'
            ]);
        });
    }
};
