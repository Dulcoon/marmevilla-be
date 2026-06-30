<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\DokuService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DokuWebhookController extends Controller
{
    protected $dokuService;
    protected $paymentService;

    public function __construct(DokuService $dokuService, PaymentService $paymentService)
    {
        $this->dokuService = $dokuService;
        $this->paymentService = $paymentService;
    }

    public function handleWebhook(Request $request)
    {
        $rawPayload = $request->getContent();
        $notification = json_decode($rawPayload, true);

        Log::info('DOKU Webhook Notification Received', [
            'headers' => $request->headers->all(),
            'body' => $notification
        ]);

        $signatureHeader = $request->header('Signature');
        $requestId = $request->header('Request-Id');
        $timestamp = $request->header('Request-Timestamp');
        $targetPath = $request->header('Request-Target') ?? '/api/doku/webhook';

        // 1. Verify Webhook Signature Authenticity
        $isValid = $this->dokuService->verifyWebhookSignature(
            $signatureHeader,
            $requestId,
            $timestamp,
            $rawPayload,
            $targetPath
        );

        if (!$isValid) {
            Log::error('DOKU Webhook: Invalid Signature Verification');
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 403);
        }

        // 2. Extract Invoice/Booking Code and retrieve booking
        $invoiceNumber = $notification['order']['invoice_number'] ?? null;
        if (!$invoiceNumber) {
            Log::error('DOKU Webhook: Missing invoice_number');
            return response()->json(['status' => 'error', 'message' => 'Missing invoice number'], 400);
        }

        $booking = Booking::where('booking_code', $invoiceNumber)->first();
        if (!$booking) {
            Log::error("DOKU Webhook: Booking not found for invoice number: {$invoiceNumber}");
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        // 3. Process Status
        $dokuStatus = strtoupper($notification['transaction']['status'] ?? 'FAILED');
        $transactionId = $notification['transaction']['id'] ?? $requestId;
        $paymentType = $notification['payment']['channel_id'] ?? 'DOKU Checkout';
        $amount = $notification['transaction']['amount'] ?? $booking->total_amount;

        Log::info("DOKU Webhook: Status for booking {$invoiceNumber} is {$dokuStatus}");

        if ($dokuStatus === 'SUCCESS') {
            $this->paymentService->confirmPayment(
                $booking,
                'doku',
                $transactionId,
                $paymentType,
                $amount,
                $notification
            );
        } else if ($dokuStatus === 'FAILED') {
            $this->paymentService->failPayment(
                $booking,
                'doku',
                $transactionId,
                $notification
            );
        } else if ($dokuStatus === 'REFUND') {
            $this->paymentService->refundPayment(
                $booking,
                'doku',
                $transactionId,
                $amount,
                $notification
            );
        } else if ($dokuStatus === 'CANCEL') {
            $this->paymentService->failPayment(
                $booking,
                'doku',
                $transactionId,
                $notification
            );
        } else {
            // Keep pending for other statuses
            $this->paymentService->pendingPayment(
                $booking,
                'doku',
                $transactionId,
                $notification
            );
        }

        return response()->json(['status' => 'success', 'message' => 'Webhook processed']);
    }
}
