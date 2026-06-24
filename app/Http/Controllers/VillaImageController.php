<?php

namespace App\Http\Controllers;

use App\Models\Villa;
use App\Models\VillaImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VillaImageController extends Controller
{
    /**
     * Remove the specified image from storage.
     */
    public function destroy(Villa $villa, VillaImage $image)
    {
        // Delete from storage
        $path = str_replace('/storage/', '', parse_url($image->image_url, PHP_URL_PATH));
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $image->delete();

        // If it was primary, set another image as primary if available
        if ($image->is_primary) {
            $nextImage = $villa->images()->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return redirect()->back()->with('success', 'Foto berhasil dihapus.');
    }

    /**
     * Set the specified image as primary.
     */
    public function setPrimary(Villa $villa, VillaImage $image)
    {
        // Set all other images to not primary
        $villa->images()->update(['is_primary' => false]);

        // Set this image to primary
        $image->update(['is_primary' => true]);

        return redirect()->back()->with('success', 'Foto utama berhasil diubah.');
    }

    /**
     * Update the album category for the specified image.
     */
    public function updateAlbum(Request $request, Villa $villa, VillaImage $image)
    {
        $request->validate([
            'album' => 'nullable|string|max:255',
        ]);

        $image->update([
            'album' => $request->album ?: 'Lainnya'
        ]);

        return redirect()->back()->with('success', 'Kategori album berhasil diperbarui.');
    }
}
