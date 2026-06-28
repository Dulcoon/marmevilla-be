import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

// Custom dropdown that uses plain DOM events — no Headless UI backdrop conflict
function VillaMenu({ villa, onDeleteClick }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        // Use capture phase so we catch it before bubbling causes issues
        document.addEventListener('mousedown', handleOutside, true);
        document.addEventListener('touchstart', handleOutside, true);
        return () => {
            document.removeEventListener('mousedown', handleOutside, true);
            document.removeEventListener('touchstart', handleOutside, true);
        };
    }, [open]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(prev => !prev);
                }}
                className="text-on-surface-variant hover:text-primary transition-colors p-1 -mr-1 -mt-1 rounded hover:bg-surface-container-lowest focus:outline-none"
                title="Opsi"
            >
                <span className="material-symbols-outlined">more_vert</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-outline-variant/40 z-50 overflow-hidden">
                    <Link
                        href={route('admin.villas.edit', villa.id)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
                        Edit Villa
                    </Link>
                    <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-error hover:bg-error/8 transition-colors"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            // Small delay to ensure dropdown is unmounted before modal opens
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    onDeleteClick(villa);
                                });
                            });
                        }}
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Hapus Villa
                    </button>
                </div>
            )}
        </div>
    );
}

// Custom delete confirmation modal — pure CSS/DOM, no HeadlessUI Dialog
function DeleteConfirmModal({ villa, onConfirm, onCancel }) {
    const show = villa !== null;

    // Prevent body scroll while open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [show]);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop — clicking here does nothing (intentional for safety) */}
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />

            {/* Panel */}
            <div
                className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 mx-0 sm:mx-4 animate-slide-up sm:animate-scale-in"
                style={{
                    animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Warning Icon */}
                <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-4 mx-auto">
                    <span className="material-symbols-outlined text-error text-[32px]">delete_forever</span>
                </div>

                <h2 className="text-xl font-bold text-center text-primary mb-2">
                    Hapus Villa?
                </h2>

                <p className="mt-1 text-sm text-center text-on-surface-variant mb-7 leading-relaxed">
                    Apakah Anda yakin ingin menghapus{' '}
                    <span className="font-bold text-primary">"{villa?.name}"</span>?
                    <br />
                    <span className="text-error/80">Data yang dihapus tidak dapat dikembalikan.</span>
                </p>

                <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button
                        type="button"
                        className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm text-on-surface-variant bg-surface-container-low hover:bg-surface-variant transition-colors border border-outline-variant/40"
                        onClick={onCancel}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm bg-error text-white hover:bg-error/90 transition-colors shadow-lg active:scale-[0.98]"
                        onClick={onConfirm}
                    >
                        Ya, Hapus Villa
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

export default function Index({ villas }) {
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const [villaToDelete, setVillaToDelete] = useState(null);

    const deleteVilla = () => {
        if (!villaToDelete) return;
        router.delete(route('admin.villas.destroy', villaToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setVillaToDelete(null),
            onError: () => setVillaToDelete(null),
        });
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Villa - Admin Marme Villa" />

            {/* Content Container */}
            <div className="p-4 sm:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Manajemen Villa</h2>
                        <p className="text-on-surface-variant text-base sm:text-body-md">Kelola daftar villa, fasilitas, dan harga dasar.</p>
                    </div>
                    <Link 
                        href={route('admin.villas.create')}
                        className="w-full sm:w-auto bg-primary text-white px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-[20px] sm:text-[18px]">add</span>
                        Tambah Villa
                    </Link>
                </div>

                {/* Villas List Container */}
                {villas.data.length === 0 ? (
                    <div className="bg-white rounded-xl ghost-border ambient-shadow p-8 text-center text-on-surface-variant text-sm">
                        Belum ada data villa.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {villas.data.map((villa) => (
                            <div key={villa.id} className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                {/* Image Section */}
                                <div className="relative h-48 sm:h-56 bg-surface-variant shrink-0">
                                    {villa.images && villa.images.length > 0 ? (
                                        <img src={villa.images[0].image_url} alt={villa.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-on-surface-variant text-4xl">image</span>
                                        </div>
                                    )}
                                    
                                    {/* Status Pills */}
                                    <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                                        {villa.weekend_enabled ? (
                                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#e8f5e9]/90 backdrop-blur-sm text-[#2e7d32] flex items-center gap-1.5 shadow-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]"></span> Weekend Aktif
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-sm text-on-surface-variant flex items-center gap-1.5 shadow-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span> Weekend Mati
                                            </span>
                                        )}
                                        {villa.description_en ? (
                                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50/90 backdrop-blur-sm text-blue-600 flex items-center gap-1.5 shadow-sm border border-blue-100">
                                                🇬🇧 EN Tersedia
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50/90 backdrop-blur-sm text-amber-600 flex items-center gap-1.5 shadow-sm border border-amber-100">
                                                <span className="material-symbols-outlined text-[14px]">pending</span> Menunggu EN
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <h3 className="text-xl font-bold text-primary leading-tight">{villa.name}</h3>
                                        <VillaMenu
                                            villa={villa}
                                            onDeleteClick={(v) => setVillaToDelete(v)}
                                        />
                                    </div>

                                    {/* Meta info */}
                                    <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[18px]">group</span>
                                            {villa.capacity} Tamu
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[18px]">bed</span>
                                            {villa.bed_count || 0} Kamar
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-outline-variant/50 flex justify-between items-center">
                                        <span className="text-sm text-on-surface-variant">Base Price</span>
                                        <div className="text-right">
                                            <span className="font-bold text-primary text-base">{formatRupiah(villa.base_price)}</span>
                                            <span className="text-xs text-on-surface-variant"> /malam</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal — custom, no HeadlessUI Dialog */}
            <DeleteConfirmModal
                villa={villaToDelete}
                onConfirm={deleteVilla}
                onCancel={() => setVillaToDelete(null)}
            />
        </AdminLayout>
    );
}
