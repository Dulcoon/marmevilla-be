import AdminLayout from '@/Layouts/AdminLayout';
import { IconRenderer } from '@/utils/icon-mapper';
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
                <IconRenderer name="more_vert" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-outline-variant/40 z-50 overflow-hidden">
                    <Link
                        href={route('admin.villas.edit', villa.id)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <IconRenderer name="edit" className="text-[18px] text-on-surface-variant" />
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
                        <IconRenderer name="delete" className="text-[18px]" />
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
                    <IconRenderer name="delete_forever" className="text-error text-[32px]" />
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
    const [isReordering, setIsReordering] = useState(false);
    const [tempVillas, setTempVillas] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    const deleteVilla = () => {
        if (!villaToDelete) return;
        router.delete(route('admin.villas.destroy', villaToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setVillaToDelete(null),
            onError: () => setVillaToDelete(null),
        });
    };

    const startReordering = () => {
        setTempVillas([...villas.data]);
        setIsReordering(true);
    };

    const cancelReordering = () => {
        setIsReordering(false);
        setTempVillas([]);
    };

    const saveOrder = () => {
        setIsSavingOrder(true);
        router.post(route('admin.villas.reorder'), {
            ids: tempVillas.map(v => v.id)
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsReordering(false);
                setIsSavingOrder(false);
                setTempVillas([]);
            },
            onError: () => {
                setIsSavingOrder(false);
            }
        });
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const reordered = [...tempVillas];
        const [draggedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        setTempVillas(reordered);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
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
                    {isReordering ? (
                        <div className="w-full sm:w-auto flex items-center gap-3">
                            <button
                                type="button"
                                disabled={isSavingOrder}
                                onClick={cancelReordering}
                                className="flex-1 sm:flex-initial bg-surface-container-low text-on-surface-variant border border-outline-variant/40 px-6 py-3 sm:py-2.5 rounded-lg font-semibold text-sm hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isSavingOrder}
                                onClick={saveOrder}
                                className="flex-1 sm:flex-initial bg-primary text-white px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow disabled:opacity-50 min-w-[140px]"
                            >
                                {isSavingOrder ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <IconRenderer name="save" className="text-[20px] sm:text-[18px]" />
                                        Simpan Urutan
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full sm:w-auto flex items-center gap-3">
                            {villas.data.length > 1 && (
                                <button
                                    type="button"
                                    onClick={startReordering}
                                    className="flex-1 sm:flex-initial bg-white border border-outline-variant text-on-surface px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <IconRenderer name="sort" className="text-[20px] sm:text-[18px]" />
                                    Atur Urutan
                                </button>
                            )}
                            <Link 
                                href={route('admin.villas.create')}
                                className="flex-1 sm:flex-initial bg-primary text-white px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow active:scale-[0.98]"
                            >
                                <IconRenderer name="add" className="text-[20px] sm:text-[18px]" />
                                Tambah Villa
                            </Link>
                        </div>
                    )}
                </div>

                {/* Villas List Container */}
                {villas.data.length === 0 ? (
                    <div className="bg-white rounded-xl ghost-border ambient-shadow p-8 text-center text-on-surface-variant text-sm">
                        Belum ada data villa.
                    </div>
                ) : isReordering ? (
                    <div className="max-w-2xl mx-auto w-full bg-white rounded-xl ghost-border ambient-shadow p-6 flex flex-col gap-4">
                        <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#f0e8d9] flex items-start gap-3">
                            <IconRenderer name="info" className="text-gold shrink-0 text-[20px] mt-0.5" />
                            <p className="text-xs text-[#70665E] font-medium leading-relaxed font-sans">
                                Seret dan taruh (*drag & drop*) villa di bawah ini untuk merapikan urutan tampilannya di situs tamu. Urutan pertama (paling atas) akan muncul sebagai villa utama paling awal.
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {tempVillas.map((villa, idx) => (
                                <div
                                    key={villa.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition-all cursor-move ${
                                        draggedIndex === idx 
                                            ? 'border-gold bg-gold/5 opacity-50 scale-[0.99] shadow-sm' 
                                            : 'border-outline-variant/30 hover:border-gold/30 hover:bg-[#F9F7F2]/10'
                                    }`}
                                >
                                    {/* Drag Handle */}
                                    <div className="text-on-surface-variant/40 hover:text-gold transition-colors p-1.5 shrink-0">
                                        <IconRenderer name="drag_indicator" className="text-[22px]" />
                                    </div>

                                    {/* Image Thumbnail */}
                                    <div className="w-20 h-14 rounded-lg bg-surface-variant overflow-hidden shrink-0 border border-outline-variant/30">
                                        {villa.images && villa.images.length > 0 ? (
                                            <img src={villa.images[0].image_url} alt={villa.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <IconRenderer name="image" className="text-on-surface-variant/50 text-xl" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Villa Name */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-bold text-primary truncate leading-snug">{villa.name}</h4>
                                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Posisi ke-{idx + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                            <IconRenderer name="image" className="text-on-surface-variant text-4xl" />
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
                                                <IconRenderer name="pending" className="text-[14px]" /> Menunggu EN
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
                                            <IconRenderer name="group" className="text-[18px]" />
                                            {villa.capacity} Tamu
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <IconRenderer name="bed" className="text-[18px]" />
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
