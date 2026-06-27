<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Villa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalRevenue = Booking::where('payment_status', 'paid')
            ->where('booking_status', '!=', 'cancelled')
            ->sum('total_amount');

        $totalBookings = Booking::count();

        // Active bookings are those that are confirmed or checked in
        $activeBookings = Booking::whereIn('booking_status', ['confirmed', 'checked_in'])
            ->count();

        // Completed bookings are those that have checked out
        $completedBookings = Booking::where('booking_status', 'checked_out')
            ->count();

        $totalVillas = Villa::count();

        $recentBookings = Booking::with('villa')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalRevenue' => (int) $totalRevenue,
                'totalBookings' => $totalBookings,
                'activeBookings' => $activeBookings,
                'completedBookings' => $completedBookings,
                'totalVillas' => $totalVillas,
            ],
            'recentBookings' => $recentBookings,
        ]);
    }
}
