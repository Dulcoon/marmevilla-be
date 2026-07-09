<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use App\Mail\BookingConfirmed;
use App\Mail\AdminBookingNotification;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\BookingExpiredNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Confirm a successful payment
     */
    public function confirmPayment(Booking $booking, string $provider, ?string $transactionId, ?string $paymentType, $grossAmount, $rawResponse)
    {
        Log::info("PaymentService: Confirming payment for Booking ID: {$booking->id}, Code: {$booking->booking_code}, Provider: {$provider}");

        // Find or create the payment record (fallback to finding by order_id or booking)
        $payment = Payment::updateOrCreate(
            [
                'booking_id' => $booking->id,
                'order_id' => $rawResponse['order_id'] ?? $rawResponse['transaction']['invoice_number'] ?? $booking->booking_code,
            ],
            [
                'provider' => $provider,
                'transaction_id' => $transactionId,
                'payment_type' => $paymentType,
                'gross_amount' => $grossAmount,
                'transaction_status' => 'settlement',
                'raw_response' => $rawResponse,
                'paid_at' => now(),
            ]
        );

        $wasNotConfirmed = $booking->booking_status !== 'confirmed';

        $booking->update([
            'payment_status' => 'paid',
            'booking_status' => 'confirmed'
        ]);

        if ($wasNotConfirmed) {
            try {
                Mail::to($booking->guest_email)->send(new BookingConfirmed($booking));

                $adminEmail = Setting::where('key', 'admin_email')->value('value');
                if ($adminEmail) {
                    $emails = array_filter(array_map('trim', explode(',', $adminEmail)));
                    if (!empty($emails)) {
                        Mail::to($emails)->send(new AdminBookingNotification($booking));
                    }
                }

                Notification::send(User::all(), new BookingConfirmedNotification($booking));
            } catch (\Exception $e) {
                Log::error("PaymentService: Failed to send payment confirmation notification: " . $e->getMessage());
            }

            if ($booking->voucher_id) {
                $booking->voucher()->increment('used_count');
                Log::info("PaymentService: Incremented voucher used_count for Voucher ID: {$booking->voucher_id}");
            }
        }

        return $payment;
    }

    /**
     * Mark payment as refunded
     */
    public function refundPayment(Booking $booking, string $provider, ?string $transactionId, $grossAmount, $rawResponse)
    {
        Log::info("PaymentService: Refunding payment for Booking ID: {$booking->id}, Code: {$booking->booking_code}, Provider: {$provider}");

        $payment = Payment::updateOrCreate(
            [
                'booking_id' => $booking->id,
                'provider' => $provider,
            ],
            [
                'transaction_id' => $transactionId,
                'gross_amount' => $grossAmount,
                'transaction_status' => 'refunded',
                'raw_response' => $rawResponse,
            ]
        );

        $booking->update(['payment_status' => 'refunded']);

        if ($booking->voucher_id) {
            $booking->voucher()->decrement('used_count');
            Log::info("PaymentService: Decremented voucher used_count for Voucher ID: {$booking->voucher_id}");
        }

        return $payment;
    }

    /**
     * Mark payment as failed or expired
     */
    public function failPayment(Booking $booking, string $provider, ?string $transactionId, $rawResponse)
    {
        Log::info("PaymentService: Failing/expiring payment for Booking ID: {$booking->id}, Code: {$booking->booking_code}, Provider: {$provider}");

        $payment = Payment::updateOrCreate(
            [
                'booking_id' => $booking->id,
                'provider' => $provider,
            ],
            [
                'transaction_id' => $transactionId,
                'transaction_status' => 'failed',
                'raw_response' => $rawResponse,
            ]
        );

        $wasNotCancelled = $booking->booking_status !== 'cancelled';
        $booking->update([
            'payment_status' => 'failed',
            'booking_status' => 'cancelled'
        ]);

        if ($wasNotCancelled) {
            try {
                Notification::send(User::all(), new BookingExpiredNotification($booking));
            } catch (\Exception $e) {
                Log::error("PaymentService: Failed to send booking expired notification: " . $e->getMessage());
            }
        }

        return $payment;
    }

    /**
     * Update payment to pending state
     */
    public function pendingPayment(Booking $booking, string $provider, ?string $transactionId, $rawResponse)
    {
        Log::info("PaymentService: Setting payment to pending for Booking ID: {$booking->id}, Code: {$booking->booking_code}, Provider: {$provider}");

        $payment = Payment::updateOrCreate(
            [
                'booking_id' => $booking->id,
                'provider' => $provider,
            ],
            [
                'transaction_id' => $transactionId,
                'transaction_status' => 'pending',
                'raw_response' => $rawResponse,
            ]
        );

        $booking->update(['payment_status' => 'pending']);

        return $payment;
    }
}
