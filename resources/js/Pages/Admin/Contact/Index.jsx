import AdminLayout from '@/Layouts/AdminLayout';
import { IconRenderer } from '@/utils/icon-mapper';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ contacts }) {
    const { delete: destroy } = useForm();
    const [selectedMessage, setSelectedMessage] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
            destroy(route('admin.contacts.destroy', id));
        }
    };

    const handleViewMessage = (contact) => {
        setSelectedMessage(contact);
        if (!contact.is_read) {
            router.patch(route('admin.contacts.mark-as-read', contact.id), {}, { preserveScroll: true, preserveState: true });
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head title="Kotak Masuk - Admin Marme Villa" />

            <div className="p-4 sm:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary mb-1 sm:mb-2 font-bold">Kotak Masuk</h2>
                        <p className="text-on-surface-variant text-base sm:text-body-md">Kelola pesan dan pertanyaan dari pengunjung website.</p>
                    </div>
                </div>

                {/* Messages List Container */}
                {contacts.data.length === 0 ? (
                    <div className="bg-white rounded-xl ghost-border ambient-shadow p-8 text-center text-on-surface-variant text-sm">
                        <IconRenderer name="inbox" className="text-4xl mb-3 block opacity-50" />
                        Belum ada pesan masuk.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {contacts.data.map((contact) => (
                            <div key={contact.id} className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
                                {/* Status Indicator */}
                                <div className="absolute top-4 right-4 z-10">
                                    {!contact.is_read ? (
                                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-error/10 text-error flex items-center gap-1.5 shadow-sm border border-error/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Baru
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-surface-container-high text-on-surface-variant flex items-center gap-1.5 shadow-sm border border-outline-variant/30">
                                            Dibaca
                                        </span>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className={`p-5 flex flex-col flex-1 ${!contact.is_read ? 'bg-primary/5' : ''}`}>
                                    <div className="flex justify-between items-start gap-2 mb-3 pr-16">
                                        <h3 className="text-xl font-bold text-primary leading-tight truncate">{contact.name}</h3>
                                    </div>

                                    {/* Meta info */}
                                    <div className="flex flex-col gap-1.5 text-sm text-on-surface-variant font-medium mb-4">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <IconRenderer name="mail" className="text-[18px]" />
                                            {contact.email}
                                        </div>
                                        {contact.phone && (
                                            <div className="flex items-center gap-1.5 truncate">
                                                <IconRenderer name="call" className="text-[18px]" />
                                                {contact.phone}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-xs mt-1">
                                            <IconRenderer name="schedule" className="text-[16px]" />
                                            {formatTime(contact.created_at)}
                                        </div>
                                    </div>

                                    {/* Message Preview */}
                                    <div className="mt-2 text-sm text-on-surface line-clamp-3 mb-6 flex-1">
                                        {contact.message}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-outline-variant/50 flex justify-between items-center gap-2">
                                        <button 
                                            onClick={() => handleViewMessage(contact)}
                                            className="flex-1 px-4 py-2 text-sm font-semibold bg-surface-container-low text-primary hover:bg-primary hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            <IconRenderer name="visibility" className="text-[18px]" />
                                            Baca
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(contact.id)}
                                            className="px-4 py-2 text-sm font-semibold bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-colors flex items-center justify-center"
                                            title="Hapus"
                                        >
                                            <IconRenderer name="delete" className="text-[18px]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {contacts.links && contacts.links.length > 3 && (
                    <div className="bg-white rounded-xl ghost-border ambient-shadow px-6 py-4 flex items-center justify-between">
                        <div className="text-sm text-on-surface-variant">
                            Menampilkan <span className="font-medium text-on-surface">{contacts.from || 0}</span> sampai <span className="font-medium text-on-surface">{contacts.to || 0}</span> dari <span className="font-medium text-on-surface">{contacts.total}</span> data
                        </div>
                        <div className="flex items-center gap-1">
                            {contacts.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                                        link.active 
                                        ? 'bg-primary border-primary text-on-primary' 
                                        : 'border-outline-variant/60 text-on-surface hover:bg-surface-container-low'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail Pesan */}
            {selectedMessage && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => setSelectedMessage(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface-bright rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-lowest">
                            <h3 className="font-bold text-on-surface text-lg flex items-center gap-2">
                                <IconRenderer name="mail" className="text-primary" />
                                Detail Pesan
                            </h3>
                            <button onClick={() => setSelectedMessage(null)} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
                                <IconRenderer name="close" className="text-[20px]" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="font-bold text-on-surface text-lg">{selectedMessage.name}</h4>
                                    <p className="text-sm text-primary font-medium mt-1">{selectedMessage.email}</p>
                                    {selectedMessage.phone && (
                                        <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                                            <IconRenderer name="call" className="text-[16px]" />
                                            {selectedMessage.phone}
                                        </p>
                                    )}
                                </div>
                                <div className="text-xs text-on-surface-variant text-right">
                                    {formatTime(selectedMessage.created_at)}
                                </div>
                            </div>
                            
                            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/40">
                                <p className="text-on-surface leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-outline-variant/60 flex items-center justify-end gap-3 bg-surface-container-lowest">
                            <button 
                                onClick={() => setSelectedMessage(null)}
                                className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                            <a 
                                href={`mailto:${selectedMessage.email}?subject=Balasan dari Marme Villa Jogja`}
                                className="px-4 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <IconRenderer name="reply" className="text-[18px]" />
                                Balas via Email
                            </a>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
