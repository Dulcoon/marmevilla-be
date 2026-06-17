import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    return (
        <AdminLayout>
            <Head title="Profil Saya" />

            <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
                {/* Header */}
                <div>
                    <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Profil Saya</h2>
                    <p className="text-on-surface-variant text-base sm:text-body-md">Kelola informasi akun dan keamanan password Anda.</p>
                </div>

                {/* Profile Info Card */}
                <ProfileInfoCard user={user} mustVerifyEmail={mustVerifyEmail} status={status} />

                {/* Password Card */}
                <PasswordCard />

                {/* Danger Zone Card */}
                <DangerZoneCard />
            </div>
        </AdminLayout>
    );
}

/* ─── Profile Information ────────────────────────────────────────── */
function ProfileInfoCard({ user, mustVerifyEmail, status }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
            {/* Card Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-outline-variant flex items-center gap-3">
                <div className="p-2.5 bg-[#fdfaf5] rounded-lg border border-[#f0e8d9]">
                    <span className="material-symbols-outlined text-[#D4B47D] text-xl">person</span>
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-primary leading-tight">Informasi Profil</h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Perbarui nama dan alamat email akun Anda.</p>
                </div>
            </div>

            {/* Card Body */}
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-on-surface mb-1.5">Nama</label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                        className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-[#D4B47D] focus:ring-1 focus:ring-[#D4B47D] transition-colors"
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-[#D4B47D] focus:ring-1 focus:ring-[#D4B47D] transition-colors"
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 bg-[#fff3e0] rounded-lg border border-[#ffcc80]">
                        <p className="text-sm text-on-surface">
                            Alamat email Anda belum terverifikasi.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold text-[#D4B47D] hover:underline focus:outline-none"
                            >
                                Kirim ulang email verifikasi.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-sm font-semibold text-[#2e7d32]">
                                Link verifikasi baru telah dikirim ke email Anda.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-[#D4B47D] text-white px-6 py-2.5 rounded-lg font-button text-sm hover:bg-[#c2a26b] transition-colors ambient-shadow active:scale-[0.98] disabled:opacity-50"
                    >
                        Simpan Perubahan
                    </button>
                    {recentlySuccessful && (
                        <span className="text-sm font-semibold text-[#2e7d32] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span> Tersimpan
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}

/* ─── Update Password ─────────────────────────────────────────────── */
function PasswordCard() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const PasswordField = ({ id, label, value, onChange, inputRef, show, toggleShow, error, autoComplete }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-on-surface mb-1.5">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    ref={inputRef}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    className="w-full px-4 py-2.5 pr-12 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-[#D4B47D] focus:ring-1 focus:ring-[#D4B47D] transition-colors"
                />
                <button
                    type="button"
                    onClick={() => toggleShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-0.5"
                >
                    <span className="material-symbols-outlined text-[20px]">{show ? 'visibility_off' : 'visibility'}</span>
                </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
        </div>
    );

    return (
        <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-outline-variant flex items-center gap-3">
                <div className="p-2.5 bg-[#fdfaf5] rounded-lg border border-[#f0e8d9]">
                    <span className="material-symbols-outlined text-[#D4B47D] text-xl">lock</span>
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-primary leading-tight">Ubah Password</h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Pastikan akun Anda menggunakan password yang kuat dan aman.</p>
                </div>
            </div>

            <form onSubmit={submit} className="p-4 sm:p-6 space-y-5">
                <PasswordField
                    id="current_password"
                    label="Password Saat Ini"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    inputRef={currentPasswordInput}
                    show={showCurrent}
                    toggleShow={setShowCurrent}
                    error={errors.current_password}
                    autoComplete="current-password"
                />
                <PasswordField
                    id="password"
                    label="Password Baru"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    inputRef={passwordInput}
                    show={showNew}
                    toggleShow={setShowNew}
                    error={errors.password}
                    autoComplete="new-password"
                />
                <PasswordField
                    id="password_confirmation"
                    label="Konfirmasi Password Baru"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    show={showConfirm}
                    toggleShow={setShowConfirm}
                    error={errors.password_confirmation}
                    autoComplete="new-password"
                />

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-[#D4B47D] text-white px-6 py-2.5 rounded-lg font-button text-sm hover:bg-[#c2a26b] transition-colors ambient-shadow active:scale-[0.98] disabled:opacity-50"
                    >
                        Perbarui Password
                    </button>
                    {recentlySuccessful && (
                        <span className="text-sm font-semibold text-[#2e7d32] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span> Tersimpan
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}

/* ─── Delete Account ──────────────────────────────────────────────── */
function DangerZoneCard() {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef();
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const confirm = () => setOpen(true);
    const close = () => { setOpen(false); clearErrors(); reset(); };

    const submit = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => close(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-outline-variant flex items-center gap-3">
                    <div className="p-2.5 bg-[#fff5f5] rounded-lg border border-[#ffcdd2]">
                        <span className="material-symbols-outlined text-error text-xl">warning</span>
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-error leading-tight">Zona Berbahaya</h3>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                        Setelah akun dihapus, semua data dan informasi yang terkait akan dihapus secara permanen. Pastikan Anda sudah mengunduh data penting sebelum menghapus akun.
                    </p>
                    <button
                        onClick={confirm}
                        className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-error text-on-error rounded-lg font-button text-sm hover:bg-error/90 transition-colors ambient-shadow active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                        Hapus Akun Saya
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal show={open} onClose={close}>
                <form onSubmit={submit} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#fff5f5] rounded-lg">
                            <span className="material-symbols-outlined text-error text-2xl">warning</span>
                        </div>
                        <h2 className="text-xl font-bold text-primary">Hapus Akun Permanen?</h2>
                    </div>

                    <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                        Setelah akun dihapus, semua data dan informasi akan dihapus secara permanen. Masukkan password Anda untuk mengonfirmasi.
                    </p>

                    <div>
                        <label htmlFor="delete-password" className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
                        <input
                            id="delete-password"
                            type="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-colors"
                            placeholder="Masukkan password Anda"
                        />
                        {errors.password && <p className="mt-1.5 text-xs text-error">{errors.password}</p>}
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <SecondaryButton onClick={close}>
                            Batal
                        </SecondaryButton>
                        <DangerButton disabled={processing} className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                            Ya, Hapus Akun Saya
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}
