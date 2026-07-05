<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Booking;

class BookingPaymentError extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $errorMessage;

    public function __construct(Booking $booking, string $errorMessage = '')
    {
        $this->booking = $booking;
        $this->errorMessage = $errorMessage;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Pembayaran GAGAL: ' . $this->booking->booking_code,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.booking.payment_error',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
