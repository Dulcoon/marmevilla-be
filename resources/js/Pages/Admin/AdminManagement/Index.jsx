import AdminLayout from '@/Layouts/AdminLayout';
import { IconRenderer } from '@/utils/icon-mapper';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const ROLE_CONFIG = {
    superadmin: {
        label: 'Superadmin',
        bg: 'bg-[#FFF8E1]',
        text: 'text-[#F59E0B]',
        icon: 'shield_person',
    },
    admin: {
        label: 'Admin',
        bg: 'bg-[#E8F5E9]',
        text: 'text-[#2E7D32]',
        icon: 'admin_panel_settings',
    },
};

function RoleBadge({ role }) {
    const cfg = ROLE_CONFIG[role] ?? { label: role, bg: 'bg-surface-variant', text: 'text-on-surface-variant', icon: 'person' };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
            <IconRenderer name={cfg.icon} className="text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} />
            {cfg.label}
        </span>
    );
}

function formatLastLogin(isoString) {
    if (!isoString) return { relative: 'Belum pernah login', absolute: null };
    const date = new Date(isoString);
    const relative = formatDistanceToNow(date, { addSuffix: true, locale: id });
    const absolute = date.toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
    return { relative, absolute };
}

function DeleteConfirmModal({ admin, onClose, onConfirm, processing }) {
    if (!admin) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                        <IconRenderer name="delete_forever" className="text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                    </div>
                    <div>
                        <h3 className="font-headline-md text-lg font-bold text-primary">Hapus Akun Admin</h3>
                        <p className="text-on-surface-variant text-sm">Tindakan ini tidak dapat dibatalkan</p>
                    </div>
                </div>
                <p className="text-on-surface text-sm">
                    Apakah Anda yakin ingin menghapus akun admin <strong>{admin.name}</strong> ({admin.email})?
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

export default function Index({ admins, roles }) {
    const { props } = usePage();
    const currentUserId = props.auth?.user?.id;
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const filtered = admins.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleteProcessing(true);
        router.delete(route('admin.manage-admins.destroy', deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteProcessing(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Kelola Admin - Marme Villa" />

            <div className="p-4 sm:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6 sm:gap-8">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-[#FFF8E1] flex items-center justify-center">
                                <IconRenderer name="manage_accounts" className="text-[18px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }} />
                            </div>
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Superadmin Panel</span>
                        </div>
                        <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Kelola Admin</h2>
                        <p className="text-on-surface-variant text-base sm:text-body-md">
                            Buat, ubah, dan hapus akun admin. Pantau aktivitas login terakhir.
                        </p>
                    </div>
                    <a href={route('admin.manage-admins.create')}
                        className="w-full sm:w-auto bg-primary text-white px-6 py-3 sm:py-2.5 rounded-lg font-button text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow active:scale-[0.98]">
                        <IconRenderer name="person_add" className="text-[18px]" />
                        Tambah Admin Baru
                    </a>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl ghost-border ambient-shadow p-4 sm:p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                            <IconRenderer name="group" className="text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold mb-0.5">Total Admin</p>
                            <p className="text-2xl font-bold text-primary leading-none">{admins.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl ghost-border ambient-shadow p-4 sm:p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFF8E1] flex items-center justify-center shrink-0">
                            <IconRenderer name="shield_person" className="text-[20px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold mb-0.5">Superadmin</p>
                            <p className="text-2xl font-bold text-primary leading-none">{admins.filter(a => a.role === 'superadmin').length}</p>
                        </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-white rounded-xl ghost-border ambient-shadow p-4 sm:p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                            <IconRenderer name="admin_panel_settings" className="text-[20px] text-[#2E7D32]" style={{ fontVariationSettings: "'FILL' 1" }} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold mb-0.5">Admin</p>
                            <p className="text-2xl font-bold text-primary leading-none">{admins.filter(a => a.role === 'admin').length}</p>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 sm:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface-bright/50">
                        <h3 className="font-headline-md text-lg font-semibold text-primary">Daftar Akun Admin</h3>
                        <div className="relative w-full sm:w-72">
                            <IconRenderer name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]" />
                            <input
                                type="text"
                                placeholder="Cari nama, email, atau role..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-sm focus:border-primary focus:ring-0 transition-colors outline-none"
                            />
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Admin</th>
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Role</th>
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Login Terakhir</th>
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">IP Terakhir</th>
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Bergabung</th>
                                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="font-body-md text-sm">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                                            {search ? 'Tidak ada admin yang cocok dengan pencarian.' : 'Belum ada akun admin.'}
                                        </td>
                                    </tr>
                                ) : filtered.map(admin => {
                                    const lastLogin = formatLastLogin(admin.last_login_at);
                                    const isSelf = admin.id === currentUserId;
                                    return (
                                        <tr key={admin.id} className="border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                        {admin.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-on-surface">{admin.name}</p>
                                                            {isSelf && (
                                                                <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-semibold">Anda</span>
                                                            )}
                                                        </div>
                                                        <p className="text-on-surface-variant text-xs">{admin.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4"><RoleBadge role={admin.role} /></td>
                                            <td className="p-4">
                                                {admin.last_login_at ? (
                                                    <div title={lastLogin.absolute}>
                                                        <p className="text-on-surface text-sm font-medium">{lastLogin.relative}</p>
                                                        <p className="text-on-surface-variant text-xs">{lastLogin.absolute}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-on-surface-variant/50 italic text-xs">Belum pernah login</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-on-surface-variant text-xs font-mono">
                                                {admin.last_login_ip ?? '-'}
                                            </td>
                                            <td className="p-4 text-on-surface-variant text-xs">
                                                {new Date(admin.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={route('admin.manage-admins.edit', admin.id)}
                                                        className="text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
                                                        title="Edit">
                                                        <IconRenderer name="edit" className="text-[20px]" />
                                                    </a>
                                                    {!isSelf && (
                                                        <button
                                                            onClick={() => setDeleteTarget(admin)}
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

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col p-4 gap-4">
                        {filtered.length === 0 ? (
                            <div className="py-8 text-center text-on-surface-variant text-sm">
                                {search ? 'Tidak ada admin yang cocok.' : 'Belum ada akun admin.'}
                            </div>
                        ) : filtered.map(admin => {
                            const lastLogin = formatLastLogin(admin.last_login_at);
                            const isSelf = admin.id === currentUserId;
                            return (
                                <div key={admin.id} className="bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                                {admin.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-on-surface">{admin.name}</p>
                                                    {isSelf && <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-semibold">Anda</span>}
                                                </div>
                                                <p className="text-on-surface-variant text-xs">{admin.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <a href={route('admin.manage-admins.edit', admin.id)} className="p-2 text-on-surface-variant hover:text-primary">
                                                <IconRenderer name="edit" className="text-[20px]" />
                                            </a>
                                            {!isSelf && (
                                                <button onClick={() => setDeleteTarget(admin)} className="p-2 text-error/80 hover:text-error">
                                                    <IconRenderer name="delete" className="text-[20px]" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3"><RoleBadge role={admin.role} /></div>

                                    <div className="flex flex-col gap-2 pt-3 border-t border-outline-variant/20">
                                        <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                                            <IconRenderer name="schedule" className="text-[16px] shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-on-surface">Login Terakhir: </span>
                                                {admin.last_login_at ? (
                                                    <span>{lastLogin.relative} &bull; {lastLogin.absolute}</span>
                                                ) : (
                                                    <span className="italic text-on-surface-variant/50">Belum pernah login</span>
                                                )}
                                            </div>
                                        </div>
                                        {admin.last_login_ip && (
                                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                                <IconRenderer name="router" className="text-[16px] shrink-0" />
                                                <span className="font-mono">{admin.last_login_ip}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                admin={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                processing={deleteProcessing}
            />
        </AdminLayout>
    );
}
