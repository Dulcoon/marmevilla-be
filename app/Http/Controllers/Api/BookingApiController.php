<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Setting;
use App\Models\Villa;
use App\Models\Voucher;
use App\Models\BlockedDate;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;
use App\Notifications\NewPendingBookingNotification;
use App\Notifications\PaymentErrorNotification;
use App\Mail\BookingPaymentError;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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
        $breakdown = [];
        
        $customPrices = $villa->customPrices()->where('end_date', '>=', $startDate->format('Y-m-d'))
            ->where('start_date', '<=', $endDate->format('Y-m-d'))
            ->get();

        foreach ($period as $date) {
            $currentPrice = $villa->base_price;
            $isWeekend = $date->isFriday() || $date->isSaturday(); // Friday and Saturday night
            $rateType = 'standard';

            if ($villa->weekend_enabled && $isWeekend && $villa->weekend_price) {
                $currentPrice = $villa->weekend_price;
                $rateType = 'weekend';
            }

            foreach ($customPrices as $cp) {
                if ($date->between(Carbon::parse($cp->start_date), Carbon::parse($cp->end_date))) {
                    $currentPrice = $cp->custom_price;
                    $rateType = 'custom';
                    break;
                }
            }

            $basePriceTotal += $currentPrice;
            $breakdown[] = [
                'date' => $date->format('Y-m-d'),
                'price' => (int) $currentPrice,
                'type' => $rateType
            ];
        }

        $extraGuests = max(0, $guests - $villa->capacity);
        $extraChargeTotal = $extraGuests * $villa->extra_guest_fee;

        return [
            'base_price_total' => $basePriceTotal,
            'extra_charge_total' => $extraChargeTotal,
            'total' => $basePriceTotal + $extraChargeTotal,
            'nights' => $period->count(),
            'extra_guests' => $extraGuests,
            'breakdown' => $breakdown
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
                // A booking overlaps if its check_in is BEFORE the new check_out
                // AND its check_out is AFTER the new check_in
                $query->where('check_in', '<', $request->check_out)
                      ->where('check_out', '>', $request->check_in);
            })->exists();

        // Check if dates are manually blocked
        $isBlocked = BlockedDate::where('villa_id', $villa->id)
            ->where(function ($query) use ($request) {
                $query->where('start_date', '<', $request->check_out)
                      ->where('end_date', '>', $request->check_in);
            })->exists();

        if ($hasBooking || $isBlocked) {
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
            $period = CarbonPeriod::create($booking->check_in, Carbon::parse($booking->check_out)->subDay());
            foreach ($period as $date) {
                $bookedDates[] = $date->format('Y-m-d');
            }
        }

        // Get all active/upcoming blocked dates
        $blockedDates = BlockedDate::where('villa_id', $villa->id)
            ->where('end_date', '>', today())
            ->get();

        foreach ($blockedDates as $blocked) {
            $period = CarbonPeriod::create($blocked->start_date, Carbon::parse($blocked->end_date)->subDay());
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

        $booking = null;

        try {
            $transactionResult = DB::transaction(function () use ($request) {
                // Lock the villa row to prevent concurrent bookings
                $villa = Villa::where('slug', $request->villa_slug)->lockForUpdate()->firstOrFail();

                // 1. Re-validate availability inside transaction
                $hasBooking = Booking::where('villa_id', $villa->id)
                    ->whereIn('booking_status', ['confirmed', 'pending'])
                    ->where(function ($query) use ($request) {
                        $query->where('check_in', '<', $request->check_out)
                              ->where('check_out', '>', $request->check_in);
                    })->exists();

                $isBlocked = BlockedDate::where('villa_id', $villa->id)
                    ->where(function ($query) use ($request) {
                        $query->where('start_date', '<', $request->check_out)
                              ->where('end_date', '>', $request->check_in);
                    })->exists();

                if ($hasBooking || $isBlocked) {
                    throw new \Exception('Villa tidak tersedia pada rentang tanggal yang dipilih.');
                }

                // 2. Validate guests capacity
                if ($request->guests > $villa->max_guests) {
                    throw new \Exception('Jumlah tamu melebihi kapasitas maksimum villa.');
                }

                // 3. Calculate pricing
                $pricing = $this->calculatePrice($villa, $request->check_in, $request->check_out, $request->guests);

                // 4. Validate voucher (if any)
                $discount = 0;
                $voucherId = null;
                if ($request->voucher_code) {
                    // Normalize voucher code to uppercase for PostgreSQL case sensitivity
                    $voucherCode = strtoupper($request->voucher_code);
                    $voucher = Voucher::where('code', $voucherCode)
                        ->where('is_active', true)
                        ->where('start_date', '<=', now())
                        ->where('end_date', '>=', now())
                        ->where(function ($query) {
                            $query->whereNull('usage_limit')
                                  ->orWhereColumn('used_count', '<', 'usage_limit');
                        })
                        ->first();

                    if (!$voucher) {
                        throw new \Exception('Voucher tidak valid atau kuota penggunaan sudah habis.');
                    }

                    $voucherId = $voucher->id;
                    $discount = $voucher->discount_amount;
                }

                $grandTotal = max(0, $pricing['total'] - $discount);
                $orderId = 'TRX-' . time() . '-' . strtoupper(Str::random(5));
                $bookingCode = 'BK-' . strtoupper(Str::random(8));

                // 5. Create booking row in database
                $bookingCreated = Booking::create([
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

                return [
                    'booking' => $bookingCreated,
                    'grand_total' => $grandTotal,
                    'pricing' => $pricing,
                    'villa' => $villa
                ];
            });

            $booking = $transactionResult['booking'];
            $grandTotal = $transactionResult['grand_total'];
            $pricing = $transactionResult['pricing'];
            $villa = $transactionResult['villa'];

            $activeGateway = Setting::where('key', 'active_payment_gateway')->value('value') ?? 'midtrans';

            if ($activeGateway === 'doku') {
                $dokuService = app(\App\Services\DokuService::class);
                $expiryMinutes = Setting::where('key', 'doku_expiry_minutes')->value('value') ?? 60;
                
                $dokuResponse = $dokuService->createCheckoutUrl($booking, $grandTotal, $expiryMinutes);
                
                // DOKU API response structure sometimes wraps the data inside a 'response' object
                $paymentUrl = $dokuResponse['payment']['url'] 
                           ?? $dokuResponse['response']['payment']['url'] 
                           ?? null;

                if (!$paymentUrl) {
                    throw new \Exception('Gagal mendapatkan URL pembayaran dari DOKU.');
                }

                // Record payment attempt
                $booking->payments()->create([
                    'provider' => 'doku',
                    'order_id' => $booking->booking_code,
                    'gross_amount' => $grandTotal,
                    'transaction_status' => 'pending',
                    'snap_token' => $paymentUrl,
                    'raw_response' => $dokuResponse,
                ]);

                try {
                    Notification::send(User::all(), new NewPendingBookingNotification($booking));
                } catch (\Exception $e) {
                    Log::error("BookingApiController: Failed to send new pending booking notification: " . $e->getMessage());
                }

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'booking' => $booking,
                        'payment_gateway' => 'doku',
                        'payment_url' => $paymentUrl
                    ]
                ]);
            } else {
                // Midtrans Setup dynamically from settings with fallback to env config
                $serverKey = Setting::where('key', 'midtrans_server_key')->value('value') ?? config('midtrans.server_key');
                $isProduction = filter_var(Setting::where('key', 'midtrans_is_production')->value('value') ?? config('midtrans.is_production', false), FILTER_VALIDATE_BOOLEAN);

                Config::$serverKey = $serverKey;
                Config::$isProduction = $isProduction;
                Config::$isSanitized = config('midtrans.is_sanitized', true);
                Config::$is3ds = config('midtrans.is_3ds', true);

                $expiryMinutes = Setting::where('key', 'midtrans_expiry_minutes')->value('value') ?? 1440;

                $params = [
                    'transaction_details' => [
                        'order_id' => $booking->midtrans_order_id,
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

                $snapToken = Snap::getSnapToken($params);
                
                $booking->update([
                    'midtrans_snap_token' => $snapToken
                ]);

                // Record payment attempt
                $booking->payments()->create([
                    'provider' => 'midtrans',
                    'order_id' => $booking->midtrans_order_id,
                    'gross_amount' => $grandTotal,
                    'transaction_status' => 'pending',
                    'snap_token' => $snapToken,
                ]);

                try {
                    Notification::send(User::all(), new NewPendingBookingNotification($booking));
                } catch (\Exception $e) {
                    Log::error("BookingApiController: Failed to send new pending booking notification: " . $e->getMessage());
                }

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'booking' => $booking,
                        'payment_gateway' => 'midtrans',
                        'snap_token' => $snapToken
                    ]
                ]);
            }

        } catch (\Exception $e) {
            // Booking tetap disimpan, status diubah jadi payment_error
            if ($booking) {
                try {
                    $booking->update([
                        'booking_status' => 'payment_error',
                        'notes' => 'Gagal mendapatkan token pembayaran: ' . $e->getMessage()
                    ]);

                    // Notifikasi in-app ke semua admin
                    Notification::send(User::all(), new PaymentErrorNotification($booking));

                    // Email notifikasi ke admin jika dikonfigurasi
                    try {
                        $adminEmail = Setting::where('key', 'admin_email')->value('value');
                        if ($adminEmail) {
                            $emails = array_filter(array_map('trim', explode(',', $adminEmail)));
                            if (!empty($emails)) {
                                Mail::to($emails)->send(new BookingPaymentError($booking, $e->getMessage()));
                            }
                        }
                    } catch (\Exception $mailEx) {
                        Log::error("BookingApiController: Failed to send payment error email: " . $mailEx->getMessage());
                    }
                } catch (\Exception $updateEx) {
                    Log::error("BookingApiController: Failed to update booking status: " . $updateEx->getMessage());
                }
            }

            return response()->json(['status' => 'error', 'message' => 'Gagal memproses pembayaran. Silakan coba lagi.'], 500);
        }
    }

    public function showStatus(Request $request)
    {
        $request->validate([
            'booking_code' => 'required|string',
            'email' => 'required|email',
        ]);

        $booking = Booking::with(['villa.images'])
            ->where('booking_code', $request->booking_code)
            ->where('guest_email', $request->email)
            ->first();

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reservasi tidak ditemukan atau data email tidak cocok.'
            ], 404);
        }

        // Add payment gateway details if payment is pending
        $paymentGateway = Setting::where('key', 'active_payment_gateway')->value('value') ?? 'midtrans';
        $paymentUrl = null;
        $snapToken = null;

        if ($booking->payment_status === 'pending') {
            if ($paymentGateway === 'doku') {
                $latestPendingPayment = $booking->payments()
                    ->where('provider', 'doku')
                    ->where('transaction_status', 'pending')
                    ->latest()
                    ->first();
                if ($latestPendingPayment) {
                    $paymentUrl = $latestPendingPayment->snap_token; // DOKU uses snap_token column to store payment URL
                }
            } else {
                $snapToken = $booking->midtrans_snap_token;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'booking' => $booking,
                'payment_gateway' => $paymentGateway,
                'payment_url' => $paymentUrl,
                'snap_token' => $snapToken,
            ]
        ]);
    }
}

