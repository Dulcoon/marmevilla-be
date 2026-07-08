<x-mail::message>
# Reservasi Terkonfirmasi

Halo {{ explode(' ', $booking->guest_name)[0] }},

Terima kasih atas pesanan Anda di Marme Villa Jogja! Pembayaran Anda telah berhasil dan reservasi Anda sudah kami konfirmasi.

**Rincian Pesanan:**
- **Kode Booking:** {{ $booking->booking_code }}
- **Nama Pemesan:** {{ $booking->guest_name }}
- **Paviliun:** {{ $booking->villa->name }}
- **Tanggal Check-in:** {{ \Carbon\Carbon::parse($booking->check_in)->translatedFormat('d F Y') }} (Mulai 14:00 WIB)
- **Tanggal Check-out:** {{ \Carbon\Carbon::parse($booking->check_out)->translatedFormat('d F Y') }} (Hingga 12:00 WIB)
- **Jumlah Tamu:** {{ $booking->guest_count }} orang
- **Total Pembayaran:** Rp {{ number_format($booking->total_amount, 0, ',', '.') }}

<x-mail::button :url="config('app.frontend_url') . '/booking/status?code=' . $booking->booking_code . '&email=' . urlencode($booking->guest_email)">
Cek Status & Detail Reservasi
</x-mail::button>

Jika Anda membutuhkan bantuan mendesak atau memiliki pertanyaan sebelum kedatangan, silakan hubungi kontak darurat admin kami di **+62 851 9008 3940**.

Sampai jumpa di Marme Villa Jogja! Jika Anda memiliki pertanyaan atau permintaan khusus, jangan ragu untuk membalas email ini.

Salam Hangat,<br>
Tim {{ config('app.name') }}
</x-mail::message>

