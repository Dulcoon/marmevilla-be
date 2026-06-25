<?php

namespace App\Http\Controllers;

use App\Models\VillaFacility;
use Illuminate\Http\Request;

class VillaFacilityController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        VillaFacility::create([
            'name' => $request->name,
            'icon' => 'check_circle', // default icon
        ]);

        return redirect()->back()->with('success', 'Fasilitas baru berhasil ditambahkan.');
    }
}
