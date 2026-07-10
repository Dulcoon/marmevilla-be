import { useState, useEffect, useRef } from 'react';
import { IconRenderer } from '@/utils/icon-mapper';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';

export default function AdminHeader({ onMenuToggle }) {
    const { user, unreadNotifications = [], unreadMessages = [], unreadMessagesCount = 0 } = usePage().props.auth;
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgOpen, setMsgOpen] = useState(false);
    
    // Live Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);

    // Live Search Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                setIsSearching(true);
                axios.get(route('admin.reservations.search', { q: searchQuery }))
                    .then(res => {
                        setSearchResults(res.data);
                        setIsSearching(false);
                    })
                    .catch(err => {
                        console.error("Search error", err);
                        setIsSearching(false);
                    });
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle click outside to close search dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);

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
                    <IconRenderer name="menu" className="text-[22px]" />
                </button>

                <div className="relative hidden sm:block" ref={searchRef}>
                    <IconRenderer name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input 
                        className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-full text-sm focus:outline-none focus:border-[#D4B47D] focus:ring-1 focus:ring-[#D4B47D] transition-colors w-64" 
                        placeholder="Cari reservasi, tamu..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSearch(true)}
                    />
                    
                    {/* Live Search Dropdown */}
                    {showSearch && searchQuery.trim().length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
                            {isSearching ? (
                                <div className="p-4 text-center text-sm text-on-surface-variant">Mencari...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="max-h-96 overflow-y-auto">
                                    {searchResults.map(result => (
                                        <Link
                                            key={result.id}
                                            href={route('admin.reservations.show', result.id)}
                                            className="block p-3 hover:bg-surface-container-lowest border-b border-outline-variant/30 last:border-0"
                                            onClick={() => setShowSearch(false)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-sm text-primary">{result.booking_code}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                    result.booking_status === 'confirmed' ? 'bg-success/10 text-success' :
                                                    result.booking_status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    result.booking_status === 'cancelled' ? 'bg-error/10 text-error' :
                                                    'bg-surface-container-highest text-on-surface'
                                                }`}>
                                                    {result.booking_status.charAt(0).toUpperCase() + result.booking_status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium text-on-surface mb-0.5">{result.guest_name}</div>
                                            <div className="text-xs text-on-surface-variant flex items-center gap-1">
                                                <IconRenderer name="home" className="text-[12px]" />
                                                <span>{result.villa?.name}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-on-surface-variant">Tidak ada hasil ditemukan.</div>
                            )}
                        </div>
                    )}
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
                            setMsgOpen(false);
                        }}
                        className="p-3 sm:p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative cursor-pointer active:opacity-80"
                    >
                        <IconRenderer name="notifications" className="text-[22px]" />
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
                            <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-80 mt-2 bg-white border border-outline-variant rounded-xl shadow-lg py-2 z-20 transition-all origin-top-right overflow-hidden">
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
                                                <IconRenderer name={notif.data.icon || 'notifications'} className={` mt-0.5 ${notif.data.color || 'text-primary'}`} />
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
                
                {/* Message Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setMsgOpen(!msgOpen);
                            setProfileOpen(false);
                            setNotifOpen(false);
                        }}
                        className="p-3 sm:p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative cursor-pointer active:opacity-80"
                    >
                        <IconRenderer name="mail" className="text-[22px]" />
                        {unreadMessagesCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-error rounded-full"></span>
                        )}
                    </button>

                    {msgOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setMsgOpen(false)}
                            />
                            <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-80 mt-2 bg-white border border-outline-variant rounded-xl shadow-lg py-2 z-20 transition-all origin-top-right overflow-hidden">
                                <div className="px-4 py-3 flex justify-between items-center border-b border-outline-variant/50">
                                    <h3 className="font-bold text-primary text-sm">Kotak Masuk</h3>
                                    {unreadMessagesCount > 0 && (
                                        <Link
                                            href={route('admin.contacts.mark-all-read')}
                                            method="patch"
                                            as="button"
                                            className="text-xs font-semibold text-on-surface-variant hover:text-primary hover:underline"
                                            onClick={() => setMsgOpen(false)}
                                        >
                                            Tandai semua dibaca
                                        </Link>
                                    )}
                                </div>
                                
                                <div className="max-h-96 overflow-y-auto">
                                    {unreadMessages.length > 0 ? (
                                        unreadMessages.map((msg) => (
                                            <Link
                                                key={msg.id}
                                                href={route('admin.contacts.index')}
                                                className="w-full flex items-start gap-3 p-4 hover:bg-surface-container-lowest transition-colors text-left border-b border-outline-variant/30 last:border-0"
                                                onClick={() => setMsgOpen(false)}
                                            >
                                                <IconRenderer name="person" className="mt-0.5 text-[#D4B47D]" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-on-surface font-medium leading-snug truncate">
                                                        {msg.name}
                                                    </p>
                                                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                                                        {msg.message}
                                                    </p>
                                                    <p className="text-[10px] text-on-surface-variant mt-1.5">
                                                        {formatTime(msg.created_at)}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-on-surface-variant text-sm">
                                            Belum ada pesan baru.
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-outline-variant/50 p-2">
                                    <Link 
                                        href={route('admin.contacts.index')}
                                        className="block text-center w-full py-2 text-sm font-semibold text-primary hover:bg-surface-container-lowest rounded-lg transition-colors"
                                        onClick={() => setMsgOpen(false)}
                                    >
                                        Lihat Semua Pesan
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-8 w-px bg-outline-variant mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setProfileOpen(!profileOpen);
                            setNotifOpen(false);
                            setMsgOpen(false);
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
                                    <IconRenderer name="person" className="text-lg sm:text-sm" />
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
                                    <IconRenderer name="logout" className="text-lg sm:text-sm text-error" />
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
