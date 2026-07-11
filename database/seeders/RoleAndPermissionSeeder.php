<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Seed roles, permissions, and the default superadmin account.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ---------- Define Permissions ----------
        $permissions = [
            // Villa management
            'view villas',
            'create villas',
            'edit villas',
            'delete villas',

            // Pricing
            'view pricing',
            'edit pricing',

            // Blocked dates
            'view blocked-dates',
            'manage blocked-dates',

            // Vouchers
            'view vouchers',
            'create vouchers',
            'edit vouchers',
            'delete vouchers',

            // Reservations
            'view reservations',
            'edit reservations',

            // Reviews
            'view reviews',
            'manage reviews',

            // Contacts
            'view contacts',
            'manage contacts',

            // Settings (Superadmin only conceptually)
            'view settings',
            'edit settings',

            // Admin management (Superadmin exclusive)
            'view admins',
            'create admins',
            'edit admins',
            'delete admins',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ---------- Create Roles ----------

        // Admin Role: day-to-day operational access
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions([
            'view villas', 'create villas', 'edit villas', 'delete villas',
            'view pricing', 'edit pricing',
            'view blocked-dates', 'manage blocked-dates',
            'view vouchers', 'create vouchers', 'edit vouchers', 'delete vouchers',
            'view reservations', 'edit reservations',
            'view reviews', 'manage reviews',
            'view contacts', 'manage contacts',
        ]);

        // Superadmin Role: full access including user management
        $superadminRole = Role::firstOrCreate(['name' => 'superadmin']);
        $superadminRole->syncPermissions(Permission::all());

        // ---------- Create Default Superadmin User ----------
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@marmevilla.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('supermarme110726'),
            ]
        );
        $superadmin->assignRole('superadmin');

        // ---------- Ensure Existing Admin Gets admin Role ----------
        $existingAdmin = User::where('email', 'admin@marmevilla.com')->first();
        if ($existingAdmin && !$existingAdmin->hasAnyRole(['admin', 'superadmin'])) {
            $existingAdmin->assignRole('admin');
        }

        $this->command->info('✅ Roles, permissions, and superadmin user seeded successfully!');
        $this->command->info('   Superadmin: superadmin@marmevilla.com / superadmin123');
    }
}
