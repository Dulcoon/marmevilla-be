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
        Schema::table('villa_custom_prices', function (Blueprint $table) {
            $table->string('name')->after('villa_id');
            $table->integer('min_stay')->default(1)->after('custom_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villa_custom_prices', function (Blueprint $table) {
            $table->dropColumn(['name', 'min_stay']);
        });
    }
};
