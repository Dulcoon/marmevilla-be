<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Villa;

class VillaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Villa::create([
            'name' => 'Marme Villa',
            'slug' => 'marme-villa',
            'tagline' => 'Paviliun kerajaan tahun 1920-an yang lahir kembali.',
            'description' => 'Langit-langit ukir tinggi dan tempat tidur jati berkelambu empat di bawah balok pendalungan antik.',
            'long_description' => [
                'Terletak di dalam Joglo warisan sejarah yang asli, suite ini menawarkan pilar saka guru tinggi yang diukir dengan tangan dari kayu jati berusia seabad, beranda pribadi yang menghadap ke kolam koi, dan bak mandi batu berendam dalam yang dibingkai oleh sekat ukir Jepara.',
                'Tempat tidur king berkelambu empat, linen lurik tenunan lokal, dan perpustakaan seni Jawa yang dikuratori menjadikan suite ini sebagai tempat peristirahatan kami yang paling intim.'
            ],
            'location' => 'https://maps.app.goo.gl/dummy1', // Placeholder map link
            'size' => '65 m²',
            'bed_count' => 4,
            'bathroom_count' => 1,
            'view_description' => 'Kolam Koi & Taman',
            'capacity' => 12,
            'max_guests' => 20,
            'features' => [
                'Arsitektur Joglo warisan budaya',
                'Beranda pribadi',
                'Bak mandi batu berendam',
                'Termasuk sarapan harian'
            ],
            'base_price' => 3500000,
            'weekend_price' => 4000000,
            'extra_guest_fee' => 125000,
            'weekend_enabled' => true,
        ]);

        Villa::create([
            'name' => 'Arasa Villa by Marme',
            'slug' => 'arasa-villa',
            'tagline' => 'Kolam rendam pribadi di bawah pohon kamboja.',
            'description' => 'Kolam rendam pribadi dan daybed luar ruangan yang dibingkai oleh sekat ukir jepara.',
            'long_description' => [
                'Sebuah paviliun berkonsep terbuka yang ditata di sekitar kolam rendam pribadi dan daybed luar ruangan, dengan bak mandi teraso berdiri bebas yang diposisikan untuk menangkap cahaya sore hari.',
                'Keindahan dalam dan luar ruangan menyatu dengan lembut di sini — pintu geser setinggi langit-langit terbuka lebar ke taman tropis pribadi Anda.'
            ],
            'location' => 'https://maps.app.goo.gl/dummy2', // Placeholder map link
            'size' => '85 m²',
            'bed_count' => 5,
            'bathroom_count' => 1,
            'view_description' => 'Taman Pribadi & Kolam Rendam',
            'capacity' => 12,
            'max_guests' => 20,
            'features' => [
                'Kolam rendam pribadi',
                'Daybed luar ruangan',
                'Taman tropis berpagar',
                'Pelayan pribadi bersiap'
            ],
            'base_price' => 5400000,
            'weekend_price' => 6000000,
            'extra_guest_fee' => 125000,
            'weekend_enabled' => true,
        ]);
    }
}
