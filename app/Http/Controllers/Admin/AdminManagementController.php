<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminManagementController extends Controller
{
    /**
     * Display a listing of all admin users.
     */
    public function index(): Response
    {
        $admins = User::with('roles:name')
            ->select(['id', 'name', 'email', 'last_login_at', 'last_login_ip', 'created_at'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'role'           => $user->roles->first()?->name ?? 'admin',
                    'last_login_at'  => $user->last_login_at?->toISOString(),
                    'last_login_ip'  => $user->last_login_ip,
                    'created_at'     => $user->created_at->toISOString(),
                    'is_self'        => $user->id === auth()->id(),
                ];
            });

        $roles = Role::all(['name'])->pluck('name');

        return Inertia::render('Admin/AdminManagement/Index', [
            'admins' => $admins,
            'roles'  => $roles,
        ]);
    }

    /**
     * Show the form for creating a new admin.
     */
    public function create(): Response
    {
        $roles = Role::all(['name'])->pluck('name');

        return Inertia::render('Admin/AdminManagement/CreateEdit', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created admin in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(8)->mixedCase()->numbers(), 'confirmed'],
            'role'     => ['required', 'exists:roles,name'],
        ], [
            'name.required'     => 'Nama wajib diisi.',
            'email.required'    => 'Email wajib diisi.',
            'email.unique'      => 'Email sudah digunakan oleh akun lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 8 karakter.',
            'role.required'     => 'Role wajib dipilih.',
            'role.exists'       => 'Role yang dipilih tidak valid.',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        return redirect()->route('admin.manage-admins.index')
            ->with('success', "Akun admin '{$user->name}' berhasil dibuat.");
    }

    /**
     * Show the form for editing the specified admin.
     */
    public function edit(User $user): Response
    {
        $roles = Role::all(['name'])->pluck('name');

        return Inertia::render('Admin/AdminManagement/CreateEdit', [
            'admin' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->roles->first()?->name ?? 'admin',
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified admin in storage.
     */
    public function update(Request $request, User $user)
    {
        // Prevent superadmin from demoting themselves
        if ($user->id === auth()->id() && $request->role !== 'superadmin') {
            return back()->withErrors(['role' => 'Anda tidak dapat mengubah role akun Anda sendiri.']);
        }

        $rules = [
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', "unique:users,email,{$user->id}"],
            'role'  => ['required', 'exists:roles,name'],
        ];

        if ($request->filled('password')) {
            $rules['password'] = [
                'required',
                Password::min(8)->mixedCase()->numbers(),
                'confirmed',
            ];
        }

        $request->validate($rules, [
            'name.required'  => 'Nama wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique'   => 'Email sudah digunakan oleh akun lain.',
            'role.required'  => 'Role wajib dipilih.',
            'role.exists'    => 'Role yang dipilih tidak valid.',
        ]);

        $data = [
            'name'  => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        $user->syncRoles([$request->role]);

        return redirect()->route('admin.manage-admins.index')
            ->with('success', "Akun admin '{$user->name}' berhasil diperbarui.");
    }

    /**
     * Remove the specified admin from storage.
     */
    public function destroy(User $user)
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'Anda tidak dapat menghapus akun Anda sendiri.']);
        }

        $userName = $user->name;
        $user->delete();

        return redirect()->route('admin.manage-admins.index')
            ->with('success', "Akun admin '{$userName}' berhasil dihapus.");
    }
}
