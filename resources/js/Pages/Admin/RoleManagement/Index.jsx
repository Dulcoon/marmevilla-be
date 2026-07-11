import AdminLayout from '@/Layouts/AdminLayout';
import { IconRenderer } from '@/utils/icon-mapper';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

function DeleteConfirmModal({ role, onClose, onConfirm, processing }) {
    if (!role) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                        <IconRenderer name="delete_forever" className="text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                    </div>
                    <div>
                        <h3 className="font-headline-md text-lg font-bold text-primary">Hapus Role</h3>
                        <p className="text-on-surface-variant text-sm">Tindakan ini tidak dapat dibatalkan</p>
                    </div>
                </div>
                <p className="text-on-surface text-sm">
                    Apakah Anda yakin ingin menghapus role <strong>{role.name}</strong>? Pengguna dengan role ini tidak akan lagi memiliki hak akses terkait.
                </p>
                <div className="flex gap-3 mt-2">
                    <button type="button" onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-semibold hover:bg-surface-container-low transition-colors">
                        Batal
                    </button>
                    <button type="button" onClick={onConfirm} disabled={processing}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-error text-on-error text-sm font-semibold hover:bg-error/90 transition-colors disabled:opacity-50">
                        {processing ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ roles }) {
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const filtered = roles.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleteProcessing(true);
        router.delete(route('admin.manage-roles.destroy', deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteProcessing(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Kelola Role & Akses - Marme Villa" />

            <div className="p-4 sm:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-[#FFF8E1] flex items-center justify-center">
                                <IconRenderer name="admin_panel_settings" className="text-[18px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }} />
                            </div>
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Superadmin Panel</span>
                        </div>
                        <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Kelola Role & Akses</h2>
                        <p className="text-on-surface-variant text-base sm:text-body-md">
                            Atur tingkatan role admin dan konfigurasikan izin/hak akses untuk masing-masing modul.
                        </p>
                    </div>
                    <a href={route('admin.manage-roles.create')}
                        className="w-full sm:w-auto bg-primary text-white px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow active:scale-[0.98]">
                        <IconRenderer name="add_moderator" className="text-[18px]" />
                        Tambah Role Baru
                    </a>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 sm:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface-bright/50">
                        <h3 className="font-headline-md text-lg font-semibold text-primary">Daftar Role</h3>
                        <div className="relative w-full sm:w-72">
                            <IconRenderer name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]" />
                            <input
                                type="text"
                                placeholder="Cari nama role..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-sm focus:border-primary focus:ring-0 transition-colors outline-none"
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[200px]">Nama Role</th>
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[120px]">Pengguna</th>
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Hak Akses (Permissions)</th>
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center w-[120px]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="font-body-md text-sm">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                                            {search ? 'Tidak ada role yang cocok dengan pencarian.' : 'Belum ada role.'}
                                        </td>
                                    </tr>
                                ) : filtered.map(role => {
                                    const isSystemRole = ['superadmin', 'admin'].includes(role.name);
                                    return (
                                        <tr key={role.id} className="border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors group">
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-primary capitalize flex items-center gap-1.5">
                                                        <IconRenderer
                                                            name={role.name === 'superadmin' ? 'shield_person' : role.name === 'admin' ? 'admin_panel_settings' : 'shield'}
                                                            className={`text-[18px] ${role.name === 'superadmin' ? 'text-[#F59E0B]' : role.name === 'admin' ? 'text-[#2E7D32]' : 'text-on-surface-variant/70'}`}
                                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                                        />
                                                        {role.name}
                                                    </span>
                                                    {isSystemRole && (
                                                        <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-semibold w-max uppercase tracking-wider">
                                                            Sistem Bawaan
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 align-top font-semibold text-on-surface">
                                                <div className="flex items-center gap-1">
                                                    <IconRenderer name="group" className="text-[16px] text-on-surface-variant/70" />
                                                    {role.users_count} Staf
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                {role.name === 'superadmin' ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-[#F59E0B] font-semibold bg-[#FFF8E1] px-2.5 py-1 rounded-lg w-max">
                                                        <IconRenderer name="star" className="text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                                        Akses Penuh Tanpa Batasan (Semua Permission)
                                                    </div>
                                                ) : role.permissions.length === 0 ? (
                                                    <span className="text-on-surface-variant/40 italic">Tidak ada permission aktif</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {role.permissions.map(perm => (
                                                            <span key={perm} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-medium border border-outline-variant/30">
                                                                {perm}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center align-top">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {role.name !== 'superadmin' ? (
                                                        <a href={route('admin.manage-roles.edit', role.id)}
                                                            className="text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
                                                            title="Edit">
                                                            <IconRenderer name="edit" className="text-[20px]" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-on-surface-variant/30 p-1.5" title="Superadmin tidak dapat diubah">
                                                            <IconRenderer name="lock" className="text-[20px]" />
                                                        </span>
                                                    )}
                                                    {!isSystemRole && role.users_count === 0 && (
                                                        <button
                                                            onClick={() => setDeleteTarget(role)}
                                                            className="text-error/70 hover:text-error p-1.5 rounded-lg hover:bg-error/10 transition-colors"
                                                            title="Hapus">
                                                            <IconRenderer name="delete" className="text-[20px]" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                role={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                processing={deleteProcessing}
            />
        </AdminLayout>
    );
}
