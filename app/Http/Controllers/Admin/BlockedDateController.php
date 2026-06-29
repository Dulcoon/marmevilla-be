<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Villa;
use App\Models\BlockedDate;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BlockedDateController extends Controller
{
    public function index(Request $request)
    {
        $villas = Villa::select('id', 'name')->get();
        
        $selectedVillaId = $request->query('villa_id');
        $villa = null;

        if ($selectedVillaId) {
            $villa = Villa::with('blockedDates')->find($selectedVillaId);
        } elseif ($villas->count() > 0) {
            $villa = Villa::with('blockedDates')->first();
        }

        return Inertia::render('Admin/BlockedDate/Index', [
            'villas' => $villas,
            'selectedVilla' => $villa
        ]);
    }

    public function store(Request $request, Villa $villa)
    {
        $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'nullable|string|max:255',
        ]);

        $startDate = Carbon::parse($request->start_date)->format('Y-m-d');
        $endDate = Carbon::parse($request->end_date)->format('Y-m-d');

        // Check if there is any active or pending booking in the range
        $hasBooking = Booking::where('villa_id', $villa->id)
            ->whereIn('booking_status', ['confirmed', 'pending'])
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where('check_in', '<', $endDate)
                      ->where('check_out', '>', $startDate);
            })->exists();

        if ($hasBooking) {
            return back()->withErrors(['start_date' => 'Tidak dapat memblokir tanggal karena terdapat reservasi aktif pada rentang tanggal tersebut.']);
        }

        // Check if there is any overlapping blocked dates
        $hasOverlap = BlockedDate::where('villa_id', $villa->id)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where('start_date', '<', $endDate)
                      ->where('end_date', '>', $startDate);
            })->exists();

        if ($hasOverlap) {
            return back()->withErrors(['start_date' => 'Rentang tanggal ini sudah diblokir sebelumnya.']);
        }

        $villa->blockedDates()->create([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $request->reason,
        ]);

        return redirect()->back()->with('success', 'Tanggal berhasil diblokir.');
    }

    public function destroy(Villa $villa, BlockedDate $blockedDate)
    {
        if ($blockedDate->villa_id !== $villa->id) {
            abort(403);
        }

        $blockedDate->delete();

        return redirect()->back()->with('success', 'Blokir tanggal berhasil dihapus.');
    }
}
