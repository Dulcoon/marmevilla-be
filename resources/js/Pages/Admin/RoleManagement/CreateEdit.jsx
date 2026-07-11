import AdminLayout from '@/Layouts/AdminLayout';
import { IconRenderer } from '@/utils/icon-mapper';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function CreateEdit({ role, groupedPermissions }) {
    const isEdit = !!role;

    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name ?? '',
        permissions: role?.permissions ?? [],
    });

    const handleCheckboxChange = (permName) => {
        const current = [...data.permissions];
        if (current.includes(permName)) {
            setData('permissions', current.filter(p => p !== permName));
        } else {
            setData('permissions', [...current, permName]);
        }
    };

    const handleSelectAllCategory = (categoryPerms, isAllSelected) => {
        const current = [...data.permissions];
        const categoryNames = categoryPerms.map(p => p.name);

        if (isAllSelected) {
            // Remove all permissions belonging to this category
            setData('permissions', current.filter(p => !categoryNames.includes(p)));
        } else {
            // Add all permissions belonging to this category (avoiding duplicates)
            const filteredCurrent = current.filter(p => !categoryNames.includes(p));
            setData('permissions', [...filteredCurrent, ...categoryNames]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.manage-roles.update', role.id));
        } else {
            post(route('admin.manage-roles.store'));
        }
    };

    return (
        <AdminLayout>
            <Head title={`${isEdit ? 'Edit' : 'Tambah'} Role - Marme Villa`} />

            <div className="p-4 sm:p-8 max-w-[1000px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Link href={route('admin.manage-roles.index')} className="hover:text-primary transition-colors flex items-center gap-1">
                        <IconRenderer name="admin_panel_settings" className="text-[16px]" />
                        Kelola Role & Akses
                    </Link>
                    <IconRenderer name="chevron_right" className="text-[16px]" />
                    <span className="text-on-surface font-medium">{isEdit ? `Edit: ${role.name}` : 'Tambah Role Baru'}</span>
                </div>

                {/* Page Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF8E1] flex items-center justify-center">
                            <IconRenderer name={isEdit ? 'edit_attributes' : 'add_moderator'} className="text-[18px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }} />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Superadmin Panel</span>
                    </div>
                    <h2 className="font-headline-xl text-2xl sm:text-3xl text-primary font-bold mb-1">
                        {isEdit ? 'Edit Hak Akses Role' : 'Tambah Role Baru'}
                    </h2>
                    <p className="text-on-surface-variant text-sm sm:text-body-md">
                        {isEdit
                            ? 'Ubah nama role dan sesuaikan izin hak akses modul untuk tingkatan ini.'
                            : 'Buat role baru dan tentukan izin hak akses apa saja yang diberikan.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                        <div className="p-5 border-b border-outline-variant/30 bg-surface-bright/50">
                            <h3 className="font-semibold text-primary flex items-center gap-2">
                                <IconRenderer name="badge" className="text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                Nama Role
                            </h3>
                        </div>
                        <div className="p-5 sm:p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">
                                    Nama Role <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Cth: manager, finance, marketing"
                                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:ring-1 outline-none transition-colors capitalize ${errors.name ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`}
                                    disabled={isEdit && ['admin', 'superadmin'].includes(role.name.toLowerCase())}
                                />
                                {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                                <p className="text-on-surface-variant text-xs mt-1.5 leading-relaxed">
                                    Gunakan huruf kecil atau kata sederhana. Sistem akan menampilkannya dalam format kapital.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Config Card */}
                    <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                        <div className="p-5 border-b border-outline-variant/30 bg-surface-bright/50 flex justify-between items-center">
                            <h3 className="font-semibold text-primary flex items-center gap-2">
                                <IconRenderer name="rule" className="text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                Atur Hak Akses Modul
                            </h3>
                            <span className="text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full font-medium">
                                {data.permissions.length} Hak Akses Dipilih
                            </span>
                        </div>

                        <div className="p-5 sm:p-6 flex flex-col gap-8">
                            {Object.entries(groupedPermissions).map(([category, perms]) => {
                                const categoryPermsNames = perms.map(p => p.name);
                                const selectedInCategory = data.permissions.filter(p => categoryPermsNames.includes(p));
                                const isAllSelected = selectedInCategory.length === perms.length;

                                return (
                                    <div key={category} className="border border-outline-variant/30 rounded-xl p-4 sm:p-5 bg-surface-container-lowest">
                                        {/* Category Title & Select All */}
                                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/20">
                                            <span className="font-bold text-primary text-sm flex items-center gap-1.5">
                                                <IconRenderer name="folder_open" className="text-[18px] text-on-surface-variant/80" />
                                                Modul {category}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectAllCategory(perms, isAllSelected)}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                                                    isAllSelected
                                                        ? 'bg-error/10 text-error hover:bg-error/20'
                                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                                }`}
                                            >
                                                {isAllSelected ? 'Batalkan Semua' : 'Pilih Semua'}
                                            </button>
                                        </div>

                                        {/* Permissions Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {perms.map(perm => {
                                                const isChecked = data.permissions.includes(perm.name);
                                                return (
                                                    <label
                                                        key={perm.id}
                                                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                            isChecked
                                                                ? 'border-primary/40 bg-primary/5'
                                                                : 'border-outline-variant/10 hover:border-outline-variant/30'
                                                        }`}
                                                    >
                                                        <div className="mt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handleCheckboxChange(perm.name)}
                                                                className="rounded border-outline-variant text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-xs text-on-surface leading-tight mb-0.5">
                                                                {perm.name}
                                                            </span>
                                                            <span className="text-[11px] text-on-surface-variant leading-normal">
                                                                {perm.description}
                                                            </span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                        <Link href={route('admin.manage-roles.index')}
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
                                    <IconRenderer name="save" className="text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                                    {isEdit ? 'Simpan Perubahan' : 'Buat Role'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
