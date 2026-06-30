<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'active_payment_gateway' => 'required|string|in:midtrans,doku',
            'midtrans_server_key' => 'nullable|string',
            'midtrans_client_key' => 'nullable|string',
            'midtrans_is_production' => 'required|string|in:true,false,1,0',
            'midtrans_expiry_minutes' => 'required|integer|min:1',
            'doku_client_id' => 'nullable|string',
            'doku_secret_key' => 'nullable|string',
            'doku_is_production' => 'required|string|in:true,false,1,0',
            'doku_expiry_minutes' => 'required|integer|min:1',
            'admin_email' => 'required|email',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
