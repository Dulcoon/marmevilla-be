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
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('provider'); // 'midtrans' or 'doku'
            $table->string('transaction_id')->nullable();
            $table->string('order_id');
            $table->string('payment_type')->nullable();
            $table->decimal('gross_amount', 12, 2);
            $table->string('transaction_status'); // pending, settlement, failed, expire, cancel, deny, refunded
            $table->text('snap_token')->nullable(); // Can store token or redirect URL
            $table->json('raw_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
