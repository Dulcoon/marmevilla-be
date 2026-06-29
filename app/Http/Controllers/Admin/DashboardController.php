<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Villa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

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

        $today = Carbon::today();

        // Check-ins today
        $todayCheckIns = Booking::whereDate('check_in', $today)->get();
        $totalCheckInsToday = $todayCheckIns->count();
        $waitingCheckIns = $todayCheckIns->whereIn('booking_status', ['pending', 'confirmed'])->count();

        // Check-outs today
        $todayCheckOuts = Booking::whereDate('check_out', $today)->get();
        $totalCheckOutsToday = $todayCheckOuts->count();
        $waitingCheckOuts = $todayCheckOuts->whereIn('booking_status', ['checked_in', 'confirmed'])->count();

        $trend = request()->query('trend', '30_days');

        $chartData = [];
        if ($trend === 'year') {
            $startDate = Carbon::now()->startOfYear();
            $endDate = Carbon::now()->endOfYear();

            $revenueTrend = Booking::where('payment_status', 'paid')
                ->where('booking_status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('MONTH(created_at) as month, SUM(total_amount) as total')
                ->groupBy('month')
                ->orderBy('month', 'asc')
                ->get();

            for ($i = 1; $i <= 12; $i++) {
                $monthData = $revenueTrend->firstWhere('month', $i);
                $chartData[] = [
                    'date' => Carbon::create()->month($i)->translatedFormat('M'),
                    'revenue' => $monthData ? (int) $monthData->total : 0,
                ];
            }
        } else {
            // Default to 30_days
            $startDate = Carbon::today()->subDays(29);
            $endDate = Carbon::today();

            $revenueTrend = Booking::where('payment_status', 'paid')
                ->where('booking_status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

            for ($i = 0; $i < 30; $i++) {
                $date = Carbon::today()->subDays(29 - $i)->format('Y-m-d');
                $dayData = $revenueTrend->firstWhere('date', $date);
                $chartData[] = [
                    'date' => Carbon::parse($date)->translatedFormat('d M'),
                    'revenue' => $dayData ? (int) $dayData->total : 0,
                ];
            }
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalRevenue' => (int) $totalRevenue,
                'totalBookings' => $totalBookings,
                'activeBookings' => $activeBookings,
                'completedBookings' => $completedBookings,
                'totalVillas' => $totalVillas,
            ],
            'todayHighlights' => [
                'checkIns' => [
                    'total' => $totalCheckInsToday,
                    'waiting' => $waitingCheckIns
                ],
                'checkOuts' => [
                    'total' => $totalCheckOutsToday,
                    'waiting' => $waitingCheckOuts
                ]
            ],
            'recentBookings' => $recentBookings,
            'revenueTrend' => $chartData,
            'trend' => $trend,
        ]);
    }
}
