import React, { useState } from 'react';
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
        router.get(route('admin.pricing.index'), { villa_id: e.target.value }, { preserveState: true });
    };

    // Custom Price Form
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        custom_price: '',
        min_stay: ''
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

    const submitCustomPrice = (e) => {
        e.preventDefault();
        if (!selectedVilla) return;

        post(route('admin.pricing.custom-prices.store', selectedVilla.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setDateRange({ from: undefined, to: undefined });
            },
        });
    };

    const deleteCustomPrice = (customPriceId) => {
        if (confirm('Are you sure you want to delete this pricing rule?')) {
            router.delete(route('admin.pricing.custom-prices.destroy', { villa: selectedVilla.id, customPrice: customPriceId }), {
                preserveScroll: true,
            });
        }
    };

    const toggleWeekendPremium = () => {
        if (!selectedVilla) return;
        router.put(route('admin.pricing.weekend', selectedVilla.id), {
            weekend_enabled: !selectedVilla.weekend_enabled,
            weekend_price: selectedVilla.weekend_price
        }, { preserveScroll: true });
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Aturan Harga" />

            <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="font-headline-xl text-[40px] leading-[48px] font-bold tracking-tight text-primary mb-2">Aturan Harga</h1>
                        <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">Kelola rentang tanggal khusus dan penyesuaian harga otomatis.</p>
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
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedVilla ? (
                    <div className="flex flex-col gap-6">
                        {/* Weekend Pricing Toggle Card */}
                        <div className="bg-surface-container-lowest rounded-xl border border-[#E6E2D3] p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                            <div className="flex justify-between items-start gap-4 md:flex-col md:gap-1 md:w-1/3">
                                <div>
                                    <h3 className="font-headline-md text-lg font-semibold text-primary">Harga Akhir Pekan</h3>
                                    <p className="font-body-sm text-sm text-on-surface-variant mt-1 leading-snug">Otomatis menerapkan tarif lebih tinggi untuk malam Jumat dan Sabtu.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1 md:hidden">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={selectedVilla.weekend_enabled}
                                        onChange={toggleWeekendPremium}
                                    />
                                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div className="bg-[#F9F7F2] rounded-lg p-4 flex justify-between items-center border border-[#E6E2D3] md:flex-1 md:max-w-md">
                                <div className="flex flex-col">
                                    <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-0.5">Tarif / Malam</span>
                                    <span className="font-body-lg text-primary font-semibold">
                                        Rp {selectedVilla.weekend_price ? selectedVilla.weekend_price.toLocaleString('id-ID') : '0'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a href={route('admin.villas.edit', selectedVilla.id)} className="text-primary bg-white border border-primary/30 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors inline-flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        Edit
                                    </a>
                                    <label className="relative hidden md:inline-flex items-center cursor-pointer shrink-0">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={selectedVilla.weekend_enabled}
                                            onChange={toggleWeekendPremium}
                                        />
                                        <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column: Add New Rule Form */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="bg-surface-container-lowest rounded-xl border border-[#E6E2D3] p-6 shadow-[0px_4px_20px_rgba(64,46,42,0.08)] flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                                        <span className="material-symbols-outlined">edit_calendar</span>
                                    </div>
                                    <div>
                                        <h3 className="font-headline-md text-2xl font-semibold text-primary">Harga Rentang Khusus</h3>
                                        <p className="font-label-md text-xs tracking-wider text-on-surface-variant font-normal">Prioritas 1 (Menimpa harga dasar)</p>
                                    </div>
                                </div>
                                <form onSubmit={submitCustomPrice} className="flex flex-col gap-5 flex-1">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-xs font-semibold tracking-wider text-on-surface">Nama Aturan</label>
                                        <input 
                                            type="text" 
                                            className="bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#D4B47D] focus:ring-0 px-4 py-2 font-body-md rounded-t-md transition-colors" 
                                            placeholder="misal: Libur Idul Fitri"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            required
                                        />
                                        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-xs font-semibold tracking-wider text-on-surface uppercase">Rentang Tanggal</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button type="button" className="w-full flex items-center gap-3 p-3 bg-[#F9F7F2] border border-outline-variant/30 rounded-xl outline-none focus:border-[#D4B47D] hover:bg-black/5 text-left transition-colors">
                                                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">calendar_month</span>
                                                    <span className="flex-1 font-body-md text-on-surface">
                                                        {dateRange?.from ? (
                                                            dateRange.to ? (
                                                                <>{format(dateRange.from, "d MMM yyyy", { locale: id })} - {format(dateRange.to, "d MMM yyyy", { locale: id })}</>
                                                            ) : (
                                                                format(dateRange.from, "d MMM yyyy", { locale: id })
                                                            )
                                                        ) : (
                                                            <span className="text-on-surface-variant/50">Pilih rentang tanggal...</span>
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
                                                    numberOfMonths={2}
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
                                        <label className="font-label-md text-xs font-semibold tracking-wider text-on-surface">Tarif per Malam (IDR)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant">Rp</span>
                                            <input 
                                                type="text" 
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#D4B47D] focus:ring-0 pl-12 pr-4 py-2 font-body-md rounded-t-md transition-colors" 
                                                placeholder="4.500.000"
                                                value={data.custom_price !== '' && data.custom_price !== null ? parseInt(data.custom_price).toLocaleString('id-ID') : ''}
                                                onChange={e => setData('custom_price', e.target.value.replace(/\D/g, ''))}
                                                required
                                            />
                                        </div>
                                        {errors.custom_price && <div className="text-red-500 text-xs mt-1">{errors.custom_price}</div>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-xs font-semibold tracking-wider text-on-surface">Minimal Menginap (Malam)</label>
                                        <input 
                                            type="number" 
                                            className="bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#D4B47D] focus:ring-0 px-4 py-2 font-body-md rounded-t-md transition-colors" 
                                            min="1" 
                                            placeholder="1"
                                            value={data.min_stay}
                                            onChange={e => setData('min_stay', e.target.value)}
                                            required
                                        />
                                        {errors.min_stay && <div className="text-red-500 text-xs mt-1">{errors.min_stay}</div>}
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
                                        <button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-6 py-2 rounded-md transition-colors disabled:opacity-50">Simpan Aturan</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Settings & List */}
                        <div className="lg:col-span-8 flex flex-col gap-6">

                            {/* Existing Rules List Card */}
                            <div className="bg-surface-container-lowest rounded-xl border border-[#E6E2D3] flex flex-col flex-1">
                                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                                    <h3 className="font-headline-md text-lg font-semibold text-primary">Aturan Harga Aktif</h3>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">
                                            {selectedVilla.custom_prices?.length || 0} Aturan
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col gap-4">
                                    {selectedVilla.custom_prices && selectedVilla.custom_prices.map(rule => (
                                        <div key={rule.id} className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-lg p-4 flex flex-col gap-3">
                                            {/* Top row */}
                                            <div className="flex justify-between items-start">
                                                <span className="font-headline-md text-base font-semibold text-primary">{rule.name}</span>
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const today = new Date();
                                                        today.setHours(0,0,0,0);
                                                        const start = new Date(rule.start_date);
                                                        const end = new Date(rule.end_date);
                                                        if (end < today) return <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-md tracking-wider uppercase">Expired</span>;
                                                        if (start <= today && end >= today) return <span className="px-2 py-0.5 bg-[#D1E7DD] text-[#0F5132] text-[10px] font-bold rounded-md tracking-wider uppercase">Active</span>;
                                                        return <span className="px-2 py-0.5 bg-[#FDECC8] text-[#9A6B22] text-[10px] font-bold rounded-md tracking-wider uppercase">Upcoming</span>;
                                                    })()}
                                                    <button 
                                                        onClick={() => deleteCustomPrice(rule.id)}
                                                        className="text-outline-variant hover:text-error transition-colors"
                                                        title="Hapus Aturan"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Middle row */}
                                            <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                                                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                                <span>
                                                    {new Date(rule.start_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})} &ndash; {new Date(rule.end_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})}
                                                </span>
                                            </div>
                                            {/* Bottom row */}
                                            <div className="font-body-md text-primary font-medium mt-1">
                                                Rp {rule.custom_price.toLocaleString('id-ID')} /mlm
                                            </div>
                                        </div>
                                    ))}

                                    {/* Base Rate Card */}
                                    <div className="bg-[#F9F7F2]/50 border border-[#E6E2D3] rounded-lg p-4 flex flex-col gap-3">
                                        {/* Top row */}
                                        <div className="flex justify-between items-start">
                                            <span className="font-headline-md text-base font-semibold text-on-surface-variant">Default Base Rate</span>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 bg-outline-variant/30 text-on-surface-variant text-[10px] font-bold rounded-md tracking-wider uppercase">Default</span>
                                                <a href={route('admin.villas.edit', selectedVilla.id)} className="text-outline-variant hover:text-primary transition-colors inline-flex">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </a>
                                            </div>
                                        </div>
                                        {/* Middle row */}
                                        <div className="flex items-center gap-2 text-outline text-sm">
                                            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                            <span>All other dates</span>
                                        </div>
                                        {/* Bottom row */}
                                        <div className="font-body-md text-on-surface-variant font-medium mt-1">
                                            Rp {selectedVilla.base_price ? selectedVilla.base_price.toLocaleString('id-ID') : '0'} /mlm
                                        </div>
                                    </div>
                                </div>
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
