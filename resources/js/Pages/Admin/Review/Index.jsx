import AdminLayout from '@/Layouts/AdminLayout';
import { IconRenderer } from '@/utils/icon-mapper';
import { Head, router, usePage } from '@inertiajs/react';

function StarDisplay({ rating }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function ReviewIndex({ reviews, publishedCount, maxPublished }) {
    const { flash } = usePage().props;

    const handleTogglePublish = (review) => {
        router.patch(route('admin.reviews.toggle-publish', review.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (review) => {
        if (!confirm(`Yakin ingin menghapus ulasan dari "${review.guest_name}"?`)) return;
        router.delete(route('admin.reviews.destroy', review.id), { preserveScroll: true });
    };

    const submittedReviews = reviews.filter(r => r.status === 'submitted');
    const pendingReviews = reviews.filter(r => r.status === 'pending');

    return (
        <AdminLayout>
            <Head title="Kelola Ulasan - Admin Marme Villa" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Kelola Ulasan Tamu</h2>
                        <p className="text-on-surface-variant text-sm mt-0.5">
                            Pilih ulasan terbaik untuk ditampilkan di halaman beranda.
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${
                        publishedCount >= maxPublished
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                        <IconRenderer name="star" className="text-[18px]" />
                        {publishedCount}/{maxPublished} Ditampilkan di Beranda
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                        <IconRenderer name="check_circle" className="text-[20px]" />
                        <span className="text-sm font-medium">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                        <IconRenderer name="error" className="text-[20px]" />
                        <span className="text-sm font-medium">{flash.error}</span>
                    </div>
                )}

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <IconRenderer name="info" className="text-blue-500 text-[20px] mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-700">
                        Maksimal <strong>3 ulasan</strong> dapat ditampilkan di beranda sekaligus. Jika batas sudah tercapai dan Anda mencentang ulasan baru, sistem otomatis akan menyembunyikan ulasan yang paling lama.
                    </p>
                </div>

                {/* Submitted Reviews */}
                <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between">
                        <h3 className="font-semibold text-primary text-base">Ulasan Masuk</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                            {submittedReviews.length} Ulasan
                        </span>
                    </div>

                    {submittedReviews.length === 0 ? (
                        <div className="p-12 text-center text-on-surface-variant">
                            <IconRenderer name="rate_review" className="text-[48px] mb-3 text-outline" />
                            <p className="text-sm">Belum ada ulasan yang masuk.</p>
                            <p className="text-xs mt-1 opacity-70">Ulasan akan muncul setelah tamu melakukan checkout dan mengisi form.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-outline-variant/40">
                            {submittedReviews.map((review) => (
                                <div key={review.id} className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-5 transition-colors ${review.is_published ? 'bg-amber-50/40' : 'hover:bg-surface-container/30'}`}>

                                    {/* Publish Checkbox */}
                                    <div className="flex items-start pt-1 shrink-0">
                                        <button
                                            onClick={() => handleTogglePublish(review)}
                                            title={review.is_published ? 'Sembunyikan dari beranda' : 'Tampilkan di beranda'}
                                            className={`relative w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                                review.is_published
                                                    ? 'bg-amber-500 border-amber-500 text-white'
                                                    : 'border-outline hover:border-primary'
                                            }`}
                                        >
                                            {review.is_published && (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Review Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                            <div>
                                                <div className="font-semibold text-primary">{review.guest_name}</div>
                                                <div className="text-xs text-on-surface-variant">{review.city}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StarDisplay rating={review.rating} />
                                                {review.is_published && (
                                                    <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                                                        Di Beranda
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <blockquote className="text-sm text-on-surface-variant leading-relaxed italic border-l-2 border-outline-variant pl-3">
                                            "{review.comment}"
                                        </blockquote>
                                        {review.booking && (
                                            <div className="text-xs text-on-surface-variant/60 mt-2">
                                                Booking: {review.booking.booking_code}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex sm:flex-col gap-2 items-start shrink-0">
                                        <button
                                            onClick={() => handleDelete(review)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus ulasan"
                                        >
                                            <IconRenderer name="delete" className="text-[18px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pending Reviews (sent but not filled yet) */}
                {pendingReviews.length > 0 && (
                    <div className="bg-white rounded-xl ghost-border ambient-shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between">
                            <h3 className="font-semibold text-primary text-base">Menunggu Diisi Tamu</h3>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
                                {pendingReviews.length} Permintaan Terkirim
                            </span>
                        </div>
                        <div className="divide-y divide-outline-variant/40">
                            {pendingReviews.map((review) => (
                                <div key={review.id} className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                                            <IconRenderer name="mail" className="text-amber-600 text-[18px]" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-primary">{review.guest_name}</div>
                                            <div className="text-xs text-on-surface-variant">Email terkirim, belum mengisi form</div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                                        Menunggu
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
