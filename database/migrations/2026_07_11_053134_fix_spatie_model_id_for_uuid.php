<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Spatie's default migration creates model_id as unsignedBigInteger.
     * Our User model uses UUIDs (char 36), so we need to change the column type.
     */
    public function up(): void
    {
        // Fix model_has_roles table
        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->string('model_id', 36)->change();
        });

        // Fix model_has_permissions table
        Schema::table('model_has_permissions', function (Blueprint $table) {
            $table->string('model_id', 36)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('model_id')->change();
        });

        Schema::table('model_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('model_id')->change();
        });
    }
};
