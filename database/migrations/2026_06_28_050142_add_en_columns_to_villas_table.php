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
            $table->string('tagline_en')->nullable()->after('tagline');
            $table->text('description_en')->nullable()->after('description');
            $table->json('long_description_en')->nullable()->after('long_description');
            $table->string('view_description_en')->nullable()->after('view_description');
            $table->json('features_en')->nullable()->after('features');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villas', function (Blueprint $table) {
            $table->dropColumn([
                'tagline_en',
                'description_en',
                'long_description_en',
                'view_description_en',
                'features_en'
            ]);
        });
    }
};
