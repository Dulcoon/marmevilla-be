<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Villa;

class VillaFacilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $facilities = [
            ['name' => 'Wi-Fi gratis', 'icon' => 'wifi'],
            ['name' => 'Mini bar', 'icon' => 'minibar'],
            ['name' => 'Smart TV', 'icon' => 'tv'],
            ['name' => 'AC', 'icon' => 'ac'],
            ['name' => 'Mesin espresso', 'icon' => 'coffee'],
            ['name' => 'Brankas kamar', 'icon' => 'safe'],
            ['name' => 'Water heater', 'icon' => 'waterheater'],
            ['name' => 'Dispenser', 'icon' => 'dispenser'],
            ['name' => 'Amenities', 'icon' => 'amenities'],
            ['name' => 'Parking Area', 'icon' => 'parking'],
            ['name' => 'Welcome drink', 'icon' => 'welcomedrink'],
            ['name' => 'Snack', 'icon' => 'snack'],
        ];

        // Insert or ignore facilities to avoid duplicates
        foreach ($facilities as $facility) {
            DB::table('villa_facilities')->updateOrInsert(
                ['name' => $facility['name']],
                [
                    'id' => Str::uuid()->toString(),
                    'icon' => $facility['icon'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Get all facilities
        $allFacilities = DB::table('villa_facilities')->get();

        // Assign facilities to all villas
        $villas = Villa::all();

        foreach ($villas as $villa) {
            // Randomly select 6-10 facilities for each villa
            $selectedFacilities = $allFacilities->random(rand(6, 10));

            foreach ($selectedFacilities as $facility) {
                // Check if already assigned
                $exists = DB::table('villa_facility_items')
                    ->where('villa_id', $villa->id)
                    ->where('facility_id', $facility->id)
                    ->exists();

                if (!$exists) {
                    DB::table('villa_facility_items')->insert([
                        'id' => Str::uuid()->toString(),
                        'villa_id' => $villa->id,
                        'facility_id' => $facility->id,
                    ]);
                }
            }
        }
    }
}
