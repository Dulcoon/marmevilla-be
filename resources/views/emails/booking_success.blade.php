<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Sukses - Marme Villa</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #F9F7F2; color: #402E2A; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #402E2A; color: white; padding: 32px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #D4B47D; font-weight: 700; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 24px; }
        .details-box { background-color: #F9F7F2; border: 1px solid #E6E2D3; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #E6E2D3; padding-bottom: 12px; }
        .detail-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        .label { color: #70665E; font-size: 14px; }
        .value { font-weight: 600; text-align: right; }
        .footer { text-align: center; padding: 32px 40px; background-color: #Fdfaf5; color: #70665E; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reservasi Dikonfirmasi</h1>
            <p style="margin-top: 8px; opacity: 0.8; font-size: 14px;">Kode Booking: {{ $booking->booking_code }}</p>
        </div>
        <div class="content">
            <div class="greeting">Halo {{ $booking->guest_name }},</div>
            <p>Terima kasih telah memilih Marme Villa. Kami dengan senang hati menginformasikan bahwa reservasi Anda telah berhasil dikonfirmasi.</p>
            
            <div class="details-box">
                <div class="detail-row">
                    <span class="label">Villa</span>
                    <span class="value">{{ $booking->villa->name }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Check-in</span>
                    <span class="value">{{ \Carbon\Carbon::parse($booking->check_in)->translatedFormat('d F Y') }} <br><span style="font-size: 12px; color: #70665E; font-weight: normal;">Mulai 14:00 WIB</span></span>
                </div>
                <div class="detail-row">
                    <span class="label">Check-out</span>
                    <span class="value">{{ \Carbon\Carbon::parse($booking->check_out)->translatedFormat('d F Y') }} <br><span style="font-size: 12px; color: #70665E; font-weight: normal;">Hingga 12:00 WIB</span></span>
                </div>
                <div class="detail-row">
                    <span class="label">Jumlah Tamu</span>
                    <span class="value">{{ $booking->guest_count }} Orang</span>
                </div>
            </div>

            <p style="font-size: 14px; color: #70665E;">Kami sangat menantikan kedatangan Anda. Jika Anda memiliki pertanyaan atau permintaan khusus, jangan ragu untuk membalas email ini.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Marme Villa. All rights reserved.<br>
            Jalan Pariwisata Pantai Selatan, Gunungkidul, Yogyakarta
        </div>
    </div>
</body>
</html>
