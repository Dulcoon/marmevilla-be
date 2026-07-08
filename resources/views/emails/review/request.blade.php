<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bagikan Ulasan Anda - Marme Villa</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #F9F7F2; color: #402E2A; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #402E2A; color: white; padding: 32px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #D4B47D; font-weight: 700; }
        .stars { font-size: 32px; text-align: center; margin: 8px 0 0; letter-spacing: 4px; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
        .highlight-box { background-color: #F9F7F2; border: 1px solid #E6E2D3; border-radius: 12px; padding: 20px 24px; margin: 24px 0; text-align: center; }
        .highlight-box p { margin: 0; color: #70665E; font-size: 15px; font-style: italic; line-height: 1.8; }
        .cta-btn { display: block; margin: 28px auto 8px; background-color: #C9A96E; color: white !important; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 700; font-size: 16px; text-align: center; width: fit-content; letter-spacing: 0.5px; }
        .cta-note { text-align: center; font-size: 12px; color: #70665E; margin-top: 8px; }
        .link-fallback { font-size: 12px; color: #70665E; word-break: break-all; text-align: center; margin-top: 8px; }
        .footer { text-align: center; padding: 28px 40px; background-color: #Fdfaf5; color: #70665E; font-size: 12px; border-top: 1px solid #E6E2D3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Marme Villa Jogja</h1>
            <div class="stars">🌟</div>
        </div>
        <div class="content">
            <div class="greeting">Halo {{ $review->booking?->guest_name ?? 'Tamu Marme Villa' }},</div>
            <p>
                Terima kasih telah memilih Marme Villa sebagai tempat istirahat Anda. Kami berharap setiap momen yang Anda lewati bersama kami membawa kenangan indah yang akan selalu diingat.
            </p>
            <div class="highlight-box">
                <p>
                    "Ulasan Anda sangat berarti bagi kami — dan bagi calon tamu lain yang sedang mencari pengalaman yang sama seperti yang Anda rasakan."
                </p>
            </div>
            <p>
                Hanya butuh satu menit untuk mengisi form di bawah ini. Ceritakan tentang pengalaman Anda, dan beri kami bintang yang Anda rasa sesuai!
            </p>
            <a href="{{ $reviewUrl }}" class="cta-btn">
                ✍️ Tulis Ulasan Saya
            </a>
            <p class="cta-note">Klik tombol di atas untuk langsung menuju form ulasan.</p>
            <p class="link-fallback">Atau salin tautan ini: {{ $reviewUrl }}</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Marme Villa. All rights reserved.<br>
            Bantul, Daerah Istimewa Yogyakarta
        </div>
    </div>
</body>
</html>
