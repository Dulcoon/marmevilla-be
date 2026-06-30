<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $notification = json_decode($payload);

        // Verify signature key
        $validSignatureKey = hash(
            "sha512",
            $notification->order_id . $notification->status_code . $notification->gross_amount . config('midtrans.server_key')
        );

        if ($notification->signature_key !== $validSignatureKey) {
            Log::error('Midtrans Webhook Invalid Signature', ['payload' => $notification]);
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 403);
        }

        $booking = Booking::where('midtrans_order_id', $notification->order_id)->first();
        if (!$booking) {
            // Backup fallback: try searching by booking code if order_id doesn't match directly
            $booking = Booking::where('booking_code', $notification->order_id)->first();
            if (!$booking) {
                return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
            }
        }

        $transactionStatus = $notification->transaction_status;
        $fraudStatus = $notification->fraud_status ?? null;
        $transactionId = $notification->transaction_id ?? null;
        $paymentType = $notification->payment_type ?? 'Midtrans';
        $amount = $notification->gross_amount ?? $booking->total_amount;

        $rawResponse = (array) $notification;

        Log::info("Midtrans Webhook: Status for booking {$booking->booking_code} is {$transactionStatus}");

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                Log::warning('Midtrans: Transaction challenged', ['order_id' => $notification->order_id]);
                $this->paymentService->pendingPayment($booking, 'midtrans', $transactionId, $rawResponse);
            } else if ($fraudStatus == 'accept') {
                $this->paymentService->confirmPayment(
                    $booking,
                    'midtrans',
                    $transactionId,
                    $paymentType,
                    $amount,
                    $rawResponse
                );
            }
        } else if ($transactionStatus == 'settlement') {
            $this->paymentService->confirmPayment(
                $booking,
                'midtrans',
                $transactionId,
                $paymentType,
                $amount,
                $rawResponse
            );
        } else if (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $this->paymentService->failPayment($booking, 'midtrans', $transactionId, $rawResponse);
        } else if ($transactionStatus == 'refund') {
            $this->paymentService->refundPayment($booking, 'midtrans', $transactionId, $amount, $rawResponse);
        } else if ($transactionStatus == 'pending') {
            $this->paymentService->pendingPayment($booking, 'midtrans', $transactionId, $rawResponse);
        }

        return response()->json(['status' => 'success', 'message' => 'Webhook processed']);
    }
}
