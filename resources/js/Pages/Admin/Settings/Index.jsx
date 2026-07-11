import { useForm, Head } from '@inertiajs/react';
import { IconRenderer } from '@/utils/icon-mapper';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { usePermission } from '@/hooks/usePermission';

export default function Index({ settings, flash }) {
    const { can } = usePermission();
    const canEditSettings = can('edit settings');
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

    const [emailsList, setEmailsList] = useState(
        settings?.admin_email 
            ? settings.admin_email.split(',').map(e => e.trim()).filter(Boolean)
            : []
    );
    const [newEmail, setNewEmail] = useState('');

    const handleAddEmail = () => {
        if (newEmail.trim() && !emailsList.includes(newEmail.trim())) {
            setEmailsList([...emailsList, newEmail.trim()]);
            setNewEmail('');
        }
    };

    const handleRemoveEmail = (index) => {
        setEmailsList(emailsList.filter((_, i) => i !== index));
    };

    // Helper to check if a tab has validation errors
    const gatewayKeys = [
        'midtrans_server_key',
        'midtrans_client_key',
        'midtrans_expiry_minutes',
        'doku_client_id',
        'doku_secret_key',
        'doku_expiry_minutes'
    ];
    const hasGatewayErrors = Object.keys(errors).some(key => gatewayKeys.includes(key));
    const hasGeneralErrors = !!errors.admin_email;

    const submit = (e) => {
        e.preventDefault();

        data.admin_email = emailsList.join(', ');

        post(route('admin.settings.store'), {
            preserveScroll: true,
            onError: (errs) => {
                const hasGatewayErr = Object.keys(errs).some(key => gatewayKeys.includes(key));
                if (hasGatewayErr) {
                    setActiveTab('gateway');
                } else if (errs.admin_email) {
                    setActiveTab('general');
                }
            }
        });
    };

    const tabClass = (tab) => {
        const hasErr = tab === 'gateway' ? hasGatewayErrors : hasGeneralErrors;
        return `
            flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative
            ${activeTab === tab 
                ? 'bg-primary text-white shadow-md' 
                : 'text-on-surface-variant hover:bg-white/60 hover:text-primary'
            }
            ${hasErr ? 'border border-error/50' : ''}
        `;
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Sistem" />

            <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
                <div>
                    <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold font-sans">Pengaturan Sistem</h2>
                    <p className="text-on-surface-variant text-base sm:text-body-md">Konfigurasi payment gateway, email notifikasi, dan parameter sistem Marme Villa.</p>
                </div>

                {/* Segmented Control Tabs */}
                <div className="p-1 bg-surface-variant/40 rounded-xl flex gap-1 border border-outline-variant/20">
                    <button type="button" onClick={() => setActiveTab('gateway')} className={tabClass('gateway')}>
                        <IconRenderer name="payments" className="text-[18px]" />
                        <span>Gateway Pembayaran</span>
                        {hasGatewayErrors && (
                            <span className="w-2 h-2 rounded-full bg-error absolute top-2 right-2 animate-pulse" />
                        )}
                    </button>
                    <button type="button" onClick={() => setActiveTab('general')} className={tabClass('general')}>
                        <IconRenderer name="settings" className="text-[18px]" />
                        <span>Umum & Notifikasi</span>
                        {hasGeneralErrors && (
                            <span className="w-2 h-2 rounded-full bg-error absolute top-2 right-2 animate-pulse" />
                        )}
                    </button>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden flex flex-col">
                    
                    <div className="p-4 sm:p-6 flex flex-col gap-6 flex-1">
                        {activeTab === 'gateway' && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-primary mb-1">Pilih Payment Gateway Aktif</h3>
                                    <p className="text-xs text-on-surface-variant mb-4">Pilih payment gateway utama yang digunakan tamu untuk melakukan transaksi pembayaran reservasi villa.</p>
                                    
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {/* Midtrans Card */}
                                        <div 
                                            onClick={() => canEditSettings && setData('active_payment_gateway', 'midtrans')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-2 relative ${
                                                canEditSettings ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
                                            } ${
                                                data.active_payment_gateway === 'midtrans'
                                                    ? 'border-secondary bg-secondary/5 shadow-sm'
                                                    : 'border-outline-variant/50 hover:border-outline-variant'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-primary text-base">Midtrans</span>
                                                {data.active_payment_gateway === 'midtrans' && (
                                                    <IconRenderer name="check_circle" className="text-secondary font-bold" />
                                                )}
                                            </div>
                                            <p className="text-xs text-on-surface-variant">Layanan payment gateway lokal terpopuler dengan dukungan pembayaran QRIS, E-Wallet (Gopay, ShopeePay), Kartu Kredit, dan Virtual Account.</p>
                                        </div>

                                        {/* Doku Card */}
                                        <div 
                                            onClick={() => canEditSettings && setData('active_payment_gateway', 'doku')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-2 relative ${
                                                canEditSettings ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
                                            } ${
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
                                            <IconRenderer name="build" className="text-secondary" />
                                            Konfigurasi Midtrans
                                        </h4>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-primary mb-1">Server Key</label>
                                                <input
                                                    type="password"
                                                    value={data.midtrans_server_key}
                                                    onChange={(e) => setData('midtrans_server_key', e.target.value)}
                                                    className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-secondary focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                    placeholder="SB-Mid-server-xxxx"
                                                    disabled={!canEditSettings}
                                                />
                                                {errors.midtrans_server_key && <p className="text-error text-xs mt-1">{errors.midtrans_server_key}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-primary mb-1">Client Key</label>
                                                <input
                                                    type="text"
                                                    value={data.midtrans_client_key}
                                                    onChange={(e) => setData('midtrans_client_key', e.target.value)}
                                                    className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-secondary focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                    placeholder="SB-Mid-client-xxxx"
                                                    disabled={!canEditSettings}
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
                                                    className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-secondary focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors text-on-surface"
                                                    disabled={!canEditSettings}
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
                                                    className="w-full bg-[#F9F7F2] border-b border-[#70665E] focus:border-secondary focus:ring-0 px-3 py-2 text-sm font-body-md rounded-t-md transition-colors"
                                                    placeholder="Cth: 1440"
                                                    disabled={!canEditSettings}
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
                                                    disabled={!canEditSettings}
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
                                                    disabled={!canEditSettings}
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
                                                    disabled={!canEditSettings}
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
                                                    disabled={!canEditSettings}
                                                />
                                                {errors.doku_expiry_minutes && <p className="text-error text-xs mt-1">{errors.doku_expiry_minutes}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'general' && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-primary mb-1">Pengaturan Notifikasi</h3>
                                    <p className="text-xs text-on-surface-variant mb-6">
                                        Daftar alamat email admin yang akan menerima notifikasi otomatis setiap kali ada reservasi baru yang berhasil dibayar.
                                    </p>
                                    
                                    <div className="max-w-xl">
                                        <div className="flex flex-col gap-4 border border-outline-variant/30 rounded-xl p-4 sm:p-6 bg-surface-bright/40">
                                            <h4 className="text-sm font-bold text-primary flex items-center gap-2 pb-3 border-b border-outline-variant/20">
                                                <IconRenderer name="mail" className="text-secondary text-[18px]" />
                                                Email Penerima Notifikasi
                                            </h4>

                                            {errors.admin_email && (
                                                <div className="bg-red-50 text-error text-xs px-3 py-2 rounded-lg border border-red-100 flex items-center gap-1.5 font-sans">
                                                    <IconRenderer name="error" className="text-[14px]" />
                                                    {errors.admin_email}
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-3">
                                                {emailsList.length > 0 ? (
                                                    <div className="flex flex-col gap-2">
                                                        {emailsList.map((email, idx) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white border border-outline-variant/50 rounded-lg p-2.5 px-3">
                                                                <span className="text-sm font-body-md text-primary">{email}</span>
                                                                {canEditSettings && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveEmail(idx)}
                                                                        className="text-error/70 hover:text-error hover:bg-error/10 p-1 rounded-md transition-colors"
                                                                    >
                                                                        <IconRenderer name="delete" className="text-[18px]" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 bg-surface-variant/30 rounded-lg border border-dashed border-outline-variant/50">
                                                        <p className="text-sm text-on-surface-variant">Belum ada email yang ditambahkan</p>
                                                    </div>
                                                )}

                                                {canEditSettings && (
                                                    <div className="flex gap-2 mt-2">
                                                        <input
                                                            type="email"
                                                            value={newEmail}
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleAddEmail();
                                                                }
                                                            }}
                                                            placeholder="Masukkan email baru..."
                                                            className="flex-1 bg-white border border-outline-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary/20 rounded-lg px-3 py-2 text-sm text-primary transition-colors outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleAddEmail}
                                                            disabled={!newEmail.trim()}
                                                            className="bg-secondary/10 text-secondary hover:bg-secondary/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                        >
                                                            <IconRenderer name="add" className="text-[18px]" />
                                                            Tambah
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-[11px] text-on-surface-variant mt-2">
                                                Email-email di atas akan secara otomatis menerima laporan ketika ada reservasi baru yang berhasil dibayar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Unified Footer */}
                    <div className="p-4 sm:p-6 bg-surface-bright border-t border-outline-variant/50 flex justify-end">
                        {canEditSettings ? (
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto bg-primary text-white px-8 py-3 sm:py-2.5 rounded-lg font-button text-sm sm:text-button hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ambient-shadow disabled:opacity-50 active:scale-[0.98]"
                            >
                                <IconRenderer name="save" className="text-[20px] sm:text-[18px]" />
                                Simpan Pengaturan
                            </button>
                        ) : (
                            <div className="w-full sm:w-auto bg-surface-container-low text-on-surface-variant border border-outline-variant/40 px-8 py-3 sm:py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
                                <IconRenderer name="lock" className="text-[18px]" />
                                Mode Lihat Saja (Read-Only)
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
