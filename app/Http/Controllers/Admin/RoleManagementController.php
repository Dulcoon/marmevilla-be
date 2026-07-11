<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::with('permissions')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'users_count' => $role->users()->count(),
                    'permissions' => $role->permissions->pluck('name'),
                ];
            });

        return Inertia::render('Admin/RoleManagement/Index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = Permission::all();
        $groupedPermissions = $this->groupPermissions($permissions);

        return Inertia::render('Admin/RoleManagement/CreateEdit', [
            'groupedPermissions' => $groupedPermissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name|max:255',
            'permissions' => 'array',
        ]);

        $role = Role::create([
            'name' => strtolower(trim($request->name)),
            'guard_name' => 'web',
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('admin.manage-roles.index')
            ->with('success', 'Role berhasil dibuat!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        // Load permissions
        $role->load('permissions');

        $permissions = Permission::all();
        $groupedPermissions = $this->groupPermissions($permissions);

        return Inertia::render('Admin/RoleManagement/CreateEdit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ],
            'groupedPermissions' => $groupedPermissions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        if ($role->name === 'superadmin') {
            return redirect()->route('admin.manage-roles.index')
                ->with('error', 'Role superadmin tidak boleh diubah!');
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update([
            'name' => strtolower(trim($request->name)),
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('admin.manage-roles.index')
            ->with('success', 'Role berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if (in_array($role->name, ['superadmin', 'admin'])) {
            return redirect()->route('admin.manage-roles.index')
                ->with('error', 'Role bawaan sistem tidak boleh dihapus!');
        }

        // Check if there are users still using this role
        if ($role->users()->count() > 0) {
            return redirect()->route('admin.manage-roles.index')
                ->with('error', 'Role tidak dapat dihapus karena masih digunakan oleh beberapa pengguna!');
        }

        $role->delete();

        return redirect()->route('admin.manage-roles.index')
            ->with('success', 'Role berhasil dihapus!');
    }

    /**
     * Helper to group permissions into logical categories.
     */
    private function groupPermissions($permissions)
    {
        $groups = [];

        foreach ($permissions as $permission) {
            $name = $permission->name;

            // Simple naming conventions mapping
            // e.g. "view villas" or "create villas" -> group: "Villa"
            if (str_contains($name, 'villa')) {
                $category = 'Villa';
            } elseif (str_contains($name, 'pricing')) {
                $category = 'Aturan Harga';
            } elseif (str_contains($name, 'blocked-date')) {
                $category = 'Blokir Tanggal';
            } elseif (str_contains($name, 'voucher')) {
                $category = 'Voucher';
            } elseif (str_contains($name, 'reservation')) {
                $category = 'Reservasi';
            } elseif (str_contains($name, 'review')) {
                $category = 'Ulasan';
            } elseif (str_contains($name, 'contact')) {
                $category = 'Kontak & Pesan';
            } else {
                $category = 'Lain-lain';
            }

            $groups[$category][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $this->getFriendlyDescription($name),
            ];
        }

        return $groups;
    }

    /**
     * Helper to get user friendly descriptions for permissions.
     */
    private function getFriendlyDescription($permissionName)
    {
        $descriptions = [
            'view villas' => 'Melihat daftar villa',
            'create villas' => 'Menambah villa baru',
            'edit villas' => 'Mengubah informasi villa',
            'delete villas' => 'Menghapus villa',

            'view pricing' => 'Melihat aturan harga villa',
            'edit pricing' => 'Mengatur & mengubah harga villa',

            'view blocked-dates' => 'Melihat tanggal yang diblokir',
            'manage blocked-dates' => 'Mengelola pemblokiran tanggal kalender',

            'view vouchers' => 'Melihat daftar voucher diskon',
            'create vouchers' => 'Membuat voucher baru',
            'edit vouchers' => 'Mengubah voucher',
            'delete vouchers' => 'Menghapus voucher',

            'view reservations' => 'Melihat daftar reservasi/booking tamu',
            'edit reservations' => 'Mengubah status & detail reservasi tamu',

            'view reviews' => 'Melihat ulasan villa dari tamu',
            'manage reviews' => 'Memoderasi ulasan (publikasi & balas)',

            'view contacts' => 'Melihat pesan masuk dari form kontak',
            'manage contacts' => 'Membalas/menandai pesan dibaca & menghapus pesan',
        ];

        return $descriptions[$permissionName] ?? ucwords($permissionName);
    }
}
