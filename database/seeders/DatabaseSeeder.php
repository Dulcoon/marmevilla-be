<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default admin user (role assigned by RoleAndPermissionSeeder)
        User::firstOrCreate(
            ['email' => 'admin@marmevilla.com'],
            [
                'name' => 'Admin Marmevilla',
                'password' => 'admin123',
            ]
        );

        $this->call([
            VillaSeeder::class,
            VillaFacilitySeeder::class,
            RoleAndPermissionSeeder::class,
        ]);
    }
}
