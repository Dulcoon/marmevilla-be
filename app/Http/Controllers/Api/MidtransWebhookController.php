<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmed;
use App\Mail\AdminBookingNotification;

class MidtransWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $notification = json_decode($payload);

        $validSignatureKey = hash("sha512", $notification->order_id . $notification->status_code . $notification->gross_amount . config('midtrans.server_key'));

        if ($notification->signature_key !== $validSignatureKey) {
            Log::error('Midtrans Webhook Invalid Signature', ['payload' => $notification]);
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 403);
        }

        $booking = Booking::where('midtrans_order_id', $notification->order_id)->first();
        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        $transactionStatus = $notification->transaction_status;
        $fraudStatus = $notification->fraud_status ?? null;

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                // Leave as pending, needs manual review
                Log::warning('Midtrans: Transaction challenged', ['order_id' => $notification->order_id]);
            } else if ($fraudStatus == 'accept') {
                $wasNotConfirmed = $booking->booking_status !== 'confirmed';
                $booking->update([
                    'payment_status' => 'paid',
                    'booking_status' => 'confirmed'
                ]);
                if ($wasNotConfirmed) {
                    Mail::to($booking->guest_email)->send(new BookingConfirmed($booking));

                    $adminEmail = Setting::where('key', 'admin_email')->value('value');
                    if ($adminEmail) {
                        Mail::to($adminEmail)->send(new AdminBookingNotification($booking));
                    }
                }
            }
        } else if ($transactionStatus == 'settlement') {
            $wasNotConfirmed = $booking->booking_status !== 'confirmed';
            $booking->update([
                'payment_status' => 'paid',
                'booking_status' => 'confirmed'
            ]);
            if ($wasNotConfirmed) {
                Mail::to($booking->guest_email)->send(new BookingConfirmed($booking));

                $adminEmail = Setting::where('key', 'admin_email')->value('value');
                if ($adminEmail) {
                    Mail::to($adminEmail)->send(new AdminBookingNotification($booking));
                }
            }
        } else if (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $booking->update([
                'payment_status' => 'failed',
                'booking_status' => 'cancelled'
            ]);
        } else if ($transactionStatus == 'refund') {
            $booking->update(['payment_status' => 'refunded']);
        } else if ($transactionStatus == 'pending') {
            $booking->update(['payment_status' => 'pending']);
        }

        return response()->json(['status' => 'success', 'message' => 'Webhook processed']);
    }
}
