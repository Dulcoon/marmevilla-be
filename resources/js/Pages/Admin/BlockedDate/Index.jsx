import React, { useState } from 'react';
import { IconRenderer } from '@/utils/icon-mapper';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfToday } from "date-fns";
import { id } from "date-fns/locale";

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function Index({ villas, selectedVilla, auth }) {
    // Select Villa Dropdown
    const handleVillaChange = (e) => {
        router.get(route('admin.blocked-dates.index'), { villa_id: e.target.value }, { preserveState: true });
    };

    // Block Date Form
    const { data, setData, post, processing, errors, reset } = useForm({
        start_date: '',
        end_date: '',
        reason: ''
    });

    const [dateRange, setDateRange] = React.useState({
        from: undefined,
        to: undefined
    });

    // Update form data when dateRange changes
    React.useEffect(() => {
        setData(prev => ({
            ...prev,
            start_date: dateRange?.from ? formatDate(dateRange.from) : '',
            end_date: dateRange?.to ? formatDate(dateRange.to) : ''
        }));
    }, [dateRange]);

    const submitBlockDate = (e) => {
        e.preventDefault();
        if (!selectedVilla) return;

        post(route('admin.blocked-dates.store', selectedVilla.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setDateRange({ from: undefined, to: undefined });
            },
        });
    };

    const deleteBlockedDate = (blockedDateId) => {
        if (confirm('Apakah Anda yakin ingin menghapus blokir tanggal ini?')) {
            router.delete(route('admin.blocked-dates.destroy', { villa: selectedVilla.id, blockedDate: blockedDateId }), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Blokir Tanggal" />

            <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="font-headline-xl text-[40px] leading-[48px] font-bold tracking-tight text-primary mb-2">Blokir Tanggal</h1>
                        <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">Tutup ketersediaan villa secara manual untuk maintenance, renovasi, atau acara pribadi.</p>
                    </div>
                    
                    {/* Villa Selector */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0">
                        <label className="font-label-md text-xs uppercase tracking-wider font-semibold text-on-surface-variant md:normal-case md:text-sm md:tracking-normal">Pilih Villa</label>
                        <div className="relative w-full md:w-64">
                            <select 
                                className="w-full bg-white border border-[#E6E2D3] focus:border-[#D4B47D] focus:ring-1 focus:ring-[#D4B47D] rounded-xl px-4 py-3 font-body-md shadow-sm appearance-none outline-none transition-all cursor-pointer"
                                value={selectedVilla?.id || ''}
                                onChange={handleVillaChange}
                            >
                                <option value="" disabled>-- Pilih Villa --</option>
                                {villas.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                                <IconRenderer name="expand_more" className="text-[20px]" />
                            </div>
                        </div>
                    </div>
                </div>

                {selectedVilla ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Form to Block Date */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-surface-container-lowest rounded-xl border border-[#E6E2D3] p-6 shadow-[0px_4px_20px_rgba(64,46,42,0.08)] flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                                        <IconRenderer name="event_busy" />
                                    </div>
                                    <div>
                                        <h3 className="font-headline-md text-lg font-semibold text-primary">Blokir Rentang Tanggal</h3>
                                        <p className="font-label-md text-xs text-on-surface-variant font-normal">Tanggal yang diblokir tidak bisa dipesan tamu.</p>
                                    </div>
                                </div>

                                <form onSubmit={submitBlockDate} className="flex flex-col gap-5 flex-1">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-xs font-semibold tracking-wider text-on-surface uppercase">Rentang Tanggal</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button type="button" className="w-full flex items-center gap-3 p-3 bg-[#F9F7F2] border border-outline-variant/30 rounded-xl outline-none focus:border-[#D4B47D] hover:bg-black/5 text-left transition-colors">
                                                    <IconRenderer name="calendar_month" className="text-[20px] text-on-surface-variant" />
                                                    <span className="flex-1 font-body-md text-on-surface text-sm">
                                                        {dateRange?.from ? (
                                                            dateRange.to ? (
                                                                <>{format(dateRange.from, "d MMM yyyy", { locale: id })} - {format(dateRange.to, "d MMM yyyy", { locale: id })}</>
                                                            ) : (
                                                                format(dateRange.from, "d MMM yyyy", { locale: id })
                                                            )
                                                        ) : (
                                                            <span className="text-on-surface-variant/50">Pilih tanggal...</span>
                                                        )}
                                                    </span>
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl bg-surface-container-lowest border border-[#E6E2D3] shadow-lg z-50 overflow-x-auto flex justify-center" align="start">
                                                <Calendar
                                                    mode="range"
                                                    defaultMonth={dateRange?.from}
                                                    selected={dateRange}
                                                    onSelect={setDateRange}
                                                    numberOfMonths={1}
                                                    disabled={[
                                                        { before: startOfToday() }
                                                    ]}
                                                    className="bg-white rounded-2xl"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.start_date && <div className="text-red-500 text-xs mt-1">{errors.start_date}</div>}
                                        {errors.end_date && <div className="text-red-500 text-xs mt-1">{errors.end_date}</div>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-xs font-semibold tracking-wider text-on-surface">Alasan Blokir</label>
                                        <input 
                                            type="text" 
                                            className="bg-[#F9F7F2] border border-outline-variant/40 focus:border-[#D4B47D] focus:ring-0 px-4 py-3 font-body-md rounded-xl transition-colors text-sm outline-none" 
                                            placeholder="misal: Perbaikan AC / Booking Internal"
                                            value={data.reason}
                                            onChange={e => setData('reason', e.target.value)}
                                            required
                                        />
                                        {errors.reason && <div className="text-red-500 text-xs mt-1">{errors.reason}</div>}
                                    </div>

                                    <div className="mt-auto pt-6 flex justify-end">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                reset();
                                                setDateRange({ from: undefined, to: undefined });
                                            }} 
                                            className="text-primary font-semibold text-sm px-4 py-2 hover:bg-surface-variant rounded-md transition-colors mr-2">
                                            Bersihkan
                                        </button>
                                        <button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50">Terapkan Blokir</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Existing Blocked Dates list */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="bg-surface-container-lowest rounded-xl border border-[#E6E2D3] flex flex-col flex-1 shadow-sm">
                                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                                    <h3 className="font-headline-md text-lg font-semibold text-primary">Jadwal Blokir Tanggal</h3>
                                    <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">
                                        {selectedVilla.blocked_dates?.length || 0} Blokir
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col gap-4 max-h-[600px] overflow-y-auto">
                                    {selectedVilla.blocked_dates && selectedVilla.blocked_dates.length > 0 ? (
                                        selectedVilla.blocked_dates.map(rule => (
                                            <div key={rule.id} className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl p-4 flex flex-col gap-3 transition-all hover:shadow-sm">
                                                {/* Top row */}
                                                <div className="flex justify-between items-start">
                                                    <span className="font-headline-md text-base font-semibold text-primary">{rule.reason || 'Tidak ada alasan'}</span>
                                                    <div className="flex items-center gap-3">
                                                        {(() => {
                                                            const today = new Date();
                                                            today.setHours(0,0,0,0);
                                                            const start = new Date(rule.start_date);
                                                            const end = new Date(rule.end_date);
                                                            if (end < today) return <span className="px-2.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full tracking-wider uppercase">Expired</span>;
                                                            if (start <= today && end >= today) return <span className="px-2.5 py-0.5 bg-[#D1E7DD] text-[#0F5132] text-[10px] font-bold rounded-full tracking-wider uppercase">Active</span>;
                                                            return <span className="px-2.5 py-0.5 bg-[#FDECC8] text-[#9A6B22] text-[10px] font-bold rounded-full tracking-wider uppercase">Upcoming</span>;
                                                        })()}
                                                        <button 
                                                            onClick={() => deleteBlockedDate(rule.id)}
                                                            className="text-outline-variant hover:text-error transition-colors p-1 rounded-full hover:bg-red-50 flex items-center justify-center"
                                                            title="Hapus Blokir"
                                                        >
                                                            <IconRenderer name="delete" className="text-[20px]" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Details row */}
                                                <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                                                    <IconRenderer name="calendar_month" className="text-[18px]" />
                                                    <span>
                                                        {new Date(rule.start_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})} &ndash; {new Date(rule.end_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-on-surface-variant">
                                            <IconRenderer name="calendar_today" className="text-4xl text-outline-variant/60 mb-2" />
                                            <p className="text-sm">Belum ada tanggal yang diblokir untuk villa ini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl border border-[#E6E2D3] text-center">
                        <p className="text-on-surface-variant">Silakan pilih Villa atau buat Villa terlebih dahulu.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
