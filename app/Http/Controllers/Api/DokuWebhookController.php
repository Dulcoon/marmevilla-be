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

        $dokuStatus = strtoupper($notification['transaction']['status'] ?? 'FAILED');
        $transactionId = $notification['transaction']['id'] ?? $requestId;
        
        $paymentTypeRaw = $notification['payment']['payment_channel'] 
            ?? $notification['payment']['channel_id'] 
            ?? $notification['payment']['payment_method'] 
            ?? 'DOKU Checkout';

        $paymentMap = [
            'VIRTUAL_ACCOUNT_BCA' => 'BCA Virtual Account',
            'VIRTUAL_ACCOUNT_BANK_MANDIRI' => 'Mandiri Virtual Account',
            'VIRTUAL_ACCOUNT_BNI' => 'BNI Virtual Account',
            'VIRTUAL_ACCOUNT_BRI' => 'BRI Virtual Account',
            'VIRTUAL_ACCOUNT_BANK_PERMATA' => 'Permata Virtual Account',
            'VIRTUAL_ACCOUNT_CIMB' => 'CIMB Virtual Account',
            'VIRTUAL_ACCOUNT_DANAMON' => 'Danamon Virtual Account',
            'QRIS' => 'QRIS',
            'CREDIT_CARD' => 'Kartu Kredit',
            'EMONEY_OVO' => 'OVO',
            'EMONEY_DANA' => 'DANA',
            'EMONEY_LINKAJA' => 'LinkAja',
            'EMONEY_SHOPEE_PAY' => 'ShopeePay',
        ];

        $paymentType = $paymentMap[strtoupper($paymentTypeRaw)] ?? str_replace('_', ' ', strtoupper($paymentTypeRaw));
        $amount = $notification['transaction']['amount'] ?? $booking->total_amount;

        Log::info("DOKU Webhook: Status for booking {$invoiceNumber} is {$dokuStatus}, method: {$paymentType}");

        if ($dokuStatus === 'SUCCESS') {
            $this->paymentService->confirmPayment(
                $booking,
                'doku',
                $transactionId,
                $paymentType,
                $amount,
                $notification
            );
        } else if ($dokuStatus === 'FAILED' || $dokuStatus === 'EXPIRED') {
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
