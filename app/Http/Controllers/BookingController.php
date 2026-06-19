<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Villa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a listing of all bookings.
     */
    public function index(Request $request)
    {
        $query = Booking::with(['villa:id,name,slug', 'voucher:id,code'])
            ->latest();

        // Filter by booking status
        if ($request->filled('booking_status')) {
            $query->where('booking_status', $request->booking_status);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by villa
        if ($request->filled('villa_id')) {
            $query->where('villa_id', $request->villa_id);
        }

        // Search by booking code, guest name, email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                  ->orWhere('guest_name', 'like', "%{$search}%")
                  ->orWhere('guest_email', 'like', "%{$search}%")
                  ->orWhere('guest_phone', 'like', "%{$search}%");
            });
        }

        $bookings = $query->paginate(15)->withQueryString();

        $villas = Villa::select('id', 'name')->get();

        // Summary counts
        $summary = [
            'total'      => Booking::count(),
            'pending'    => Booking::where('booking_status', 'pending')->count(),
            'confirmed'  => Booking::where('booking_status', 'confirmed')->count(),
            'checked_in' => Booking::where('booking_status', 'checked_in')->count(),
            'cancelled'  => Booking::where('booking_status', 'cancelled')->count(),
            'paid'       => Booking::where('payment_status', 'paid')->count(),
        ];

        return Inertia::render('Admin/Reservation/Index', [
            'bookings' => $bookings,
            'villas'   => $villas,
            'summary'  => $summary,
            'filters'  => $request->only(['search', 'booking_status', 'payment_status', 'villa_id']),
        ]);
    }

    /**
     * Show the detail of a booking.
     */
    public function show(Booking $booking)
    {
        $booking->load(['villa.images', 'voucher']);

        return Inertia::render('Admin/Reservation/Show', [
            'booking' => $booking,
        ]);
    }

    /**
     * Update booking status or payment status.
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        $request->validate([
            'booking_status' => 'nullable|in:pending,confirmed,checked_in,checked_out,cancelled',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
        ]);

        $data = array_filter([
            'booking_status' => $request->booking_status,
            'payment_status' => $request->payment_status,
        ], fn($v) => $v !== null);

        $booking->update($data);

        return back()->with('success', 'Status reservasi berhasil diperbarui.');
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Booking $booking)
    {
        if (in_array($booking->booking_status, ['checked_in', 'checked_out'])) {
            return back()->with('error', 'Tidak dapat membatalkan reservasi yang sedang/sudah berlangsung.');
        }

        $booking->update(['booking_status' => 'cancelled']);

        return back()->with('success', 'Reservasi berhasil dibatalkan.');
    }
}
