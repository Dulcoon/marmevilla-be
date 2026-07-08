<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('set null');
            $table->string('token', 64)->unique();
            $table->string('guest_name');
            $table->string('city');
            $table->tinyInteger('rating')->default(5); // 1-5
            $table->text('comment');
            $table->boolean('is_published')->default(false);
            $table->enum('status', ['pending', 'submitted'])->default('submitted');
            $table->timestamps();
        });

        // Insert default reviews from current FE hardcoded data
        DB::table('reviews')->insert([
            [
                'booking_id'   => null,
                'token'        => Str::random(40),
                'guest_name'   => 'Amélie L.',
                'city'         => 'Paris',
                'rating'       => 5,
                'comment'      => 'Pengalaman menginap paling puitis dalam hidup kami. Setiap detail membisikkan keindahan Jawa kuno, namun kenyamanan modern tetap terpenuhi secara sempurna.',
                'is_published' => true,
                'status'       => 'submitted',
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'booking_id'   => null,
                'token'        => Str::random(40),
                'guest_name'   => 'James & Mia',
                'city'         => 'Singapura',
                'rating'       => 5,
                'comment'      => 'Kami datang untuk akhir pekan dan akhirnya tinggal selama seminggu. Malam-malam syahdu dengan alunan gamelan akan selalu hidup dalam ingatan kami.',
                'is_published' => true,
                'status'       => 'submitted',
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'booking_id'   => null,
                'token'        => Str::random(40),
                'guest_name'   => 'Putri Anggraini',
                'city'         => 'Jakarta',
                'rating'       => 5,
                'comment'      => 'Sebuah kepulangan yang tidak saya sadari sangat saya butuhkan. Seluruh tim memperlakukan Anda layaknya keluarga sendiri.',
                'is_published' => true,
                'status'       => 'submitted',
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
