<x-mail::message>
# Reservasi Terkonfirmasi

Halo {{ explode(' ', $booking->guest_name)[0] }},

Terima kasih atas pesanan Anda di Marme Villa Jogja! Pembayaran Anda telah berhasil dan reservasi Anda sudah kami konfirmasi.

**Rincian Pesanan:**
- **Kode Booking:** {{ $booking->booking_code }}
- **Nama Pemesan:** {{ $booking->guest_name }}
- **Paviliun:** {{ $booking->villa->name }}
- **Tanggal Check-in:** {{ \Carbon\Carbon::parse($booking->check_in)->format('d F Y') }}
- **Tanggal Check-out:** {{ \Carbon\Carbon::parse($booking->check_out)->format('d F Y') }}
- **Jumlah Tamu:** {{ $booking->guest_count + $booking->extra_guests }} orang
- **Total Pembayaran:** Rp {{ number_format($booking->total_amount, 0, ',', '.') }}

<x-mail::button :url="config('app.frontend_url')">
Kunjungi Website Kami
</x-mail::button>

Sampai jumpa di Marme Villa Jogja! Jika Anda memiliki pertanyaan atau permintaan khusus, jangan ragu untuk membalas email ini.

Salam Hangat,<br>
Tim {{ config('app.name') }}
</x-mail::message>
