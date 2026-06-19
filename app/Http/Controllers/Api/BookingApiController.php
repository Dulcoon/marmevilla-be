<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Setting;
use App\Models\Villa;
use App\Models\Voucher;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

class BookingApiController extends Controller
{
    private function calculatePrice($villa, $checkIn, $checkOut, $guests)
    {
        $startDate = Carbon::parse($checkIn);
        $endDate = Carbon::parse($checkOut);
        
        $period = CarbonPeriod::create($startDate, $endDate->copy()->subDay());
        $basePriceTotal = 0;
        
        $customPrices = $villa->customPrices()->where('end_date', '>=', $startDate->format('Y-m-d'))
            ->where('start_date', '<=', $endDate->format('Y-m-d'))
            ->get();

        foreach ($period as $date) {
            $currentPrice = $villa->base_price;
            $isWeekend = $date->isWeekend(); // Saturday and Sunday

            if ($villa->weekend_enabled && $isWeekend && $villa->weekend_price) {
                $currentPrice = $villa->weekend_price;
            }

            foreach ($customPrices as $cp) {
                if ($date->between(Carbon::parse($cp->start_date), Carbon::parse($cp->end_date))) {
                    $currentPrice = $cp->custom_price;
                    break;
                }
            }

            $basePriceTotal += $currentPrice;
        }

        $extraGuests = max(0, $guests - $villa->capacity);
        $extraChargeTotal = $extraGuests * $villa->extra_guest_fee * $period->count();

        return [
            'base_price_total' => $basePriceTotal,
            'extra_charge_total' => $extraChargeTotal,
            'total' => $basePriceTotal + $extraChargeTotal,
            'nights' => $period->count(),
            'extra_guests' => $extraGuests
        ];
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'villa_slug' => 'required|exists:villas,slug',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests' => 'required|integer|min:1',
            'voucher_code' => 'nullable|string'
        ]);

        $villa = Villa::where('slug', $request->villa_slug)->firstOrFail();

        if ($request->guests > $villa->max_guests) {
            return response()->json(['status' => 'error', 'message' => 'Number of guests exceeds maximum capacity'], 400);
        }

        // Check if booked
        $hasBooking = Booking::where('villa_id', $villa->id)
            ->whereIn('booking_status', ['confirmed', 'pending'])
            ->where(function ($query) use ($request) {
                // A booking overlaps if its check_in is on or before the new check_out
                // AND its check_out is on or after the new check_in
                $query->where('check_in', '<=', $request->check_out)
                      ->where('check_out', '>=', $request->check_in);
            })->exists();

        if ($hasBooking) {
            return response()->json(['status' => 'error', 'message' => 'Dates are not available'], 400);
        }

        $pricing = $this->calculatePrice($villa, $request->check_in, $request->check_out, $request->guests);

        $discount = 0;
        $voucherId = null;
        if ($request->voucher_code) {
            $voucher = Voucher::where('code', $request->voucher_code)
                ->where('is_active', true)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->where(function ($query) {
                    $query->whereNull('usage_limit')
                          ->orWhereColumn('used_count', '<', 'usage_limit');
                })
                ->first();

            if ($voucher) {
                $voucherId = $voucher->id;
                $discount = $voucher->discount_amount;
            }
        }

        $grandTotal = max(0, $pricing['total'] - $discount);

        return response()->json([
            'status' => 'success',
            'data' => [
                'available' => true,
                'pricing' => $pricing,
                'discount' => $discount,
                'grand_total' => $grandTotal,
                'voucher_id' => $voucherId
            ]
        ]);
    }

    public function getBookedDates($slug)
    {
        $villa = Villa::where('slug', $slug)->firstOrFail();

        // Get all pending and confirmed bookings from today onwards
        $bookings = Booking::where('villa_id', $villa->id)
            ->whereIn('booking_status', ['confirmed', 'pending'])
            ->where('check_out', '>', today())
            ->get();

        $bookedDates = [];

        foreach ($bookings as $booking) {
            $period = CarbonPeriod::create($booking->check_in, Carbon::parse($booking->check_out));
            foreach ($period as $date) {
                $bookedDates[] = $date->format('Y-m-d');
            }
        }

        // Return unique dates
        return response()->json([
            'status' => 'success',
            'data' => array_values(array_unique($bookedDates))
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'villa_slug' => 'required|exists:villas,slug',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guest_name' => 'required|string',
            'guest_email' => 'required|email',
            'guest_phone' => 'required|string',
            'guests' => 'required|integer|min:1',
            'special_requests' => 'nullable|string',
            'voucher_code' => 'nullable|string'
        ]);

        // Re-run availability and pricing check securely on server side
        $availabilityResponse = $this->checkAvailability($request);
        $availabilityData = json_decode($availabilityResponse->getContent(), true);

        if ($availabilityResponse->getStatusCode() !== 200 || !$availabilityData['data']['available']) {
            return response()->json(['status' => 'error', 'message' => 'Villa is no longer available or invalid input'], 400);
        }

        $pricing = $availabilityData['data']['pricing'];
        $discount = $availabilityData['data']['discount'];
        $grandTotal = $availabilityData['data']['grand_total'];
        $voucherId = $availabilityData['data']['voucher_id'];

        $orderId = 'TRX-' . time() . '-' . strtoupper(Str::random(5));
        $bookingCode = 'BK-' . strtoupper(Str::random(8));

        $villa = Villa::where('slug', $request->villa_slug)->firstOrFail();

        $booking = Booking::create([
            'booking_code' => $bookingCode,
            'villa_id' => $villa->id,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'guest_name' => $request->guest_name,
            'guest_email' => $request->guest_email,
            'guest_phone' => $request->guest_phone,
            'special_requests' => $request->special_requests,
            'guest_count' => $request->guests,
            'extra_guests' => $pricing['extra_guests'],
            'base_price_total' => $pricing['base_price_total'],
            'extra_charge_total' => $pricing['extra_charge_total'],
            'voucher_id' => $voucherId,
            'discount_amount' => $discount,
            'total_amount' => $grandTotal,
            'payment_status' => 'pending',
            'booking_status' => 'pending',
            'midtrans_order_id' => $orderId
        ]);

        // Midtrans Setup
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');

        $expiryMinutes = Setting::where('key', 'midtrans_expiry_minutes')->value('value') ?? 1440;

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grandTotal,
            ],
            'customer_details' => [
                'first_name' => $request->guest_name,
                'email' => $request->guest_email,
                'phone' => $request->guest_phone,
            ],
            'item_details' => [
                [
                    'id' => $villa->id,
                    'price' => $grandTotal,
                    'quantity' => 1,
                    'name' => 'Booking: ' . $villa->name . ' (' . $pricing['nights'] . ' nights)'
                ]
            ],
            'expiry' => [
                'unit' => 'minute',
                'duration' => (int) $expiryMinutes
            ]
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            
            $booking->update([
                'midtrans_snap_token' => $snapToken
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'booking' => $booking,
                    'snap_token' => $snapToken
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
