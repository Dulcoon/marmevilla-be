<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Villa;
use App\Models\BlockedDate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

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
        $booking->load(['villa.images', 'voucher', 'payments' => function ($q) {
            $q->latest();
        }]);

        // Get booked dates for the villa, EXCLUDING the current booking
        $otherBookings = Booking::where('villa_id', $booking->villa_id)
            ->where('id', '!=', $booking->id)
            ->whereIn('booking_status', ['confirmed', 'checked_in'])
            ->get();

        $bookedDates = [];
        foreach ($otherBookings as $b) {
            $period = CarbonPeriod::create($b->check_in, Carbon::parse($b->check_out)->subDay());
            foreach ($period as $date) {
                $bookedDates[] = $date->format('Y-m-d');
            }
        }

        // Get blocked dates for the villa
        $blockedDates = BlockedDate::where('villa_id', $booking->villa_id)->get();
        foreach ($blockedDates as $b) {
            $period = CarbonPeriod::create($b->start_date, Carbon::parse($b->end_date)->subDay());
            foreach ($period as $date) {
                $bookedDates[] = $date->format('Y-m-d');
            }
        }

        return Inertia::render('Admin/Reservation/Show', [
            'booking' => $booking,
            'bookedDates' => $bookedDates,
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

    /**
     * Update booking dates.
     */
    public function updateDates(Request $request, Booking $booking)
    {
        $request->validate([
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        $newCheckIn = Carbon::parse($request->check_in)->startOfDay();
        $newCheckOut = Carbon::parse($request->check_out)->startOfDay();
        
        $originalCheckIn = Carbon::parse($booking->check_in)->startOfDay();
        $originalCheckOut = Carbon::parse($booking->check_out)->startOfDay();

        $originalNights = $originalCheckIn->diffInDays($originalCheckOut);
        $newNights = $newCheckIn->diffInDays($newCheckOut);

        if ($originalNights !== $newNights) {
            return back()->with('error', 'Jumlah malam (' . $newNights . ') tidak sesuai dengan pesanan asli (' . $originalNights . ').');
        }

        // Check if dates are available (excluding this booking)
        $hasBooking = Booking::where('villa_id', $booking->villa_id)
            ->where('id', '!=', $booking->id)
            ->whereIn('booking_status', ['confirmed', 'pending'])
            ->where(function ($query) use ($newCheckIn, $newCheckOut) {
                $query->where('check_in', '<', $newCheckOut->format('Y-m-d'))
                      ->where('check_out', '>', $newCheckIn->format('Y-m-d'));
            })->exists();

        if ($hasBooking) {
            return back()->with('error', 'Tanggal yang dipilih sudah dipesan oleh orang lain.');
        }

        // Check if dates are blocked
        $isBlocked = BlockedDate::where('villa_id', $booking->villa_id)
            ->where(function ($query) use ($newCheckIn, $newCheckOut) {
                $query->where('start_date', '<', $newCheckOut->format('Y-m-d'))
                      ->where('end_date', '>', $newCheckIn->format('Y-m-d'));
            })->exists();

        if ($isBlocked) {
            return back()->with('error', 'Tanggal yang dipilih tidak tersedia (diblokir oleh admin).');
        }

        $booking->update([
            'check_in' => $newCheckIn->format('Y-m-d'),
            'check_out' => $newCheckOut->format('Y-m-d'),
        ]);

        return back()->with('success', 'Tanggal reservasi berhasil diperbarui.');
    }
}
