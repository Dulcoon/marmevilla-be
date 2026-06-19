<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
                $booking->update(['payment_status' => 'challenge']);
            } else if ($fraudStatus == 'accept') {
                $booking->update([
                    'payment_status' => 'success',
                    'booking_status' => 'confirmed'
                ]);
            }
        } else if ($transactionStatus == 'settlement') {
            $booking->update([
                'payment_status' => 'success',
                'booking_status' => 'confirmed'
            ]);
        } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            $booking->update([
                'payment_status' => 'failed',
                'booking_status' => 'cancelled'
            ]);
        } else if ($transactionStatus == 'pending') {
            $booking->update(['payment_status' => 'pending']);
        }

        return response()->json(['status' => 'success', 'message' => 'Webhook processed']);
    }
}
