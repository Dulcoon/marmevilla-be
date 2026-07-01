<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('villas', function (Blueprint $table) {
            $table->string('seo_title')->nullable()->after('album_order');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('seo_title_en')->nullable()->after('seo_description');
            $table->text('seo_description_en')->nullable()->after('seo_title_en');
        });

        // Auto-populate for existing rows
        $villas = \Illuminate\Support\Facades\DB::table('villas')->get();
        foreach ($villas as $villa) {
            $seoTitle = $villa->name . ' - Marme Villa Jogja';
            $seoDesc = \Illuminate\Support\Str::limit(strip_tags($villa->description), 150);
            
            $seoTitleEn = $villa->name . ' - Marme Villa Jogja';
            $descriptionEn = $villa->description_en ?: $villa->description;
            $seoDescEn = \Illuminate\Support\Str::limit(strip_tags($descriptionEn), 150);
            
            \Illuminate\Support\Facades\DB::table('villas')
                ->where('id', $villa->id)
                ->update([
                    'seo_title' => $seoTitle,
                    'seo_description' => $seoDesc,
                    'seo_title_en' => $seoTitleEn,
                    'seo_description_en' => $seoDescEn,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villas', function (Blueprint $table) {
            $table->dropColumn(['seo_title', 'seo_description', 'seo_title_en', 'seo_description_en']);
        });
    }
};
