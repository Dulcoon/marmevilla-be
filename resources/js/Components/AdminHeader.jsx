import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminHeader({ onMenuToggle }) {
    const { user, unreadNotifications = [] } = usePage().props.auth;
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-surface-bright border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-6 transition-colors">
            {/* Left Section: Menu Toggle & Search */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuToggle}
                    className="p-3 sm:p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors lg:hidden active:opacity-80"
                    aria-label="Toggle Navigation Sidebar"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                <div className="relative hidden sm:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input 
                        className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-full text-sm focus:outline-none focus:border-[#D4B47D] focus:ring-1 focus:ring-[#D4B47D] transition-colors w-64" 
                        placeholder="Cari reservasi, tamu..." 
                        type="text"
                    />
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notification Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setNotifOpen(!notifOpen);
                            setProfileOpen(false);
                        }}
                        className="p-3 sm:p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative cursor-pointer active:opacity-80"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        {unreadNotifications.length > 0 && (
                            <span className="absolute top-2.5 right-2.5 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-error rounded-full"></span>
                        )}
                    </button>

                    {notifOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setNotifOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant rounded-xl shadow-lg py-2 z-20 transition-all origin-top-right overflow-hidden">
                                <div className="px-4 py-3 flex justify-between items-center border-b border-outline-variant/50">
                                    <h3 className="font-bold text-primary text-sm">Notifikasi</h3>
                                    {unreadNotifications.length > 0 && (
                                        <Link
                                            href={route('admin.notifications.mark-all-read')}
                                            method="patch"
                                            as="button"
                                            className="text-xs font-semibold text-on-surface-variant hover:text-primary hover:underline"
                                            onClick={() => setNotifOpen(false)}
                                        >
                                            Tandai semua dibaca
                                        </Link>
                                    )}
                                </div>
                                
                                <div className="max-h-96 overflow-y-auto">
                                    {unreadNotifications.length > 0 ? (
                                        unreadNotifications.map((notif) => (
                                            <Link
                                                key={notif.id}
                                                href={route('admin.notifications.mark-as-read', notif.id)}
                                                method="patch"
                                                as="button"
                                                className="w-full flex items-start gap-3 p-4 hover:bg-surface-container-lowest transition-colors text-left border-b border-outline-variant/30 last:border-0"
                                                onClick={() => setNotifOpen(false)}
                                            >
                                                <span className={`material-symbols-outlined mt-0.5 ${notif.data.color || 'text-primary'}`}>
                                                    {notif.data.icon || 'notifications'}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm text-on-surface font-medium leading-snug">
                                                        {notif.data.message}
                                                    </p>
                                                    <p className="text-xs text-on-surface-variant mt-1">
                                                        {formatTime(notif.created_at)}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-on-surface-variant text-sm">
                                            Belum ada notifikasi baru.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <button className="p-3 sm:p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors cursor-pointer active:opacity-80">
                    <span className="material-symbols-outlined">mail</span>
                </button>

                <div className="h-8 w-px bg-outline-variant mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setProfileOpen(!profileOpen);
                            setNotifOpen(false);
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low p-2 pr-4 sm:p-1 sm:pr-3 rounded-full transition-colors select-none focus:outline-none"
                    >
                        <img 
                            alt="Profil Admin" 
                            className="w-8 h-8 sm:w-8 sm:h-8 rounded-full object-cover border border-outline-variant" 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=D4B47D&color=fff&bold=true`}
                        />
                        <span className="font-label-md text-label-md text-primary font-semibold hidden sm:inline">{user?.name || 'Profil Admin'}</span>
                    </button>

                    {profileOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setProfileOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant rounded-xl shadow-lg py-2 z-20 transition-all origin-top-right">
                                <Link 
                                    href={route('profile.edit')}
                                    className="flex items-center gap-3 px-4 py-3 sm:py-2.5 text-base sm:text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    <span className="material-symbols-outlined text-lg sm:text-sm">person</span>
                                    <span>Profil</span>
                                </Link>
                                <hr className="border-outline-variant/50 my-1" />
                                <Link 
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-base sm:text-sm text-error hover:bg-error-container/20 transition-colors text-left"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    <span className="material-symbols-outlined text-lg sm:text-sm text-error">logout</span>
                                    <span>Keluar</span>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
