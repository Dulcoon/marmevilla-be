<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DokuService
{
    protected $clientId;
    protected $secretKey;
    protected $isProduction;
    protected $baseUrl;

    public function __construct()
    {
        $this->clientId = Setting::where('key', 'doku_client_id')->value('value') ?? config('services.doku.client_id');
        $this->secretKey = Setting::where('key', 'doku_secret_key')->value('value') ?? config('services.doku.secret_key');
        $this->isProduction = filter_var(
            Setting::where('key', 'doku_is_production')->value('value') ?? config('services.doku.is_production', false),
            FILTER_VALIDATE_BOOLEAN
        );

        $this->baseUrl = $this->isProduction 
            ? 'https://api.doku.com' 
            : 'https://api-sandbox.doku.com';
    }

    /**
     * Create Doku Checkout URL
     *
     * @param \App\Models\Booking $booking
     * @param float|int $amount
     * @param int $expiryMinutes
     * @return array
     * @throws \Exception
     */
    public function createCheckoutUrl($booking, $amount, $expiryMinutes = 60)
    {
        $requestId = (string) Str::uuid();
        $timestamp = gmdate("Y-m-d\TH:i:s\Z");
        $targetPath = '/checkout/v1/payment';

        $booking->loadMissing('villa');
        $queryParams = [
            'room' => $booking->villa->slug,
            'checkIn' => $booking->check_in ? $booking->check_in->format('Y-m-d') : '',
            'checkOut' => $booking->check_out ? $booking->check_out->format('Y-m-d') : '',
            'guests' => (int) $booking->guest_count,
            'name' => $booking->guest_name,
            'email' => $booking->guest_email,
            'bookingCode' => $booking->booking_code,
            'total' => (int) $booking->total_amount,
        ];

        $body = [
            'order' => [
                'amount' => (int) $amount,
                'invoice_number' => $booking->booking_code,
                'callback_url' => config('app.frontend_url') . '/booking/success?booking_code=' . $booking->booking_code,
            ],
            'payment' => [
                'payment_due_date' => (int) $expiryMinutes,
            ],
        ];

        $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        
        // 1. Calculate Digest
        $digest = base64_encode(hash('sha256', $jsonBody, true));

        // 2. Construct String to Sign
        $stringToSign = "Client-Id:" . $this->clientId . "\n" .
                        "Request-Id:" . $requestId . "\n" .
                        "Request-Timestamp:" . $timestamp . "\n" .
                        "Request-Target:" . $targetPath . "\n" .
                        "Digest:" . $digest;

        // 3. Compute Signature
        $signature = 'HMACSHA256=' . base64_encode(hash_hmac('sha256', $stringToSign, $this->secretKey, true));

        Log::info('Doku request logs', [
            'url' => $this->baseUrl . $targetPath,
            'headers' => [
                'Client-Id' => $this->clientId,
                'Request-Id' => $requestId,
                'Request-Timestamp' => $timestamp,
                'Signature' => $signature,
            ],
            'body' => $body
        ]);

        // 4. Send request
        $response = Http::withHeaders([
            'Client-Id' => $this->clientId,
            'Request-Id' => $requestId,
            'Request-Timestamp' => $timestamp,
            'Signature' => $signature,
            'Content-Type' => 'application/json',
        ])->withBody($jsonBody, 'application/json')->post($this->baseUrl . $targetPath);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('DOKU API Error Response', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        throw new \Exception('DOKU API Error: ' . ($response->json('message') ?? $response->body()));
    }

    /**
     * Verify Webhook Signature from Doku
     *
     * @param string $signatureHeader
     * @param string $requestId
     * @param string $timestamp
     * @param string $rawBody
     * @param string $targetPath
     * @return bool
     */
    public function verifyWebhookSignature($signatureHeader, $requestId, $timestamp, $rawBody, $targetPath = '/api/doku/webhook')
    {
        if (empty($signatureHeader) || empty($requestId) || empty($timestamp)) {
            return false;
        }

        // 1. Calculate Digest
        $digest = base64_encode(hash('sha256', $rawBody, true));

        // 2. Construct String to Sign
        $stringToSign = "Client-Id:" . $this->clientId . "\n" .
                        "Request-Id:" . $requestId . "\n" .
                        "Request-Timestamp:" . $timestamp . "\n" .
                        "Request-Target:" . $targetPath . "\n" .
                        "Digest:" . $digest;

        // 3. Compute Signature
        $calculatedSignature = 'HMACSHA256=' . base64_encode(hash_hmac('sha256', $stringToSign, $this->secretKey, true));

        // Strip the HMACSHA256= prefix if it exists in the incoming header
        $cleanSignatureHeader = str_replace('HMACSHA256=', '', $signatureHeader);
        $cleanCalculatedSignature = str_replace('HMACSHA256=', '', $calculatedSignature);

        return hash_equals($cleanCalculatedSignature, $cleanSignatureHeader);
    }
}
