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
            'icon' => 'nullable|string|max:255',
        ]);

        $facility = VillaFacility::create([
            'name' => $request->name,
            'icon' => $request->icon ?: 'check_circle', // default icon
        ]);

        \App\Jobs\TranslateFacilityDataJob::dispatch($facility);

        return redirect()->back()->with('success', 'Fasilitas baru berhasil ditambahkan.');
    }
}
