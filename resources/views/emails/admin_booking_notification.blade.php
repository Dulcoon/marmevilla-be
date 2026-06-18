<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Baru Masuk! - Marme Villa Admin</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #F9F7F2; color: #402E2A; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #D4B47D; color: white; padding: 32px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #402E2A; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 24px; }
        .details-box { background-color: #F9F7F2; border: 1px solid #E6E2D3; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #E6E2D3; padding-bottom: 12px; }
        .detail-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        .label { color: #70665E; font-size: 14px; }
        .value { font-weight: 600; text-align: right; }
        .btn { display: inline-block; padding: 14px 28px; background-color: #402E2A; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; margin-top: 24px; }
        .footer { text-align: center; padding: 32px 40px; background-color: #Fdfaf5; color: #70665E; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Booking Baru Masuk!</h1>
        </div>
        <div class="content">
            <div class="greeting">Halo Tim Admin,</div>
            <p>Satu reservasi baru saja berhasil dibayar dan dikonfirmasi. Berikut adalah detail transaksinya:</p>
            
            <div class="details-box">
                <div class="detail-row">
                    <span class="label">Kode Booking</span>
                    <span class="value" style="color: #D4B47D;">{{ $booking->booking_code }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Nama Tamu</span>
                    <span class="value">{{ $booking->guest_name }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Telepon</span>
                    <span class="value">{{ $booking->guest_phone }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Villa</span>
                    <span class="value">{{ $booking->villa->name }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Tanggal</span>
                    <span class="value">{{ \Carbon\Carbon::parse($booking->check_in)->translatedFormat('d M') }} - {{ \Carbon\Carbon::parse($booking->check_out)->translatedFormat('d M Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Total Dibayar</span>
                    <span class="value">Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</span>
                </div>
                @if($booking->special_requests)
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #E6E2D3;">
                    <span class="label" style="display: block; margin-bottom: 4px;">Permintaan Khusus:</span>
                    <span class="value" style="font-weight: normal; text-align: left; display: block; font-style: italic;">"{{ $booking->special_requests }}"</span>
                </div>
                @endif
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/admin/bookings" class="btn">Lihat di Dashboard</a>
            </div>
        </div>
        <div class="footer">
            Sistem Notifikasi Marme Villa
        </div>
    </div>
</body>
</html>
