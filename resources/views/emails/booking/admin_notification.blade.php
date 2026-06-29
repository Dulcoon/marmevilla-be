<x-mail::message>
# Reservasi Baru Terkonfirmasi

Halo Admin,

Terdapat reservasi baru yang telah berhasil dibayar dan dikonfirmasi di Marme Villa Jogja.

**Rincian Pesanan:**
- **Kode Booking:** {{ $booking->booking_code }}
- **Nama Pemesan:** {{ $booking->guest_name }}
- **Email Pemesan:** {{ $booking->guest_email }}
- **No HP Pemesan:** {{ $booking->guest_phone ?? '-' }}
- **Paviliun:** {{ $booking->villa->name }}
- **Tanggal Check-in:** {{ \Carbon\Carbon::parse($booking->check_in)->format('d F Y') }}
- **Tanggal Check-out:** {{ \Carbon\Carbon::parse($booking->check_out)->format('d F Y') }}
- **Jumlah Tamu:** {{ $booking->guest_count + $booking->extra_guests }} orang
- **Total Pembayaran:** Rp {{ number_format($booking->total_amount, 0, ',', '.') }}

<x-mail::button :url="config('app.url') . '/admin/reservations'">
Lihat Detail Reservasi di Dashboard
</x-mail::button>

Sistem {{ config('app.name') }}
</x-mail::message>
