import AdminLayout from '@/Layouts/AdminLayout';
import { IconRenderer } from '@/utils/icon-mapper';
import { Head, Link, router } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ stats: beStats, todayHighlights, recentBookings, revenueTrend, trend }) {
    const stats = [
        {
            title: 'Total Pendapatan',
            value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(beStats?.totalRevenue || 0),
            icon: 'payments',
            trend: 'Pesanan Lunas',
            trendType: 'neutral',
        },
        {
            title: 'Total Booking',
            value: beStats?.totalBookings || '0',
            icon: 'calendar_month',
            trend: 'Semua Status',
            trendType: 'neutral',
        },
        {
            title: 'Reservasi Aktif',
            value: beStats?.activeBookings || '0',
            icon: 'vpn_key',
            trend: 'Belum Check-out',
            trendType: 'neutral',
        },
    ];

    const formatDateRange = (start, end) => {
        if (!start || !end) return '-';
        const opt = { day: 'numeric', month: 'short' };
        return `${new Date(start).toLocaleDateString('id-ID', opt)} - ${new Date(end).toLocaleDateString('id-ID', opt)}`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { label: 'Menunggu', style: 'bg-[#fff3e0] text-[#e65100]' };
            case 'confirmed': return { label: 'Dikonfirmasi', style: 'bg-[#e8f5e9] text-[#2e7d32]' };
            case 'checked_in': return { label: 'Check-in', style: 'bg-[#e3f2fd] text-[#1565c0]' };
            case 'checked_out': return { label: 'Selesai', style: 'bg-surface-variant text-on-surface-variant' };
            case 'cancelled': return { label: 'Batal', style: 'bg-[#ffebee] text-[#c62828]' };
            default: return { label: status || 'Unknown', style: 'bg-surface-variant text-on-surface-variant' };
        }
    };

    const highlights = [
        {
            title: 'Check-in',
            subtitle: `${todayHighlights?.checkIns?.total || 0} Tamu Datang`,
            status: todayHighlights?.checkIns?.waiting > 0 ? `${todayHighlights.checkIns.waiting} Menunggu` : 'Semua Sudah Datang',
            icon: 'login',
            statusStyle: todayHighlights?.checkIns?.waiting > 0 ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant',
        },
        {
            title: 'Check-out',
            subtitle: `${todayHighlights?.checkOuts?.total || 0} Terjadwal`,
            status: todayHighlights?.checkOuts?.waiting > 0 ? `${todayHighlights.checkOuts.waiting} Belum Keluar` : 'Selesai Semua',
            icon: 'logout',
            statusStyle: todayHighlights?.checkOuts?.waiting > 0 ? 'bg-error/20 text-error-container' : 'bg-surface-variant text-on-surface-variant',
        }
    ];

    const bookings = recentBookings || [];

    return (
        <AdminLayout>
            <Head title="Ringkasan Dashboard" />

            {/* Dashboard Content Container - Optimized for mobile paddings */}
            <div className="p-4 sm:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Ringkasan Dashboard</h2>
                        <p className="text-on-surface-variant text-base sm:text-body-md">Selamat datang kembali. Berikut aktivitas di Marme Villa hari ini.</p>
                    </div>
                    {/* <button className="w-full sm:w-auto bg-primary text-white px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow active:scale-[0.98]">
                        <IconRenderer name="add" className="text-[20px] sm:text-[18px]" />
                        Booking Baru
                    </button> */}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col gap-3 sm:gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-[#fdfaf5] rounded-lg border border-[#f0e8d9]">
                                    <IconRenderer name={stat.icon} className="text-primary text-2xl" />
                                </div>
                                {stat.trendType === 'up' ? (
                                    <span className="bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                        <IconRenderer name="trending_up" className="text-[16px] sm:text-[14px]" /> {stat.trend}
                                    </span>
                                ) : (
                                    <span className="bg-surface-variant text-on-surface-variant text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-label-md text-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider mb-0.5 sm:mb-1">{stat.title}</p>
                                <h3 className="text-2xl sm:text-headline-lg font-bold text-primary">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bento Grid: Trend Chart & Highlights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Chart Area */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-headline-md font-bold text-primary">Tren Pendapatan</h3>
                            <select 
                                value={trend || '30_days'}
                                onChange={(e) => router.get(route('admin.dashboard'), { trend: e.target.value }, { preserveState: true, preserveScroll: true })}
                                className="bg-surface-container-lowest border border-outline-variant rounded-md text-sm py-2 pl-3 pr-8 focus:ring-primary focus:border-primary focus:outline-none"
                            >
                                <option value="30_days">30 Hari Terakhir</option>
                                <option value="year">Tahun Ini</option>
                            </select>
                        </div>
                        <div className="h-[240px] sm:h-[300px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#402E2A" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#402E2A" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#737373', fontSize: 12 }}
                                        tickMargin={10}
                                        minTickGap={30}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#737373', fontSize: 12 }}
                                        tickFormatter={(value) => `Rp${(value/1000000).toFixed(1)}Jt`}
                                        width={80}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value), 'Pendapatan']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#402E2A" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Today's Highlights */}
                    <div className="bg-primary rounded-xl p-4 sm:p-6 ghost-border ambient-shadow text-white relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-20 -mr-10 -mt-10"></div>
                        
                        <div>
                            <h3 className="text-xl sm:text-headline-md font-bold text-on-primary mb-4 sm:mb-6 relative z-10">Sorotan Hari Ini</h3>
                            <div className="space-y-3 sm:space-y-4 relative z-10">
                                {highlights.map((highlight, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <IconRenderer name={highlight.icon} className="text-primary" />
                                            <div>
                                                <p className="font-label-md text-sm text-white/70">{highlight.title}</p>
                                                <p className="font-bold text-base">{highlight.subtitle}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-3 py-1.5 rounded font-medium ${highlight.statusStyle}`}>
                                            {highlight.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings Table */}
                <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-outline-variant/50 flex justify-between items-center">
                        <h3 className="text-xl sm:text-headline-md font-bold text-primary">Booking Terbaru</h3>
                        <a className="text-on-surface-variant font-medium text-sm hover:underline" href="#">Lihat Semua</a>
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[650px]">
                            <thead>
                                <tr className="bg-surface-bright border-b border-outline-variant text-on-surface-variant font-label-md text-sm uppercase tracking-wider">
                                    <th className="py-4 px-4 sm:px-6 font-semibold">Kode</th>
                                    <th className="py-4 px-4 sm:px-6 font-semibold">Tamu</th>
                                    <th className="py-4 px-4 sm:px-6 font-semibold">Villa</th>
                                    <th className="py-4 px-4 sm:px-6 font-semibold">Tanggal</th>
                                    <th className="py-4 px-4 sm:px-6 font-semibold">Status</th>
                                    <th className="py-4 px-4 sm:px-6 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-on-surface">
                                {bookings.length > 0 ? bookings.map((booking, idx) => {
                                    const { label, style } = getStatusStyle(booking.booking_status);
                                    return (
                                        <tr 
                                            key={booking.id || idx} 
                                            className={`hover:bg-surface-container-lowest transition-colors ${
                                                idx !== bookings.length - 1 ? 'border-b border-outline-variant/50' : ''
                                            }`}
                                        >
                                            <td className="py-4 px-4 sm:px-6 font-mono text-primary font-semibold">{booking.booking_code}</td>
                                            <td className="py-4 px-4 sm:px-6 font-bold">{booking.guest_name}</td>
                                            <td className="py-4 px-4 sm:px-6 text-on-surface-variant">{booking.villa?.name || '-'}</td>
                                            <td className="py-4 px-4 sm:px-6 text-on-surface-variant">{formatDateRange(booking.check_in, booking.check_out)}</td>
                                            <td className="py-4 px-4 sm:px-6">
                                                <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold ${style}`}>
                                                    {label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 sm:px-6 text-right">
                                                <Link href={route('admin.reservations.show', booking.id)} className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low inline-block">
                                                    <IconRenderer name="visibility" className="text-base sm:text-sm" />
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-on-surface-variant">Belum ada booking terbaru</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden flex flex-col divide-y divide-outline-variant/50">
                        {bookings.length > 0 ? bookings.map((booking, idx) => {
                            const { label, style } = getStatusStyle(booking.booking_status);
                            return (
                                <div key={booking.id || idx} className="p-5 flex flex-col gap-4 bg-white hover:bg-surface-container-lowest transition-colors">
                                    {/* Top Row: ID & Status */}
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-on-surface-variant text-[11px] font-bold">{booking.booking_code}</span>
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${style}`}>
                                            {label}
                                        </span>
                                    </div>
                                    
                                    {/* Guest Name */}
                                    <p className="font-bold text-[17px] text-primary -mt-2">{booking.guest_name}</p>
                                    
                                    {/* Detail Box */}
                                    <div className="flex justify-between items-center text-sm text-on-surface-variant bg-[#F9F7F2] rounded-xl p-3.5">
                                        <div className="flex items-center gap-2">
                                            <IconRenderer name="villa" className="text-[18px]" />
                                            <span className="font-medium truncate max-w-[120px]">{booking.villa?.name || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <IconRenderer name="calendar_today" className="text-[18px]" />
                                            <span className="font-medium whitespace-nowrap">{formatDateRange(booking.check_in, booking.check_out)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Button */}
                                    <Link href={route('admin.reservations.show', booking.id)} className="w-full py-2.5 text-sm font-semibold text-primary border border-outline-variant/60 rounded-xl hover:bg-surface-container-low transition-colors shadow-sm block text-center">
                                        Lihat Detail
                                    </Link>
                                </div>
                            )
                        }) : (
                            <div className="p-8 text-center text-on-surface-variant text-sm">Belum ada booking terbaru</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
