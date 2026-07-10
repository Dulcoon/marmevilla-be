<x-mail::message>
# Reservasi Terkonfirmasi

Halo {{ explode(' ', $booking->guest_name)[0] }},

Terima kasih atas pesanan Anda di Marme Villa Jogja! Pembayaran Anda telah berhasil dan reservasi Anda sudah kami konfirmasi.

**Rincian Pesanan:**
<div style="font-size: 16px; line-height: 1.5; margin-top: 10px; margin-bottom: 20px;">
• **Kode Booking:** {{ $booking->booking_code }}<br>
• **Nama Pemesan:** {{ $booking->guest_name }}<br>
• **Paviliun:** {{ $booking->villa->name }}<br>
• **Tanggal Check-in:** {{ \Carbon\Carbon::parse($booking->check_in)->translatedFormat('d F Y') }} (Mulai 15:00 WIB)<br>
• **Tanggal Check-out:** {{ \Carbon\Carbon::parse($booking->check_out)->translatedFormat('d F Y') }} (Hingga 12:00 WIB)<br>
• **Jumlah Tamu:** {{ $booking->guest_count }} orang<br>
• **Total Pembayaran:** Rp {{ number_format($booking->total_amount, 0, ',', '.') }}
</div>

<x-mail::button :url="config('app.frontend_url') . '/booking/status?code=' . $booking->booking_code . '&email=' . urlencode($booking->guest_email)">
Cek Status & Detail Reservasi
</x-mail::button>

Jika Anda membutuhkan bantuan mendesak atau memiliki pertanyaan sebelum kedatangan, silakan hubungi kontak darurat admin kami di **+62 851 9008 3940**.

Sampai jumpa di Marme Villa Jogja! Jika Anda memiliki pertanyaan atau permintaan khusus, jangan ragu untuk membalas email ini.

Salam Hangat,<br>
Tim {{ config('app.name') }}
</x-mail::message>

