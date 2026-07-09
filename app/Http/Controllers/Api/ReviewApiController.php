<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewReviewAdminNotificationMail;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ReviewApiController extends Controller
{
    /**
     * Get review form data by token (for guest to fill in).
     */
    public function showForm(string $token)
    {
        $review = Review::with('booking.villa')->where('token', $token)->first();

        if (!$review) {
            return response()->json(['status' => 'error', 'message' => 'Tautan ulasan tidak valid.'], 404);
        }

        if ($review->status === 'submitted') {
            return response()->json(['status' => 'already_submitted', 'message' => 'Ulasan ini sudah pernah diisi. Terima kasih!'], 409);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'guest_name' => $review->guest_name,
                'villa_name' => $review->booking?->villa?->name ?? 'Marme Villa',
                'check_in'   => $review->booking?->check_in,
                'check_out'  => $review->booking?->check_out,
            ]
        ]);
    }

    /**
     * Submit the review form (guest submits from link in email).
     */
    public function submitForm(Request $request, string $token)
    {
        $review = Review::where('token', $token)->first();

        if (!$review) {
            return response()->json(['status' => 'error', 'message' => 'Tautan ulasan tidak valid.'], 404);
        }

        if ($review->status === 'submitted') {
            return response()->json(['status' => 'error', 'message' => 'Ulasan sudah pernah dikirimkan.'], 409);
        }

        $validated = $request->validate([
            'guest_name' => 'required|string|max:100',
            'city'       => 'required|string|max:100',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'required|string|min:10|max:1000',
        ]);

        $review->update([
            ...$validated,
            'status' => 'submitted',
        ]);

        // Notify admin
        $adminEmail = Setting::where('key', 'admin_email')->value('value') ?? config('mail.from.address');
        try {
            $emails = array_filter(array_map('trim', explode(',', $adminEmail)));
            if (!empty($emails)) {
                Mail::to($emails)->send(new NewReviewAdminNotificationMail($review));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send admin review notification', [
                'review_id' => $review->id,
                'error'     => $e->getMessage(),
            ]);
        }

        return response()->json(['status' => 'success', 'message' => 'Ulasan berhasil dikirimkan. Terima kasih!']);
    }

    /**
     * Get published reviews for the homepage.
     */
    public function published()
    {
        $reviews = Review::where('is_published', true)
            ->where('status', 'submitted')
            ->select('id', 'guest_name', 'city', 'rating', 'comment')
            ->orderBy('updated_at', 'desc')
            ->limit(3)
            ->get();

        return response()->json(['status' => 'success', 'data' => $reviews]);
    }
}
