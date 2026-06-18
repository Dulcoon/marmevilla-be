import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { useState, useEffect } from 'react';

export default function Form({ villa }) {
    const isEditing = !!villa.id;

    // Parse array fields or default to empty arrays with one empty string item
    const initialLongDesc = Array.isArray(villa.long_description) ? villa.long_description : [''];
    const initialFeatures = Array.isArray(villa.features) ? villa.features : [''];

    const { data, setData, post, put, processing, errors, transform } = useForm({
        name: villa.name || '',
        tagline: villa.tagline || '',
        description: villa.description || '',
        long_description: initialLongDesc,
        location: villa.location || '',
        size: villa.size || '',
        bed_count: villa.bed_count || '',
        bathroom_count: villa.bathroom_count || '',
        view_description: villa.view_description || '',
        capacity: villa.capacity || '',
        max_guests: villa.max_guests || '',
        features: initialFeatures,
        base_price: villa.base_price || '',
        weekend_price: villa.weekend_price || '',
        extra_guest_fee: villa.extra_guest_fee || '',
        weekend_enabled: villa.weekend_enabled ?? true,
        images: [],
        new_images: []
    });

    const [localImages, setLocalImages] = useState([]);

    // Clean up local image URLs on unmount
    useEffect(() => {
        return () => {
            localImages.forEach(img => URL.revokeObjectURL(img.preview));
        };
    }, [localImages]);

    const submit = (e) => {
        e.preventDefault();
        
        transform((currentData) => {
            const cleanData = {
                ...currentData,
                long_description: currentData.long_description.filter(item => item.trim() !== ''),
                features: currentData.features.filter(item => item.trim() !== '')
            };
            
            if (cleanData.long_description.length === 0) cleanData.long_description = null;
            if (cleanData.features.length === 0) cleanData.features = null;

            if (isEditing) {
                cleanData._method = 'put';
            }

            return cleanData;
        });

        if (isEditing) {
            post(route('admin.villas.update', villa.id), {
                forceFormData: true,
            });
        } else {
            post(route('admin.villas.store'));
        }
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        
        setLocalImages(prev => [...prev, ...newPreviews]);
        
        const field = isEditing ? 'new_images' : 'images';
        setData(field, [...data[field], ...files]);
        
        // Reset file input so same files can be selected again if needed
        e.target.value = '';
    };

    const removeLocalImage = (index) => {
        const fileToRemove = localImages[index];
        URL.revokeObjectURL(fileToRemove.preview);
        
        const updatedLocal = localImages.filter((_, i) => i !== index);
        setLocalImages(updatedLocal);
        
        const field = isEditing ? 'new_images' : 'images';
        setData(field, data[field].filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId) => {
        if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
            router.delete(route('admin.villas.images.destroy', [villa.id, imageId]), { 
                preserveScroll: true, 
                preserveState: true 
            });
        }
    };

    const setPrimaryImage = (imageId) => {
        router.patch(route('admin.villas.images.set-primary', [villa.id, imageId]), {}, { 
            preserveScroll: true, 
            preserveState: true 
        });
    };

    // Helper for array inputs
    const updateArrayItem = (field, index, value) => {
        const newArray = [...data[field]];
        newArray[index] = value;
        setData(field, newArray);
    };

    const addArrayItem = (field) => {
        setData(field, [...data[field], '']);
    };

    const removeArrayItem = (field, index) => {
        const newArray = data[field].filter((_, i) => i !== index);
        if (newArray.length === 0) newArray.push('');
        setData(field, newArray);
    };

    const inputClasses = "mt-1.5 block w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

    return (
        <AdminLayout>
            <Head title={`${isEditing ? 'Edit' : 'Tambah'} Villa - Admin Marme Villa`} />

            <div className="p-4 sm:p-8 max-w-[800px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        <Link 
                            href={route('admin.villas.index')} 
                            className="mt-1 sm:mt-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary transition-colors shrink-0 border border-transparent hover:border-outline-variant/30"
                            title="Kembali ke Daftar"
                        >
                            <span className="material-symbols-outlined text-[24px] sm:text-[28px]">arrow_back</span>
                        </Link>
                        <div>
                            <h2 className="font-headline-xl text-3xl sm:text-headline-xl text-primary font-bold">{isEditing ? 'Edit Villa' : 'Tambah Villa Baru'}</h2>
                            <p className="text-on-surface-variant text-base sm:text-body-md mt-1 sm:mt-0">{isEditing ? 'Perbarui informasi dan spesifikasi villa.' : 'Lengkapi informasi untuk menambahkan villa baru.'}</p>
                        </div>
                    </div>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={submit} className="flex flex-col gap-6 sm:gap-8">
                    
                    {/* SECTION: Informasi Dasar */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col gap-4">
                        <h3 className="text-headline-sm font-bold text-primary border-b border-outline-variant/50 pb-2">Informasi Dasar</h3>
                        
                        <div>
                            <InputLabel htmlFor="name" value="Nama Villa *" />
                            <input id="name" type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClasses} required />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="tagline" value="Tagline (Slogan singkat)" />
                            <input id="tagline" type="text" value={data.tagline} onChange={e => setData('tagline', e.target.value)} className={inputClasses} placeholder="Cth: Kolam rendam pribadi di bawah pohon kamboja." />
                            <InputError message={errors.tagline} />
                        </div>

                        <div>
                            <InputLabel htmlFor="location" value="Link Google Maps *" />
                            <input id="location" type="url" value={data.location} onChange={e => setData('location', e.target.value)} className={inputClasses} required placeholder="Cth: https://maps.app.goo.gl/..." />
                            <InputError message={errors.location} />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi Singkat *" />
                            <textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} className={inputClasses} rows="3" required />
                            <InputError message={errors.description} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <InputLabel value="Deskripsi Lengkap (Per Paragraf)" />
                            {data.long_description.map((item, idx) => (
                                <div key={`long_desc_${idx}`} className="flex gap-2 items-start">
                                    <textarea 
                                        value={item} 
                                        onChange={e => updateArrayItem('long_description', idx, e.target.value)} 
                                        className={inputClasses} rows="2" 
                                        placeholder={`Paragraf ${idx + 1}`}
                                    />
                                    <button type="button" onClick={() => removeArrayItem('long_description', idx)} className="mt-1.5 p-2.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addArrayItem('long_description')} className="mt-2 text-sm text-primary font-semibold flex items-center gap-1 w-fit hover:underline">
                                <span className="material-symbols-outlined text-[18px]">add_circle</span> Tambah Paragraf
                            </button>
                            <InputError message={errors.long_description} />
                        </div>
                    </div>

                    {/* SECTION: Spesifikasi Fisik */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col gap-4">
                        <h3 className="text-headline-sm font-bold text-primary border-b border-outline-variant/50 pb-2">Spesifikasi Bangunan</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="size" value="Luas Bangunan/Tanah (m²)" />
                                <input id="size" type="text" value={data.size} onChange={e => setData('size', e.target.value)} className={inputClasses} placeholder="Cth: 120m²" />
                                <InputError message={errors.size} />
                            </div>
                            <div>
                                <InputLabel htmlFor="view_description" value="Pemandangan (View)" />
                                <input id="view_description" type="text" value={data.view_description} onChange={e => setData('view_description', e.target.value)} className={inputClasses} placeholder="Cth: Sawah & Gunung" />
                                <InputError message={errors.view_description} />
                            </div>
                            <div>
                                <InputLabel htmlFor="bed_count" value="Jumlah Tempat Tidur" />
                                <input id="bed_count" type="number" value={data.bed_count} onChange={e => setData('bed_count', e.target.value)} className={inputClasses} />
                                <InputError message={errors.bed_count} />
                            </div>
                            <div>
                                <InputLabel htmlFor="bathroom_count" value="Jumlah Kamar Mandi" />
                                <input id="bathroom_count" type="number" value={data.bathroom_count} onChange={e => setData('bathroom_count', e.target.value)} className={inputClasses} />
                                <InputError message={errors.bathroom_count} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <InputLabel value="Fitur Unggulan" />
                            {data.features.map((item, idx) => (
                                <div key={`feature_${idx}`} className="flex gap-2 items-center">
                                    <input 
                                        type="text"
                                        value={item} 
                                        onChange={e => updateArrayItem('features', idx, e.target.value)} 
                                        className={inputClasses} 
                                        placeholder="Cth: Dapur lengkap dengan alat masak"
                                    />
                                    <button type="button" onClick={() => removeArrayItem('features', idx)} className="mt-1.5 p-2.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addArrayItem('features')} className="mt-2 text-sm text-primary font-semibold flex items-center gap-1 w-fit hover:underline">
                                <span className="material-symbols-outlined text-[18px]">add_circle</span> Tambah Fitur
                            </button>
                            <InputError message={errors.features} />
                        </div>
                    </div>

                    {/* SECTION: Kapasitas & Harga */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col gap-4">
                        <h3 className="text-headline-sm font-bold text-primary border-b border-outline-variant/50 pb-2">Kapasitas & Harga</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="capacity" value="Kapasitas Standar (Orang) *" />
                                <input id="capacity" type="number" value={data.capacity} onChange={e => setData('capacity', e.target.value)} className={inputClasses} required />
                                <InputError message={errors.capacity} />
                            </div>
                            <div>
                                <InputLabel htmlFor="max_guests" value="Maksimal Tamu (Orang)" />
                                <input id="max_guests" type="number" value={data.max_guests} onChange={e => setData('max_guests', e.target.value)} className={inputClasses} />
                                <InputError message={errors.max_guests} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                            <div>
                                <InputLabel htmlFor="base_price" value="Harga Dasar (Rp) *" />
                                <input id="base_price" type="text" value={data.base_price !== '' && data.base_price !== null ? parseInt(data.base_price).toLocaleString('id-ID') : ''} onChange={e => setData('base_price', e.target.value.replace(/\D/g, ''))} className={inputClasses} required placeholder="Cth: 2.500.000" />
                                <InputError message={errors.base_price} />
                            </div>
                            <div>
                                <InputLabel htmlFor="weekend_price" value="Harga Weekend (Rp) *" />
                                <input id="weekend_price" type="text" value={data.weekend_price !== '' && data.weekend_price !== null ? parseInt(data.weekend_price).toLocaleString('id-ID') : ''} onChange={e => setData('weekend_price', e.target.value.replace(/\D/g, ''))} className={inputClasses} required placeholder="Cth: 3.000.000" />
                                <InputError message={errors.weekend_price} />
                            </div>
                            <div>
                                <InputLabel htmlFor="extra_guest_fee" value="Biaya Ekstra Tamu (Rp) *" />
                                <input id="extra_guest_fee" type="text" value={data.extra_guest_fee !== '' && data.extra_guest_fee !== null ? parseInt(data.extra_guest_fee).toLocaleString('id-ID') : ''} onChange={e => setData('extra_guest_fee', e.target.value.replace(/\D/g, ''))} className={inputClasses} required placeholder="Cth: 250.000" />
                                <InputError message={errors.extra_guest_fee} />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="flex items-center w-fit cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.weekend_enabled}
                                    onChange={(e) => setData('weekend_enabled', e.target.checked)}
                                    className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 transition-colors w-5 h-5"
                                />
                                <span className="ms-3 text-sm font-semibold text-primary">
                                    Aktifkan Harga Weekend (Sabtu & Minggu)
                                </span>
                            </label>
                            <InputError message={errors.weekend_enabled} />
                        </div>
                    </div>

                    {/* SECTION: Galeri Foto */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col gap-4">
                        <h3 className="text-headline-sm font-bold text-primary border-b border-outline-variant/50 pb-2">Galeri Foto</h3>
                        
                        {isEditing && villa.images && villa.images.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold mb-2">Foto Tersimpan</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {villa.images.map((img) => (
                                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant group bg-surface-container-low">
                                            <img src={img.image_url} alt="Villa" className="w-full h-full object-cover" />
                                            
                                            {img.is_primary && (
                                                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                    UTAMA
                                                </div>
                                            )}
                                            
                                            {/* Mobile-friendly action buttons overlay */}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex justify-between items-end gap-2">
                                                {!img.is_primary ? (
                                                    <button type="button" onClick={() => setPrimaryImage(img.id)} className="text-white hover:text-primary flex items-center bg-black/40 rounded p-1">
                                                        <span className="material-symbols-outlined text-[20px]">star</span>
                                                    </button>
                                                ) : <div></div>}
                                                <button type="button" onClick={() => removeExistingImage(img.id)} className="text-error hover:text-error/80 flex items-center bg-black/40 rounded p-1">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-semibold mb-2">{isEditing ? 'Tambah Foto Baru' : 'Pilih Foto'}</h4>
                            
                            {/* Upload Button/Zone */}
                            <div className="relative border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:bg-surface-container-lowest transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[150px]">
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/jpeg,image/png,image/webp,image/jpg" 
                                    onChange={handleImageSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <span className="material-symbols-outlined text-4xl text-primary mb-2">add_photo_alternate</span>
                                <p className="text-sm font-medium text-on-surface">Tap untuk memilih foto atau Drag & Drop ke sini</p>
                                <p className="text-xs text-on-surface-variant mt-1">Maksimal 5MB per foto (JPG, PNG, WEBP)</p>
                            </div>

                            <InputError message={errors.images} className="mt-2" />
                            <InputError message={errors.new_images} className="mt-2" />
                            <InputError message={errors['images.0']} className="mt-2" />
                            <InputError message={errors['new_images.0']} className="mt-2" />

                            {/* Local Previews */}
                            {localImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {localImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low">
                                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                            
                                            {!isEditing && idx === 0 && (
                                                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                    UTAMA
                                                </div>
                                            )}

                                            <button 
                                                type="button" 
                                                onClick={() => removeLocalImage(idx)} 
                                                className="absolute top-2 right-2 bg-error text-white rounded-full p-1.5 shadow-md hover:bg-error/90 flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link 
                            href={route('admin.villas.index')}
                            className="px-6 py-3 rounded-lg font-button text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors bg-white ghost-border ambient-shadow"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            className="bg-primary text-white px-8 py-3 rounded-lg font-button text-sm hover:bg-primary/90 transition-colors ambient-shadow active:scale-[0.98] disabled:opacity-50"
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Villa'}
                        </button>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
}
