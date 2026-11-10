import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    Check,
    Coffee,
    HelpCircle,
    Loader2,
    LocateFixed,
    MapPin,
    MoreHorizontal,
    Navigation,
    Palette,
    RefreshCw,
    Scissors,
    Search,
    ShieldCheck,
    ShoppingBag,
    Shirt,
    Store,
    WifiOff,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BusinessData = {
    id?: number | string;
    owner_name?: string;
    business_name?: string;
    business_type?: string;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
};

type Props = {
    mode?: 'create' | 'edit';
    business?: BusinessData | null;
    userPhone?: string | null;
    cancelUrl?: string;
};

const BUSINESS_TYPES = [
    { id: 'kuliner', label: 'Kuliner & Minuman', icon: Coffee, desc: 'Warung makan, kafe, kue, katering' },
    { id: 'fashion', label: 'Fashion & Pakaian', icon: Shirt, desc: 'Baju, hijab, konveksi, aksesoris' },
    { id: 'kerajinan', label: 'Kerajinan Tangan', icon: Scissors, desc: 'Anyaman, kriya, suvenir, ukiran' },
    { id: 'jasa', label: 'Jasa & Layanan', icon: Briefcase, desc: 'Laundry, salon, servis, bimbingan' },
    { id: 'dagang', label: 'Dagang/Toko', icon: ShoppingBag, desc: 'Kelontong, toko sembako, pulsa' },
    { id: 'lainnya', label: 'Lainnya', icon: MoreHorizontal, desc: 'Bidang usaha lainnya' },
];

export default function Onboarding({
    mode = 'create',
    business = null,
    userPhone = null,
    cancelUrl = '/dashboard',
}: Props) {
    const isEditMode = mode === 'edit';

    // Retrieve initial draft from sessionStorage if in create mode
    const getInitialDraft = () => {
        if (!isEditMode && typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem('lapak_biz_draft');
                if (saved) return JSON.parse(saved);
            } catch {
                // ignore error
            }
        }
        return null;
    };

    const draft = getInitialDraft();

    const [ownerName, setOwnerName] = useState(business?.owner_name || draft?.owner_name || '');
    const [businessName, setBusinessName] = useState(business?.business_name || draft?.business_name || '');
    const [businessType, setBusinessType] = useState(business?.business_type || draft?.business_type || '');
    const [address, setAddress] = useState(business?.address || draft?.address || '');
    const [lat, setLat] = useState<number | null>(business?.lat ?? draft?.lat ?? null);
    const [lng, setLng] = useState<number | null>(business?.lng ?? draft?.lng ?? null);

    // Form errors & state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverMessage, setServerMessage] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    // Geolocation & Search state
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationNotice, setLocationNotice] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Array<{ label: string; address: string; lat: number; lng: number }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchNotice, setSearchNotice] = useState('');
    const [showManualCoords, setShowManualCoords] = useState(false);
    const [supportsGeolocation, setSupportsGeolocation] = useState(true);

    const ownerInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Detect browser geolocation support
    useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setSupportsGeolocation(false);
        }
    }, []);

    // Online / Offline tracking
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Warn before unload on unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges && !isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, isSubmitting]);

    // Save draft in sessionStorage in create mode
    useEffect(() => {
        if (!isEditMode && typeof window !== 'undefined') {
            try {
                sessionStorage.setItem(
                    'lapak_biz_draft',
                    JSON.stringify({ owner_name: ownerName, business_name: businessName, business_type: businessType, address, lat, lng })
                );
            } catch {
                // ignore
            }
        }
        setHasUnsavedChanges(true);
    }, [ownerName, businessName, businessType, address, lat, lng, isEditMode]);

    // Focus first input on mount
    useEffect(() => {
        ownerInputRef.current?.focus();
    }, []);

    // Client-side validation per field
    const validateField = (field: string, value: any): string => {
        switch (field) {
            case 'owner_name': {
                const trimmed = (value || '').trim();
                if (!trimmed) return 'Nama panggilan belum diisi.';
                if (/<[^>]*>/.test(value)) return 'Nama panggilan mengandung karakter yang tidak diizinkan.';
                if (/^\d+$/.test(trimmed.replace(/[\s.'-]/g, ''))) return 'Nama panggilan tidak boleh hanya angka.';
                if (trimmed.length < 2) return 'Nama panggilan minimal 2 karakter.';
                if (trimmed.length > 40) return 'Nama panggilan maksimal 40 karakter.';
                if (!/^[\p{L}\s.'-]+$/u.test(trimmed)) return 'Nama panggilan hanya boleh berisi huruf, spasi, titik, apostrof, atau tanda hubung.';
                return '';
            }
            case 'business_name': {
                const trimmed = (value || '').trim();
                if (!trimmed) return 'Nama usaha belum diisi.';
                if (/<[^>]*>/.test(value)) return 'Nama usaha mengandung karakter yang tidak diizinkan.';
                if (trimmed.length < 2) return 'Nama usaha minimal 2 karakter.';
                if (trimmed.length > 60) return 'Nama usaha maksimal 60 karakter.';
                if (!/^[\p{L}0-9\s&.,'\-\/]+$/u.test(trimmed)) return 'Nama usaha hanya boleh berisi huruf, angka, spasi, dan tanda baca umum (& . , \' - /).';
                return '';
            }
            case 'business_type': {
                if (!value || !BUSINESS_TYPES.some((b) => b.id === value)) return 'Pilih jenis usahamu.';
                return '';
            }
            case 'location': {
                if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) return 'Tentukan lokasi usahamu di peta.';
                if (lat < -11.5 || lat > 6.5 || lng < 94.5 || lng > 141.5) return 'Lokasi harus berada di Indonesia.';
                // Singapore enclave check
                if (lat >= 1.15 && lat <= 1.48 && lng >= 103.58 && lng <= 104.08) return 'Lokasi harus berada di Indonesia.';
                return '';
            }
            default:
                return '';
        }
    };

    const handleBlur = (field: string, val: any) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const err = validateField(field, val);
        setErrors((prev) => ({ ...prev, [field]: err }));
    };

    // Geolocation handler
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationNotice('Perangkat atau browser kamu tidak mendukung pendeteksian lokasi.');
            return;
        }

        setIsDetectingLocation(true);
        setLocationNotice('');

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const userLat = pos.coords.latitude;
                const userLng = pos.coords.longitude;

                setLat(userLat);
                setLng(userLng);
                setErrors((prev) => ({ ...prev, location: '' }));
                setIsDetectingLocation(false);

                // Reverse geocode to fill address
                try {
                    const res = await fetch(`/api/location/reverse?lat=${userLat}&lng=${userLng}`);
                    const data = await res.json();
                    if (data.success && data.address) {
                        setAddress(data.address.slice(0, 200));
                    }
                } catch {
                    // Reverse geocode failure doesn't block location
                }
            },
            (err) => {
                setIsDetectingLocation(false);
                if (err.code === err.PERMISSION_DENIED) {
                    setLocationNotice('Izin lokasi ditolak. Kamu bisa cari alamat atau geser pin di peta.');
                } else {
                    setLocationNotice('Lokasi belum terdeteksi. Coba lagi atau cari alamat.');
                }
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    // Address search with 400ms debounce
    const handleSearchInput = (val: string) => {
        setSearchQuery(val);
        setSearchNotice('');

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (val.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/location/search?q=${encodeURIComponent(val)}`);
                const data = await res.json();
                if (data.success && data.suggestions && data.suggestions.length > 0) {
                    setSuggestions(data.suggestions);
                    setSearchNotice('');
                } else {
                    setSuggestions([]);
                    setSearchNotice('Alamat tidak ditemukan. Coba kata kunci lain atau geser pin di peta.');
                }
            } catch {
                setSuggestions([]);
                setSearchNotice('Pencarian sedang sibuk. Coba lagi sebentar lagi.');
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const handleSelectSuggestion = (item: { label: string; address: string; lat: number; lng: number }) => {
        setLat(item.lat);
        setLng(item.lng);
        setAddress(item.address.slice(0, 200));
        setSearchQuery('');
        setSuggestions([]);
        setErrors((prev) => ({ ...prev, location: '' }));
    };

    // Form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isOnline) {
            setServerMessage('Kamu sedang offline. Sambungkan internet untuk menyimpan profil.');
            return;
        }

        // Validate all fields
        const errOwner = validateField('owner_name', ownerName);
        const errBiz = validateField('business_name', businessName);
        const errType = validateField('business_type', businessType);
        const errLoc = validateField('location', null);

        const newErrors: Record<string, string> = {};
        if (errOwner) newErrors.owner_name = errOwner;
        if (errBiz) newErrors.business_name = errBiz;
        if (errType) newErrors.business_type = errType;
        if (errLoc) newErrors.location = errLoc;

        setErrors(newErrors);
        setTouched({ owner_name: true, business_name: true, business_type: true, location: true });

        if (Object.keys(newErrors).length > 0) {
            // Focus first error
            if (errOwner) ownerInputRef.current?.focus();
            return;
        }

        setIsSubmitting(true);
        setServerMessage('');

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const res = await fetch('/profil-usaha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    mode,
                    owner_name: ownerName,
                    business_name: businessName,
                    business_type: businessType,
                    address,
                    lat,
                    lng,
                    ubah: isEditMode ? '1' : '0',
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Clear draft in sessionStorage upon success
                try {
                    sessionStorage.removeItem('lapak_biz_draft');
                } catch {
                    // ignore
                }
                setHasUnsavedChanges(false);

                // Navigate to next page
                window.location.href = data.redirect || '/dashboard';
            } else {
                setIsSubmitting(false);
                if (data.errors) {
                    setErrors(data.errors);
                }
                setServerMessage(data.message || 'Maaf, ada gangguan. Coba lagi sebentar lagi.');
            }
        } catch {
            setIsSubmitting(false);
            setServerMessage('Koneksi bermasalah. Coba lagi.');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-secondary selection:text-primary">
            <Head title={isEditMode ? 'Ubah Profil Usaha - LAPAK' : 'Pengaturan Profil Usaha - LAPAK'} />

            {/* Header Brand */}
            <header className="mx-auto flex w-full max-w-2xl items-center justify-between pb-6">
                <div className="flex items-center gap-2.5">
                    <img
                        src="/Logo Kanopi dan Grafik Naik.png"
                        alt="Logo LAPAK"
                        className="size-8 object-contain"
                        onError={(e) => {
                            e.currentTarget.src = '/logo-icon.png';
                        }}
                    />
                    <div className="flex flex-col text-left">
                        <span className="font-heading text-base font-bold text-foreground">LAPAK</span>
                        <span className="text-[10px] text-muted-foreground">Profil Lapak Usaha</span>
                    </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                    <Store className="size-3.5" />
                    {isEditMode ? 'Pengaturan Toko' : 'Langkah Awal Usahamu'}
                </div>
            </header>

            {/* Main Form Container */}
            <main className="mx-auto w-full max-w-2xl flex-1 flex flex-col justify-center py-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
                    {/* Offline Banner */}
                    {!isOnline && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900"
                        >
                            <WifiOff className="size-4 shrink-0 text-amber-600" />
                            <span>Kamu sedang offline. Sambungkan internet untuk menyimpan perubahan.</span>
                        </div>
                    )}

                    {/* Header Text */}
                    <div className="space-y-1 text-left">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary mb-1">
                            <Store className="size-3.5" />
                            {isEditMode ? 'Mode Ubah Profil' : 'Profil Lapak Usahamu'}
                        </div>
                        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                            {isEditMode ? 'Ubah Profil Usaha' : 'Kenalkan usahamu ke LAPAK'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditMode
                                ? 'Perbarui data tokomu agar asisten AI dapat terus memberikan saran pasar yang akurat.'
                                : 'Data ini tersimpan di akun usahamu dan dipakai AI untuk menyesuaikan rekomendasi pasar serta materi promosi tokomu.'}
                        </p>
                    </div>

                    {serverMessage && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive"
                        >
                            {serverMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. Nama Panggilan Pemilik */}
                        <div className="space-y-1.5">
                            <Label htmlFor="owner-name" className="text-sm font-semibold text-foreground">
                                Nama Panggilan Pemilik <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                ref={ownerInputRef}
                                id="owner-name"
                                value={ownerName}
                                onChange={(e) => {
                                    setOwnerName(e.target.value);
                                    if (touched.owner_name) {
                                        setErrors((prev) => ({ ...prev, owner_name: validateField('owner_name', e.target.value) }));
                                    }
                                }}
                                onBlur={() => handleBlur('owner_name', ownerName)}
                                placeholder="Contoh: Bu Rara atau Mas Arif"
                                aria-invalid={errors.owner_name ? 'true' : 'false'}
                                aria-describedby={errors.owner_name ? 'owner-name-error' : 'owner-name-hint'}
                                className="h-12 text-base"
                                required
                            />
                            {errors.owner_name ? (
                                <p id="owner-name-error" role="alert" aria-live="assertive" className="text-xs font-medium text-destructive">
                                    {errors.owner_name}
                                </p>
                            ) : (
                                <p id="owner-name-hint" className="text-xs text-muted-foreground">
                                    Nama panggilan yang akan disapa oleh LAPAK di dashboard usahamu.
                                </p>
                            )}
                        </div>

                        {/* 2. Nama Usaha / Toko */}
                        <div className="space-y-1.5">
                            <Label htmlFor="biz-name" className="text-sm font-semibold text-foreground">
                                Nama Usaha / Warung <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="biz-name"
                                value={businessName}
                                onChange={(e) => {
                                    setBusinessName(e.target.value);
                                    if (touched.business_name) {
                                        setErrors((prev) => ({ ...prev, business_name: validateField('business_name', e.target.value) }));
                                    }
                                }}
                                onBlur={() => handleBlur('business_name', businessName)}
                                placeholder="Contoh: Warung Berkah Bu Rara"
                                aria-invalid={errors.business_name ? 'true' : 'false'}
                                aria-describedby={errors.business_name ? 'biz-name-error' : 'biz-name-hint'}
                                className="h-12 text-base"
                                required
                            />
                            {errors.business_name ? (
                                <p id="biz-name-error" role="alert" aria-live="assertive" className="text-xs font-medium text-destructive">
                                    {errors.business_name}
                                </p>
                            ) : (
                                <p id="biz-name-hint" className="text-xs text-muted-foreground">
                                    Nama resmi tokomu yang dicantumkan pada poster promosi dan laporan transaksi.
                                </p>
                            )}
                        </div>

                        {/* 3. Jenis Usaha (Radio Group dengan 6 Kartu) */}
                        <div className="space-y-2">
                            <Label id="biz-type-label" className="text-sm font-semibold text-foreground">
                                Jenis Usaha <span className="text-destructive">*</span>
                            </Label>
                            <div
                                role="radiogroup"
                                aria-labelledby="biz-type-label"
                                className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
                            >
                                {BUSINESS_TYPES.map((cat) => {
                                    const IconComp = cat.icon;
                                    const isSelected = businessType === cat.id;

                                    return (
                                        <div
                                            key={cat.id}
                                            role="radio"
                                            aria-checked={isSelected}
                                            tabIndex={0}
                                            onClick={() => {
                                                setBusinessType(cat.id);
                                                setErrors((prev) => ({ ...prev, business_type: '' }));
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === ' ' || e.key === 'Enter') {
                                                    e.preventDefault();
                                                    setBusinessType(cat.id);
                                                    setErrors((prev) => ({ ...prev, business_type: '' }));
                                                }
                                            }}
                                            className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer min-h-[48px] select-none ${
                                                isSelected
                                                    ? 'border-primary bg-secondary/70 ring-2 ring-primary shadow-xs'
                                                    : 'border-border bg-card hover:bg-muted/40 text-foreground'
                                            }`}
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center gap-1.5 font-bold text-sm">
                                                    <IconComp className={`size-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    <span>{cat.label}</span>
                                                </div>
                                                {isSelected && <Check className="size-3.5 text-primary" />}
                                            </div>
                                            <span className="text-[11px] text-muted-foreground leading-tight">
                                                {cat.desc}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.business_type && (
                                <p role="alert" aria-live="assertive" className="text-xs font-medium text-destructive">
                                    {errors.business_type}
                                </p>
                            )}
                        </div>

                        {/* 4. Lokasi Usaha (Peta, Deteksi Lokasi, Cari Alamat) */}
                        <div className="space-y-3 pt-2 border-t border-border/80">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                                <Label className="text-sm font-semibold text-foreground">
                                    Lokasi Usaha <span className="text-destructive">*</span>
                                </Label>
                                <span className="text-[11px] text-muted-foreground">
                                    Untuk analisis pasar di sekitar tokomu
                                </span>
                            </div>

                            {/* Tombol Deteksi Lokasi */}
                            {supportsGeolocation && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGetCurrentLocation}
                                        disabled={isDetectingLocation}
                                        className="h-10 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-secondary cursor-pointer"
                                    >
                                        {isDetectingLocation ? (
                                            <RefreshCw className="size-3.5 animate-spin" />
                                        ) : (
                                            <LocateFixed className="size-3.5" />
                                        )}
                                        Gunakan lokasi saya
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
                                        Untuk melihat pasar di sekitar usahamu.
                                    </span>
                                </div>
                            )}

                            {locationNotice && (
                                <p role="alert" aria-live="assertive" className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                    {locationNotice}
                                </p>
                            )}

                            {/* Cari Alamat Input & Autocomplete */}
                            <div className="relative">
                                <div className="relative flex rounded-xl border border-border bg-card shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                    <div className="flex items-center pl-3 text-muted-foreground">
                                        <Search className="size-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchInput(e.target.value)}
                                        placeholder="Ketik nama jalan, pasar, kelurahan, atau kota..."
                                        className="h-11 w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
                                    />
                                    {isSearching && (
                                        <div className="flex items-center pr-3">
                                            <RefreshCw className="size-3.5 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                {searchNotice && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {searchNotice}
                                    </p>
                                )}

                                {/* Autocomplete Dropdown */}
                                {suggestions.length > 0 && (
                                    <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg space-y-1">
                                        {suggestions.map((item, idx) => (
                                            <li
                                                key={idx}
                                                tabIndex={0}
                                                onClick={() => handleSelectSuggestion(item)}
                                                onKeyDown={(e) => {
                                                    if (e.key === ' ' || e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSelectSuggestion(item);
                                                    }
                                                }}
                                                className="flex items-start gap-2 rounded-lg p-2 text-xs text-popover-foreground hover:bg-muted cursor-pointer transition-colors"
                                            >
                                                <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                                                <span className="leading-snug">{item.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Peta Interaktif & Visual Pin */}
                            <div className="space-y-2">
                                <div
                                    tabIndex={0}
                                    aria-label="Peta lokasi usaha. Klik untuk menentukan titik pin."
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = (e.clientX - rect.left) / rect.width;
                                        const y = (e.clientY - rect.top) / rect.height;

                                        // Map relative click (x: 0..1, y: 0..1) to Indonesia bounds
                                        // lng: 95..141, lat: 6.0..-11.0
                                        const calculatedLng = 95.0 + x * (141.0 - 95.0);
                                        const calculatedLat = 6.0 - y * (6.0 - (-11.0));

                                        setLat(calculatedLat);
                                        setLng(calculatedLng);
                                        setErrors((prev) => ({ ...prev, location: '' }));

                                        // Reverse geocode
                                        fetch(`/api/location/reverse?lat=${calculatedLat}&lng=${calculatedLng}`)
                                            .then((r) => r.json())
                                            .then((d) => {
                                                if (d.success && d.address) setAddress(d.address.slice(0, 200));
                                            })
                                            .catch(() => {});
                                    }}
                                    className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-slate-100 cursor-crosshair select-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    {/* Map Graphic Layer */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-85 pointer-events-none"
                                        style={{
                                            backgroundImage:
                                                'radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #f8fafc 1px)',
                                            backgroundSize: '24px 24px',
                                            backgroundPosition: '0 0, 12px 12px',
                                        }}
                                    />

                                    {/* Stylized Indonesia Outline Representation */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center text-slate-400 font-bold text-xs uppercase tracking-wider">
                                            Ketuk di peta untuk menentukan atau memindahkan pin
                                        </div>
                                    </div>

                                    {/* Pin Marker */}
                                    {lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) ? (
                                        <div
                                            className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-150"
                                            style={{
                                                left: `${Math.max(5, Math.min(95, ((lng - 95.0) / (141.0 - 95.0)) * 100))}%`,
                                                top: `${Math.max(5, Math.min(95, ((6.0 - lat) / (6.0 - (-11.0))) * 100))}%`,
                                            }}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="rounded-full bg-primary p-2 text-white shadow-md animate-bounce">
                                                    <MapPin className="size-5 fill-white text-primary" />
                                                </div>
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-0.5" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-xs border border-slate-200">
                                            Pin belum ditentukan
                                        </div>
                                    )}

                                    {lat !== null && lng !== null && (
                                        <div className="absolute bottom-2.5 right-2.5 rounded-md bg-white/90 px-2 py-1 text-[10px] font-mono text-slate-700 shadow-xs border border-slate-200">
                                            {lat.toFixed(4)}, {lng.toFixed(4)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                                    <span>
                                        Privasi: Lokasi hanya dipakai untuk analisis pasar di sekitar usaha dan tidak akan ditampilkan ke pengguna lain.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowManualCoords(!showManualCoords)}
                                        className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 shrink-0 ml-2"
                                    >
                                        {showManualCoords ? 'Sembunyikan Koordinat' : 'Input Koordinat Manual'}
                                    </button>
                                </div>
                            </div>

                            {/* Manual Coordinate Input Fallback */}
                            {showManualCoords && (
                                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border bg-muted/40">
                                    <div className="space-y-1">
                                        <Label htmlFor="manual-lat" className="text-xs font-semibold">
                                            Lintang (Latitude)
                                        </Label>
                                        <Input
                                            id="manual-lat"
                                            type="number"
                                            step="0.000001"
                                            value={lat ?? ''}
                                            onChange={(e) => setLat(e.target.value === '' ? null : parseFloat(e.target.value))}
                                            placeholder="-6.200000"
                                            className="h-10 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="manual-lng" className="text-xs font-semibold">
                                            Bujur (Longitude)
                                        </Label>
                                        <Input
                                            id="manual-lng"
                                            type="number"
                                            step="0.000001"
                                            value={lng ?? ''}
                                            onChange={(e) => setLng(e.target.value === '' ? null : parseFloat(e.target.value))}
                                            placeholder="106.816666"
                                            className="h-10 text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            {errors.location && (
                                <p role="alert" aria-live="assertive" className="text-xs font-medium text-destructive">
                                    {errors.location}
                                </p>
                            )}

                            {/* Alamat Teks yang Dapat Diedit Manual */}
                            <div className="space-y-1.5 pt-1">
                                <Label htmlFor="address-input" className="text-sm font-semibold text-foreground">
                                    Alamat Lengkap Toko / Lapak
                                </Label>
                                <textarea
                                    id="address-input"
                                    rows={2}
                                    maxLength={200}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value.slice(0, 200))}
                                    placeholder="Contoh: Jl. Diponegoro No. 8, Wonokromo, Surabaya"
                                    className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>Bisa diedit manual tanpa mengubah titik koordinat di peta.</span>
                                    <span>{address.length}/200</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit & Cancel Actions */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                            {isEditMode ? (
                                <Link
                                    href={cancelUrl}
                                    className="w-full sm:w-auto text-center text-sm font-semibold text-muted-foreground hover:text-foreground py-2"
                                >
                                    Batal
                                </Link>
                            ) : (
                                <div className="text-xs text-muted-foreground">
                                    Pastikan 4 isian bertanda bintang (*) telah lengkap
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting || !isOnline}
                                size="lg"
                                className="w-full sm:w-auto font-heading text-base px-8 h-12"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="size-4 animate-spin" />
                                        Menyimpan Profil...
                                    </>
                                ) : isEditMode ? (
                                    'Simpan perubahan'
                                ) : (
                                    <>
                                        Lanjut
                                        <ArrowRight className="size-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer Assurance */}
            <footer className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 pt-4 text-xs text-muted-foreground text-center">
                <ShieldCheck className="size-4 text-[#216E45]" />
                <span>Seluruh data toko terenkripsi aman dan hanya dapat diakses oleh tokomu.</span>
            </footer>
        </div>
    );
}
