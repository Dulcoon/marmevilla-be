<?php

namespace App\Mail;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewReviewAdminNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $review;
    public $adminReviewUrl;

    public function __construct(Review $review)
    {
        $this->review = $review;
        $this->adminReviewUrl = url('/admin/reviews');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⭐ Ulasan Baru Masuk dari ' . $this->review->guest_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.review.admin_notification',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
