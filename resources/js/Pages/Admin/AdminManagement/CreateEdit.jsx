import AdminLayout from '@/Layouts/AdminLayout';
import { IconRenderer } from '@/utils/icon-mapper';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

const ROLE_DESCRIPTIONS = {
    superadmin: {
        icon: 'shield_person',
        color: 'text-[#F59E0B]',
        bg: 'bg-[#FFF8E1]',
        border: 'border-[#F59E0B]/30',
        selectedBorder: 'border-[#F59E0B]',
        selectedBg: 'bg-[#FFFBEB]',
        label: 'Superadmin',
        description: 'Akses penuh termasuk kelola akun admin, pengaturan sistem, dan semua fitur operasional.',
        perks: ['Kelola akun admin', 'Ubah pengaturan sistem', 'Akses semua fitur'],
    },
    admin: {
        icon: 'admin_panel_settings',
        color: 'text-[#2E7D32]',
        bg: 'bg-[#E8F5E9]',
        border: 'border-[#2E7D32]/30',
        selectedBorder: 'border-[#2E7D32]',
        selectedBg: 'bg-[#F1F8F2]',
        label: 'Admin',
        description: 'Akses operasional harian: kelola villa, reservasi, ulasan, voucher, dan konten website.',
        perks: ['Kelola villa & harga', 'Kelola reservasi', 'Kelola voucher & ulasan'],
    },
};

export default function CreateEdit({ admin, roles }) {
    const isEdit = !!admin;
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        name: admin?.name ?? '',
        email: admin?.email ?? '',
        role: admin?.role ?? 'admin',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.manage-admins.update', admin.id));
        } else {
            post(route('admin.manage-admins.store'));
        }
    };

    return (
        <AdminLayout>
            <Head title={`${isEdit ? 'Edit' : 'Tambah'} Admin - Marme Villa`} />

            <div className="p-4 sm:p-8 max-w-[860px] mx-auto w-full flex flex-col gap-6 sm:gap-8">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Link href={route('admin.manage-admins.index')} className="hover:text-primary transition-colors flex items-center gap-1">
                        <IconRenderer name="manage_accounts" className="text-[16px]" />
                        Kelola Admin
                    </Link>
                    <IconRenderer name="chevron_right" className="text-[16px]" />
                    <span className="text-on-surface font-medium">{isEdit ? `Edit: ${admin.name}` : 'Tambah Admin Baru'}</span>
                </div>

                {/* Page Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF8E1] flex items-center justify-center">
                            <IconRenderer name={isEdit ? 'edit' : 'person_add'} className="text-[18px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }} />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Superadmin Panel</span>
                    </div>
                    <h2 className="font-headline-xl text-2xl sm:text-3xl text-primary font-bold mb-1">
                        {isEdit ? 'Edit Akun Admin' : 'Tambah Admin Baru'}
                    </h2>
                    <p className="text-on-surface-variant text-sm sm:text-body-md">
                        {isEdit
                            ? 'Ubah informasi, role, atau password akun admin ini.'
                            : 'Buat akun admin baru dengan role dan password yang sesuai.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                        <div className="p-5 border-b border-outline-variant/30 bg-surface-bright/50">
                            <h3 className="font-semibold text-primary flex items-center gap-2">
                                <IconRenderer name="person" className="text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                Informasi Akun
                            </h3>
                        </div>
                        <div className="p-5 sm:p-6 flex flex-col gap-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">
                                    Nama Lengkap <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Cth: Budi Santoso"
                                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:ring-1 outline-none transition-colors ${errors.name ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`}
                                />
                                {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">
                                    Email <span className="text-error">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="admin@marmevilla.com"
                                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:ring-1 outline-none transition-colors ${errors.email ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`}
                                />
                                {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Role Selector Card */}
                    <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                        <div className="p-5 border-b border-outline-variant/30 bg-surface-bright/50">
                            <h3 className="font-semibold text-primary flex items-center gap-2">
                                <IconRenderer name="shield" className="text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                Pilih Role
                            </h3>
                        </div>
                        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(ROLE_DESCRIPTIONS).map(([roleKey, cfg]) => (
                                <label key={roleKey}
                                    className={`relative flex flex-col gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${data.role === roleKey ? `${cfg.selectedBorder} ${cfg.selectedBg}` : `${cfg.border} hover:border-outline-variant`}`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={roleKey}
                                        checked={data.role === roleKey}
                                        onChange={() => setData('role', roleKey)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center ${cfg.color}`}>
                                                <IconRenderer name={cfg.icon} className="text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                            </div>
                                            <span className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${data.role === roleKey ? `${cfg.selectedBorder} ${cfg.bg}` : 'border-outline-variant'}`}>
                                            {data.role === roleKey && <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg.replace('bg-', 'bg-')} ${cfg.color.replace('text-', 'bg-')}`} />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-on-surface-variant leading-relaxed">{cfg.description}</p>
                                    <ul className="flex flex-col gap-1">
                                        {cfg.perks.map(perk => (
                                            <li key={perk} className={`text-xs flex items-center gap-1.5 ${cfg.color}`}>
                                                <IconRenderer name="check_circle" className="text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                                {perk}
                                            </li>
                                        ))}
                                    </ul>
                                </label>
                            ))}
                        </div>
                        {errors.role && <p className="text-error text-xs px-6 pb-4">{errors.role}</p>}
                    </div>

                    {/* Password Card */}
                    <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                        <div className="p-5 border-b border-outline-variant/30 bg-surface-bright/50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-primary flex items-center gap-2">
                                    <IconRenderer name="lock" className="text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                    Password
                                </h3>
                                {isEdit && (
                                    <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full">
                                        Kosongkan jika tidak ingin ubah password
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-5 sm:p-6 flex flex-col gap-5">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">
                                    {isEdit ? 'Password Baru' : 'Password'} {!isEdit && <span className="text-error">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder={isEdit ? 'Kosongkan jika tidak ingin ubah' : 'Min. 8 karakter'}
                                        className={`w-full border rounded-lg px-3.5 py-2.5 pr-11 text-sm text-on-surface focus:ring-1 outline-none transition-colors ${errors.password ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                                        <IconRenderer name={showPassword ? 'visibility_off' : 'visibility'} className="text-[20px]" />
                                    </button>
                                </div>
                                {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
                                {!isEdit && (
                                    <p className="text-on-surface-variant text-xs mt-1">Minimal 8 karakter, kombinasi huruf besar, kecil, dan angka.</p>
                                )}
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">
                                    Konfirmasi Password {!isEdit && <span className="text-error">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswordConfirm ? 'text' : 'password'}
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="Ulangi password"
                                        className={`w-full border rounded-lg px-3.5 py-2.5 pr-11 text-sm text-on-surface focus:ring-1 outline-none transition-colors ${errors.password_confirmation ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`}
                                    />
                                    <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                                        <IconRenderer name={showPasswordConfirm ? 'visibility_off' : 'visibility'} className="text-[20px]" />
                                    </button>
                                </div>
                                {errors.password_confirmation && <p className="text-error text-xs mt-1">{errors.password_confirmation}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                        <Link href={route('admin.manage-admins.index')}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-outline-variant/60 text-on-surface-variant text-sm font-semibold hover:bg-surface-container-low transition-colors text-center">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing}
                            className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors ambient-shadow active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IconRenderer name={isEdit ? 'save' : 'person_add'} className="text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                    {isEdit ? 'Simpan Perubahan' : 'Buat Admin'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
