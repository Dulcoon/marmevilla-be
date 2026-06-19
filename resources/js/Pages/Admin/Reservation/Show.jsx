import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';

const BOOKING_STATUS = {
    pending:    { label: 'Menunggu',     color: 'bg-amber-100 text-amber-700',    icon: 'hourglass_empty' },
    confirmed:  { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700',      icon: 'check_circle' },
    checked_in: { label: 'Check-In',     color: 'bg-indigo-100 text-indigo-700',  icon: 'meeting_room' },
    checked_out:{ label: 'Check-Out',    color: 'bg-purple-100 text-purple-700',  icon: 'exit_to_app' },
    cancelled:  { label: 'Dibatalkan',   color: 'bg-red-100 text-red-700',        icon: 'cancel' },
};

const PAYMENT_STATUS = {
    pending:  { label: 'Belum Bayar',  color: 'bg-amber-50 text-amber-600',    icon: 'pending' },
    paid:     { label: 'Lunas',        color: 'bg-emerald-50 text-emerald-700', icon: 'payments' },
    failed:   { label: 'Gagal',        color: 'bg-red-50 text-red-700',        icon: 'error' },
    refunded: { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-600',     icon: 'undo' },
};

function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-outline-variant/30 last:border-b-0">
            <span className="text-xs text-on-surface-variant uppercase tracking-wide font-medium w-40 shrink-0">{label}</span>
            <span className="text-sm text-on-surface font-medium">{value ?? '-'}</span>
        </div>
    );
}

export default function ReservationShow({ booking }) {
    const { flash } = usePage().props;

    const statusForm = useForm({
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
    });

    const updateStatus = (e) => {
        e.preventDefault();
        statusForm.patch(route('admin.reservations.update-status', booking.id), {
            preserveScroll: true,
        });
    };

    const cancelBooking = () => {
        if (confirm('Yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat diurungkan.')) {
            router.patch(route('admin.reservations.cancel', booking.id), {}, { preserveScroll: true });
        }
    };

    const bs = BOOKING_STATUS[booking.booking_status] ?? { label: booking.booking_status, color: 'bg-gray-100 text-gray-600', icon: 'help' };
    const ps = PAYMENT_STATUS[booking.payment_status] ?? { label: booking.payment_status, color: 'bg-gray-100 text-gray-600', icon: 'help' };

    const nights = Math.round(
        (new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24)
    );

    const primaryImage = booking.villa?.images?.find(i => i.is_primary) ?? booking.villa?.images?.[0];
    const imageUrl = primaryImage?.image_url ?? null;

    const selectClass = "w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface";

    return (
        <AdminLayout>
            <Head title={`Reservasi ${booking.booking_code} - Admin`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.reservations.index')}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary border border-transparent hover:border-outline-variant/30 transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-primary font-mono tracking-wide">{booking.booking_code}</h2>
                        <p className="text-on-surface-variant text-sm mt-0.5">
                            Dibuat pada {formatDate(booking.created_at)}
                        </p>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        <span className="text-sm font-medium">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                        <span className="material-symbols-outlined text-[20px]">error</span>
                        <span className="text-sm font-medium">{flash.error}</span>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left: Booking Details */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Status Badges */}
                        <div className="bg-white rounded-xl p-5 ghost-border ambient-shadow flex flex-wrap gap-3">
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm ${bs.color}`}>
                                <span className="material-symbols-outlined text-[18px]">{bs.icon}</span>
                                {bs.label}
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm ${ps.color}`}>
                                <span className="material-symbols-outlined text-[18px]">{ps.icon}</span>
                                {ps.label}
                            </div>
                        </div>

                        {/* Villa Info */}
                        <div className="bg-white rounded-xl p-5 ghost-border ambient-shadow">
                            <h3 className="font-bold text-primary text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">villa</span>
                                Informasi Villa
                            </h3>
                            <div className="flex gap-4">
                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt={booking.villa?.name}
                                        className="w-24 h-20 object-cover rounded-xl shrink-0"
                                    />
                                )}
                                <div>
                                    <p className="font-bold text-on-surface text-base">{booking.villa?.name ?? '-'}</p>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                        <div className="text-xs text-on-surface-variant">Check-In <span className="block font-semibold text-on-surface text-sm">{formatDate(booking.check_in)}</span></div>
                                        <div className="text-xs text-on-surface-variant">Check-Out <span className="block font-semibold text-on-surface text-sm">{formatDate(booking.check_out)}</span></div>
                                        <div className="text-xs text-on-surface-variant">Durasi <span className="block font-semibold text-on-surface text-sm">{nights} malam</span></div>
                                        <div className="text-xs text-on-surface-variant">Tamu <span className="block font-semibold text-on-surface text-sm">{booking.guest_count} orang</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guest Info */}
                        <div className="bg-white rounded-xl p-5 ghost-border ambient-shadow">
                            <h3 className="font-bold text-primary text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">person</span>
                                Data Tamu
                            </h3>
                            <InfoRow label="Nama Lengkap" value={booking.guest_name} />
                            <InfoRow label="Email" value={booking.guest_email} />
                            <InfoRow label="Telepon" value={booking.guest_phone} />
                            <InfoRow label="Jumlah Tamu" value={`${booking.guest_count} orang${booking.extra_guests > 0 ? ` (${booking.extra_guests} ekstra)` : ''}`} />
                            {booking.special_requests && (
                                <InfoRow label="Permintaan Khusus" value={booking.special_requests} />
                            )}
                        </div>

                        {/* Payment Breakdown */}
                        <div className="bg-white rounded-xl p-5 ghost-border ambient-shadow">
                            <h3 className="font-bold text-primary text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">receipt</span>
                                Rincian Pembayaran
                            </h3>
                            <InfoRow label="Harga Villa" value={formatIDR(booking.base_price_total)} />
                            {booking.extra_charge_total > 0 && (
                                <InfoRow label="Biaya Ekstra Tamu" value={formatIDR(booking.extra_charge_total)} />
                            )}
                            {booking.discount_amount > 0 && (
                                <InfoRow
                                    label={`Diskon${booking.voucher ? ` (${booking.voucher.code})` : ''}`}
                                    value={`- ${formatIDR(booking.discount_amount)}`}
                                />
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 mt-1 bg-primary/5 rounded-lg px-3">
                                <span className="text-xs text-on-surface-variant uppercase tracking-wide font-medium w-40 shrink-0">Total Pembayaran</span>
                                <span className="text-lg font-bold text-primary">{formatIDR(booking.total_amount)}</span>
                            </div>
                            <InfoRow label="Midtrans Order ID" value={booking.midtrans_order_id} />
                        </div>

                    </div>

                    {/* Right: Actions */}
                    <div className="space-y-5">

                        {/* Update Status Form */}
                        <div className="bg-white rounded-xl p-5 ghost-border ambient-shadow">
                            <h3 className="font-bold text-primary text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                Ubah Status
                            </h3>
                            <form onSubmit={updateStatus} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Status Reservasi</label>
                                    <select
                                        value={statusForm.data.booking_status}
                                        onChange={(e) => statusForm.setData('booking_status', e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="pending">Menunggu</option>
                                        <option value="confirmed">Dikonfirmasi</option>
                                        <option value="checked_in">Check-In</option>
                                        <option value="checked_out">Check-Out</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Status Pembayaran</label>
                                    <select
                                        value={statusForm.data.payment_status}
                                        onChange={(e) => statusForm.setData('payment_status', e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="pending">Belum Bayar</option>
                                        <option value="paid">Lunas</option>
                                        <option value="failed">Gagal</option>
                                        <option value="refunded">Dikembalikan</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {statusForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </form>
                        </div>

                        {/* Danger Zone */}
                        {!['cancelled', 'checked_out'].includes(booking.booking_status) && (
                            <div className="bg-white rounded-xl p-5 ghost-border ambient-shadow border-l-4 border-error">
                                <h3 className="font-bold text-error text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">warning</span>
                                    Tindakan Berbahaya
                                </h3>
                                <p className="text-xs text-on-surface-variant mb-4">Membatalkan reservasi akan membebaskan slot tanggal tersebut. Tindakan ini tidak dapat diurungkan.</p>
                                <button
                                    type="button"
                                    onClick={cancelBooking}
                                    className="w-full py-2.5 bg-error text-white text-sm font-semibold rounded-lg hover:bg-error/90 transition-colors"
                                >
                                    Batalkan Reservasi
                                </button>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white rounded-xl p-5 ghost-border ambient-shadow">
                            <h3 className="font-bold text-primary text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">timeline</span>
                                Info Sistem
                            </h3>
                            <div className="space-y-3 text-xs text-on-surface-variant">
                                <div className="flex justify-between">
                                    <span>Dibuat</span>
                                    <span className="font-medium text-on-surface">{formatDate(booking.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Terakhir diubah</span>
                                    <span className="font-medium text-on-surface">{formatDate(booking.updated_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Midtrans Token</span>
                                    <span className="font-mono text-[10px] text-on-surface truncate max-w-[120px]">
                                        {booking.midtrans_snap_token ? booking.midtrans_snap_token.substring(0, 16) + '...' : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
