<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ulasan Baru - Marme Villa Admin</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #F9F7F2; color: #402E2A; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #402E2A; color: white; padding: 28px 40px; }
        .header h1 { margin: 0; font-size: 20px; color: #D4B47D; font-weight: 700; }
        .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.7; }
        .content { padding: 32px 40px; }
        .review-card { background-color: #F9F7F2; border: 1px solid #E6E2D3; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .stars { color: #C9A96E; font-size: 20px; margin-bottom: 12px; letter-spacing: 2px; }
        .comment { font-style: italic; color: #402E2A; font-size: 15px; line-height: 1.8; border-left: 3px solid #C9A96E; padding-left: 16px; margin: 0; }
        .meta { margin-top: 16px; padding-top: 12px; border-top: 1px dashed #E6E2D3; font-size: 13px; color: #70665E; }
        .cta-btn { display: inline-block; background-color: #402E2A; color: white !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; margin-top: 8px; }
        .footer { text-align: center; padding: 20px 40px; background-color: #Fdfaf5; color: #70665E; font-size: 12px; border-top: 1px solid #E6E2D3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⭐ Ulasan Baru Masuk!</h1>
            <p>Marme Villa — Notifikasi Admin</p>
        </div>
        <div class="content">
            <p>Halo Admin, ada ulasan baru yang telah dikirimkan oleh tamu Anda. Berikut detailnya:</p>
            <div class="review-card">
                <div class="stars">
                    @for ($i = 0; $i < $review->rating; $i++) ★ @endfor
                    @for ($i = $review->rating; $i < 5; $i++) ☆ @endfor
                    ({{ $review->rating }}/5)
                </div>
                <blockquote class="comment">"{{ $review->comment }}"</blockquote>
                <div class="meta">
                    <strong>{{ $review->guest_name }}</strong> &mdash; {{ $review->city }}
                </div>
            </div>
            <p style="font-size: 14px; color: #70665E;">
                Buka halaman manajemen ulasan untuk menyetujui dan menampilkan ulasan ini di halaman utama website.
            </p>
            <a href="{{ $adminReviewUrl }}" class="cta-btn">Kelola Ulasan →</a>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Marme Villa Admin Panel. Pesan ini dikirim otomatis oleh sistem.
        </div>
    </div>
</body>
</html>
