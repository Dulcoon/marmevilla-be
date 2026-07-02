import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MATERIAL_ICONS } from '@/utils/material-icons';

export default function Form({ villa, all_facilities }) {
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
        new_images: [],
        image_albums: [],
        new_image_albums: [],
        facilities_ids: villa.facilities ? villa.facilities.map(f => f.id) : [],
        album_order: villa.album_order || [],
        seo_title: villa.seo_title || '',
        seo_description: villa.seo_description || '',
        seo_title_en: villa.seo_title_en || '',
        seo_description_en: villa.seo_description_en || ''
    });

    const [localImages, setLocalImages] = useState([]);
    const [customAlbums, setCustomAlbums] = useState([]);
    const [collapsedAlbums, setCollapsedAlbums] = useState({});
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [tempAlbums, setTempAlbums] = useState(null);

    const toggleAlbumCollapse = (albumName) => {
        setCollapsedAlbums(prev => ({
            ...prev,
            [albumName]: !prev[albumName]
        }));
    };

    const toggleAllAlbumsCollapse = (collapse) => {
        const albumsToCollapse = tempAlbums || allAlbums;
        const updated = {};
        albumsToCollapse.forEach(album => {
            updated[album] = collapse;
        });
        setCollapsedAlbums(updated);
    };

    const handleDragStart = (e, index) => {
        const currentList = tempAlbums || allAlbums;
        if (currentList[index] === 'Lainnya') {
            e.preventDefault();
            return;
        }
        setDraggedIndex(index);
        setTempAlbums([...currentList]);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());

        // Use the entire album card as the drag ghost image
        const cardElement = e.currentTarget.closest('.album-card-container');
        if (cardElement) {
            // Align the ghost image top-left (near the drag handle)
            e.dataTransfer.setDragImage(cardElement, 24, 24);
        }
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        const currentList = tempAlbums || allAlbums;
        if (currentList[index] === 'Lainnya' || currentList[draggedIndex] === 'Lainnya') return;

        // Immediately swap positions in local state for fluid visual shifting
        const reordered = [...currentList];
        const [draggedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        setTempAlbums(reordered);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (tempAlbums) {
            const updatedOrder = tempAlbums.filter(album => album !== 'Lainnya');
            setData('album_order', updatedOrder);
        }
        setDraggedIndex(null);
        setTempAlbums(null);
    };

    const handleDragEnd = () => {
        if (tempAlbums) {
            const updatedOrder = tempAlbums.filter(album => album !== 'Lainnya');
            setData('album_order', updatedOrder);
        }
        setDraggedIndex(null);
        setTempAlbums(null);
    };

    // Modal State for New Facility
    const [showFacilityModal, setShowFacilityModal] = useState(false);
    const [newFacilityName, setNewFacilityName] = useState('');
    const [newFacilityIcon, setNewFacilityIcon] = useState('');
    const [searchIconQuery, setSearchIconQuery] = useState('');
    const [facilityError, setFacilityError] = useState('');

    const filteredIcons = useMemo(() => {
        if (!searchIconQuery.trim()) {
            const popularIcons = [
                'wifi', 'pool', 'ac_unit', 'kitchen', 'restaurant', 
                'tv', 'hot_tub', 'local_parking', 'sports_tennis', 'spa',
                'water_drop', 'coffee_maker', 'local_drink', 'lock', 'checkroom', 'flight', 'fitness_center'
            ];
            // Gunakan Set untuk mencegah duplikasi key pada React (misal 'wifi' ada di popular dan MATERIAL_ICONS)
            return [...new Set([...popularIcons, ...MATERIAL_ICONS.slice(0, 40)])].slice(0, 50);
        }
        const query = searchIconQuery.toLowerCase().replace(/[^a-z_]/g, '');
        return MATERIAL_ICONS.filter(icon => icon.includes(query)).slice(0, 100);
    }, [searchIconQuery]);

    const submitNewFacility = () => {
        if (!newFacilityName.trim()) return;
        setFacilityError('');
        router.post(route('admin.facilities.store'), { 
            name: newFacilityName.trim(), 
            icon: newFacilityIcon.trim() || null 
        }, { 
            preserveScroll: true,
            onSuccess: () => {
                setShowFacilityModal(false);
                setNewFacilityName('');
                setNewFacilityIcon('');
                setSearchIconQuery('');
            },
            onError: (errors) => {
                setFacilityError(errors.name || 'Terjadi kesalahan saat menyimpan.');
            }
        });
    };

    const allAlbums = useMemo(() => {
        const savedAlbums = (villa?.images || []).map(img => img.album).filter(Boolean);
        const localAlbums = localImages.map(img => img.album).filter(Boolean);
        const uniqueExisting = [...new Set([...savedAlbums, ...localAlbums, ...customAlbums])];
        
        const order = data.album_order || [];
        const orderedExisting = order.filter(album => uniqueExisting.includes(album) && album !== 'Lainnya');
        const unorderedExisting = uniqueExisting.filter(album => !orderedExisting.includes(album) && album !== 'Lainnya');
        unorderedExisting.sort((a, b) => a.localeCompare(b, 'id'));
        
        return [...orderedExisting, ...unorderedExisting, 'Lainnya'];
    }, [villa, localImages, customAlbums, data.album_order]);

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

    const handleImageSelect = (e, targetAlbum = 'Lainnya') => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            album: targetAlbum
        }));

        setLocalImages(prev => [...prev, ...newPreviews]);

        const field = isEditing ? 'new_images' : 'images';
        const albumField = isEditing ? 'new_image_albums' : 'image_albums';
        setData(prev => ({
            ...prev,
            [field]: [...prev[field], ...files],
            [albumField]: [...prev[albumField], ...Array(files.length).fill(targetAlbum)]
        }));

        // Reset file input so same files can be selected again if needed
        e.target.value = '';
    };

    const removeLocalImage = (index) => {
        const fileToRemove = localImages[index];
        URL.revokeObjectURL(fileToRemove.preview);

        const updatedLocal = localImages.filter((_, i) => i !== index);
        setLocalImages(updatedLocal);

        const field = isEditing ? 'new_images' : 'images';
        const albumField = isEditing ? 'new_image_albums' : 'image_albums';
        setData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
            [albumField]: prev[albumField].filter((_, i) => i !== index)
        }));
    };

    const updateLocalImageAlbum = (index, value) => {
        const updatedLocal = [...localImages];
        updatedLocal[index].album = value;
        setLocalImages(updatedLocal);

        const albumField = isEditing ? 'new_image_albums' : 'image_albums';
        setData(albumField, data[albumField].map((item, i) => i === index ? value : item));
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

    const updateExistingImageAlbum = (imageId, newAlbum) => {
        router.patch(route('admin.villas.images.update-album', [villa.id, imageId]), { album: newAlbum }, {
            preserveScroll: true,
            preserveState: true
        });
    };

    const renameAlbum = async (oldName, newName) => {
        if (!newName || newName.trim() === '' || newName === oldName || oldName === 'Lainnya') return;
        
        // Update custom albums
        setCustomAlbums(prev => prev.map(a => a === oldName ? newName : a));

        // Update local images
        const updatedLocal = localImages.map(img => (img.album || 'Lainnya') === oldName ? { ...img, album: newName } : img);
        setLocalImages(updatedLocal);

        // Update data
        const albumField = isEditing ? 'new_image_albums' : 'image_albums';
        setData(albumField, data[albumField].map(a => (a || 'Lainnya') === oldName ? newName : a));

        // Update existing images via API
        const savedImgs = (villa?.images || []).filter(img => (img.album || 'Lainnya') === oldName);
        if (savedImgs.length > 0) {
            try {
                await Promise.all(
                    savedImgs.map(img => axios.patch(route('admin.villas.images.update-album', [villa.id, img.id]), { album: newName }))
                );
                router.reload({ only: ['villa'] });
            } catch (err) {
                console.error("Gagal update album", err);
            }
        }
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

                        {all_facilities && all_facilities.length > 0 && (
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex justify-between items-center">
                                    <InputLabel value="Fasilitas Kamar" />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowFacilityModal(true)}
                                        className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded hover:bg-primary/20 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add</span> Tambah
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1.5 mt-2">
                                    {all_facilities.map(facility => (
                                        <div key={facility.id} className="group flex items-center gap-3 p-2.5 border border-outline-variant rounded-lg hover:border-primary/30 hover:bg-surface-container-low transition-all">
                                            <label className="flex items-center gap-3 flex-1 cursor-pointer select-none min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={data.facilities_ids.includes(facility.id)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        if (checked) {
                                                            setData('facilities_ids', [...data.facilities_ids, facility.id]);
                                                        } else {
                                                            setData('facilities_ids', data.facilities_ids.filter(id => id !== facility.id));
                                                        }
                                                    }}
                                                    className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 transition-colors w-4 h-4 shrink-0"
                                                />
                                                <span className="material-symbols-outlined text-[20px] text-primary shrink-0">{facility.icon || 'check_circle'}</span>
                                                <span className="text-sm text-on-surface truncate">{facility.name}</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(`Hapus fasilitas "${facility.name}"? Fasilitas ini akan dihapus dari semua villa.`)) {
                                                        router.delete(route('admin.facilities.destroy', facility.id), {
                                                            preserveScroll: true,
                                                        });
                                                    }
                                                }}
                                                className="p-2 text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                                title={`Hapus ${facility.name}`}
                                                aria-label={`Hapus fasilitas ${facility.name}`}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.facilities_ids} />
                            </div>
                        )}
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
                    </div>                    {/* SECTION: Galeri Foto */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-outline-variant/50 pb-3 mb-4 gap-3">
                            <div>
                                <h3 className="text-headline-sm font-bold text-primary">Galeri Foto</h3>
                                <p className="text-xs text-on-surface-variant mt-0.5">Tarik dan lepas ikon drag di sebelah kiri album untuk mengurutkan tampilan.</p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => toggleAllAlbumsCollapse(true)}
                                    className="text-xs bg-surface-container-low text-on-surface-variant font-semibold px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
                                >
                                    Lipat Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleAllAlbumsCollapse(false)}
                                    className="text-xs bg-surface-container-low text-on-surface-variant font-semibold px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
                                >
                                    Buka Semua
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        const name = prompt("Masukkan Nama Album Baru:");
                                        if (name && name.trim() && !allAlbums.includes(name.trim())) {
                                            setCustomAlbums(prev => [...prev, name.trim()]);
                                        }
                                    }}
                                    className="text-xs bg-primary/10 text-primary font-semibold px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1 shrink-0 ml-auto sm:ml-0"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span> Album Baru
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {(tempAlbums || allAlbums).map((albumName, idx) => {
                                const savedImgs = (villa?.images || []).filter(img => (img.album || 'Lainnya') === albumName);
                                const localImgs = localImages.map((img, idx) => ({ ...img, globalIndex: idx })).filter(img => (img.album || 'Lainnya') === albumName);
                                const totalImgs = savedImgs.length + localImgs.length;

                                if (savedImgs.length === 0 && localImgs.length === 0 && albumName !== 'Lainnya' && !customAlbums.includes(albumName)) {
                                    return null;
                                }

                                const isCollapsed = !!collapsedAlbums[albumName];

                                return (
                                    <div 
                                        key={albumName} 
                                        draggable={false}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={handleDrop}
                                        style={{ transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)' }}
                                        className={`album-card-container border rounded-xl p-4 bg-surface-container-lowest ambient-shadow ${draggedIndex === idx ? 'opacity-25 border-dashed border-primary border-2 scale-[0.96] bg-primary/5 shadow-inner' : 'border-outline-variant hover:border-primary/40 hover:shadow-md'}`}
                                    >
                                        <div className="flex justify-between items-center select-none">
                                            <div className="flex items-center gap-3 w-full">
                                                {/* Drag Handle or Lock */}
                                                {albumName !== 'Lainnya' ? (
                                                    <span 
                                                        draggable={true}
                                                        onDragStart={(e) => handleDragStart(e, idx)}
                                                        onDragEnd={handleDragEnd}
                                                        className="material-symbols-outlined cursor-grab text-on-surface-variant hover:text-primary active:cursor-grabbing hover:bg-surface-variant/40 rounded p-1 shrink-0 select-none" 
                                                        title="Tarik untuk mengurutkan album"
                                                    >
                                                        drag_indicator
                                                    </span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-outline-variant/60 shrink-0 select-none" title="Album default (selalu di akhir)">lock</span>
                                                )}
                                                
                                                {/* Album Icon & Title Rename */}
                                                <span className="material-symbols-outlined text-primary shrink-0">photo_library</span>
                                                <input
                                                    type="text"
                                                    defaultValue={albumName}
                                                    onBlur={(e) => renameAlbum(albumName, e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                                                    className="font-bold text-lg text-primary border-none bg-transparent focus:ring-0 p-0 hover:bg-surface-variant/20 rounded px-2 w-full max-w-xs focus:bg-white"
                                                    disabled={albumName === 'Lainnya'}
                                                    title={albumName === 'Lainnya' ? "Album default tidak dapat diubah namanya" : "Klik untuk mengubah nama album"}
                                                />

                                                <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full shrink-0">
                                                    {totalImgs} Foto
                                                </span>
                                            </div>

                                            {/* Toggle Collapse Trigger */}
                                            <button 
                                                type="button"
                                                onClick={() => toggleAlbumCollapse(albumName)}
                                                className="p-1 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center text-on-surface-variant shrink-0"
                                                aria-label={isCollapsed ? "Buka album" : "Lipat album"}
                                            >
                                                <span className="material-symbols-outlined text-[24px]">
                                                    {isCollapsed ? 'expand_more' : 'expand_less'}
                                                </span>
                                            </button>
                                        </div>

                                        {!isCollapsed && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                {/* Render Saved Images */}
                                                {savedImgs.map((img) => (
                                                    <div key={`saved-${img.id}`} className="flex flex-col gap-2 bg-white p-2 rounded-xl border border-outline-variant group">
                                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/5">
                                                            <img src={img.image_url} alt="Villa" className="w-full h-full object-cover" />
                                                            {img.is_primary && (
                                                                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">UTAMA</div>
                                                            )}
                                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex justify-between items-end gap-2">
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
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[11px] text-on-surface-variant font-medium">Pindahkan ke:</label>
                                                            <select
                                                                value={albumName}
                                                                onChange={(e) => updateExistingImageAlbum(img.id, e.target.value)}
                                                                className="w-full px-2 py-1 text-xs bg-surface-container-low border border-outline-variant rounded focus:ring-1 focus:ring-primary focus:border-primary"
                                                            >
                                                                {allAlbums.map(a => <option key={a} value={a}>{a}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Render Local Images */}
                                                {localImgs.map((img) => (
                                                    <div key={`local-${img.globalIndex}`} className="flex flex-col gap-2 bg-white p-2 rounded-xl border border-outline-variant group">
                                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/5">
                                                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                                            <div className="absolute top-2 left-2 bg-tertiary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">BARU</div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeLocalImage(img.globalIndex)}
                                                                className="absolute top-2 right-2 bg-error text-white rounded-full p-1 shadow-md hover:bg-error/90 flex items-center justify-center"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[11px] text-on-surface-variant font-medium">Pindahkan ke:</label>
                                                            <select
                                                                value={albumName}
                                                                onChange={(e) => updateLocalImageAlbum(img.globalIndex, e.target.value)}
                                                                className="w-full px-2 py-1 text-xs bg-surface-container-low border border-outline-variant rounded focus:ring-1 focus:ring-primary focus:border-primary"
                                                            >
                                                                {allAlbums.map(a => <option key={a} value={a}>{a}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Upload Dropzone */}
                                                <div className="relative border-2 border-dashed border-outline-variant rounded-xl p-4 text-center hover:bg-surface-container-low hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[160px]">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                                        onChange={(e) => handleImageSelect(e, albumName)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        title={`Upload ke album ${albumName}`}
                                                    />
                                                    <span className="material-symbols-outlined text-3xl text-outline-variant group-hover:text-primary mb-2">add_photo_alternate</span>
                                                    <p className="text-sm font-medium text-on-surface">Tambah Foto</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <InputError message={errors.images} className="mt-2" />
                        <InputError message={errors.new_images} className="mt-2" />
                    </div>

                    {/* SECTION: Pengaturan SEO */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 ghost-border ambient-shadow flex flex-col gap-6">
                        <div className="border-b border-outline-variant/50 pb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-3xl">search</span>
                            <div>
                                <h3 className="text-headline-sm font-bold text-primary">Pengaturan SEO (Optimasi Google)</h3>
                                <p className="text-xs text-on-surface-variant mt-0.5">Atur judul dan deskripsi pencarian agar judul halaman menarik dan relevan di hasil pencarian Google.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bahasa Indonesia */}
                            <div className="flex flex-col gap-4 border-r border-outline-variant/30 pr-0 md:pr-6">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">language</span> Bahasa Indonesia
                                </h4>

                                {/* SEO Title (ID) */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <InputLabel htmlFor="seo_title" value="Meta Title (ID)" />
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            data.seo_title.length >= 40 && data.seo_title.length <= 60 
                                                ? 'bg-success/10 text-success' 
                                                : data.seo_title.length > 60 
                                                    ? 'bg-error/10 text-error' 
                                                    : 'bg-surface-container-high text-on-surface-variant'
                                        }`}>
                                            {data.seo_title.length} / 60 Karakter (Ideal: 50-60)
                                        </span>
                                    </div>
                                    <TextInput
                                        id="seo_title"
                                        type="text"
                                        name="seo_title"
                                        value={data.seo_title}
                                        className="w-full"
                                        placeholder={villa.name ? `${villa.name} — Villa Mewah Tradisional Jogja` : ""}
                                        onChange={(e) => setData('seo_title', e.target.value)}
                                    />
                                    <InputError message={errors.seo_title} />
                                </div>

                                {/* SEO Description (ID) */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <InputLabel htmlFor="seo_description" value="Meta Description (ID)" />
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            data.seo_description.length >= 120 && data.seo_description.length <= 160 
                                                ? 'bg-success/10 text-success' 
                                                : data.seo_description.length > 160 
                                                    ? 'bg-error/10 text-error' 
                                                    : 'bg-surface-container-high text-on-surface-variant'
                                        }`}>
                                            {data.seo_description.length} / 160 Karakter (Ideal: 120-160)
                                        </span>
                                    </div>
                                    <textarea
                                        id="seo_description"
                                        name="seo_description"
                                        rows={4}
                                        value={data.seo_description}
                                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary text-sm p-3 transition-colors"
                                        placeholder="Tulis deskripsi singkat penawaran villa yang memikat calon tamu di Google..."
                                        onChange={(e) => setData('seo_description', e.target.value)}
                                    />
                                    <InputError message={errors.seo_description} />
                                </div>
                            </div>

                            {/* English Translation */}
                            <div className="flex flex-col gap-4">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">language</span> English Translation
                                </h4>

                                {/* SEO Title (EN) */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <InputLabel htmlFor="seo_title_en" value="Meta Title (EN)" />
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            data.seo_title_en.length >= 40 && data.seo_title_en.length <= 60 
                                                ? 'bg-success/10 text-success' 
                                                : data.seo_title_en.length > 60 
                                                    ? 'bg-error/10 text-error' 
                                                    : 'bg-surface-container-high text-on-surface-variant'
                                        }`}>
                                            {data.seo_title_en.length} / 60 Karakter (Ideal: 50-60)
                                        </span>
                                    </div>
                                    <TextInput
                                        id="seo_title_en"
                                        type="text"
                                        name="seo_title_en"
                                        value={data.seo_title_en}
                                        className="w-full"
                                        placeholder={villa.name ? `${villa.name} — Luxury Traditional Heritage Villa` : ""}
                                        onChange={(e) => setData('seo_title_en', e.target.value)}
                                    />
                                    <InputError message={errors.seo_title_en} />
                                </div>

                                {/* SEO Description (EN) */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <InputLabel htmlFor="seo_description_en" value="Meta Description (EN)" />
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            data.seo_description_en.length >= 120 && data.seo_description_en.length <= 160 
                                                ? 'bg-success/10 text-success' 
                                                : data.seo_description_en.length > 160 
                                                    ? 'bg-error/10 text-error' 
                                                    : 'bg-surface-container-high text-on-surface-variant'
                                        }`}>
                                            {data.seo_description_en.length} / 160 Karakter (Ideal: 120-160)
                                        </span>
                                    </div>
                                    <textarea
                                        id="seo_description_en"
                                        name="seo_description_en"
                                        rows={4}
                                        value={data.seo_description_en}
                                        className="w-full rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary text-sm p-3 transition-colors"
                                        placeholder="Write an inviting english meta summary for search engines..."
                                        onChange={(e) => setData('seo_description_en', e.target.value)}
                                    />
                                    <InputError message={errors.seo_description_en} />
                                </div>
                            </div>
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
                            {processing ? 'Menyimpan & Menerjemahkan (tunggu sebentar)...' : 'Simpan Villa'}
                        </button>
                    </div>

                </form>
            </div>

            {/* Modal Tambah Fasilitas */}
            {showFacilityModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4 border-b border-outline-variant/50 pb-2">
                            <h3 className="text-lg font-bold text-primary">Tambah Fasilitas Baru</h3>
                            <button onClick={() => {
                                setShowFacilityModal(false);
                                setFacilityError('');
                            }} className="text-outline hover:text-error transition-colors p-1">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <div>
                                <InputLabel value="Nama Fasilitas *" />
                                <input 
                                    type="text" 
                                    value={newFacilityName} 
                                    onChange={e => {
                                        setNewFacilityName(e.target.value);
                                        if (facilityError) setFacilityError('');
                                    }} 
                                    className={inputClasses} 
                                    placeholder="Cth: Kolam Renang, Smart TV" 
                                    autoFocus 
                                />
                                {facilityError && (
                                    <p className="text-sm text-error mt-1">{facilityError}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <InputLabel value="Cari & Pilih Icon" />
                                    {newFacilityIcon && (
                                        <div className="text-xs text-primary font-medium flex items-center gap-1">
                                            Terpilih: <span className="material-symbols-outlined text-[16px]">{newFacilityIcon}</span> {newFacilityIcon}
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="text" 
                                    value={searchIconQuery} 
                                    onChange={e => setSearchIconQuery(e.target.value)} 
                                    className={`${inputClasses} mb-2`} 
                                    placeholder="Ketik untuk mencari icon... (cth: bed, car, fire)" 
                                />
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg max-h-48 overflow-y-auto">
                                    {filteredIcons.length > 0 ? filteredIcons.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setNewFacilityIcon(icon)}
                                            className={`p-2 rounded flex flex-col items-center justify-center transition-all ${newFacilityIcon === icon ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-surface-variant/20 text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary'}`}
                                            title={icon}
                                        >
                                            <span className="material-symbols-outlined text-[24px]">{icon}</span>
                                        </button>
                                    )) : (
                                        <div className="col-span-full text-center text-sm text-outline py-4">Icon tidak ditemukan.</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Atau ketik nama icon manual (opsional)" />
                                <input 
                                    type="text" 
                                    value={newFacilityIcon} 
                                    onChange={e => setNewFacilityIcon(e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))} 
                                    className={inputClasses} 
                                    placeholder="Cth: local_cafe" 
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/50">
                                <button type="button" onClick={() => setShowFacilityModal(false)} className="px-4 py-2 text-sm text-on-surface-variant font-semibold hover:bg-surface-container-low rounded-lg transition-colors">Batal</button>
                                <button type="button" onClick={submitNewFacility} disabled={!newFacilityName.trim()} className="px-4 py-2 text-sm text-white bg-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">Simpan Fasilitas</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
