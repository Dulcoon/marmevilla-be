import { Link, usePage } from '@inertiajs/react';
import { IconRenderer } from '@/utils/icon-mapper';
import { usePermission } from '@/hooks/usePermission';

export default function AdminSidebar({ isOpen, onClose }) {
    const { url, props } = usePage();
    const isSuperadmin = props.auth?.user?.is_superadmin ?? false;
    const { can } = usePermission();

    const menuItems = [
        { name: 'Dashboard', icon: 'dashboard', href: route('dashboard'), active: url.startsWith('/dashboard'), show: true },
        { name: 'Kelola Villa', icon: 'villa', href: route('admin.villas.index'), active: url.startsWith('/admin/villas'), show: can('view villas') },
        { name: 'Aturan Harga', icon: 'payments', href: route('admin.pricing.index'), active: url.startsWith('/admin/pricing'), show: can('view pricing') },
        { name: 'Blokir Tanggal', icon: 'event_busy', href: route('admin.blocked-dates.index'), active: url.startsWith('/admin/blocked-dates'), show: can('view blocked-dates') },
        { name: 'Voucher', icon: 'confirmation_number', href: route('admin.vouchers.index'), active: url.startsWith('/admin/vouchers'), show: can('view vouchers') },
        { name: 'Reservasi', icon: 'calendar_month', href: route('admin.reservations.index'), active: url.startsWith('/admin/reservations'), show: can('view reservations') },
        { name: 'Ulasan Tamu', icon: 'rate_review', href: route('admin.reviews.index'), active: url.startsWith('/admin/reviews'), show: can('view reviews') },
        { name: 'Kotak Masuk', icon: 'mail', href: route('admin.contacts.index'), active: url.startsWith('/admin/contacts'), show: can('view contacts') },
    ].filter(item => item.show);

    const footerItems = [
        { name: 'Pengaturan', icon: 'settings', href: route('admin.settings.index'), active: url.startsWith('/admin/settings'), show: can('view settings') },
    ].filter(item => item.show);

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar drawer */}
            <aside 
                className={`fixed left-0 top-0 h-full w-sidebar-width bg-primary text-on-primary/70 shadow-xl z-50 flex flex-col py-8 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header / Logo */}
                <div className="px-6 mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-headline-md font-headline-md font-bold text-on-primary">Marme Villa</h1>
                        <p className="font-label-md text-label-md text-on-primary/70 mt-1 uppercase tracking-wider">Konsol Admin</p>
                    </div>
                    {/* Close button for mobile */}
                    <button 
                        onClick={onClose} 
                        className="lg:hidden p-1 text-on-primary hover:bg-white/10 rounded-full transition-colors"
                    >
                        <IconRenderer name="close" />
                    </button>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 flex flex-col gap-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                                item.active
                                    ? 'text-on-primary border-l-4 border-[#D4B47D] bg-primary-container/40'
                                    : 'hover:text-on-primary hover:bg-primary-container/10'
                            }`}
                        >
                            <IconRenderer name={item.icon} className="text-[24px] sm:text-[20px]" 
                                style={{ fontVariationSettings: item.active ? "'FILL' 1" : undefined }}
                             />
                            <span className={`font-label-md text-base sm:text-label-md ${item.active ? 'text-[#D4B47D] font-semibold' : ''}`}>
                                {item.name}
                            </span>
                        </Link>
                    ))}

                    {/* Superadmin-only section */}
                    {isSuperadmin && (
                        <>
                            <div className="mx-6 my-3 border-t border-white/10" />
                            <div className="px-6 mb-1">
                                <span className="text-[10px] uppercase tracking-widest text-on-primary/40 font-semibold">
                                    Superadmin
                                </span>
                            </div>
                            <Link
                                href={route('admin.manage-admins.index')}
                                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                                    url.startsWith('/admin/manage-admins')
                                        ? 'text-on-primary border-l-4 border-[#D4B47D] bg-primary-container/40'
                                        : 'hover:text-on-primary hover:bg-primary-container/10'
                                }`}
                            >
                                <IconRenderer 
                                    name="manage_accounts" 
                                    className="text-[24px] sm:text-[20px]"
                                    style={{ fontVariationSettings: url.startsWith('/admin/manage-admins') ? "'FILL' 1" : undefined }}
                                />
                                <span className={`font-label-md text-base sm:text-label-md ${url.startsWith('/admin/manage-admins') ? 'text-[#D4B47D] font-semibold' : ''}`}>
                                    Kelola Admin
                                </span>
                            </Link>
                            <Link
                                href={route('admin.manage-roles.index')}
                                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                                    url.startsWith('/admin/manage-roles')
                                        ? 'text-on-primary border-l-4 border-[#D4B47D] bg-primary-container/40'
                                        : 'hover:text-on-primary hover:bg-primary-container/10'
                                }`}
                            >
                                <IconRenderer 
                                    name="admin_panel_settings" 
                                    className="text-[24px] sm:text-[20px]"
                                    style={{ fontVariationSettings: url.startsWith('/admin/manage-roles') ? "'FILL' 1" : undefined }}
                                />
                                <span className={`font-label-md text-base sm:text-label-md ${url.startsWith('/admin/manage-roles') ? 'text-[#D4B47D] font-semibold' : ''}`}>
                                    Kelola Role & Akses
                                </span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* Secondary Navigation */}
                <div className="mt-auto flex flex-col gap-1">
                    {footerItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-6 py-4 sm:py-3 transition-colors ${
                                item.active
                                    ? 'text-on-primary border-l-4 border-[#D4B47D] bg-primary-container/40'
                                    : 'hover:text-on-primary hover:bg-primary-container/10'
                            }`}
                        >
                            <IconRenderer name={item.icon} className="text-[24px] sm:text-[20px]" />
                            <span className="font-label-md text-base sm:text-label-md">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </aside>
        </>
    );
}
