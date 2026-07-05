import { useForm, Head } from '@inertiajs/react';
import { IconRenderer } from '@/utils/icon-mapper';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

export default function Index({ settings, flash }) {
    const { data, setData, post, processing, errors } = useForm({
        active_payment_gateway: settings?.active_payment_gateway || 'midtrans',
        midtrans_server_key: settings?.midtrans_server_key || '',
        midtrans_client_key: settings?.midtrans_client_key || '',
        midtrans_is_production: settings?.midtrans_is_production || 'false',
        midtrans_expiry_minutes: settings?.midtrans_expiry_minutes || '1440', // default 24 jam
        doku_client_id: settings?.doku_client_id || '',
        doku_secret_key: settings?.doku_secret_key || '',
        doku_is_production: settings?.doku_is_production || 'false',
        doku_expiry_minutes: settings?.doku_expiry_minutes || '60', // default 1 jam
        admin_email: settings?.admin_email || '',
    });

    const [activeTab, setActiveTab] = useState('gateway');

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.store'));
    };

    const tabClass = (tab) => `
        px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2
        ${activeTab === tab 
            ? 'bg-primary text-white shadow-sm' 
            : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-primary'
        }
    `;

    return (
        <AdminLayout>
            <Head title="Pengaturan Sistem" />

            <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
                <div>
                    <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Pengaturan Sistem</h2>
                    <p className="text-on-surface-variant text-base sm:text-body-md">Konfigurasi payment gateway, email notifikasi, dan parameter sistem Marme Villa.</p>
                </div>

                {flash?.success && (
                    <div className="bg-[#e8f5e9] text-[#2e7d32] px-4 py-3 rounded-lg border border-[#c8e6c9] flex items-center gap-2">
                        <IconRenderer name="check_circle" />
                        <p className="text-sm font-medium">{flash.success}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b border-outline-variant/30 pb-2">
                    <button onClick={() => setActiveTab('gateway')} className={tabClass('gateway')}>
                        <IconRenderer name="payments" className="text-[18px]" />
                        Gateway Pembayaran
                    </button>
                    <button onClick={() => setActiveTab('general')} className={tabClass('general')}>
                        <IconRenderer name="settings" className="text-[18px]" />
                        Umum & Notifikasi
                    </button>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden flex flex-col">
                    
                    {activeTab === 'gateway' && (
                        <div className="p-4 sm:p-6 flex flex-col gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-primary mb-1">Pilih Payment Gateway Aktif</h3>
                                <p className="text-xs text-on-surface-variant mb-4">Pilih payment gateway utama yang digunakan tamu untuk melakukan transaksi pembayaran reservasi villa.</p>
                                
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {/* Midtrans Card */}
                                    <div 
                                        onClick={() => setData('active_payment_gateway', 'midtrans')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2 relative ${
                                            data.active_payment_gateway === 'midtrans'
                                                ? 'border-gold bg-gold/5 shadow-sm'
                                                : 'border-outline-variant/50 hover:border-outline-variant'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-primary text-base">Midtrans</span>
                                            {data.active_payment_gateway === 'midtrans' && (
                                                <IconRenderer name="check_circle" className="text-gold font-bold" />
                                            )}
                                        </div>
                                        <p className="text-xs text-on-surface-variant">Layanan payment gateway lokal terpopuler dengan dukungan pembayaran QRIS, E-Wallet (Gopay, ShopeePay), Kartu Kredit, dan Virtual Account.</p>
                                    </div>

                                    {/* Doku Card */}
                                    <div 
                                        onClick={() => setData('active_payment_gateway', 'doku')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2 relative ${
                                            data.active_payment_gateway === 'doku'
                                                ? 'border-[#DE2117] bg-[#DE2117]/5 shadow-sm'
                                                : 'border-outline-variant/50 hover:border-outline-variant'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-[#DE2117] text-base">DOKU Checkout</span>
                                            {data.active_payment_gateway === 'doku' && (
                                                <IconRenderer name="check_circle" className="text-[#DE2117] font-bold" />
                                            )}
                                        </div>
                                        <p className="text-xs text-on-surface-variant">Layanan DOKU Checkout dengan antar muka pembayaran responsif, terintegrasi e-wallet, link aja, bank transfer, dan gerai ritel modern.</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-outline-variant/30" />

                            {/* Conditional Settings Fields */}
                            {data.active_payment_gateway === 'midtrans' ? (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-primary text-md flex items-center gap-2">
                                        <IconRenderer name="build" className="text-gold" />
                                        Konfigurasi Midtrans
                                    </h4>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-primary mb-1">Server Key</label>
                                            <input
                                                type="password"
                                                value={data.midtrans_server_key}
                                                onChange={(e) => setData('midtrans_server_key', e.target.value)}
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#D4B47D] focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                placeholder="SB-Mid-server-xxxx"
                                            />
                                            {errors.midtrans_server_key && <p className="text-error text-xs mt-1">{errors.midtrans_server_key}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-primary mb-1">Client Key</label>
                                            <input
                                                type="text"
                                                value={data.midtrans_client_key}
                                                onChange={(e) => setData('midtrans_client_key', e.target.value)}
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#D4B47D] focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                placeholder="SB-Mid-client-xxxx"
                                            />
                                            {errors.midtrans_client_key && <p className="text-error text-xs mt-1">{errors.midtrans_client_key}</p>}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-primary mb-1">Mode Transaksi</label>
                                            <select
                                                value={data.midtrans_is_production}
                                                onChange={(e) => setData('midtrans_is_production', e.target.value)}
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#D4B47D] focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors text-on-surface"
                                            >
                                                <option value="false">Sandbox / Testing</option>
                                                <option value="true">Production / Live</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-primary mb-1">Waktu Kadaluarsa (Menit)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={data.midtrans_expiry_minutes}
                                                onChange={(e) => setData('midtrans_expiry_minutes', e.target.value)}
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#D4B47D] focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                placeholder="Cth: 1440"
                                            />
                                            {errors.midtrans_expiry_minutes && <p className="text-error text-xs mt-1">{errors.midtrans_expiry_minutes}</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-[#DE2117] text-md flex items-center gap-2">
                                        <IconRenderer name="build" />
                                        Konfigurasi DOKU Checkout
                                    </h4>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-primary mb-1">Client ID</label>
                                            <input
                                                type="text"
                                                value={data.doku_client_id}
                                                onChange={(e) => setData('doku_client_id', e.target.value)}
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#DE2117] focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                placeholder="Cth: 28479..."
                                            />
                                            {errors.doku_client_id && <p className="text-error text-xs mt-1">{errors.doku_client_id}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-primary mb-1">Secret Key / Shared Key</label>
                                            <input
                                                type="password"
                                                value={data.doku_secret_key}
                                                onChange={(e) => setData('doku_secret_key', e.target.value)}
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#DE2117] focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                placeholder="SK-xxxx"
                                            />
                                            {errors.doku_secret_key && <p className="text-error text-xs mt-1">{errors.doku_secret_key}</p>}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-primary mb-1">Mode Transaksi</label>
                                            <select
                                                value={data.doku_is_production}
                                                onChange={(e) => setData('doku_is_production', e.target.value)}
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#DE2117] focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors text-on-surface"
                                            >
                                                <option value="false">Sandbox / Testing</option>
                                                <option value="true">Production / Live</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-primary mb-1">Waktu Kadaluarsa (Menit)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={data.doku_expiry_minutes}
                                                onChange={(e) => setData('doku_expiry_minutes', e.target.value)}
                                                className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-[#DE2117] focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                placeholder="Cth: 60"
                                            />
                                            {errors.doku_expiry_minutes && <p className="text-error text-xs mt-1">{errors.doku_expiry_minutes}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="p-4 sm:p-6 flex flex-col gap-6">
                            {/* Admin Email */}
                            <div>
                                <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                    <IconRenderer name="mail" className="text-[18px]" />
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
                    )}

                    <div className="p-4 sm:p-6 bg-surface-bright border-t border-outline-variant/50 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto bg-primary text-white px-8 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow disabled:opacity-50"
                        >
                            <IconRenderer name="save" className="text-[20px] sm:text-[18px]" />
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
