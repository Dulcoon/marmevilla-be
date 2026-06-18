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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            $table->foreignUuid('villa_id')->constrained('villas')->onDelete('cascade');
            $table->date('check_in');
            $table->date('check_out');
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone');
            $table->text('special_requests')->nullable();
            $table->integer('guest_count');
            $table->integer('extra_guests')->default(0);
            $table->integer('base_price_total');
            $table->integer('extra_charge_total')->default(0);
            $table->foreignId('voucher_id')->nullable()->constrained('vouchers')->nullOnDelete();
            $table->integer('discount_amount')->default(0);
            $table->integer('total_amount');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('booking_status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])->default('pending');
            $table->string('midtrans_snap_token')->nullable();
            $table->string('midtrans_order_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
