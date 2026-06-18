import { useForm, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ settings, flash }) {
    const { data, setData, post, processing, errors } = useForm({
        midtrans_expiry_minutes: settings?.midtrans_expiry_minutes || '1440', // default 24 jam
        admin_email: settings?.admin_email || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.store'));
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Sistem" />

            <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
                <div>
                    <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Pengaturan Sistem</h2>
                    <p className="text-on-surface-variant text-base sm:text-body-md">Konfigurasi umum untuk aplikasi Marme Villa.</p>
                </div>

                {flash?.success && (
                    <div className="bg-[#e8f5e9] text-[#2e7d32] px-4 py-3 rounded-lg border border-[#c8e6c9] flex items-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        <p className="text-sm font-medium">{flash.success}</p>
                    </div>
                )}

                <form onSubmit={submit} className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden flex flex-col">
                    <div className="p-4 sm:p-6 border-b border-outline-variant/50">
                        <h3 className="text-xl sm:text-headline-md font-bold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined">payments</span>
                            Pembayaran & Notifikasi
                        </h3>
                    </div>

                    <div className="p-4 sm:p-6 flex flex-col gap-6">
                        {/* Midtrans Expiry */}
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">timer</span>
                                Batas Waktu Pembayaran (Menit)
                            </label>
                            <p className="text-xs text-on-surface-variant mb-3">
                                Waktu tunggu maksimal bagi tamu untuk menyelesaikan pembayaran sebelum reservasi dibatalkan otomatis (Auto-Cancel). Default 1440 menit (24 jam).
                            </p>
                            <div className="flex items-center bg-[#F9F7F2] border-b border-[#70665E] rounded-t-md focus-within:border-[#D4B47D] max-w-sm transition-colors">
                                <input
                                    type="number"
                                    min="1"
                                    value={data.midtrans_expiry_minutes}
                                    onChange={(e) => setData('midtrans_expiry_minutes', e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 font-body-md"
                                    placeholder="Cth: 1440"
                                />
                                <span className="pr-4 text-sm text-on-surface-variant">Menit</span>
                            </div>
                            {errors.midtrans_expiry_minutes && <p className="text-error text-xs mt-1">{errors.midtrans_expiry_minutes}</p>}
                        </div>

                        <hr className="border-outline-variant/30" />

                        {/* Admin Email */}
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                Email Admin (Notifikasi)
                            </label>
                            <p className="text-xs text-on-surface-variant mb-3">
                                Email yang akan menerima notifikasi setiap kali ada reservasi baru yang berhasil dibayar.
                            </p>
                            <div className="max-w-sm">
                                <input
                                    type="email"
                                    value={data.admin_email}
                                    onChange={(e) => setData('admin_email', e.target.value)}
                                    className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#D4B47D] focus:ring-0 px-4 py-3 font-body-md rounded-t-md transition-colors"
                                    placeholder="admin@marmevilla.com"
                                />
                            </div>
                            {errors.admin_email && <p className="text-error text-xs mt-1">{errors.admin_email}</p>}
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 bg-surface-bright border-t border-outline-variant/50 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto bg-primary text-white px-8 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[20px] sm:text-[18px]">save</span>
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
