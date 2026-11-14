import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Home,
    Mic,
    Wallet,
    Store,
    Gift,
    LineChart,
    GraduationCap,
    Users,
    Settings,
    Moon,
    Sun,
    Bot,
    LogOut,
    ShoppingCart,
    BookOpen,
    ExternalLink,
    Sparkles,
    BadgePercent,
    TrendingUp,
    CheckCircle2,
    X,
    MessageCircle,
    Check,
    Clock,
    AlertCircle,
    Volume2,
    ArrowRight,
    Download,
    Smartphone,
} from 'lucide-react';

export type ActivePage =
    | 'dashboard'
    | 'catat'
    | 'keuangan'
    | 'produk'
    | 'promosi'
    | 'analisis'
    | 'laporan'
    | 'belajar'
    | 'bantuan'
    | 'pengaturan'
    | 'etalase';

export interface AppSidebarProps {
    current: ActivePage;
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
    customWidget?: React.ReactNode;
    counts?: {
        products?: number;
        transactions?: number;
        tasks?: number;
        modules?: string;
    };
    onShowToast?: (msg: string) => void;
}

interface OrderItem {
    id: string;
    customerName: string;
    phone: string;
    items: string;
    total: number;
    timeAgo: string;
    address: string;
    status: 'menunggu' | 'diproses' | 'siap' | 'selesai';
}

const initialOrders: OrderItem[] = [
    {
        id: 'ORD-101',
        customerName: 'Bu Dewi Kartika',
        phone: '6281234567890',
        items: '2x Paket Rendang Daging Spesial',
        total: 130000,
        timeAgo: '10 menit lalu',
        address: 'Kebayoran Baru, Jakarta Selatan',
        status: 'menunggu',
    },
    {
        id: 'ORD-102',
        customerName: 'Pak Joko Santoso',
        phone: '6281388889999',
        items: '5x Nasi Bento Ayam Crispy',
        total: 125000,
        timeAgo: '45 menit lalu',
        address: 'Jl. Fatmawati No. 12, Jakarta Selatan',
        status: 'diproses',
    },
    {
        id: 'ORD-103',
        customerName: 'Mbak Anisa',
        phone: '6285711112222',
        items: '1x Keripik Balado Pedas (Toples 500g)',
        total: 35000,
        timeAgo: '2 jam lalu',
        address: 'Cilandak Barat, Jakarta Selatan',
        status: 'siap',
    },
];

interface VoicePromptGuide {
    pageTitle: string;
    pageBadge: string;
    description: string;
    examples: {
        text: string;
        response: string;
    }[];
}

const getVoicePromptsForPage = (page: ActivePage): VoicePromptGuide => {
    switch (page) {
        case 'dashboard':
            return {
                pageTitle: 'Dashboard Utama',
                pageBadge: 'Ringkasan & Aksi Kasir',
                description: 'Kamu bisa menanyakan data performa tokomu atau merekam transaksi secara langsung:',
                examples: [
                    {
                        text: 'Berapa laba bersih dan uang masuk minggu ini?',
                        response: 'Laba bersih minggu ini tercatat Rp 5.650.000 dengan total uang masuk Rp 9.850.000.',
                    },
                    {
                        text: 'Tampilkan pengeluaran paling boros hari ini',
                        response: 'Pengeluaran terbesar hari ini adalah pos Bahan Baku sebesar 52%.',
                    },
                    {
                        text: 'Catat pemasukan 150 ribu pesanan katering',
                        response: 'Mengarahkan ke modul kasir: Pemasukan katering Rp 150.000 siap dicatat.',
                    },
                ],
            };
        case 'catat':
            return {
                pageTitle: 'Pencatatan Kasir (Catat)',
                pageBadge: 'Voice to Transaction AI',
                description: 'Ucapkan transaksi tokomu seperti berbicara ke asisten kasir nyata:',
                examples: [
                    {
                        text: 'Catat nasi rawon tiga porsi tujuh puluh lima ribu tunai',
                        response: 'Mengekstrak data: Pemasukan 3x Nasi Rawon nominal Rp 75.000 (Tunai) otomatis terisi.',
                    },
                    {
                        text: 'Beli minyak goreng dua liter 34 ribu dari kas kecil',
                        response: 'Mengekstrak data: Pengeluaran Bahan Baku Rp 34.000 berhasil dicatat.',
                    },
                    {
                        text: 'Uang masuk 120 ribu dari Pak Joko via transfer QRIS',
                        response: 'Mengekstrak data: Pemasukan Rp 120.000 metode pembayaran QRIS.',
                    },
                ],
            };
        case 'keuangan':
        case 'laporan':
            return {
                pageTitle: page === 'laporan' ? 'Laporan Arus Kas' : 'Manajemen Keuangan',
                pageBadge: 'Kas & Buku Utang',
                description: 'Gunakan suara untuk memeriksa kas usaha dan mengelola kasbon pelanggan:',
                examples: [
                    {
                        text: 'Berapa sisa saldo kas usaha yang tersisa saat ini?',
                        response: 'Saldo kas usaha siap operasional tercatat Rp 8.750.000.',
                    },
                    {
                        text: 'Siapa saja pelanggan yang masih ada kasbon belum lunas?',
                        response: 'Ditemukan 2 transaksi piutang belum lunas: Bu Lina (Rp 45.000) dan Mas Eko (Rp 25.000).',
                    },
                    {
                        text: 'Unduh laporan keuangan bulan ini ke format file',
                        response: 'Menyiapkan file ekspor laporan kas format CSV/Excel untuk diunduh.',
                    },
                ],
            };
        case 'produk':
        case 'etalase':
            return {
                pageTitle: 'Katalog & Produk Toko',
                pageBadge: 'Manajemen Menu Jualan',
                description: 'Kelola harga, stok, atau tambah menu dagangan baru tanpa repot mengetik:',
                examples: [
                    {
                        text: 'Tambah produk baru Keripik Singkong Pedas harga 15 ribu',
                        response: 'Membuka formulir: Produk baru Keripik Singkong Pedas (Rp 15.000) siap disimpan.',
                    },
                    {
                        text: 'Berapa sisa stok es sinom hari ini?',
                        response: 'Stok Es Sinom Segar terpantau tersisa 8 botol siap jual.',
                    },
                    {
                        text: 'Ubah harga Nasi Rawon Daging jadi 28 ribu',
                        response: 'Harga menu Nasi Rawon Daging diperbarui menjadi Rp 28.000.',
                    },
                ],
            };
        case 'promosi':
            return {
                pageTitle: 'Generator Konten Promosi',
                pageBadge: 'Poster & Copywriting AI',
                description: 'Instruksikan AI Gemini untuk membuat materi promosi tokomu:',
                examples: [
                    {
                        text: 'Bikinkan poster promo diskon 20 persen untuk hari Jumat',
                        response: 'Menyusun poster promo Canva-style dengan tema "Jumat Berkah Diskon 20%".',
                    },
                    {
                        text: 'Buatkan pesan WhatsApp promo makan siang hemat',
                        response: 'Copywriting siap: "Makan siang lezat & hemat di Dapur Bu Siti, pesan sekarang gratis ongkir!"',
                    },
                    {
                        text: 'Tampilkan ide promosi kuliner untuk akhir pekan',
                        response: 'Menampilkan 3 rekomendasi strategi promosi weekend khusus kuliner UMKM.',
                    },
                ],
            };
        case 'analisis':
            return {
                pageTitle: 'Analisis Bisnis & Pasar',
                pageBadge: 'Rekomendasi AI Gemini',
                description: 'Tanyakan insight penjualan dan tren pembeli di sekitarmu:',
                examples: [
                    {
                        text: 'Hari apa warung saya paling ramai pembeli?',
                        response: 'Berdasarkan data 28 hari, hari Sabtu adalah hari tersibuk dengan kontribusi omzet 28%.',
                    },
                    {
                        text: 'Apa menu yang paling laris dalam 2 minggu terakhir?',
                        response: 'Produk terlaris adalah Nasi Rawon Daging (total 84 porsi terjual).',
                    },
                    {
                        text: 'Bagaimana saran AI untuk menaikkan omzet toko?',
                        response: 'Saran Gemini: Buat paket bundling Rawon + Es Sinom di jam makan siang 11.30–13.30.',
                    },
                ],
            };
        case 'belajar':
            return {
                pageTitle: 'Belajar Mandiri UMKM',
                pageBadge: 'Modul & Sertifikasi',
                description: 'Navigasikan materi pelatihan dan cek kemampuan usahamu:',
                examples: [
                    {
                        text: 'Buka modul cara jualan laris di WhatsApp Bisnis',
                        response: 'Membuka Modul 2: Praktik Pemasaran Digital & Closing Pelanggan WhatsApp.',
                    },
                    {
                        text: 'Berapa nilai tes dan progres belajar saya?',
                        response: 'Progres belajarmu 75% (3 dari 4 modul selesai) dengan rata-rata post-test 88.',
                    },
                    {
                        text: 'Rekomendasikan materi keuangan praktis untuk pemula',
                        response: 'Mengarahkan ke materi: "Memisahkan Uang Usaha dan Uang Pribadi".',
                    },
                ],
            };
        case 'bantuan':
            return {
                pageTitle: 'Konsultasi & Mentor',
                pageBadge: 'Tanya Ahli UMKM',
                description: 'Hubungi mentor bisnis atau tanyakan solusi kendala tokomu:',
                examples: [
                    {
                        text: 'Jadwalkan konsultasi dengan Kak Rendy besok jam 2 siang',
                        response: 'Membuat draf jadwal temu daring dengan Kak Rendy (Pemasaran Digital).',
                    },
                    {
                        text: 'Bagaimana syarat mengurus sertifikasi halal gratis?',
                        response: 'Menampilkan panduan program SEHATI (Sertifikasi Halal Gratis) Kementerian Agama.',
                    },
                    {
                        text: 'Tanyakan tips kemasan produk makanan tahan lama ke forum',
                        response: 'Membuka formulir tanya jawab forum komunitas sesama pelaku UMKM.',
                    },
                ],
            };
        case 'pengaturan':
            return {
                pageTitle: 'Pengaturan & Preferensi',
                pageBadge: 'Aksesibilitas Toko',
                description: 'Sesuaikan kenyamanan aplikasi dan data usaha dengan suara:',
                examples: [
                    {
                        text: 'Ubah ukuran tulisan ke mode besar',
                        response: 'Mengaktifkan mode teks besar untuk keterbacaan yang lebih ramah mata.',
                    },
                    {
                        text: 'Perbarui nomor telepon WhatsApp toko',
                        response: 'Membuka bagian kontak profil usaha untuk diedit.',
                    },
                    {
                        text: 'Hubungkan akun media sosial bisnis',
                        response: 'Menampilkan integrasi tautan Instagram dan WhatsApp toko.',
                    },
                ],
            };
        default:
            return {
                pageTitle: 'Asisten Suara Pintar LAPAK',
                pageBadge: 'Asisten Cerdas UMKM',
                description: 'Cukup ucapkan instruksimu, sistem pintar LAPAK siap membantu:',
                examples: [
                    {
                        text: 'Catat pemasukan lima puluh ribu rupiah',
                        response: 'Transaksi pemasukan Rp 50.000 berhasil dicatat ke pembukuan kas.',
                    },
                    {
                        text: 'Berapa total penjualan hari ini?',
                        response: 'Total uang masuk hari ini tercatat Rp 1.450.000.',
                    },
                    {
                        text: 'Buka menu catatan kas',
                        response: 'Membuka modul pencatatan kas harian.',
                    },
                ],
            };
    }
};

export default function AppSidebar({
    current,
    sidebarOpen = true,
    setSidebarOpen,
    customWidget,
    counts,
    onShowToast,
}: AppSidebarProps) {
    const pageProps = usePage().props as any;
    const business = pageProps?.business || pageProps?.auth?.user?.business || null;
    const businessName = business?.name || 'Lapak UMKM';
    const logoUrl =
        business?.logo_url ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80';

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
    const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [localToast, setLocalToast] = useState<string | null>(null);

    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isSimulatingSpeech, setIsSimulatingSpeech] = useState(false);
    const [activeSampleText, setActiveSampleText] = useState<string | null>(null);
    const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

    // PWA Install Prompt State
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isPwaInstalled, setIsPwaInstalled] = useState(false);

    const voiceGuide = getVoicePromptsForPage(current);

    const handleSimulatePrompt = (sample: { text: string; response: string }) => {
        setActiveSampleText(sample.text);
        setIsSimulatingSpeech(true);
        setVoiceFeedback(null);

        setTimeout(() => {
            setIsSimulatingSpeech(false);
            setVoiceFeedback(sample.response);
        }, 1100);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('lapak_theme');
        const isDark =
            savedTheme === 'dark' ||
            document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);

        // Tutup sidebar otomatis di mobile (< 768px) saat halaman dimuat
        if (typeof window !== 'undefined' && window.innerWidth < 768 && setSidebarOpen) {
            setSidebarOpen(false);
        }

        // Listener PWA Install
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsPwaInstalled(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallPwa = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                showNotification('Aplikasi LAPAK berhasil dipasang!');
                setDeferredPrompt(null);
                setIsPwaInstalled(true);
            }
        } else {
            showNotification('PWA siap: Pilih menu browser (titik 3 / Bagikan) lalu tekan "Tambahkan ke Layar Utama" / "Install Aplikasi".');
        }
    };

    const showNotification = (msg: string) => {
        if (onShowToast) {
            onShowToast(msg);
        } else {
            setLocalToast(msg);
            setTimeout(() => setLocalToast(null), 3000);
        }
    };

    const toggleDarkMode = () => {
        const nextMode = !isDarkMode;
        setIsDarkMode(nextMode);
        if (nextMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('lapak_theme', 'dark');
            showNotification('Mode Gelap diaktifkan');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('lapak_theme', 'light');
            showNotification('Mode Terang diaktifkan');
        }
    };

    const handleConfirmLogout = () => {
        setIsLoggingOut(true);
        router.post('/keluar', {}, {
            onError: () => {
                setIsLoggingOut(false);
                setIsLogoutModalOpen(false);
                showNotification('Gagal keluar akun. Silakan coba lagi.');
            },
        });
    };

    const updateOrderStatus = (orderId: string, nextStatus: OrderItem['status']) => {
        setOrders((prev) =>
            prev.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
        );
        const statusText =
            nextStatus === 'selesai'
                ? 'ditandai selesai'
                : nextStatus === 'diproses'
                ? 'sedang disiapkan'
                : 'siap dikirim';
        showNotification(`Status pesanan ${orderId} ${statusText}`);
    };

    const activeOrderCount = orders.filter((o) => o.status !== 'selesai').length;

    // Helper formatting currency
    const formatRp = (val: number) => {
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    };

    return (
        <>
            {/* Local Toast if parent does not have toast handler */}
            {localToast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{localToast}</span>
                </div>
            )}

            {/* ================= FAR-LEFT ICON SIDEBAR (Desktop & Tablet >= 768px) ================= */}
            <aside className="z-20 hidden md:flex w-16 shrink-0 select-none flex-col items-center justify-between border-r border-slate-100 bg-white py-4 print:hidden">
                <div className="flex w-full flex-col items-center space-y-5">
                    {/* Brand Logo */}
                    <Link
                        href="/dashboard"
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:opacity-90"
                        title={businessName}
                    >
                        <svg
                            className="h-7 w-7"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8 24C8 15 15 6 25 6C22 13 18 17 12 18C16 19 20 18 23 15C19 22 14 25 8 24Z"
                                fill="url(#appSidebarLogoGrad)"
                            />
                            <defs>
                                <linearGradient
                                    id="appSidebarLogoGrad"
                                    x1="8"
                                    y1="6"
                                    x2="25"
                                    y2="24"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#a855f7" />
                                    <stop offset="1" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </Link>

                    {/* Main Nav Icons */}
                    <nav className="flex w-full flex-col items-center space-y-1.5 px-2">
                        {/* Beranda / Dashboard */}
                        <Link
                            href="/dashboard"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'dashboard'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Ringkasan Usaha (Dashboard)"
                        >
                            <Home className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Catat Transaksi (Suara & Manual) */}
                        <Link
                            href="/catat"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'catat'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Catat Suara & Transaksi Kas"
                        >
                            <Mic className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Buku Kas & Riwayat Keuangan */}
                        <Link
                            href="/keuangan"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'keuangan'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Catatan Kas & Riwayat Keuangan"
                        >
                            <Wallet className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Laporan Laba Rugi */}
                        <Link
                            href="/laporan"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'laporan'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Laporan Laba & Rugi (PDF & Excel)"
                        >
                            <LineChart className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Analisis Usaha AI */}
                        <Link
                            href="/analisis"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'analisis'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Analisis Pasar & Demografi Sekitar"
                        >
                            <TrendingUp className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Produk & Stok */}
                        <Link
                            href="/produk"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'produk'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Katalog Produk & Kelola Stok"
                        >
                            <Store className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Promosi & Konten AI */}
                        <Link
                            href="/promosi"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'promosi'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Konten & Promosi Otomatis AI"
                        >
                            <Gift className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Modul Belajar UMKM */}
                        <Link
                            href="/belajar"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'belajar'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Pojok Belajar & Literasi Bisnis"
                        >
                            <GraduationCap className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Tanya Mentor & Forum */}
                        <Link
                            href="/bantuan"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'bantuan'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Bantuan & Konsultasi Mentor"
                        >
                            <Users className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Pengaturan Akun */}
                        <Link
                            href="/pengaturan"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                current === 'pengaturan'
                                    ? 'bg-purple-100/80 text-[#8b5cf6] font-bold'
                                    : 'text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6]'
                            }`}
                            title="Profil Usaha & Pengaturan"
                        >
                            <Settings className="h-[18px] w-[18px]" />
                        </Link>
                    </nav>
                </div>

                {/* Bottom Action Icons */}
                <div className="flex flex-col items-center space-y-2.5">
                    {/* Mode Gelap / Terang Toggle */}
                    <button
                        type="button"
                        onClick={toggleDarkMode}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 transition"
                        title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                        aria-label="Toggle Mode Gelap"
                    >
                        {isDarkMode ? (
                            <Sun className="h-[18px] w-[18px] text-amber-500" />
                        ) : (
                            <Moon className="h-[18px] w-[18px]" />
                        )}
                    </button>

                    {/* Asisten AI / Analisis Quick Link */}
                    <Link
                        href="/analisis"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-purple-50 hover:text-[#8b5cf6] transition"
                        title="Asisten Analisis Usaha AI"
                        aria-label="Asisten Analisis Usaha AI"
                    >
                        <Bot className="h-[18px] w-[18px]" />
                    </Link>

                    {/* Tombol Keluar dengan Konfirmasi Nyata */}
                    <button
                        type="button"
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Keluar dari Akun"
                        aria-label="Keluar Akun"
                    >
                        <LogOut className="h-[18px] w-[18px]" />
                    </button>

                    {/* Avatar Toko */}
                    <div className="pt-1">
                        <Link
                            href="/pengaturan"
                            title={`Profil ${businessName} (Klik untuk Pengaturan)`}
                            aria-label={`Profil ${businessName}`}
                        >
                            <img
                                src={logoUrl}
                                onError={(e) => {
                                    e.currentTarget.src =
                                        'https://placehold.co/40x40/8b5cf6/ffffff?text=UMKM';
                                }}
                                alt={businessName}
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-purple-100 transition hover:ring-purple-400"
                            />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Backdrop Mobile ketika drawer Menu Usaha terbuka */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen && setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
                    aria-hidden="true"
                />
            )}

            {/* ================= SECONDARY MENU SIDEBAR (Static on Desktop/Tablet, Overlay Drawer on Mobile) ================= */}
            <aside
                id="secondarySidebar"
                className={`select-none flex-col justify-between overflow-y-auto border-r border-slate-100 bg-white px-3 py-4 print:hidden transition-all duration-200
                    fixed inset-y-0 left-0 w-64 shadow-2xl z-50 md:static md:w-56 md:shadow-none md:z-20
                    ${sidebarOpen ? 'flex' : 'hidden md:hidden'} md:flex`}
            >
                <div>
                    {/* Header Sidebar */}
                    <div className="mb-3 px-3 pt-0.5 flex items-center justify-between">
                        <h2 className="text-[14px] font-bold tracking-tight text-slate-800">
                            Menu Usaha
                        </h2>
                        {setSidebarOpen && (
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                                aria-label="Tutup Menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Navigation List */}
                    <ul className="space-y-1 text-[13px] font-medium text-slate-600">
                        {/* 1. Ringkasan Usaha */}
                        <li>
                            <Link
                                href="/dashboard"
                                className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 transition ${
                                    current === 'dashboard'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <BadgePercent
                                    className={`h-4 w-4 ${
                                        current === 'dashboard' ? 'stroke-[2.2]' : 'text-slate-400'
                                    }`}
                                />
                                <span>Ringkasan Usaha</span>
                            </Link>
                        </li>

                        {/* 2. Catat Transaksi Suara */}
                        <li>
                            <Link
                                href="/catat"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'catat'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <Mic
                                        className={`h-4 w-4 ${
                                            current === 'catat' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Catat Suara</span>
                                </div>
                                <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        current === 'catat'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-purple-50 text-purple-700'
                                    }`}
                                >
                                    Suara
                                </span>
                            </Link>
                        </li>

                        {/* 3. Catatan Kas & Keuangan */}
                        <li>
                            <Link
                                href="/keuangan"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'keuangan'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <Wallet
                                        className={`h-4 w-4 ${
                                            current === 'keuangan' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Catatan Kas</span>
                                </div>
                                <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        current === 'keuangan'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-emerald-50 text-emerald-600'
                                    }`}
                                >
                                    {counts?.transactions ? `${counts.transactions}` : 'Hari Ini'}
                                </span>
                            </Link>
                        </li>

                        {/* 4. Laporan Laba Rugi */}
                        <li>
                            <Link
                                href="/laporan"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'laporan'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <LineChart
                                        className={`h-4 w-4 ${
                                            current === 'laporan' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Laporan Laba Rugi</span>
                                </div>
                                <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        current === 'laporan'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-blue-50 text-blue-600'
                                    }`}
                                >
                                    KUR
                                </span>
                            </Link>
                        </li>

                        {/* 5. Analisis Usaha AI */}
                        <li>
                            <Link
                                href="/analisis"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'analisis'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <TrendingUp
                                        className={`h-4 w-4 ${
                                            current === 'analisis' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Analisis Pasar</span>
                                </div>
                                <span
                                    className={`flex items-center space-x-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        current === 'analisis'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-purple-50 text-[#8b5cf6]'
                                    }`}
                                >
                                    <Sparkles className="h-2.5 w-2.5" />
                                    <span>AI</span>
                                </span>
                            </Link>
                        </li>

                        {/* 6. Produk & Stok */}
                        <li>
                            <Link
                                href="/produk"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'produk'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <Store
                                        className={`h-4 w-4 ${
                                            current === 'produk' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Produk & Stok</span>
                                </div>
                                <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        current === 'produk'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-purple-50 text-purple-600'
                                    }`}
                                >
                                    {counts?.products !== undefined ? `${counts.products}` : 'Kelola'}
                                </span>
                            </Link>
                        </li>

                        {/* 7. Konten & Promosi */}
                        <li>
                            <Link
                                href="/promosi"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'promosi'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <Gift
                                        className={`h-4 w-4 ${
                                            current === 'promosi' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Konten & Promo</span>
                                </div>
                                <span
                                    className={`flex items-center space-x-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        current === 'promosi'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-purple-50 text-[#8b5cf6]'
                                    }`}
                                >
                                    <Sparkles className="h-2.5 w-2.5" />
                                    <span>AI</span>
                                </span>
                            </Link>
                        </li>

                        {/* 8. Pesanan Masuk (Buka Modal Pesanan Interaktif) */}
                        <li>
                            <button
                                type="button"
                                onClick={() => setIsOrdersModalOpen(true)}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-600 transition hover:bg-pink-50 hover:text-pink-600"
                            >
                                <div className="flex items-center space-x-2.5">
                                    <ShoppingCart className="h-4 w-4 text-slate-400" />
                                    <span>Pesanan</span>
                                </div>
                                {activeOrderCount > 0 ? (
                                    <span className="rounded bg-pink-50 px-1.5 py-0.5 text-[10px] font-bold text-pink-600">
                                        {activeOrderCount} Baru
                                    </span>
                                ) : (
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                        Selesai
                                    </span>
                                )}
                            </button>
                        </li>

                        {/* 9. Pojok Belajar */}
                        <li>
                            <Link
                                href="/belajar"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'belajar'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <BookOpen
                                        className={`h-4 w-4 ${
                                            current === 'belajar' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Pojok Belajar</span>
                                </div>
                                <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        current === 'belajar'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-amber-50 text-amber-600'
                                    }`}
                                >
                                    {counts?.modules || '1 Modul'}
                                </span>
                            </Link>
                        </li>

                        {/* 10. Tanya Mentor */}
                        <li>
                            <Link
                                href="/bantuan"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'bantuan'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <Users
                                        className={`h-4 w-4 ${
                                            current === 'bantuan' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Tanya Mentor</span>
                                </div>
                                {counts?.tasks && counts.tasks > 0 ? (
                                    <span
                                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                            current === 'bantuan'
                                                ? 'bg-white/20 text-white'
                                                : 'bg-emerald-50 text-emerald-600'
                                        }`}
                                    >
                                        {counts.tasks} Tugas
                                    </span>
                                ) : null}
                            </Link>
                        </li>

                        {/* 11. Pengaturan Akun */}
                        <li>
                            <Link
                                href="/pengaturan"
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition ${
                                    current === 'pengaturan'
                                        ? 'bg-[#8b5cf6] font-semibold text-white shadow-sm shadow-purple-200'
                                        : 'hover:bg-purple-50 hover:text-[#8b5cf6]'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <Settings
                                        className={`h-4 w-4 ${
                                            current === 'pengaturan' ? 'stroke-[2.2]' : 'text-slate-400'
                                        }`}
                                    />
                                    <span>Pengaturan</span>
                                </div>
                            </Link>
                        </li>

                        {/* 12. Profil Toko (Etalase Publik) */}
                        <li>
                            <Link
                                href="/etalase"
                                target="_blank"
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-600 transition hover:bg-purple-50 hover:text-[#8b5cf6]"
                            >
                                <div className="flex items-center space-x-2.5">
                                    <Store className="h-4 w-4 text-slate-400" />
                                    <span>Etalase Toko</span>
                                </div>
                                <ExternalLink className="h-3 w-3 text-slate-400" />
                            </Link>
                        </li>

                        {/* 13. Pasang Aplikasi PWA */}
                        {!isPwaInstalled && (
                            <li>
                                <button
                                    type="button"
                                    onClick={handleInstallPwa}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-violet-700 bg-violet-50/80 hover:bg-violet-100 font-semibold transition cursor-pointer"
                                    title="Pasang Aplikasi LAPAK di HP atau Laptop"
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <Smartphone className="h-4 w-4 text-violet-600" />
                                        <span>Install Aplikasi (PWA)</span>
                                    </div>
                                    <span className="rounded bg-violet-200/90 px-1.5 py-0.5 text-[9px] font-extrabold text-violet-800">
                                        PWA
                                    </span>
                                </button>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Bottom Custom Widget / Default Quick Etalase Widget */}
                {customWidget ? (
                    <div className="mt-4">{customWidget}</div>
                ) : (
                    <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50/70 p-3 text-xs">
                        <p className="mb-1 font-bold text-purple-900">Toko Online Aktif</p>
                        <p className="mb-2 text-[11px] leading-relaxed text-purple-700">
                            Bagikan tautan tokomu ke pelanggan untuk terima order via WhatsApp.
                        </p>
                        <Link
                            href="/etalase"
                            target="_blank"
                            className="inline-flex w-full items-center justify-center space-x-1.5 rounded-lg bg-[#8b5cf6] py-1.5 font-semibold text-white transition hover:bg-purple-700 shadow-sm"
                        >
                            <span>Buka Etalase</span>
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </aside>

            {/* ================= MODAL PESANAN MASUK (INTERAKTIF & NYATA) ================= */}
            {isOrdersModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-pesanan-title"
                >
                    <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3
                                    id="modal-pesanan-title"
                                    className="text-lg font-bold text-slate-900 flex items-center gap-2"
                                >
                                    <ShoppingCart className="h-5 w-5 text-[#8b5cf6]" />
                                    <span>Pesanan Masuk</span>
                                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-700">
                                        {activeOrderCount} Aktif
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pesanan dari etalase publik dan tautan WhatsApp usahamu.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOrdersModalOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                                aria-label="Tutup Dialog"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Order List */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-3">
                            {orders.map((ord) => (
                                <div
                                    key={ord.id}
                                    className={`p-3.5 rounded-xl border transition ${
                                        ord.status === 'selesai'
                                            ? 'bg-slate-50 border-slate-200 opacity-60'
                                            : ord.status === 'menunggu'
                                            ? 'bg-amber-50/50 border-amber-200'
                                            : 'bg-white border-slate-200 shadow-xs'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-slate-900">
                                                    {ord.customerName}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-mono">
                                                    {ord.id}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-purple-700 mt-0.5">
                                                {ord.items}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{ord.timeAgo} • {ord.address}</span>
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="font-bold text-xs text-slate-900 block">
                                                {formatRp(ord.total)}
                                            </span>
                                            <span
                                                className={`inline-block mt-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                                                    ord.status === 'selesai'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : ord.status === 'menunggu'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {ord.status === 'selesai'
                                                    ? 'Selesai'
                                                    : ord.status === 'menunggu'
                                                    ? 'Menunggu'
                                                    : ord.status === 'diproses'
                                                    ? 'Disiapkan'
                                                    : 'Siap Kirim'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons Per Order */}
                                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <a
                                            href={`https://wa.me/${ord.phone}?text=${encodeURIComponent(
                                                `Halo ${ord.customerName}, terima kasih sudah memesan di ${businessName}! Pesanan Anda (${ord.items}) sedang kami proses.`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            <span>Hubungi WA</span>
                                        </a>

                                        <div className="flex items-center gap-1.5">
                                            {ord.status !== 'selesai' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => updateOrderStatus(ord.id, 'selesai')}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                                >
                                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                    <span>Tandai Selesai</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => updateOrderStatus(ord.id, 'menunggu')}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                                                >
                                                    <span>Buka Kembali</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                            <Link
                                href="/etalase"
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900"
                            >
                                <span>Lihat Etalase Toko</span>
                                <ExternalLink className="h-3 w-3" />
                            </Link>

                            <button
                                type="button"
                                onClick={() => setIsOrdersModalOpen(false)}
                                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL KONFIRMASI KELUAR ================= */}
            {isLogoutModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="modal-logout-title"
                >
                    <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                            <LogOut className="h-6 w-6" />
                        </div>

                        <h3
                            id="modal-logout-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            Konfirmasi Keluar Akun
                        </h3>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            Apakah Anda yakin ingin keluar dari akun LAPAK? Seluruh catatan kas dan data usahamu tersimpan aman.
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(false)}
                                disabled={isLoggingOut}
                                className="w-1/2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLogout}
                                disabled={isLoggingOut}
                                className="w-1/2 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-sm disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Mengeluarkan...' : 'Ya, Keluar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Mobile Bottom Navigation Bar (< 768px) - untuk navigasi praktis jempol di HP */}
            {current !== 'catat' && (
                <div className="fixed bottom-3 left-4 right-4 z-30 md:hidden print:hidden select-none">
                    <nav className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-950/10 border border-slate-200/80 px-2 py-1.5 flex items-center justify-around">
                        {/* 1. Ringkasan Usaha (Home) */}
                        <Link
                            href="/dashboard"
                            className={`flex flex-col items-center justify-center py-1 px-2.5 transition ${
                                current === 'dashboard'
                                    ? 'text-[#7C4DFF] font-bold'
                                    : 'text-slate-500 hover:text-[#7C4DFF]'
                            }`}
                            title="Ringkasan Usaha"
                        >
                            <Home className={`w-5 h-5 ${current === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
                            <span className="text-[10px] tracking-tight mt-0.5">Beranda</span>
                        </Link>

                        {/* 2. Laporan / Keuangan */}
                        <Link
                            href="/keuangan"
                            className={`flex flex-col items-center justify-center py-1 px-2.5 transition ${
                                current === 'keuangan' || current === 'laporan'
                                    ? 'text-[#7C4DFF] font-bold'
                                    : 'text-slate-500 hover:text-[#7C4DFF]'
                            }`}
                            title="Laporan Kas"
                        >
                            <LineChart className={`w-5 h-5 ${current === 'keuangan' || current === 'laporan' ? 'stroke-[2.5]' : ''}`} />
                            <span className="text-[10px] tracking-tight mt-0.5">Keuangan</span>
                        </Link>

                        {/* 3. Tombol Tengah Menonjol: Catat Suara */}
                        <Link
                            href="/catat"
                            className="w-11 h-11 -mt-4 rounded-2xl bg-gradient-to-tr from-[#7C4DFF] to-[#9D4EDD] text-white flex items-center justify-center shadow-lg shadow-purple-500/40 ring-4 ring-white active:scale-95 transition"
                            title="Catat Transaksi Suara"
                        >
                            <Mic className="w-5 h-5" />
                        </Link>

                        {/* 4. Konsultasi / Asisten AI */}
                        <Link
                            href="/bantuan"
                            className={`flex flex-col items-center justify-center py-1 px-2.5 transition ${
                                current === 'bantuan'
                                    ? 'text-[#7C4DFF] font-bold'
                                    : 'text-slate-500 hover:text-[#7C4DFF]'
                            }`}
                            title="Konsultasi & Mentor"
                        >
                            <MessageCircle className={`w-5 h-5 ${current === 'bantuan' ? 'stroke-[2.5]' : ''}`} />
                            <span className="text-[10px] tracking-tight mt-0.5">Konsultasi</span>
                        </Link>

                        {/* 5. Toko / Pengaturan */}
                        <Link
                            href="/pengaturan"
                            className={`flex flex-col items-center justify-center py-1 px-2.5 transition ${
                                current === 'pengaturan'
                                    ? 'text-[#7C4DFF] font-bold'
                                    : 'text-slate-500 hover:text-[#7C4DFF]'
                            }`}
                            title="Pengaturan Usaha"
                        >
                            <Settings className={`w-5 h-5 ${current === 'pengaturan' ? 'stroke-[2.5]' : ''}`} />
                            <span className="text-[10px] tracking-tight mt-0.5">Pengaturan</span>
                        </Link>
                    </nav>
                </div>
            )}

            {/* Floating AI Voice Assistant Button (Melayang di pojok kanan bawah, naik di mobile agar tidak menimpa bottom bar) */}
            <div className={`fixed ${current !== 'catat' ? 'bottom-20 right-4 md:bottom-6 md:right-6' : 'bottom-6 right-6'} z-40 flex items-center group`}>
                {/* Tooltip on hover */}
                <div className="absolute right-full mr-3 hidden sm:flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap backdrop-blur-xs flex items-center gap-1.5 border border-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Panduan Bicara Perintah Suara (AI Voice)</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setIsVoiceModalOpen(true);
                        setActiveSampleText(null);
                        setVoiceFeedback(null);
                    }}
                    aria-label="Panduan Perintah Suara"
                    className="relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-3.5 py-3 md:px-4 md:py-3 text-white shadow-xl shadow-violet-500/35 ring-4 ring-white hover:scale-105 hover:shadow-2xl hover:shadow-violet-600/40 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    {/* Pulsing online/ready indicator */}
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                    </span>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
                        <Mic className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <div className="hidden sm:flex flex-col text-left pr-1">
                        <span className="text-[10px] font-medium text-violet-200 leading-none">Asisten Suara</span>
                        <span className="text-xs font-bold leading-tight">Bicara Kasir</span>
                    </div>
                </button>
            </div>

            {/* Modal Panduan & Simulasi Suara Interaktif (Pop-up Asisten Suara Kontekstual) */}
            {isVoiceModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-voice-guide-title"
                >
                    <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header Gradient */}
                        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-5 text-white relative">
                            <button
                                type="button"
                                onClick={() => setIsVoiceModalOpen(false)}
                                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                                aria-label="Tutup"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-white ring-2 ring-white/30">
                                    <Mic className="h-6 w-6 animate-pulse" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200 uppercase tracking-wider border border-emerald-400/30">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                            AI Voice Ready
                                        </span>
                                        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium text-purple-100">
                                            {voiceGuide.pageBadge}
                                        </span>
                                    </div>
                                    <h3 id="modal-voice-guide-title" className="text-base sm:text-lg font-bold text-white mt-1">
                                        Asisten Suara: {voiceGuide.pageTitle}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            {/* Petunjuk Konteks Halaman */}
                            <div className="rounded-2xl bg-violet-50/80 border border-violet-100 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div className="text-xs text-slate-700 leading-relaxed">
                                        <p className="font-semibold text-violet-950 mb-0.5">
                                            Bicara Bebas dengan Bahasa Sehari-hari
                                        </p>
                                        <p className="text-slate-600">
                                            {voiceGuide.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Daftar Contoh Perintah Suara yang Bisa Diklik */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                                    Contoh Perintah Suara di Halaman Ini (Klik untuk Coba):
                                </label>
                                <div className="space-y-2">
                                    {voiceGuide.examples.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSimulatePrompt(item)}
                                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 group cursor-pointer ${
                                                activeSampleText === item.text
                                                    ? 'border-violet-600 bg-violet-50/70 shadow-xs ring-1 ring-violet-600/30'
                                                    : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-[10px]">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-medium text-slate-800 leading-snug">
                                                    {item.text}
                                                </span>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-violet-600 opacity-80 group-hover:opacity-100">
                                                <Volume2 className="h-3.5 w-3.5" />
                                                <span>Uji</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Simulasi Suara & Balasan AI */}
                            {(isSimulatingSpeech || voiceFeedback) && (
                                <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50/50 to-white p-4 space-y-3 animate-in fade-in duration-200">
                                    {/* Speech Bubble / Waveform */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white">
                                            <Mic className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block">
                                                Input Suara Terdeteksi
                                            </span>
                                            <p className="text-xs font-semibold text-slate-900 italic">
                                                "{activeSampleText}"
                                            </p>
                                        </div>
                                    </div>

                                    {isSimulatingSpeech ? (
                                        <div className="flex items-center justify-center gap-1.5 py-2">
                                            <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="h-3 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="h-4 w-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            <div className="h-3 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '450ms' }} />
                                            <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '600ms' }} />
                                            <span className="text-xs font-medium text-violet-700 ml-2">Menganalisis audio dengan Gemini AI...</span>
                                        </div>
                                    ) : voiceFeedback ? (
                                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-start gap-2.5 animate-in fade-in duration-150">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div className="space-y-0.5">
                                                <span className="font-bold text-[11px] text-emerald-800">
                                                    Respon AI Kasir:
                                                </span>
                                                <p className="leading-relaxed">
                                                    {voiceFeedback}
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Tombol aksi cepat */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                                <Link
                                    href="/catat"
                                    onClick={() => setIsVoiceModalOpen(false)}
                                    className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 px-4 shadow-sm transition"
                                >
                                    <span>Buka Menu Rekam Suara Kasir</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setIsVoiceModalOpen(false)}
                                    className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-5 transition cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
