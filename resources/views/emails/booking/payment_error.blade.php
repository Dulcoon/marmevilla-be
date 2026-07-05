<x-mail::message>
# ⚠️ Pembayaran Gagal

Halo Tim Admin,

Ada reservasi yang gagal diproses pembayarannya. Berikut detailnya:

<x-mail::panel>
**Kode Booking:** {{ $booking->booking_code }}

**Nama Tamu:** {{ $booking->guest_name }}

**Email:** {{ $booking->guest_email }}

**Telepon:** {{ $booking->guest_phone }}

**Villa:** {{ $booking->villa->name ?? '-' }}

**Tanggal:** {{ \Carbon\Carbon::parse($booking->check_in)->translatedFormat('d M Y') }} - {{ \Carbon\Carbon::parse($booking->check_out)->translatedFormat('d M Y') }}

**Total:** Rp {{ number_format($booking->total_amount, 0, ',', '.') }}

**Status:** Gagal Bayar

@if(!empty($errorMessage))
**Pesan Error:** {{ $errorMessage }}
@endif
</x-mail::panel>

<x-mail::button :url="route('admin.reservations.index')">
Lihat di Dashboard
</x-mail::button>

Reservasi ini masih tersimpan di sistem dan dapat dicoba ulang pembayarannya.

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
