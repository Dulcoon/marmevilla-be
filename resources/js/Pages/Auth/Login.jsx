import Checkbox from '@/Components/Checkbox';
import { IconRenderer } from '@/utils/icon-mapper';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk - Admin Marme Villa" />

            <div className="mb-6">
                <h2 className="font-headline-md text-headline-md text-primary font-bold">Selamat Datang Kembali</h2>
                <p className="text-on-surface-variant text-sm mt-1">Silakan masuk untuk mengakses konsol admin.</p>
            </div>

            {status && (
                <div className="mb-4 p-3 bg-green-50 text-sm font-medium text-green-700 rounded-lg border border-green-200">
                    {status}
                </div>
            )}

            {/* Dev Only Auto-Fill Button */}
            {import.meta.env.DEV && (
                <button
                    type="button"
                    onClick={() => {
                        setData({
                            ...data,
                            email: 'admin@marmevilla.com',
                            password: 'marme2026',
                        });
                    }}
                    className="mb-4 w-full bg-surface-container-high text-on-surface-variant border border-outline-variant py-2 px-4 rounded-lg font-medium text-sm hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
                >
                    <IconRenderer name="developer_mode" className="text-[18px]" />
                    Auto-fill Admin (Dev Only)
                </button>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                {/* Email Input */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider" />
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-[#D4B47D] focus:ring-1 focus:ring-[#D4B47D] transition-colors"
                        autoComplete="username"
                        required
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5 text-xs text-error font-medium" />
                </div>

                {/* Password Input */}
                <div>
                    <div className="flex justify-between items-center">
                        <InputLabel htmlFor="password" value="Kata Sandi" className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-[#D4B47D] hover:underline focus:outline-none"
                            >
                                Lupa kata sandi?
                            </Link>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-[#D4B47D] focus:ring-1 focus:ring-[#D4B47D] transition-colors"
                        autoComplete="current-password"
                        required
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5 text-xs text-error font-medium" />
                </div>

                {/* Remember Me Option */}
                <div className="block">
                    <label className="flex items-center w-fit cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="rounded border-outline-variant text-[#D4B47D] focus:ring-[#D4B47D] focus:ring-offset-0 transition-colors"
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                {/* Submit Action */}
                <div className="mt-2">
                    <button
                        type="submit"
                        className="w-full bg-[#D4B47D] text-white py-3 rounded-lg font-button text-button hover:bg-[#c2a26b] transition-all flex items-center justify-center gap-2 ambient-shadow active:scale-[0.98] select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={processing}
                    >
                        {processing ? 'Masuk...' : 'Masuk'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
