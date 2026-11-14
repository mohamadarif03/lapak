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

    useEffect(() => {
        const savedTheme = localStorage.getItem('lapak_theme');
        const isDark =
            savedTheme === 'dark' ||
            document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
    }, []);

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

            {/* ================= FAR-LEFT ICON SIDEBAR ================= */}
            <aside className="z-20 flex w-16 shrink-0 select-none flex-col items-center justify-between border-r border-slate-100 bg-white py-4 print:hidden">
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

            {/* ================= SECONDARY MENU SIDEBAR ================= */}
            <aside
                id="secondarySidebar"
                className={`w-56 shrink-0 select-none flex-col justify-between overflow-y-auto border-r border-slate-100 bg-white px-3 py-4 print:hidden ${
                    sidebarOpen ? 'flex' : 'hidden'
                } lg:flex`}
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

            {/* Floating AI Voice Assistant Button (Melayang di pojok kanan bawah) */}
            <div className="fixed bottom-6 right-6 z-40 flex items-center group">
                {/* Tooltip on hover */}
                <div className="absolute right-full mr-3 hidden sm:flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap backdrop-blur-xs flex items-center gap-1.5 border border-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Bicara untuk Catat Transaksi (AI Voice)</span>
                    </div>
                </div>

                <Link
                    href="/catat"
                    aria-label="Catat Transaksi Suara"
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
                </Link>
            </div>
        </>
    );
}
