import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const BOOKING_STATUS = {
    pending:    { label: 'Menunggu',     color: 'bg-amber-100 text-amber-700 ring-amber-300' },
    confirmed:  { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700 ring-blue-300' },
    checked_in: { label: 'Check-In',     color: 'bg-indigo-100 text-indigo-700 ring-indigo-300' },
    checked_out:{ label: 'Check-Out',    color: 'bg-purple-100 text-purple-700 ring-purple-300' },
    cancelled:  { label: 'Dibatalkan',   color: 'bg-red-100 text-red-700 ring-red-300' },
};

const PAYMENT_STATUS = {
    pending:  { label: 'Belum Bayar', color: 'bg-amber-50 text-amber-600 ring-amber-200' },
    paid:     { label: 'Lunas',       color: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
    failed:   { label: 'Gagal',       color: 'bg-red-50 text-red-600 ring-red-200' },
    refunded: { label: 'Dikembalikan',color: 'bg-gray-100 text-gray-600 ring-gray-300' },
};

function StatusBadge({ type, value }) {
    const map = type === 'booking' ? BOOKING_STATUS : PAYMENT_STATUS;
    const status = map[value] ?? { label: value, color: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${status.color}`}>
            {status.label}
        </span>
    );
}

function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReservationIndex({ bookings, villas, summary, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [bookingStatus, setBookingStatus] = useState(filters.booking_status ?? '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status ?? '');
    const [villaId, setVillaId] = useState(filters.villa_id ?? '');

    const applyFilter = (overrides = {}) => {
        router.get(route('admin.reservations.index'), {
            search: overrides.search ?? search,
            booking_status: overrides.booking_status ?? bookingStatus,
            payment_status: overrides.payment_status ?? paymentStatus,
            villa_id: overrides.villa_id ?? villaId,
        }, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilter();
    };

    const handleStatusFilter = (field, value) => {
        const setters = { booking_status: setBookingStatus, payment_status: setPaymentStatus, villa_id: setVillaId };
        setters[field](value);
        applyFilter({ [field]: value });
    };

    const summaryCards = [
        { label: 'Total Reservasi', value: summary.total,      icon: 'receipt_long',    color: 'bg-primary/10 text-primary' },
        { label: 'Menunggu',        value: summary.pending,     icon: 'hourglass_empty', color: 'bg-amber-100 text-amber-700' },
        { label: 'Dikonfirmasi',    value: summary.confirmed,   icon: 'check_circle',    color: 'bg-blue-100 text-blue-700' },
        { label: 'Check-In',        value: summary.checked_in,  icon: 'meeting_room',    color: 'bg-indigo-100 text-indigo-700' },
        { label: 'Lunas',           value: summary.paid,        icon: 'payments',        color: 'bg-emerald-100 text-emerald-700' },
        { label: 'Dibatalkan',      value: summary.cancelled,   icon: 'cancel',          color: 'bg-red-100 text-red-700' },
    ];

    const selectClass = "px-3 py-2 text-sm bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface";

    return (
        <AdminLayout>
            <Head title="Reservasi - Admin Marme Villa" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Manajemen Reservasi</h2>
                        <p className="text-on-surface-variant text-sm mt-0.5">Pantau dan kelola semua booking yang masuk.</p>
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

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                    {summaryCards.map((c) => (
                        <div key={c.label} className="bg-white rounded-xl p-4 ghost-border ambient-shadow flex flex-col gap-2">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.color}`}>
                                <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">{c.value}</div>
                            <div className="text-xs text-on-surface-variant leading-tight">{c.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-xl p-4 ghost-border ambient-shadow">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari kode booking, nama, email..."
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shrink-0">
                                Cari
                            </button>
                        </form>

                        {/* Dropdowns */}
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={bookingStatus}
                                onChange={(e) => handleStatusFilter('booking_status', e.target.value)}
                                className={`${selectClass} w-full sm:w-auto`}
                            >
                                <option value="">Semua Status</option>
                                {Object.entries(BOOKING_STATUS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>

                            <select
                                value={paymentStatus}
                                onChange={(e) => handleStatusFilter('payment_status', e.target.value)}
                                className={`${selectClass} w-full sm:w-auto`}
                            >
                                <option value="">Semua Pembayaran</option>
                                {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>

                            <select
                                value={villaId}
                                onChange={(e) => handleStatusFilter('villa_id', e.target.value)}
                                className={`${selectClass} w-full sm:w-auto`}
                            >
                                <option value="">Semua Villa</option>
                                {villas.map((v) => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>

                            {(search || bookingStatus || paymentStatus || villaId) && (
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setBookingStatus('');
                                        setPaymentStatus('');
                                        setVillaId('');
                                        router.get(route('admin.reservations.index'));
                                    }}
                                    className="w-full sm:w-auto px-3 py-2 text-sm text-error bg-error/10 rounded-lg hover:bg-error/20 transition-colors flex justify-center items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data Container */}
                <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-outline-variant/30">
                        {bookings.data.length === 0 && (
                            <div className="text-center py-12 text-on-surface-variant">
                                <span className="material-symbols-outlined text-4xl block mb-2 text-outline">inbox</span>
                                <p className="font-medium">Tidak ada reservasi ditemukan</p>
                                <p className="text-xs mt-1">Coba ubah filter pencarian Anda</p>
                            </div>
                        )}
                        {bookings.data.map((booking) => (
                            <div key={booking.id} className="p-4 flex flex-col gap-4 hover:bg-surface-container-low/30 transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <span className="font-mono font-bold text-primary text-sm tracking-wide">
                                            {booking.booking_code}
                                        </span>
                                        <div className="text-xs text-on-surface-variant mt-1">
                                            Tgl Dibuat: {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <StatusBadge type="booking" value={booking.booking_status} />
                                        <StatusBadge type="payment" value={booking.payment_status} />
                                    </div>
                                </div>
                                
                                <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/40 space-y-2.5">
                                    <div className="flex justify-between items-start gap-2 border-b border-outline-variant/30 pb-2.5">
                                        <div>
                                            <div className="font-semibold text-on-surface text-sm">{booking.guest_name}</div>
                                            <div className="text-xs text-on-surface-variant line-clamp-1">{booking.guest_email}</div>
                                            <div className="text-xs text-on-surface-variant">{booking.guest_phone}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-bold text-primary">{formatIDR(booking.total_amount)}</div>
                                            {booking.discount_amount > 0 && (
                                                <div className="text-[10px] text-emerald-600 font-medium">Diskon: {formatIDR(booking.discount_amount)}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-on-surface-variant pt-0.5">
                                        <div className="font-medium text-on-surface">{booking.villa?.name ?? '-'}</div>
                                        <div>{booking.guest_count} tamu</div>
                                    </div>
                                    <div className="flex justify-between text-xs text-on-surface-variant">
                                        <div>Check-in / out</div>
                                        <div className="font-medium">{formatDate(booking.check_in)} - {formatDate(booking.check_out)}</div>
                                    </div>
                                </div>

                                <Link
                                    href={route('admin.reservations.show', booking.id)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                                >
                                    Detail Reservasi
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-outline-variant/50 bg-surface-container-low/50">
                                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wide">Kode</th>
                                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wide">Tamu</th>
                                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wide hidden md:table-cell">Villa</th>
                                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                                    <th className="text-right px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wide hidden sm:table-cell">Total</th>
                                    <th className="text-center px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wide">Pembayaran</th>
                                    <th className="text-center px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/30">
                                {bookings.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-4xl block mb-2 text-outline">inbox</span>
                                            <p className="font-medium">Tidak ada reservasi ditemukan</p>
                                            <p className="text-xs mt-1">Coba ubah filter pencarian Anda</p>
                                        </td>
                                    </tr>
                                )}
                                {bookings.data.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-surface-container-low/30 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <span className="font-mono font-semibold text-primary text-xs tracking-wide">
                                                {booking.booking_code}
                                            </span>
                                            <div className="text-xs text-on-surface-variant mt-0.5">
                                                {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-medium text-on-surface">{booking.guest_name}</div>
                                            <div className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[160px]">{booking.guest_email}</div>
                                            <div className="text-xs text-on-surface-variant">{booking.guest_phone}</div>
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell">
                                            <div className="text-on-surface font-medium">{booking.villa?.name ?? '-'}</div>
                                            <div className="text-xs text-on-surface-variant">{booking.guest_count} tamu</div>
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell">
                                            <div className="text-on-surface">{formatDate(booking.check_in)}</div>
                                            <div className="text-xs text-on-surface-variant">s/d {formatDate(booking.check_out)}</div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                                            <div className="font-semibold text-on-surface">{formatIDR(booking.total_amount)}</div>
                                            {booking.discount_amount > 0 && (
                                                <div className="text-xs text-emerald-600 mt-0.5">Diskon: {formatIDR(booking.discount_amount)}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusBadge type="payment" value={booking.payment_status} />
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusBadge type="booking" value={booking.booking_status} />
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <Link
                                                href={route('admin.reservations.show', booking.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                            >
                                                Detail
                                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {bookings.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/50">
                            <p className="text-xs text-on-surface-variant">
                                Menampilkan {bookings.from}–{bookings.to} dari {bookings.total} reservasi
                            </p>
                            <div className="flex gap-1">
                                {bookings.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                        className={`px-2 sm:px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                            link.active
                                                ? 'bg-primary text-white font-semibold'
                                                : !link.url
                                                ? 'text-outline cursor-not-allowed'
                                                : 'text-on-surface hover:bg-surface-container-low border border-outline-variant/40'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
