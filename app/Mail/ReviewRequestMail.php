<?php

namespace App\Mail;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReviewRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $review;
    public $reviewUrl;

    public function __construct(Review $review)
    {
        $this->review = $review;
        $frontendUrl = config('app.frontend_url') ?? env('FRONTEND_URL', 'http://localhost:5173');
        $this->reviewUrl = rtrim($frontendUrl, '/') . '/review/' . $review->token;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bagikan Pengalaman Menginap Anda di Marme Villa 🌟',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.review.request',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
