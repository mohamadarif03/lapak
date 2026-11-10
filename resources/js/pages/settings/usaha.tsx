import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    Globe,
    Lock,
    LogOut,
    MapPin,
    Phone,
    RefreshCw,
    Save,
    Share2,
    ShieldAlert,
    ShieldCheck,
    Store,
    Trash2,
    Type,
    Unlink,
    User as UserIcon,
    Wallet,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UserData = {
    id: number;
    phone_masked: string;
    joined_at: string;
    consent_at: string;
    consent_version: string;
};

type BusinessData = {
    id: number;
    owner_name: string;
    business_name: string;
    business_type: string;
    address: string;
    main_products?: string | null;
    price_range?: string | null;
    open_hours?: string | null;
    reminder_enabled?: boolean;
    reminder_time?: string | null;
};

type SocialConn = {
    id: number;
    platform: string;
    display_name: string;
    status: string;
    is_expired: boolean;
};

type Props = {
    user?: UserData;
    business?: BusinessData;
    textSize?: string;
    socialConnections?: SocialConn[];
    priceRanges?: string[];
    notice?: string | null;
    businessProfile?: any;
};

export default function PengaturanUsaha({
    user = {
        id: 1,
        phone_masked: '+62 812 •••• 7890',
        joined_at: '12 Maret 2026',
        consent_at: '12 Maret 2026, 09:30',
        consent_version: '1.0',
    },
    business = {
        id: 1,
        owner_name: 'Ibu Siti',
        business_name: 'Warung Berkah Bu Siti',
        business_type: 'Kuliner',
        address: 'Jl. Diponegoro No. 8, Wonokromo, Surabaya',
        main_products: '',
        price_range: '',
        open_hours: '08:00 - 21:00 WIB',
        reminder_enabled: true,
        reminder_time: '20:30',
    },
    textSize = 'normal',
    socialConnections = [],
    priceRanges = [
        'di bawah Rp 10 ribu',
        'Rp 10-50 ribu',
        'Rp 50-200 ribu',
        'di atas Rp 200 ribu',
    ],
    notice = null,
    businessProfile,
}: Props) {
    // 1. Flash & status notices
    const [bannerNotice, setBannerNotice] = useState<string | null>(notice);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const updateOnlineStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        setIsOnline(navigator.onLine);

        // Check URL for ?pesan=profil-tersimpan
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('pesan') === 'profil-tersimpan') {
            setBannerNotice('Profil usaha tersimpan.');
            // Clean query param without reload
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    // 2. Business details form
    const [mainProducts, setMainProducts] = useState(business?.main_products || '');
    const [priceRange, setPriceRange] = useState(business?.price_range || '');
    const [initialDetails, setInitialDetails] = useState({
        main_products: business?.main_products || '',
        price_range: business?.price_range || '',
    });
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [detailsSavedNotice, setDetailsSavedNotice] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    const isDetailsDirty =
        mainProducts.trim() !== initialDetails.main_products.trim() ||
        priceRange !== initialDetails.price_range;

    const handleSaveBusinessDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOnline) {
            setDetailsError('Kamu sedang offline. Sambungkan internet untuk menyimpan.');
            return;
        }

        setDetailsError('');
        setIsSavingDetails(true);

        try {
            const res = await fetch('/api/pengaturan/business-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    main_products: mainProducts,
                    price_range: priceRange || null,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setInitialDetails({
                    main_products: mainProducts,
                    price_range: priceRange,
                });
                setDetailsSavedNotice(true);
                setTimeout(() => setDetailsSavedNotice(false), 3000);
            } else {
                setDetailsError(data.message || 'Gagal menyimpan. Coba lagi.');
            }
        } catch {
            setDetailsError('Koneksi bermasalah. Coba lagi.');
        } finally {
            setIsSavingDetails(false);
        }
    };

    // 3. Text size setting
    const [currentTextSize, setCurrentTextSize] = useState<'normal' | 'besar'>(
        (textSize === 'besar' ? 'besar' : 'normal')
    );
    const [textSizeNotice, setTextSizeNotice] = useState(false);
    const [textSizeError, setTextSizeError] = useState('');

    const handleTextSizeChange = async (newSize: 'normal' | 'besar') => {
        if (newSize === currentTextSize) return;

        const previousSize = currentTextSize;
        setCurrentTextSize(newSize);

        // Immediate zero-latency application
        if (newSize === 'besar') {
            document.documentElement.setAttribute('data-text-size', 'besar');
            document.documentElement.classList.add('text-size-besar');
            try { localStorage.setItem('lapak_text_size', 'besar'); } catch {}
        } else {
            document.documentElement.setAttribute('data-text-size', 'normal');
            document.documentElement.classList.remove('text-size-besar');
            try { localStorage.setItem('lapak_text_size', 'normal'); } catch {}
        }

        setTextSizeError('');

        try {
            const res = await fetch('/api/pengaturan/text-size', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ text_size: newSize }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setTextSizeNotice(true);
                setTimeout(() => setTextSizeNotice(false), 2500);
            } else {
                // Rollback on failure
                setCurrentTextSize(previousSize);
                if (previousSize === 'besar') {
                    document.documentElement.setAttribute('data-text-size', 'besar');
                    document.documentElement.classList.add('text-size-besar');
                } else {
                    document.documentElement.setAttribute('data-text-size', 'normal');
                    document.documentElement.classList.remove('text-size-besar');
                }
                setTextSizeError('Gagal menyimpan. Coba lagi.');
            }
        } catch {
            setCurrentTextSize(previousSize);
            if (previousSize === 'besar') {
                document.documentElement.setAttribute('data-text-size', 'besar');
                document.documentElement.classList.add('text-size-besar');
            } else {
                document.documentElement.setAttribute('data-text-size', 'normal');
                document.documentElement.classList.remove('text-size-besar');
            }
            setTextSizeError('Gagal menyimpan. Coba lagi.');
        }
    };

    // 4. Social connections
    const [connections, setConnections] = useState<SocialConn[]>(socialConnections);
    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
    const [selectedConn, setSelectedConn] = useState<SocialConn | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [disconnectNotice, setDisconnectNotice] = useState('');
    const [disconnectError, setDisconnectError] = useState('');

    const openDisconnectDialog = (conn: SocialConn) => {
        setSelectedConn(conn);
        setDisconnectError('');
        setDisconnectModalOpen(true);
    };

    const handleConfirmDisconnect = async () => {
        if (!selectedConn) return;
        setIsDisconnecting(true);
        setDisconnectError('');

        try {
            const res = await fetch(`/api/pengaturan/social/${selectedConn.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setConnections(connections.filter((c) => c.id !== selectedConn.id));
                setDisconnectModalOpen(false);
                setSelectedConn(null);
                setDisconnectNotice('Akun diputus.');
                setTimeout(() => setDisconnectNotice(''), 3000);
            } else {
                setDisconnectError(data.message || 'Gagal memutus akun. Coba lagi.');
            }
        } catch {
            setDisconnectError('Koneksi bermasalah. Coba lagi.');
        } finally {
            setIsDisconnecting(false);
        }
    };

    // 5. Data export
    const [isExporting, setIsExporting] = useState(false);
    const [exportNotice, setExportNotice] = useState('');
    const [exportError, setExportError] = useState('');

    const handleExportData = async () => {
        if (!isOnline) {
            setExportError('Kamu sedang offline. Sambungkan internet untuk ekspor data.');
            return;
        }

        setIsExporting(true);
        setExportError('');
        setExportNotice('Menyiapkan berkas ekspor seluruh data...');

        try {
            const res = await fetch('/api/pengaturan/export', {
                method: 'POST',
                headers: {
                    'Accept': 'application/zip, application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (res.status === 429) {
                const data = await res.json().catch(() => ({}));
                setExportNotice('');
                setExportError(data.message || 'Terlalu banyak ekspor. Coba lagi nanti.');
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setExportNotice('');
                setExportError(data.message || 'Ekspor gagal. Coba lagi.');
                return;
            }

            // Download ZIP file
            const blob = await res.blob();
            const disposition = res.headers.get('content-disposition');
            let filename = 'lapak-data.zip';
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            setExportNotice('Berkas ekspor berhasil diunduh.');
            setTimeout(() => setExportNotice(''), 4000);
        } catch {
            setExportNotice('');
            setExportError('Ekspor gagal. Coba lagi.');
        } finally {
            setIsExporting(false);
        }
    };

    // 6. Delete account flow
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteStep, setDeleteStep] = useState<'info' | 'otp'>('info');
    const [isRequestingOtp, setIsRequestingOtp] = useState(false);
    const [deleteOtpCode, setDeleteOtpCode] = useState('');
    const [confirmWord, setConfirmWord] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [otpCooldown, setOtpCooldown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (otpCooldown > 0) {
            timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpCooldown]);

    const handleRequestDeleteOtp = async () => {
        setIsRequestingOtp(true);
        setDeleteError('');

        try {
            const res = await fetch('/api/pengaturan/delete-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setDeleteStep('otp');
                setOtpCooldown(60);
            } else if (res.status === 429) {
                setDeleteError(data.message || 'Terlalu banyak permintaan kode. Coba lagi nanti.');
                if (data.resend_in) {
                    setOtpCooldown(data.resend_in);
                }
            } else {
                setDeleteError(data.message || 'Kode belum terkirim. Coba lagi atau kirim lewat SMS.');
            }
        } catch {
            setDeleteError('Koneksi bermasalah. Coba lagi.');
        } finally {
            setIsRequestingOtp(false);
        }
    };

    const handleExecuteDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmWord.trim().toLowerCase() !== 'hapus') {
            setDeleteError('Ketik HAPUS untuk melanjutkan.');
            return;
        }

        if (deleteOtpCode.trim().length !== 6) {
            setDeleteError('Masukkan 6 digit kode OTP secara lengkap.');
            return;
        }

        setIsDeleting(true);
        setDeleteError('');

        try {
            const res = await fetch('/api/pengaturan/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    code: deleteOtpCode.trim(),
                    confirmation: confirmWord.trim(),
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Redirect to login with deleted message
                window.location.href = data.redirect || '/masuk?pesan=akun-dihapus';
            } else {
                setDeleteError(data.message || 'Penghapusan gagal. Tidak ada data yang diubah. Coba lagi.');
            }
        } catch {
            setDeleteError('Penghapusan gagal. Tidak ada data yang diubah. Coba lagi.');
        } finally {
            setIsDeleting(false);
        }
    };

    // 7. Logout handler
    const handleLogout = () => {
        router.post('/keluar');
    };

    return (
        <>
            <Head title="Profil & Pengaturan - LAPAK UMKM" />

            <div className="w-full max-w-4xl space-y-8 py-2">
                {/* Header */}
                <div className="border-b border-border/80 pb-5">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-primary mb-1.5">
                        <Store className="size-3.5" />
                        Pengaturan LAPAK
                    </div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Profil & Pengaturan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola data akun, informasi usaha, preferensi tampilan, dan keamanan tokomu.
                    </p>
                </div>

                {/* Offline Banner */}
                {!isOnline && (
                    <div
                        role="alert"
                        className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-900"
                    >
                        <AlertCircle className="size-4 shrink-0 text-amber-600" />
                        <span>Kamu sedang offline. Sambungkan internet untuk menyimpan atau mengelola data.</span>
                    </div>
                )}

                {/* Success Banner */}
                {bannerNotice && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className="flex items-center justify-between gap-2 rounded-xl border border-[#216E45]/40 bg-[#E4F3E8] p-4 text-xs font-semibold text-[#216E45] animate-in fade-in duration-200"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 shrink-0" />
                            <span>{bannerNotice}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setBannerNotice(null)}
                            className="text-[#216E45] hover:opacity-75 p-1"
                            aria-label="Tutup pesan"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                )}

                {/* ================= 1. BAGIAN AKUN ================= */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UserIcon className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-heading text-base font-bold text-foreground">
                                    Informasi Akun
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Data autentikasi dan persetujuan layanan LAPAK
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                Nomor WhatsApp Terdaftar
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={user.phone_masked}
                                    readOnly
                                    className="bg-muted/50 font-mono font-medium text-foreground cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Nomor HP tidak dapat diubah pada versi ini.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                Tanggal Bergabung
                            </Label>
                            <Input
                                value={user.joined_at}
                                readOnly
                                className="bg-muted/50 text-foreground cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                Persetujuan Penggunaan & Privasi
                            </Label>
                            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs text-muted-foreground">
                                <p className="font-medium text-foreground">
                                    Setuju pada {user.consent_at}, versi {user.consent_version}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <a
                                        href="/syarat"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                    >
                                        <span>Syarat Penggunaan</span>
                                        <ExternalLink className="size-3" />
                                    </a>
                                    <span className="text-border">•</span>
                                    <a
                                        href="/privasi"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                    >
                                        <span>Kebijakan Privasi</span>
                                        <ExternalLink className="size-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= 2. BAGIAN PROFIL USAHA ================= */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Store className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-heading text-base font-bold text-foreground">
                                    Profil Usaha
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Ringkasan identitas toko dan detail produk
                                </p>
                            </div>
                        </div>

                        <Button asChild variant="outline" size="sm" className="font-semibold">
                            <Link href="/profil-usaha?ubah=1">
                                Ubah Profil
                            </Link>
                        </Button>
                    </div>

                    {/* Ringkasan Profil Statis */}
                    <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-muted/20 p-4 border border-border/60">
                        <div>
                            <span className="text-[11px] font-semibold text-muted-foreground block">Nama Pemilik</span>
                            <span className="text-sm font-bold text-foreground">{business.owner_name || '-'}</span>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-muted-foreground block">Nama Usaha / Lapak</span>
                            <span className="text-sm font-bold text-foreground">{business.business_name || '-'}</span>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-muted-foreground block">Jenis Usaha</span>
                            <span className="text-sm font-bold text-foreground">{business.business_type || '-'}</span>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-muted-foreground block">Titik Lokasi / Alamat</span>
                            <span className="text-sm font-medium text-foreground line-clamp-2">{business.address || '-'}</span>
                        </div>
                    </div>

                    {/* Detail Usaha In-Page Edit */}
                    <form onSubmit={handleSaveBusinessDetails} className="space-y-4 pt-2 border-t border-border/80">
                        <div className="flex items-center justify-between">
                            <h3 className="font-heading text-sm font-bold text-foreground">
                                Detail Usaha Tambahan
                            </h3>
                            <span className="text-[11px] text-muted-foreground">
                                Boleh dikosongkan atau disesuaikan kapan saja
                            </span>
                        </div>

                        {detailsSavedNotice && (
                            <div
                                role="status"
                                aria-live="polite"
                                className="flex items-center gap-2 rounded-xl border border-[#216E45]/40 bg-[#E4F3E8] p-3 text-xs font-semibold text-[#216E45]"
                            >
                                <CheckCircle2 className="size-4 shrink-0" />
                                <span>Tersimpan.</span>
                            </div>
                        )}

                        {detailsError && (
                            <div
                                role="alert"
                                aria-live="assertive"
                                className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700"
                            >
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{detailsError}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="main-products" className="text-xs font-semibold">
                                    Produk Utama
                                </Label>
                                <span className={`text-[11px] font-medium ${mainProducts.length > 200 ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                                    {mainProducts.length} / 200 karakter
                                </span>
                            </div>
                            <Input
                                id="main-products"
                                value={mainProducts}
                                onChange={(e) => setMainProducts(e.target.value)}
                                placeholder="Contoh: Nasi goreng, es teh manis, mie ayam spesial"
                                maxLength={210}
                                aria-invalid={mainProducts.length > 200 ? 'true' : 'false'}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Sebutkan beberapa menu atau barang andalan tokomu.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="price-range" className="text-xs font-semibold">
                                Kisaran Harga Produk
                            </Label>
                            <select
                                id="price-range"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="">-- Pilih kisaran harga produk --</option>
                                {priceRanges.map((range) => (
                                    <option key={range} value={range}>
                                        {range}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={!isDetailsDirty || isSavingDetails || !isOnline || mainProducts.length > 200}
                                className="font-heading min-h-[48px] px-6"
                            >
                                {isSavingDetails ? (
                                    <>
                                        <RefreshCw className="size-4 animate-spin mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="size-4 mr-2" />
                                        Simpan Detail Usaha
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* ================= 3. BAGIAN UKURAN TEKS ================= */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Type className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-heading text-base font-bold text-foreground">
                                    Ukuran Teks Aplikasi
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Sesuaikan kenyamanan membaca tulisan di seluruh halaman LAPAK
                                </p>
                            </div>
                        </div>

                        {textSizeNotice && (
                            <span
                                role="status"
                                aria-live="polite"
                                className="inline-flex items-center gap-1 rounded-full bg-[#E4F3E8] px-3 py-1 text-xs font-bold text-[#216E45] animate-in fade-in"
                            >
                                <CheckCircle2 className="size-3.5" />
                                Tersimpan.
                            </span>
                        )}
                    </div>

                    {textSizeError && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700"
                        >
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{textSizeError}</span>
                        </div>
                    )}

                    <div
                        role="radiogroup"
                        aria-label="Pilihan ukuran teks"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        <button
                            type="button"
                            role="radio"
                            aria-checked={currentTextSize === 'normal'}
                            onClick={() => handleTextSizeChange('normal')}
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all min-h-[48px] ${
                                currentTextSize === 'normal'
                                    ? 'border-primary bg-primary/5 shadow-xs'
                                    : 'border-border bg-card hover:border-muted-foreground/30'
                            }`}
                        >
                            <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                currentTextSize === 'normal' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                            }`}>
                                {currentTextSize === 'normal' && <div className="size-2 rounded-full bg-white" />}
                            </div>
                            <div>
                                <div className="font-heading font-bold text-sm text-foreground">
                                    Ukuran Normal (100%)
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Tampilan standar bawaan aplikasi untuk kenyamanan umum.
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            role="radio"
                            aria-checked={currentTextSize === 'besar'}
                            onClick={() => handleTextSizeChange('besar')}
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all min-h-[48px] ${
                                currentTextSize === 'besar'
                                    ? 'border-primary bg-primary/5 shadow-xs'
                                    : 'border-border bg-card hover:border-muted-foreground/30'
                            }`}
                        >
                            <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                currentTextSize === 'besar' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                            }`}>
                                {currentTextSize === 'besar' && <div className="size-2 rounded-full bg-white" />}
                            </div>
                            <div>
                                <div className="font-heading font-bold text-base text-foreground">
                                    Ukuran Besar (125%)
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Tulisan lebih besar dan lebih mudah terbaca di layar HP.
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* ================= 4. BAGIAN MEDIA SOSIAL ================= */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Share2 className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-heading text-base font-bold text-foreground">
                                    Akun Media Sosial Terhubung
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Koneksi untuk menerbitkan konten promosi langsung dari LAPAK
                                </p>
                            </div>
                        </div>

                        {disconnectNotice && (
                            <span
                                role="status"
                                aria-live="polite"
                                className="inline-flex items-center gap-1 rounded-full bg-[#E4F3E8] px-3 py-1 text-xs font-bold text-[#216E45] animate-in fade-in"
                            >
                                <CheckCircle2 className="size-3.5" />
                                {disconnectNotice}
                            </span>
                        )}
                    </div>

                    {connections.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                            Belum ada akun media sosial yang terhubung ke tokomu.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {connections.map((conn) => (
                                <div
                                    key={conn.id}
                                    className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-muted/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                                            {conn.platform.slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">
                                                {conn.display_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                Platform {conn.platform}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                conn.is_expired
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-[#E4F3E8] text-[#216E45]'
                                            }`}
                                        >
                                            {conn.status}
                                        </span>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDisconnectDialog(conn)}
                                            disabled={!isOnline}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[48px]"
                                        >
                                            <Unlink className="size-4 mr-1.5" />
                                            Putuskan
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ================= 5. FITUR PENGINGAT HARIAN (BELUM DIBANGUN, ELEMEN DIPERTAHANKAN) ================= */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
                    <h2 className="font-heading text-base font-bold text-foreground border-b border-border pb-3">
                        Pengingat Catatan Keuangan Harian
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-heading text-sm font-bold text-foreground">
                                Kirim Pengingat Catat Harian
                            </p>
                            <p className="text-xs text-muted-foreground">
                                LAPAK akan mengirim pesan sapaan ramah agar kamu tidak lupa mencatat penjualan hari ini.
                            </p>
                        </div>

                        <input
                            type="checkbox"
                            defaultChecked={business.reminder_enabled ?? true}
                            className="size-5 accent-primary cursor-pointer"
                        />
                    </div>

                    <div className="max-w-xs space-y-1.5 pt-2">
                        <Label htmlFor="u-reminder-time" className="text-xs font-semibold">
                            Waktu Pengingat Setiap Malam
                        </Label>
                        <Input
                            id="u-reminder-time"
                            type="time"
                            defaultValue={business.reminder_time ?? '20:30'}
                        />
                    </div>
                </div>

                {/* ================= 6. BAGIAN DATA DAN PRIVASI ================= */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-border pb-4">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <h2 className="font-heading text-base font-bold text-foreground">
                                Data & Privasi Usaha
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Keamanan kepemilikan data tokomu di LAPAK
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground space-y-2 leading-relaxed">
                        <p>
                            Rekaman suara Anda langsung dihapus setelah diproses menjadi teks transaksi.
                        </p>
                        <p>
                            Data bisnis Anda adalah milik Anda sepenuhnya dan tidak pernah dijual atau dibagikan ke pihak ketiga mana pun.
                        </p>
                    </div>

                    {exportNotice && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="flex items-center gap-2 rounded-xl border border-[#216E45]/40 bg-[#E4F3E8] p-3 text-xs font-semibold text-[#216E45]"
                        >
                            <CheckCircle2 className="size-4 shrink-0" />
                            <span>{exportNotice}</span>
                        </div>
                    )}

                    {exportError && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700"
                        >
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{exportError}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleExportData}
                            disabled={isExporting || !isOnline}
                            className="font-heading min-h-[48px] flex-1 justify-center"
                        >
                            {isExporting ? (
                                <>
                                    <RefreshCw className="size-4 animate-spin mr-2" />
                                    Menyiapkan Ekspor...
                                </>
                            ) : (
                                <>
                                    <Download className="size-4 mr-2" />
                                    Ekspor Semua Data
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setDeleteStep('info');
                                setDeleteError('');
                                setDeleteOtpCode('');
                                setConfirmWord('');
                                setDeleteModalOpen(true);
                            }}
                            disabled={!isOnline}
                            className="font-heading min-h-[48px] flex-1 justify-center"
                        >
                            <Trash2 className="size-4 mr-2" />
                            Hapus Akun dan Data
                        </Button>
                    </div>
                </div>

                {/* ================= 7. BAGIAN KELUAR ================= */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleLogout}
                        className="font-heading text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[48px] px-6"
                    >
                        <LogOut className="size-4 mr-2" />
                        Keluar
                    </Button>
                </div>
            </div>

            {/* ================= MODAL PUTUSKAN AKUN SOSIAL ================= */}
            {disconnectModalOpen && selectedConn && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="disconnect-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
                >
                    <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <AlertCircle className="size-6 shrink-0" />
                            <h3 id="disconnect-title" className="font-heading text-base font-bold text-foreground">
                                Putuskan Akun {selectedConn.display_name}?
                            </h3>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Putuskan akun {selectedConn.display_name}? Kamu tidak bisa memposting ke akun ini sampai menghubungkan lagi.
                        </p>

                        {disconnectError && (
                            <div role="alert" className="p-3 text-xs font-semibold text-red-700 bg-red-50 rounded-xl border border-red-300">
                                {disconnectError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDisconnectModalOpen(false)}
                                disabled={isDisconnecting}
                                className="min-h-[48px]"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleConfirmDisconnect}
                                disabled={isDisconnecting}
                                className="min-h-[48px]"
                            >
                                {isDisconnecting ? (
                                    <>
                                        <RefreshCw className="size-4 animate-spin mr-2" />
                                        Memutus...
                                    </>
                                ) : (
                                    'Putuskan'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL HAPUS AKUN & SELURUH DATA ================= */}
            {deleteModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-account-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
                >
                    <div className="w-full max-w-lg rounded-2xl bg-card border border-red-200 p-6 sm:p-8 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2.5 text-red-600">
                                <ShieldAlert className="size-6 shrink-0" />
                                <h3 id="delete-account-title" className="font-heading text-lg font-bold text-foreground">
                                    Hapus Akun dan Seluruh Data
                                </h3>
                            </div>
                            {!isDeleting && (
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                    aria-label="Tutup dialog"
                                >
                                    <X className="size-5" />
                                </button>
                            )}
                        </div>

                        {deleteStep === 'info' ? (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 leading-relaxed space-y-2">
                                    <p className="font-bold">
                                        Peringatan: Tindakan ini permanen dan tidak dapat dibatalkan.
                                    </p>
                                    <p>
                                        Seluruh data akun tokomu akan dihapus bersih dari sistem:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 font-medium pl-1">
                                        <li>Profil usaha dan kontak pemilik</li>
                                        <li>Seluruh transaksi pemasukan dan pengeluaran</li>
                                        <li>Riwayat catatan suara dan transkrip</li>
                                        <li>Insight pasar, demografi, dan tren</li>
                                        <li>Kampanye promosi dan seluruh berkas poster</li>
                                        <li>Koneksi akun media sosial</li>
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 text-xs">
                                    <span className="text-muted-foreground">Ingin menyimpan salinan tokomu?</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeleteModalOpen(false);
                                            handleExportData();
                                        }}
                                        className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                        <Download className="size-3.5" />
                                        Ekspor data dulu
                                    </button>
                                </div>

                                {deleteError && (
                                    <div role="alert" className="p-3 text-xs font-semibold text-red-700 bg-red-50 rounded-xl border border-red-300">
                                        {deleteError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="min-h-[48px]"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleRequestDeleteOtp}
                                        disabled={isRequestingOtp}
                                        className="font-heading min-h-[48px]"
                                    >
                                        {isRequestingOtp ? (
                                            <>
                                                <RefreshCw className="size-4 animate-spin mr-2" />
                                                Meminta Kode...
                                            </>
                                        ) : (
                                            'Lanjut Verifikasi Hapus'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleExecuteDelete} className="space-y-4">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Kode verifikasi 6 digit telah dikirimkan ke WhatsApp nomor terdaftar ({user.phone_masked}). Berlaku 5 menit.
                                </p>

                                {deleteError && (
                                    <div role="alert" className="p-3 text-xs font-semibold text-red-700 bg-red-50 rounded-xl border border-red-300">
                                        {deleteError}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="del-otp" className="text-xs font-semibold">
                                        Kode Verifikasi 6 Digit
                                    </Label>
                                    <Input
                                        id="del-otp"
                                        value={deleteOtpCode}
                                        onChange={(e) => setDeleteOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        maxLength={6}
                                        disabled={isDeleting}
                                        className="font-mono text-center tracking-widest text-lg font-bold"
                                        required
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleRequestDeleteOtp}
                                            disabled={otpCooldown > 0 || isRequestingOtp || isDeleting}
                                            className="text-[11px] font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                                        >
                                            {otpCooldown > 0
                                                ? `Kirim ulang kode (${otpCooldown}s)`
                                                : 'Kirim ulang kode'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="del-confirm" className="text-xs font-semibold">
                                        Ketik kata "HAPUS" untuk konfirmasi
                                    </Label>
                                    <Input
                                        id="del-confirm"
                                        value={confirmWord}
                                        onChange={(e) => setConfirmWord(e.target.value)}
                                        placeholder="HAPUS"
                                        disabled={isDeleting}
                                        className="font-bold uppercase tracking-wider"
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Ketik HAPUS untuk melanjutkan.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDeleteModalOpen(false)}
                                        disabled={isDeleting}
                                        className="min-h-[48px]"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={
                                            deleteOtpCode.trim().length !== 6 ||
                                            confirmWord.trim().toLowerCase() !== 'hapus' ||
                                            isDeleting
                                        }
                                        className="font-heading min-h-[48px]"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <RefreshCw className="size-4 animate-spin mr-2" />
                                                Menghapus Seluruh Data...
                                            </>
                                        ) : (
                                            'Hapus Akun Selamanya'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

PengaturanUsaha.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Pengaturan Usaha', href: '/settings/usaha' },
    ],
};
