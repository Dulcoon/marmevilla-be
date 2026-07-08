<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with('booking:id,booking_code,guest_email,villa_id')
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reviews = $query->get();
        $publishedCount = Review::where('is_published', true)->count();

        return Inertia::render('Admin/Review/Index', [
            'reviews'        => $reviews,
            'publishedCount' => $publishedCount,
            'maxPublished'   => 3,
        ]);
    }

    /**
     * Toggle is_published for a review.
     * Enforces max 3 published: if limit reached, auto-unpublish the oldest published one.
     */
    public function togglePublish(Review $review)
    {
        if ($review->is_published) {
            // Un-publish
            $review->update(['is_published' => false]);
            return back()->with('success', 'Ulasan disembunyikan dari beranda.');
        }

        // Check current count
        $publishedCount = Review::where('is_published', true)->count();

        if ($publishedCount >= 3) {
            // Auto-unpublish the oldest published one
            $oldest = Review::where('is_published', true)
                ->orderBy('updated_at', 'asc')
                ->first();

            if ($oldest) {
                $oldest->update(['is_published' => false]);
            }
        }

        $review->update(['is_published' => true]);

        return back()->with('success', 'Ulasan ditampilkan di beranda. (Maks. 3 ulasan ditampilkan)');
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return back()->with('success', 'Ulasan berhasil dihapus.');
    }
}
