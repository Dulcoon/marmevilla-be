<?php

namespace App\Http\Controllers;

use App\Models\Villa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class VillaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $villas = Villa::with('images')->latest()->paginate(10);
        
        return Inertia::render('Admin/Villa/Index', [
            'villas' => $villas
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $facilities = \App\Models\VillaFacility::all();
        return Inertia::render('Admin/Villa/Form', [
            'villa' => new Villa(),
            'all_facilities' => $facilities
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'required|string',
            'long_description' => 'nullable|array',
            'location' => 'required|url',
            'size' => 'nullable|string|max:255',
            'bed_count' => 'nullable|integer|min:0',
            'bathroom_count' => 'nullable|integer|min:0',
            'view_description' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
            'max_guests' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
            'facilities_ids' => 'nullable|array',
            'facilities_ids.*' => 'exists:villa_facilities,id',
            'base_price' => 'required|numeric|min:0',
            'weekend_price' => 'required|numeric|min:0',
            'extra_guest_fee' => 'required|numeric|min:0',
            'weekend_enabled' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB per image
            'image_albums' => 'nullable|array',
            'image_albums.*' => 'nullable|string|max:255',
            'album_order' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        // Ensure arrays are null if empty
        if (empty($validated['long_description'])) $validated['long_description'] = null;
        if (empty($validated['features'])) $validated['features'] = null;

        $villaData = \Illuminate\Support\Arr::except($validated, ['images', 'image_albums', 'facilities_ids']);
        $villa = Villa::create($villaData);
        
        $translationSuccess = false;
        $translationError = null;
        try {
            \App\Jobs\TranslateVillaDataJob::dispatchSync($villa);
            $translationSuccess = true;
        } catch (\Exception $e) {
            $translationError = $e->getMessage();
        }
 
        // Handle image uploads
        if ($request->hasFile('images')) {
            $isFirst = true;
            $albums = $request->input('image_albums', []);
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('villas', 'public');
                $album = isset($albums[$index]) ? $albums[$index] : 'Lainnya';
                $villa->images()->create([
                    'image_url' => '/storage/' . $path,
                    'is_primary' => $isFirst,
                    'album' => $album
                ]);
                $isFirst = false; // Only first image is primary
            }
        }

        // Sync facilities
        if ($request->has('facilities_ids')) {
            $villa->facilities()->sync($request->input('facilities_ids', []));
        }

        if ($translationSuccess) {
            return redirect()->route('admin.villas.index')->with('success', 'Villa berhasil ditambahkan dan diterjemahkan otomatis ke bahasa Inggris.');
        } else {
            return redirect()->route('admin.villas.index')->with('warning', 'Villa berhasil ditambahkan, tetapi terjemahan otomatis gagal: ' . $translationError);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Villa $villa)
    {
        $villa->load(['images', 'facilities']);
        $facilities = \App\Models\VillaFacility::all();
        return Inertia::render('Admin/Villa/Form', [
            'villa' => $villa,
            'all_facilities' => $facilities
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Villa $villa)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'required|string',
            'long_description' => 'nullable|array',
            'location' => 'required|url',
            'size' => 'nullable|string|max:255',
            'bed_count' => 'nullable|integer|min:0',
            'bathroom_count' => 'nullable|integer|min:0',
            'view_description' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
            'max_guests' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
            'facilities_ids' => 'nullable|array',
            'facilities_ids.*' => 'exists:villa_facilities,id',
            'base_price' => 'required|numeric|min:0',
            'weekend_price' => 'required|numeric|min:0',
            'extra_guest_fee' => 'required|numeric|min:0',
            'weekend_enabled' => 'boolean',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'new_image_albums' => 'nullable|array',
            'new_image_albums.*' => 'nullable|string|max:255',
            'album_order' => 'nullable|array',
        ]);

        // Only update slug if name changed
        if ($villa->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        // Ensure arrays are null if empty
        if (empty($validated['long_description'])) $validated['long_description'] = null;
        if (empty($validated['features'])) $validated['features'] = null;

         $villaData = \Illuminate\Support\Arr::except($validated, ['new_images', 'new_image_albums', 'facilities_ids']);
        $villa->update($villaData);
        
        $translationSuccess = false;
        $translationError = null;
        try {
            \App\Jobs\TranslateVillaDataJob::dispatchSync($villa);
            $translationSuccess = true;
        } catch (\Exception $e) {
            $translationError = $e->getMessage();
        }

        // Handle new image uploads
        if ($request->hasFile('new_images')) {
            // Check if villa already has a primary image
            $hasPrimary = $villa->images()->where('is_primary', true)->exists();
            $albums = $request->input('new_image_albums', []);

            foreach ($request->file('new_images') as $index => $image) {
                $path = $image->store('villas', 'public');
                $album = isset($albums[$index]) ? $albums[$index] : 'Lainnya';
                $villa->images()->create([
                    'image_url' => '/storage/' . $path,
                    'is_primary' => !$hasPrimary, // Set primary if there's no primary image yet
                    'album' => $album
                ]);
                $hasPrimary = true; // After the first new image is set as primary, subsequent ones won't be
            }
        }

        // Sync facilities
        if ($request->has('facilities_ids')) {
            $villa->facilities()->sync($request->input('facilities_ids', []));
        }

        if ($translationSuccess) {
            return redirect()->route('admin.villas.index')->with('success', 'Villa berhasil diperbarui dan diterjemahkan otomatis ke bahasa Inggris.');
        } else {
            return redirect()->route('admin.villas.index')->with('warning', 'Villa berhasil diperbarui, tetapi terjemahan otomatis gagal: ' . $translationError);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Villa $villa)
    {
        $villa->delete();

        return redirect()->route('admin.villas.index')->with('success', 'Villa berhasil dihapus.');
    }
}
