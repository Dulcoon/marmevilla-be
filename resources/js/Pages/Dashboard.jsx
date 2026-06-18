import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    const stats = [
        {
            title: 'Total Pendapatan',
            value: 'Rp 45.200.000',
            icon: 'payments',
            trend: '+12.5%',
            trendType: 'up',
        },
        {
            title: 'Total Booking',
            value: '128',
            icon: 'calendar_month',
            trend: '+5.2%',
            trendType: 'up',
        },
        {
            title: 'Reservasi Aktif',
            value: '14',
            icon: 'vpn_key',
            trend: 'Hari Ini',
            trendType: 'neutral',
        },
    ];

    const highlights = [
        {
            title: 'Check-in',
            subtitle: '4 Tamu Datang',
            status: '2 Menunggu',
            icon: 'login',
            statusStyle: 'bg-primary/20 text-primary',
        },
        {
            title: 'Check-out',
            subtitle: '3 Terjadwal',
            status: 'Selesai Semua',
            icon: 'logout',
            statusStyle: 'bg-primary/20 text-primary',
        },
        {
            title: 'Kebersihan',
            subtitle: '5 Villa',
            status: '1 Mendesak',
            icon: 'cleaning_services',
            statusStyle: 'bg-error/20 text-error-container',
        },
    ];

    const bookings = [
        {
            code: '#MV-8492',
            guest: 'Budi Santoso',
            villa: 'Villa Mahadewi',
            dates: '12 Okt - 15 Okt',
            status: 'Dikonfirmasi',
            statusStyle: 'bg-[#e8f5e9] text-[#2e7d32]',
        },
        {
            code: '#MV-8493',
            guest: 'Sarah Jenkins',
            villa: 'Villa Kencana',
            dates: '14 Okt - 18 Okt',
            status: 'Menunggu',
            statusStyle: 'bg-[#fff3e0] text-[#e65100]',
        },
        {
            code: '#MV-8494',
            guest: 'Ahmad Reza',
            villa: 'Villa Arjuna',
            dates: '12 Okt - 14 Okt',
            status: 'Sudah Check-in',
            statusStyle: 'bg-[#e3f2fd] text-[#1565c0]',
        },
        {
            code: '#MV-8495',
            guest: 'Diana Wijaya',
            villa: 'Villa Mahadewi',
            dates: '20 Okt - 22 Okt',
            status: 'Dikonfirmasi',
            statusStyle: 'bg-[#e8f5e9] text-[#2e7d32]',
        },
    ];

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
                    <button className="w-full sm:w-auto bg-primary text-white px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow active:scale-[0.98]">
                        <span className="material-symbols-outlined text-[20px] sm:text-[18px]">add</span>
                        Booking Baru
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col gap-3 sm:gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-[#fdfaf5] rounded-lg border border-[#f0e8d9]">
                                    <span className="material-symbols-outlined text-primary text-2xl">{stat.icon}</span>
                                </div>
                                {stat.trendType === 'up' ? (
                                    <span className="bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px] sm:text-[14px]">trending_up</span> {stat.trend}
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
                    <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-headline-md font-bold text-primary">Tren Pendapatan</h3>
                            <select className="bg-surface-container-lowest border border-outline-variant rounded-md text-sm py-2 pl-3 pr-8 focus:ring-primary focus:border-primary focus:outline-none">
                                <option>30 Hari Terakhir</option>
                                <option>Tahun Ini</option>
                            </select>
                        </div>
                        <div className="h-[240px] sm:h-[300px] w-full bg-surface-bright rounded-lg border border-outline-variant/50 flex items-center justify-center relative overflow-hidden">
                            {/* Grid overlay pattern */}
                            <div 
                                className="absolute inset-0 opacity-20" 
                                style={{ 
                                    backgroundImage: 'linear-gradient(#402E2A 1px, transparent 1px), linear-gradient(90deg, #402E2A 1px, transparent 1px)', 
                                    backgroundSize: '20px 20px' 
                                }}
                            />
                            <p className="text-on-surface-variant text-xs sm:text-body-sm relative z-10">[Area Visualisasi Grafik]</p>
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
                                            <span className="material-symbols-outlined text-primary">{highlight.icon}</span>
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
                                {bookings.map((booking, idx) => (
                                    <tr 
                                        key={idx} 
                                        className={`hover:bg-surface-container-lowest transition-colors ${
                                            idx !== bookings.length - 1 ? 'border-b border-outline-variant/50' : ''
                                        }`}
                                    >
                                        <td className="py-4 px-4 sm:px-6 font-mono text-primary font-semibold">{booking.code}</td>
                                        <td className="py-4 px-4 sm:px-6 font-bold">{booking.guest}</td>
                                        <td className="py-4 px-4 sm:px-6 text-on-surface-variant">{booking.villa}</td>
                                        <td className="py-4 px-4 sm:px-6 text-on-surface-variant">{booking.dates}</td>
                                        <td className="py-4 px-4 sm:px-6">
                                            <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold ${booking.statusStyle}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-right">
                                            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
                                                <span className="material-symbols-outlined text-base sm:text-sm">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden flex flex-col divide-y divide-outline-variant/50">
                        {bookings.map((booking, idx) => (
                            <div key={idx} className="p-5 flex flex-col gap-4 bg-white hover:bg-surface-container-lowest transition-colors">
                                {/* Top Row: ID & Status */}
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-on-surface-variant text-[11px] font-bold">{booking.code}</span>
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${booking.statusStyle}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                
                                {/* Guest Name */}
                                <p className="font-bold text-[17px] text-primary -mt-2">{booking.guest}</p>
                                
                                {/* Detail Box */}
                                <div className="flex justify-between items-center text-sm text-on-surface-variant bg-[#F9F7F2] rounded-xl p-3.5">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">villa</span>
                                        <span className="font-medium">{booking.villa}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        <span className="font-medium">{booking.dates}</span>
                                    </div>
                                </div>
                                
                                {/* Action Button */}
                                <button className="w-full py-2.5 text-sm font-semibold text-primary border border-outline-variant/60 rounded-xl hover:bg-surface-container-low transition-colors shadow-sm">
                                    Lihat Detail
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
