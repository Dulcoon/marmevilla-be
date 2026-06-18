<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pembayaran Berhasil - Marme Villa</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #F9F7F2; color: #402E2A; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #2E7D32; color: white; padding: 32px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 24px; }
        .details-box { background-color: #F9F7F2; border: 1px solid #E6E2D3; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #E6E2D3; padding-bottom: 12px; }
        .detail-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        .label { color: #70665E; font-size: 14px; }
        .value { font-weight: 600; text-align: right; }
        .total-row { display: flex; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 2px solid #402E2A; font-size: 18px; font-weight: 700; color: #D4B47D; }
        .footer { text-align: center; padding: 32px 40px; background-color: #Fdfaf5; color: #70665E; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pembayaran Berhasil</h1>
            <p style="margin-top: 8px; opacity: 0.9; font-size: 14px;">Terima kasih atas pembayaran Anda</p>
        </div>
        <div class="content">
            <div class="greeting">Halo {{ $booking->guest_name }},</div>
            <p>Kami telah menerima pembayaran Anda untuk reservasi dengan kode <strong>{{ $booking->booking_code }}</strong>.</p>
            
            <div class="details-box">
                <div class="detail-row">
                    <span class="label">Harga Villa</span>
                    <span class="value">Rp {{ number_format($booking->base_price_total, 0, ',', '.') }}</span>
                </div>
                @if($booking->extra_charge_total > 0)
                <div class="detail-row">
                    <span class="label">Biaya Ekstra Tamu</span>
                    <span class="value">Rp {{ number_format($booking->extra_charge_total, 0, ',', '.') }}</span>
                </div>
                @endif
                @if($booking->discount_amount > 0)
                <div class="detail-row">
                    <span class="label">Diskon Voucher</span>
                    <span class="value" style="color: #2E7D32;">- Rp {{ number_format($booking->discount_amount, 0, ',', '.') }}</span>
                </div>
                @endif
                <div class="total-row">
                    <span>Total Dibayar</span>
                    <span>Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</span>
                </div>
            </div>

            <p style="font-size: 14px; color: #70665E;">Anda juga akan menerima email konfirmasi booking dengan detail check-in Anda sesaat lagi. Terima kasih!</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Marme Villa. All rights reserved.
        </div>
    </div>
</body>
</html>
