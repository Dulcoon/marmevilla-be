import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Custom Modal for Create/Edit Voucher
function VoucherModal({ isOpen, onClose, voucherToEdit }) {
    const isEdit = !!voucherToEdit;
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        discount_amount: '',
        start_date: '',
        end_date: '',
        usage_limit: '',
        is_active: true,
    });

    const [dateRange, setDateRange] = React.useState({
        from: undefined,
        to: undefined
    });

    useEffect(() => {
        if (isOpen) {
            if (isEdit && voucherToEdit) {
                setData({
                    code: voucherToEdit.code,
                    discount_amount: voucherToEdit.discount_amount,
                    start_date: voucherToEdit.start_date,
                    end_date: voucherToEdit.end_date || '',
                    usage_limit: voucherToEdit.usage_limit || '',
                    is_active: voucherToEdit.is_active,
                });
                
                // Initialize dateRange from existing data
                setDateRange({
                    from: voucherToEdit.start_date ? new Date(voucherToEdit.start_date) : undefined,
                    to: voucherToEdit.end_date ? new Date(voucherToEdit.end_date) : undefined
                });
            } else {
                reset();
                const today = new Date();
                setData('start_date', formatDate(today));
                setDateRange({
                    from: today,
                    to: undefined
                });
            }
            clearErrors();
        }
    }, [isOpen, voucherToEdit]);

    // Update form data when dateRange changes
    React.useEffect(() => {
        if (!isOpen) return;
        setData(prev => ({
            ...prev,
            start_date: dateRange?.from ? formatDate(dateRange.from) : '',
            end_date: dateRange?.to ? formatDate(dateRange.to) : ''
        }));
    }, [dateRange]);

    // Prevent body scroll while open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => {
                onClose();
            },
            preserveScroll: true,
        };

        if (isEdit) {
            put(route('admin.vouchers.update', voucherToEdit.id), options);
        } else {
            post(route('admin.vouchers.store'), options);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] mx-0 sm:mx-4 animate-slide-up sm:animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 shrink-0">
                    <h3 className="font-headline-md text-xl font-semibold text-primary">
                        {isEdit ? 'Edit Voucher' : 'Buat Voucher Baru'}
                    </h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    <form id="voucherForm" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Kode Voucher <span className="text-error">*</span></label>
                            <input 
                                type="text"
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-body-md uppercase"
                                placeholder="Cth: SUMMER24"
                                value={data.code}
                                onChange={e => setData('code', e.target.value.toUpperCase())}
                                required
                            />
                            {errors.code && <p className="text-error text-xs mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Nominal Diskon (Rp) <span className="text-error">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">Rp</span>
                                <input 
                                    type="number"
                                    className="w-full border border-outline-variant rounded-lg pl-10 pr-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-body-md"
                                    placeholder="100000"
                                    min="0"
                                    value={data.discount_amount}
                                    onChange={e => setData('discount_amount', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.discount_amount && <p className="text-error text-xs mt-1">{errors.discount_amount}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Rentang Validitas <span className="text-error">*</span></label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button type="button" className="w-full flex items-center gap-3 px-3 py-2 border border-outline-variant rounded-lg bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-left text-primary text-sm">
                                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_month</span>
                                        <span className="flex-1 font-body-md text-primary">
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
                                <PopoverContent 
                                    style={{ zIndex: 100000 }}
                                    className="w-auto p-0 rounded-2xl bg-white border border-outline-variant/30 shadow-lg overflow-x-auto flex justify-center" 
                                    align="start"
                                >
                                    <Calendar
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={window.innerWidth > 640 ? 2 : 1}
                                        className="bg-white rounded-2xl"
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.start_date && <p className="text-error text-xs mt-1">{errors.start_date}</p>}
                            {errors.end_date && <p className="text-error text-xs mt-1">{errors.end_date}</p>}
                        </div>

                        <div>
                            <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Batas Penggunaan <span className="text-on-surface-variant/50">(Opsional)</span></label>
                            <input 
                                type="number"
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-primary font-body-md"
                                placeholder="Kosongkan jika tanpa batas"
                                min="1"
                                value={data.usage_limit}
                                onChange={e => setData('usage_limit', e.target.value)}
                            />
                            {errors.usage_limit && <p className="text-error text-xs mt-1">{errors.usage_limit}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <label className="block font-label-md text-label-md text-primary font-bold">Status Aktif</label>
                                <span className="text-xs text-on-surface-variant">Aktifkan voucher ini</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E7D32]"></div>
                            </label>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-outline-variant/30 flex gap-3 shrink-0 bg-surface-bright rounded-b-2xl">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm text-on-surface-variant bg-surface-container-low hover:bg-surface-variant transition-colors border border-outline-variant/40"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        form="voucherForm"
                        disabled={processing}
                        className="flex-1 bg-primary text-white hover:bg-primary/90 transition-colors px-6 py-3 rounded-xl font-semibold text-sm ambient-shadow active:scale-[0.98] disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Voucher'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (min-width: 640px) {
                    @keyframes slideUp {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                }
            `}</style>
        </div>
    );
}

export default function Index({ vouchers, stats }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [voucherToEdit, setVoucherToEdit] = useState(null);

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Tanpa Batas';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const openCreateModal = () => {
        setVoucherToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (voucher) => {
        setVoucherToEdit(voucher);
        setIsModalOpen(true);
    };

    const handleDelete = (voucher) => {
        if (confirm(`Apakah Anda yakin ingin menghapus voucher ${voucher.code}?`)) {
            router.delete(route('admin.vouchers.destroy', voucher.id), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32] uppercase tracking-wider">Active</span>;
            case 'expired':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant uppercase tracking-wider">Expired</span>;
            case 'depleted':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF3E0] text-[#E65100] uppercase tracking-wider">Depleted</span>;
            case 'disabled':
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-container text-on-error-container uppercase tracking-wider">Disabled</span>;
        }
    };

    return (
        <AdminLayout>
            <Head title="Voucher Management - Admin Marme Villa" />

            <div className="p-4 sm:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Voucher Management</h2>
                        <p className="text-on-surface-variant text-base sm:text-body-md">Kelola diskon promosi untuk tamu.</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="w-full sm:w-auto bg-primary text-white px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Buat Voucher Baru
                    </button>
                </div>

                {/* Dashboard / Bento Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-white rounded-xl ghost-border ambient-shadow p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">confirmation_number</span>
                        </div>
                        <div>
                            <p className="font-label-md text-[10px] sm:text-label-md text-on-surface-variant uppercase tracking-wider mb-0.5">Total Vouchers</p>
                            <p className="font-headline-lg text-2xl sm:text-headline-lg text-primary leading-none">{stats.total}</p>
                        </div>
                    </div>
                    {/* Stat Card 2 */}
                    <div className="bg-white rounded-xl ghost-border ambient-shadow p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] shrink-0">
                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">check_circle</span>
                        </div>
                        <div>
                            <p className="font-label-md text-[10px] sm:text-label-md text-on-surface-variant uppercase tracking-wider mb-0.5">Active Vouchers</p>
                            <p className="font-headline-lg text-2xl sm:text-headline-lg text-primary leading-none">{stats.active}</p>
                        </div>
                    </div>
                    {/* Stat Card 3 (Full width on mobile) */}
                    <div className="col-span-2 md:col-span-1 bg-white rounded-xl ghost-border ambient-shadow p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFF3E0] flex items-center justify-center text-[#E65100] shrink-0">
                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">redeem</span>
                        </div>
                        <div>
                            <p className="font-label-md text-[10px] sm:text-label-md text-on-surface-variant uppercase tracking-wider mb-0.5">Total Redeemed</p>
                            <p className="font-headline-lg text-2xl sm:text-headline-lg text-primary leading-none">{stats.redeemed}</p>
                        </div>
                    </div>
                </div>

                {/* List Container */}
                <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden flex flex-col">
                    <div className="p-4 sm:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface-bright/50">
                        <h3 className="font-headline-md text-lg sm:text-[20px] font-semibold text-primary">Daftar Voucher</h3>
                        <div className="flex gap-2">
                            <div className="relative flex-1 sm:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Cari voucher..." 
                                    className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-sm focus:border-primary focus:ring-0 transition-colors"
                                />
                            </div>
                            <button className="p-2 border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors flex items-center justify-center bg-white">
                                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                            </button>
                        </div>
                    </div>

                    {vouchers.length === 0 ? (
                        <div className="p-8 text-center text-on-surface-variant">
                            Belum ada voucher yang dibuat.
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                                            <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Kode</th>
                                            <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Diskon</th>
                                            <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Validitas</th>
                                            <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                                            <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Penggunaan</th>
                                            <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-body-md text-sm">
                                        {vouchers.map(voucher => (
                                            <tr key={voucher.id} className="border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors group">
                                                <td className="p-4 font-bold text-primary">{voucher.code}</td>
                                                <td className="p-4 text-on-surface font-medium">{formatRupiah(voucher.discount_amount)}</td>
                                                <td className="p-4 text-on-surface-variant text-xs">
                                                    {formatDate(voucher.start_date)} - {formatDate(voucher.end_date)}
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(voucher.status)}
                                                </td>
                                                <td className="p-4 text-right text-on-surface-variant">
                                                    {voucher.used_count} / {voucher.usage_limit || '∞'}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditModal(voucher)} className="text-on-surface-variant hover:text-primary p-1 rounded hover:bg-surface-container-low" title="Edit">
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </button>
                                                        <button onClick={() => handleDelete(voucher)} className="text-error/70 hover:text-error p-1 rounded hover:bg-error/10" title="Hapus">
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden flex flex-col p-4 gap-4 bg-surface">
                                {vouchers.map(voucher => (
                                    <div key={voucher.id} className="bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-primary text-lg">{voucher.code}</h4>
                                                {getStatusBadge(voucher.status)}
                                            </div>
                                            
                                            {/* Minimalist action menu for mobile */}
                                            <div className="flex gap-1 -mr-2 -mt-2">
                                                <button onClick={() => openEditModal(voucher)} className="p-2 text-on-surface-variant hover:text-primary">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(voucher)} className="p-2 text-error/80 hover:text-error">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="font-semibold text-primary text-base mb-3">
                                            {formatRupiah(voucher.discount_amount)}
                                        </div>
                                        
                                        <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-outline-variant/20">
                                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                Valid till: {formatDate(voucher.end_date)}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                                <span className="material-symbols-outlined text-[16px]">group</span>
                                                Usage: {voucher.used_count} / {voucher.usage_limit || 'Unlimited'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <VoucherModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                voucherToEdit={voucherToEdit}
            />
        </AdminLayout>
    );
}
