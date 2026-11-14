import { Head, Link } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import {
    AlignLeft,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BadgePercent,
    Bell,
    BookOpen,
    Bot,
    CalendarCheck,
    Check,
    CheckCircle2,
    Clock,
    Contact2,
    FileText,
    Gift,
    GraduationCap,
    Home,
    Lightbulb,
    LineChart,
    LogOut,
    Maximize,
    MinusCircle,
    Moon,
    PackagePlus,
    Plus,
    PlusCircle,
    Search,
    Share2,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    Store,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppSidebar from '@/Components/AppSidebar';

// =========================================================================
// DATA DUMMY REALISTIS UMKM (Dipisahkan agar mudah diganti integrasi API)
// =========================================================================

type PeriodType = 'Hari ini' | 'Minggu ini' | 'Bulan ini';

interface FinancialMetric {
    uangMasuk: number;
    uangMasukDiff: number; // persentase naik/turun
    uangKeluar: number;
    uangKeluarDiff: number;
    laba: number;
    labaDiff: number;
    saldoKas: number;
    periodeText: string;
}

interface BestSellerProduct {
    id: number;
    name: string;
    soldCount: number;
    maxSold: number;
    image: string;
    price: number;
}

interface ReminderItem {
    id: number;
    time: string;
    title: string;
    description: string;
    actionText: string;
    actionUrl: string;
    icon: 'share' | 'receipt' | 'book' | 'mentor';
    isUrgent?: boolean;
}

interface ProfileChecklist {
    id: string;
    label: string;
    done: boolean;
}

// Data Dummy Finansial berdasarkan Periode
const dummyFinancialData: Record<PeriodType, FinancialMetric> = {
    'Hari ini': {
        uangMasuk: 1450000,
        uangMasukDiff: 15,
        uangKeluar: 320000,
        uangKeluarDiff: -8,
        laba: 1130000,
        labaDiff: 24,
        saldoKas: 8750000,
        periodeText: 'dari kemarin',
    },
    'Minggu ini': {
        uangMasuk: 9850000,
        uangMasukDiff: 12,
        uangKeluar: 4200000,
        uangKeluarDiff: 5,
        laba: 5650000,
        labaDiff: 18,
        saldoKas: 8750000,
        periodeText: 'dari minggu lalu',
    },
    'Bulan ini': {
        uangMasuk: 38600000,
        uangMasukDiff: 21,
        uangKeluar: 18450000,
        uangKeluarDiff: 10,
        laba: 20150000,
        labaDiff: 33,
        saldoKas: 8750000,
        periodeText: 'dari bulan lalu',
    },
};

// Data Dummy Chart Tren Penjualan
const dummyTrendChartData: Record<
    PeriodType,
    { labels: string[]; current: number[]; previous: number[]; unit: string }
> = {
    'Hari ini': {
        labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        current: [120, 280, 450, 210, 310, 490, 220],
        previous: [90, 220, 380, 260, 250, 410, 180],
        unit: 'ribu Rp',
    },
    'Minggu ini': {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        current: [1150, 1300, 980, 1420, 1680, 2100, 1220],
        previous: [950, 1100, 1050, 1200, 1500, 1850, 1120],
        unit: 'ribu Rp',
    },
    'Bulan ini': {
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
        current: [8400, 9600, 10200, 10400],
        previous: [7200, 7800, 8500, 8400],
        unit: 'ribu Rp',
    },
};

// Data Dummy Komposisi Pengeluaran
const dummyExpenseComposition: Record<
    PeriodType,
    {
        categories: string[];
        values: number[];
        percentages: number[];
        colors: string[];
    }
> = {
    'Hari ini': {
        categories: ['Bahan Baku', 'Transportasi', 'Listrik & Gas', 'Lainnya'],
        values: [210000, 50000, 35000, 25000],
        percentages: [66, 16, 11, 7],
        colors: ['#8b5cf6', '#ec4899', '#f59e0b', '#94a3b8'],
    },
    'Minggu ini': {
        categories: [
            'Bahan Baku',
            'Gaji Karyawan',
            'Listrik & Air',
            'Transportasi',
            'Lainnya',
        ],
        values: [2180000, 920000, 460000, 380000, 260000],
        percentages: [52, 22, 11, 9, 6],
        colors: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#94a3b8'],
    },
    'Bulan ini': {
        categories: [
            'Bahan Baku',
            'Gaji Karyawan',
            'Sewa & Listrik',
            'Transportasi',
            'Lainnya',
        ],
        values: [8850000, 4600000, 2200000, 1500000, 1300000],
        percentages: [48, 25, 12, 8, 7],
        colors: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#94a3b8'],
    },
};

// Data Dummy Pemasukan vs Pengeluaran (Bar Berkelompok)
const dummyCashFlowData: Record<
    PeriodType,
    { labels: string[]; masuk: number[]; keluar: number[] }
> = {
    'Hari ini': {
        labels: ['Pagi', 'Siang', 'Sore', 'Malam'],
        masuk: [400, 450, 310, 290],
        keluar: [180, 80, 40, 20],
    },
    'Minggu ini': {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        masuk: [1150, 1300, 980, 1420, 1680, 2100, 1220],
        keluar: [520, 480, 610, 590, 720, 850, 430],
    },
    'Bulan ini': {
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
        masuk: [8400, 9600, 10200, 10400],
        keluar: [4100, 4300, 4800, 5250],
    },
};

// Data Dummy Produk Terlaris UMKM
const dummyBestSellers: BestSellerProduct[] = [
    {
        id: 1,
        name: 'Sambal Bawang Spesial 150g',
        soldCount: 142,
        maxSold: 150,
        price: 25000,
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=100&auto=format&fit=crop&q=80',
    },
    {
        id: 2,
        name: 'Keripik Tempe Renyah Daun Jeruk',
        soldCount: 98,
        maxSold: 150,
        price: 18000,
        image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=100&auto=format&fit=crop&q=80',
    },
    {
        id: 3,
        name: 'Rendang Daging Sapi Suwir 200g',
        soldCount: 84,
        maxSold: 150,
        price: 48000,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80',
    },
    {
        id: 4,
        name: 'Peyek Kacang Gurih Renyah',
        soldCount: 67,
        maxSold: 150,
        price: 15000,
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=100&auto=format&fit=crop&q=80',
    },
    {
        id: 5,
        name: 'Dendeng Balado Basah 250g',
        soldCount: 53,
        maxSold: 150,
        price: 55000,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&auto=format&fit=crop&q=80',
    },
];

// Data Dummy Pengingat Hari Ini
const dummyReminders: ReminderItem[] = [
    {
        id: 1,
        time: '09:00 WIB',
        title: 'Jadwal posting konten promosi',
        description:
            'Waktu terbaik unggah foto produk di WhatsApp Story & Instagram.',
        actionText: 'Buka Draf',
        actionUrl: '#',
        icon: 'share',
    },
    {
        id: 2,
        time: '12:30 WIB',
        title: 'Belum mencatat transaksi siang ini',
        description:
            'Ada 3 pesanan masuk lewat WhatsApp yang belum tercatat di kas.',
        actionText: 'Catat Sekarang',
        actionUrl: '#',
        icon: 'receipt',
        isUrgent: true,
    },
    {
        id: 3,
        time: '15:00 WIB',
        title: 'Lanjut modul belajar UMKM',
        description:
            'Tersisa 1 video: "Trik Foto Produk Menarik Hanya Pakai HP".',
        actionText: 'Lanjutkan',
        actionUrl: '#',
        icon: 'book',
    },
    {
        id: 4,
        time: '19:30 WIB',
        title: 'Jadwal konsultasi mentor bisnis',
        description:
            'Sesi tanya jawab 30 menit bersama Mentor Pak Budi via Zoom.',
        actionText: 'Masuk Ruang',
        actionUrl: '#',
        icon: 'mentor',
    },
];

// Data Dummy Kelengkapan Usaha
const initialProfileChecklist: ProfileChecklist[] = [
    { id: '1', label: 'Logo dan kontak usaha terisi lengkap', done: true },
    {
        id: '2',
        label: 'Minimal 5 produk terdaftar dengan foto menarik',
        done: true,
    },
    {
        id: '3',
        label: 'Semua produk memiliki harga dan deskripsi jelas',
        done: true,
    },
    {
        id: '4',
        label: 'Tombol pemesanan via WhatsApp sudah aktif',
        done: false,
    },
    {
        id: '5',
        label: 'Sudah mencatat transaksi penjualan pertama',
        done: false,
    },
];

// Format Rupiah pembantu (Indonesian Rupiah helper)
const formatRupiah = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
};

export default function Dashboard() {
    // State Shell
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // State Konten Utama Dashboard UMKM
    const [selectedPeriod, setSelectedPeriod] =
        useState<PeriodType>('Minggu ini');
    const [isEmptyData, setIsEmptyData] = useState<boolean>(false); // Mode simulasi pengguna baru
    const [checklist, setChecklist] = useState<ProfileChecklist[]>(
        initialProfileChecklist,
    );

    // Canvas Chart Refs
    const trendChartRef = useRef<HTMLCanvasElement | null>(null);
    const donutChartRef = useRef<HTMLCanvasElement | null>(null);
    const cashFlowChartRef = useRef<HTMLCanvasElement | null>(null);

    // Chart.js Instances
    const trendChartInstance = useRef<Chart | null>(null);
    const donutChartInstance = useRef<Chart | null>(null);
    const cashFlowChartInstance = useRef<Chart | null>(null);

    // Toggle checklist kelengkapan usaha
    const handleToggleChecklist = (id: string) => {
        setChecklist((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, done: !item.done } : item,
            ),
        );
    };

    // Hitung persentase kelengkapan profil usaha
    const completedCount = checklist.filter((item) => item.done).length;
    const profileCompleteness = Math.round(
        (completedCount / checklist.length) * 100,
    );

    // Fullscreen API Helper
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    // Update dan render Chart.js secara dinamis saat periode berubah
    useEffect(() => {
        if (isEmptyData) {
            // Hancurkan chart jika sedang di mode empty state
            if (trendChartInstance.current)
                trendChartInstance.current.destroy();
            if (donutChartInstance.current)
                donutChartInstance.current.destroy();
            if (cashFlowChartInstance.current)
                cashFlowChartInstance.current.destroy();
            return;
        }

        // 1. Chart Tren Penjualan (Line Chart Area)
        if (trendChartRef.current) {
            if (trendChartInstance.current) {
                trendChartInstance.current.destroy();
            }

            const ctx = trendChartRef.current.getContext('2d');
            const data = dummyTrendChartData[selectedPeriod];

            if (ctx) {
                trendChartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: `${selectedPeriod}`,
                                data: data.current,
                                borderColor: '#8b5cf6',
                                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                                fill: true,
                                tension: 0.4,
                                borderWidth: 2.5,
                                pointBackgroundColor: '#8b5cf6',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                            },
                            {
                                label: 'Periode Lalu',
                                data: data.previous,
                                borderColor: '#94a3b8',
                                backgroundColor: 'transparent',
                                borderDash: [5, 5],
                                tension: 0.4,
                                borderWidth: 1.8,
                                pointRadius: 0,
                                pointHoverRadius: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                padding: 10,
                                cornerRadius: 8,
                                titleFont: {
                                    family: "'Plus Jakarta Sans', sans-serif",
                                    size: 12,
                                },
                                bodyFont: {
                                    family: "'Plus Jakarta Sans', sans-serif",
                                    size: 11,
                                },
                                callbacks: {
                                    label: function (context) {
                                        const raw =
                                            (context.raw as number) * 1000;
                                        return ` ${context.dataset.label}: ${formatRupiah(raw)}`;
                                    },
                                },
                            },
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: '#64748b',
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        size: 11,
                                    },
                                },
                                border: { display: false },
                            },
                            y: {
                                grid: {
                                    color: '#f1f5f9',
                                },
                                ticks: {
                                    color: '#64748b',
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        size: 10,
                                    },
                                    callback: function (val) {
                                        return val + ' rb';
                                    },
                                },
                                border: { display: false },
                            },
                        },
                    },
                });
            }
        }

        // 2. Chart Komposisi Pengeluaran (Donut Chart)
        if (donutChartRef.current) {
            if (donutChartInstance.current) {
                donutChartInstance.current.destroy();
            }

            const ctx = donutChartRef.current.getContext('2d');
            const data = dummyExpenseComposition[selectedPeriod];

            if (ctx) {
                donutChartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: data.categories,
                        datasets: [
                            {
                                data: data.values,
                                backgroundColor: data.colors,
                                borderWidth: 2,
                                borderColor: '#ffffff',
                                hoverOffset: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '72%',
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                padding: 10,
                                cornerRadius: 8,
                                titleFont: {
                                    family: "'Plus Jakarta Sans', sans-serif",
                                    size: 12,
                                },
                                bodyFont: {
                                    family: "'Plus Jakarta Sans', sans-serif",
                                    size: 11,
                                },
                                callbacks: {
                                    label: function (context) {
                                        const val = context.raw as number;
                                        const total = (
                                            context.dataset.data as number[]
                                        ).reduce((a, b) => a + b, 0);
                                        const pct = Math.round(
                                            (val / total) * 100,
                                        );
                                        return ` ${context.label}: ${formatRupiah(val)} (${pct}%)`;
                                    },
                                },
                            },
                        },
                    },
                });
            }
        }

        // 3. Chart Pemasukan vs Pengeluaran (Grouped Bar Chart)
        if (cashFlowChartRef.current) {
            if (cashFlowChartInstance.current) {
                cashFlowChartInstance.current.destroy();
            }

            const ctx = cashFlowChartRef.current.getContext('2d');
            const data = dummyCashFlowData[selectedPeriod];

            if (ctx) {
                cashFlowChartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: 'Uang Masuk',
                                data: data.masuk,
                                backgroundColor: '#10b981',
                                borderRadius: 6,
                                barPercentage: 0.6,
                                categoryPercentage: 0.7,
                            },
                            {
                                label: 'Uang Keluar',
                                data: data.keluar,
                                backgroundColor: '#ec4899',
                                borderRadius: 6,
                                barPercentage: 0.6,
                                categoryPercentage: 0.7,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                padding: 10,
                                cornerRadius: 8,
                                titleFont: {
                                    family: "'Plus Jakarta Sans', sans-serif",
                                    size: 12,
                                },
                                bodyFont: {
                                    family: "'Plus Jakarta Sans', sans-serif",
                                    size: 11,
                                },
                                callbacks: {
                                    label: function (context) {
                                        const raw =
                                            (context.raw as number) * 1000;
                                        return ` ${context.dataset.label}: ${formatRupiah(raw)}`;
                                    },
                                },
                            },
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: '#64748b',
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        size: 11,
                                    },
                                },
                                border: { display: false },
                            },
                            y: {
                                grid: {
                                    color: '#f1f5f9',
                                },
                                ticks: {
                                    color: '#64748b',
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        size: 10,
                                    },
                                    callback: function (val) {
                                        return val + ' rb';
                                    },
                                },
                                border: { display: false },
                            },
                        },
                    },
                });
            }
        }

        return () => {
            if (trendChartInstance.current)
                trendChartInstance.current.destroy();
            if (donutChartInstance.current)
                donutChartInstance.current.destroy();
            if (cashFlowChartInstance.current)
                cashFlowChartInstance.current.destroy();
        };
    }, [selectedPeriod, isEmptyData]);

    const activeFinances = dummyFinancialData[selectedPeriod];
    const activeExpenseData = dummyExpenseComposition[selectedPeriod];

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb] font-sans text-slate-700 antialiased">
            <Head title="Dashboard UMKM - Lapak Digital" />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="flex h-screen overflow-hidden">
                <AppSidebar
                    current="dashboard"
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    onShowToast={showToast}
                    customWidget={
                        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                            <p className="mb-1 font-semibold text-slate-600">
                                Simulasi Data:
                            </p>
                            <div className="flex items-center justify-between gap-1">
                                <button
                                    onClick={() => setIsEmptyData(false)}
                                    className={`flex-1 rounded-md py-1.5 font-medium transition ${
                                        !isEmptyData
                                            ? 'shadow-xs bg-[#8b5cf6] text-white'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    Berjalan
                                </button>
                                <button
                                    onClick={() => setIsEmptyData(true)}
                                    className={`flex-1 rounded-md py-1.5 font-medium transition ${
                                        isEmptyData
                                            ? 'shadow-xs bg-[#8b5cf6] text-white'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    Toko Baru
                                </button>
                            </div>
                        </div>
                    }
                />

                {/* ================= MAIN CONTENT AREA ================= */}
                <div className="flex h-screen flex-1 flex-col overflow-hidden">
                    {/* TOP NAVBAR (DIPERTAHANKAN SESUAI TEMPLATE) */}
                    <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
                        {/* Left: Menu toggle & Search */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <button
                                id="toggleSidebarBtn"
                                onClick={() => setSidebarOpen((prev) => !prev)}
                                className="rounded-lg p-1 text-slate-500 hover:text-slate-800"
                                title="Buka/Tutup Menu"
                            >
                                <AlignLeft className="h-5 w-5" />
                            </button>
                            <div className="relative w-48 sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Cari transaksi, produk, catatan..."
                                    className="w-full rounded-lg border border-slate-200/80 bg-slate-50/70 py-1.5 pl-3.5 pr-9 text-xs text-slate-700 placeholder-slate-400 transition focus:border-purple-400 focus:bg-white focus:outline-none"
                                />
                                <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        {/* Right: Utility Icons */}
                        <div className="flex items-center space-x-2 sm:space-x-2.5">
                            {/* Notifikasi Pengingat Usaha */}
                            <button
                                className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 text-slate-600 transition hover:bg-slate-50"
                                title="Pengingat Hari Ini"
                            >
                                <Bell className="h-4 w-4" />
                                <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-white"></span>
                            </button>

                            {/* Fullscreen */}
                            <button
                                id="fullscreenBtn"
                                onClick={toggleFullscreen}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 text-slate-600 transition hover:bg-slate-50"
                                title="Layar Penuh"
                            >
                                <Maximize className="h-4 w-4" />
                            </button>

                            {/* User Profile Avatar */}
                            <div className="flex items-center space-x-2 pl-1">
                                <img
                                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            'https://placehold.co/32x32/8b5cf6/ffffff?text=BS';
                                    }}
                                    alt="Ibu Siti"
                                    className="h-7 w-7 rounded-full border border-slate-200 object-cover"
                                />
                                <span className="hidden text-xs font-semibold text-slate-700 md:inline-block">
                                    Ibu Siti
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* ================= SCROLLABLE DASHBOARD BODY ================= */}
                    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 pb-28 md:pb-6">
                        {/* -------------------------------------------------------------
                            BAGIAN 1: HEADER HALAMAN
                            - Sapaan nama pengguna & nama usaha
                            - Filter periode: Hari ini / Minggu ini / Bulan ini
                        ------------------------------------------------------------- */}
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                    Halo, Bu Siti 👋
                                </h1>
                                <p className="text-xs font-medium text-slate-500">
                                    Usaha:{' '}
                                    <span className="font-semibold text-purple-700">
                                        Dapur Bu Siti
                                    </span>{' '}
                                    • Pantau performa tokomu hari ini
                                </p>
                            </div>

                            {/* Filter Periode */}
                            <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                                <div className="shadow-2xs inline-flex rounded-lg border border-slate-200/80 bg-white p-1">
                                    {(
                                        [
                                            'Hari ini',
                                            'Minggu ini',
                                            'Bulan ini',
                                        ] as const
                                    ).map((period) => (
                                        <button
                                            key={period}
                                            onClick={() =>
                                                setSelectedPeriod(period)
                                            }
                                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                                selectedPeriod === period
                                                    ? 'shadow-2xs bg-[#8b5cf6] text-white'
                                                    : 'text-slate-600 hover:bg-purple-50/60 hover:text-[#8b5cf6]'
                                            }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* -------------------------------------------------------------
                            BAGIAN 2: KARTU RINGKASAN KEUANGAN (4 KARTU)
                            - Uang masuk, Uang keluar, Laba, Saldo kas usaha
                            - Layout: 4 kolom di desktop, 2x2 di mobile
                        ------------------------------------------------------------- */}
                        <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                            {/* Kartu 1: Uang Masuk */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-4">
                                <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#10b981]"></div>
                                <div className="pl-1.5">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Uang Masuk
                                        </p>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        {isEmptyData
                                            ? 'Rp 0'
                                            : formatRupiah(
                                                  activeFinances.uangMasuk,
                                              )}
                                    </h3>
                                    <div className="mt-1 flex items-center text-[11px] font-medium">
                                        {isEmptyData ? (
                                            <span className="text-slate-400">
                                                Belum ada pemasukan
                                            </span>
                                        ) : (
                                            <>
                                                <span className="mr-1 flex items-center font-semibold text-emerald-600">
                                                    <TrendingUp className="mr-0.5 h-3 w-3" />
                                                    naik{' '}
                                                    {
                                                        activeFinances.uangMasukDiff
                                                    }
                                                    %
                                                </span>
                                                <span className="text-slate-400">
                                                    {activeFinances.periodeText}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kartu 2: Uang Keluar */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-4">
                                <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-pink-500"></div>
                                <div className="pl-1.5">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Uang Keluar
                                        </p>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
                                            <ArrowDownRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        {isEmptyData
                                            ? 'Rp 0'
                                            : formatRupiah(
                                                  activeFinances.uangKeluar,
                                              )}
                                    </h3>
                                    <div className="mt-1 flex items-center text-[11px] font-medium">
                                        {isEmptyData ? (
                                            <span className="text-slate-400">
                                                Belum ada pengeluaran
                                            </span>
                                        ) : (
                                            <>
                                                <span
                                                    className={`mr-1 flex items-center font-semibold ${
                                                        activeFinances.uangKeluarDiff >
                                                        0
                                                            ? 'text-rose-500'
                                                            : 'text-emerald-600'
                                                    }`}
                                                >
                                                    {activeFinances.uangKeluarDiff >
                                                    0 ? (
                                                        <TrendingUp className="mr-0.5 h-3 w-3" />
                                                    ) : (
                                                        <TrendingDown className="mr-0.5 h-3 w-3" />
                                                    )}
                                                    {activeFinances.uangKeluarDiff >
                                                    0
                                                        ? 'naik'
                                                        : 'turun'}{' '}
                                                    {Math.abs(
                                                        activeFinances.uangKeluarDiff,
                                                    )}
                                                    %
                                                </span>
                                                <span className="text-slate-400">
                                                    {activeFinances.periodeText}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kartu 3: Laba (Uang Masuk - Keluar) */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-4">
                                <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#8b5cf6]"></div>
                                <div className="pl-1.5">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Laba Bersih
                                        </p>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        {isEmptyData
                                            ? 'Rp 0'
                                            : formatRupiah(activeFinances.laba)}
                                    </h3>
                                    <div className="mt-1 flex items-center text-[11px] font-medium">
                                        {isEmptyData ? (
                                            <span className="text-slate-400">
                                                Belum ada laba
                                            </span>
                                        ) : (
                                            <>
                                                <span className="mr-1 flex items-center font-semibold text-emerald-600">
                                                    <TrendingUp className="mr-0.5 h-3 w-3" />
                                                    naik{' '}
                                                    {activeFinances.labaDiff}%
                                                </span>
                                                <span className="text-slate-400">
                                                    {activeFinances.periodeText}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kartu 4: Saldo Kas Usaha */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-4">
                                <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-amber-400"></div>
                                <div className="pl-1.5">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Saldo Kas Usaha
                                        </p>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                                            <Wallet className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        {isEmptyData
                                            ? 'Rp 0'
                                            : formatRupiah(
                                                  activeFinances.saldoKas,
                                              )}
                                    </h3>
                                    <div className="mt-1 flex items-center text-[11px] font-medium text-slate-400">
                                        <span>Siap dipakai operasional</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* -------------------------------------------------------------
                            BAGIAN 3: AKSI CEPAT (4 TOMBOL RAMAH SENTUH MIN 44PX)
                            - "+ Uang masuk", "+ Uang keluar", "+ Produk baru", "Buat konten"
                        ------------------------------------------------------------- */}
                        <div className="mb-6">
                            <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                Aksi Cepat
                            </h2>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {/* Tombol 1: + Uang masuk */}
                                {/* TODO: Tautkan ke route pencatatan uang masuk ketika backend siap */}
                                <a
                                    href="#"
                                    className="shadow-xs flex min-h-[44px] items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                                >
                                    <PlusCircle className="h-4 w-4 shrink-0" />
                                    <span className="text-xs">
                                        + Uang Masuk
                                    </span>
                                </a>

                                {/* Tombol 2: + Uang keluar */}
                                {/* TODO: Tautkan ke route pencatatan uang keluar ketika backend siap */}
                                <a
                                    href="#"
                                    className="shadow-xs flex min-h-[44px] items-center justify-center space-x-2 rounded-xl bg-rose-600 px-3.5 py-2.5 font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98]"
                                >
                                    <MinusCircle className="h-4 w-4 shrink-0" />
                                    <span className="text-xs">
                                        + Uang Keluar
                                    </span>
                                </a>

                                {/* Tombol 3: + Produk baru */}
                                {/* TODO: Tautkan ke route pembuatan produk baru ketika backend siap */}
                                <Link
                                    href="/produk"
                                    className="shadow-xs flex min-h-[44px] items-center justify-center space-x-2 rounded-xl bg-[#8b5cf6] px-3.5 py-2.5 font-semibold text-white transition hover:bg-purple-700 active:scale-[0.98]"
                                >
                                    <PackagePlus className="h-4 w-4 shrink-0" />
                                    <span className="text-xs">
                                        + Produk Baru
                                    </span>
                                </Link>

                                {/* Tombol 4: Buat konten */}
                                <Link
                                    href="/promosi"
                                    className="shadow-2xs flex min-h-[44px] items-center justify-center space-x-2 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2.5 font-semibold text-[#8b5cf6] transition hover:bg-purple-100 active:scale-[0.98]"
                                >
                                    <Share2 className="h-4 w-4 shrink-0" />
                                    <span className="text-xs">Buat Konten</span>
                                </Link>
                            </div>
                        </div>

                        {/* STATE KOSONG: Jika akun UMKM baru belum ada transaksi */}
                        {isEmptyData && (
                            <div className="mb-6 rounded-2xl border border-dashed border-purple-300 bg-purple-50/50 p-6 text-center sm:p-8">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-[#8b5cf6]">
                                    <ShoppingBag className="h-7 w-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Belum ada transaksi di periode ini
                                </h3>
                                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                                    Catat penjualan pertamamu sekarang untuk
                                    melihat laporan grafik dan analisa keuangan
                                    usahamu secara otomatis!
                                </p>
                                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                                    <a
                                        href="#"
                                        className="inline-flex min-h-[44px] items-center space-x-2 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Catat Penjualan Pertama</span>
                                    </a>
                                    <button
                                        onClick={() => setIsEmptyData(false)}
                                        className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Kembali ke Data Berjalan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* -------------------------------------------------------------
                            BAGIAN 4, 5, 6: CHART UTAMA (TIDAK TAMPIL JIKA STATE KOSONG)
                        ------------------------------------------------------------- */}
                        {!isEmptyData && (
                            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
                                {/* -------------------------------------------------------------
                                    BAGIAN 4: CHART TREN PENJUALAN (Span 7)
                                    - Line chart uang masuk periode ini vs periode lalu (putus-putus)
                                ------------------------------------------------------------- */}
                                <div className="shadow-2xs flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 lg:col-span-7">
                                    <div>
                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">
                                                    Tren Penjualan (
                                                    {selectedPeriod})
                                                </h3>
                                                <p className="text-[11px] text-slate-400">
                                                    Perbandingan uang masuk
                                                    dengan periode sebelumnya
                                                </p>
                                            </div>

                                            {/* Legenda Sederhana */}
                                            <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-600">
                                                <div className="flex items-center">
                                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-[#8b5cf6]"></span>
                                                    <span>
                                                        {selectedPeriod}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-slate-400">
                                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-slate-300"></span>
                                                    <span>Periode Lalu</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Canvas Line Chart */}
                                        <div className="relative h-[230px] w-full pt-2">
                                            <canvas
                                                ref={trendChartRef}
                                            ></canvas>
                                        </div>
                                    </div>

                                    {/* Footer Mini Insight */}
                                    <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2.5 text-[11px] text-slate-500">
                                        <span>
                                            💡 Penjualan tertinggi terjadi di
                                            akhir pekan
                                        </span>
                                        <span className="font-semibold text-purple-600">
                                            Target tercapai 88%
                                        </span>
                                    </div>
                                </div>

                                {/* -------------------------------------------------------------
                                    BAGIAN 5: CHART KOMPOSISI PENGELUARAN (Span 5)
                                    - Donut chart per kategori dengan legenda dan persentase
                                ------------------------------------------------------------- */}
                                <div className="shadow-2xs flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 lg:col-span-5">
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">
                                                    Pengeluaran Berdasarkan
                                                    Kategori
                                                </h3>
                                                <p className="text-[11px] text-slate-400">
                                                    Ke mana uang usahamu
                                                    terpakai
                                                </p>
                                            </div>
                                            <span className="rounded bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-600">
                                                {formatRupiah(
                                                    activeFinances.uangKeluar,
                                                )}
                                            </span>
                                        </div>

                                        {/* Donut Chart Container */}
                                        <div className="relative mx-auto my-1 flex h-[160px] items-center justify-center">
                                            <canvas
                                                ref={donutChartRef}
                                            ></canvas>
                                        </div>

                                        {/* Legenda Kategori & Persentase */}
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                                            {activeExpenseData.categories.map(
                                                (cat, idx) => (
                                                    <div
                                                        key={cat}
                                                        className="flex items-center justify-between rounded-lg bg-slate-50/80 px-2.5 py-1.5"
                                                    >
                                                        <div className="flex items-center space-x-1.5 truncate">
                                                            <span
                                                                className="h-2 w-2 shrink-0 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        activeExpenseData
                                                                            .colors[
                                                                            idx
                                                                        ],
                                                                }}
                                                            ></span>
                                                            <span className="truncate text-slate-600">
                                                                {cat}
                                                            </span>
                                                        </div>
                                                        <span className="ml-1 font-bold text-slate-700">
                                                            {
                                                                activeExpenseData
                                                                    .percentages[
                                                                    idx
                                                                ]
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* -------------------------------------------------------------
                            BAGIAN 6: CHART PEMASUKAN VS PENGELUARAN (GROUPED BAR)
                        ------------------------------------------------------------- */}
                        {!isEmptyData && (
                            <div className="shadow-2xs mb-6 rounded-xl border border-slate-100 bg-white p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Arus Kas: Uang Masuk vs Uang Keluar
                                        </h3>
                                        <p className="text-[11px] text-slate-400">
                                            Pastikan uang masuk selalu lebih
                                            tinggi dari uang keluar
                                        </p>
                                    </div>

                                    {/* Legenda Bar */}
                                    <div className="flex items-center space-x-4 text-[11px] font-medium">
                                        <div className="flex items-center">
                                            <span className="mr-1.5 h-2.5 w-2.5 rounded-sm bg-[#10b981]"></span>
                                            <span className="text-slate-600">
                                                Uang Masuk
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-1.5 h-2.5 w-2.5 rounded-sm bg-[#ec4899]"></span>
                                            <span className="text-slate-600">
                                                Uang Keluar
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative h-[200px] w-full pt-1">
                                    <canvas ref={cashFlowChartRef}></canvas>
                                </div>
                            </div>
                        )}

                        {/* -------------------------------------------------------------
                            BAGIAN 7 & 8: PRODUK TERLARIS & PENGINGAT HARI INI (2 KOLOM)
                        ------------------------------------------------------------- */}
                        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
                            {/* -------------------------------------------------------------
                                BAGIAN 7: PRODUK TERLARIS (Span 6)
                                - 5 produk teratas: foto kecil, nama, terjual, bar progress
                                - Tautan "Lihat semua", tips di bawahnya
                            ------------------------------------------------------------- */}
                            <div className="shadow-2xs flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 lg:col-span-6">
                                <div>
                                    <div className="mb-3.5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Produk Paling Laris
                                            </h3>
                                            <p className="text-[11px] text-slate-400">
                                                5 produk yang paling diminati
                                                pelanggan
                                            </p>
                                        </div>
                                        {/* TODO: Tautkan ke halaman daftar semua produk */}
                                        <a
                                            href="#"
                                            className="inline-flex items-center text-xs font-semibold text-[#8b5cf6] hover:underline"
                                        >
                                            Lihat Semua{' '}
                                            <ArrowRight className="ml-1 h-3 w-3" />
                                        </a>
                                    </div>

                                    {/* List Produk */}
                                    <div className="space-y-3">
                                        {dummyBestSellers.map(
                                            (product, idx) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center space-x-3 rounded-lg border border-slate-50 p-2 transition hover:bg-slate-50/60"
                                                >
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                                        {idx + 1}
                                                    </span>
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-100"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex items-center justify-between">
                                                            <h4 className="truncate text-xs font-semibold text-slate-800">
                                                                {product.name}
                                                            </h4>
                                                            <span className="ml-2 shrink-0 text-xs font-bold text-purple-700">
                                                                {
                                                                    product.soldCount
                                                                }{' '}
                                                                terjual
                                                            </span>
                                                        </div>
                                                        {/* Bar kecil indikator */}
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                                style={{
                                                                    width: `${Math.round(
                                                                        (product.soldCount /
                                                                            product.maxSold) *
                                                                            100,
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                {/* Tips Baris di Bawah */}
                                <div className="mt-4 flex items-center space-x-2 rounded-xl border border-amber-100 bg-amber-50/80 p-3 text-xs text-amber-900">
                                    <Lightbulb className="h-4 w-4 shrink-0 text-amber-600" />
                                    <p className="text-[11px] leading-relaxed">
                                        <span className="font-semibold">
                                            Tips UMKM:
                                        </span>{' '}
                                        Produk sambal sedang laris! Coba buat
                                        konten video cara buatnya atau tawarkan
                                        paket bundling promo.
                                    </p>
                                </div>
                            </div>

                            {/* -------------------------------------------------------------
                                BAGIAN 8: PENGINGAT HARI INI (Span 6)
                                - Daftar tugas berurutan waktu (ikon + tombol aksi)
                            ------------------------------------------------------------- */}
                            <div className="shadow-2xs flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 lg:col-span-6">
                                <div>
                                    <div className="mb-3.5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Pengingat Hari Ini
                                            </h3>
                                            <p className="text-[11px] text-slate-400">
                                                Hal penting yang perlu kamu
                                                lakukan hari ini
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                                            {dummyReminders.length} Tugas
                                        </span>
                                    </div>

                                    {/* List Tugas */}
                                    <div className="space-y-2.5">
                                        {dummyReminders.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`flex items-start justify-between rounded-xl border p-3 transition ${
                                                    task.isUrgent
                                                        ? 'border-pink-200 bg-pink-50/40'
                                                        : 'border-slate-100 bg-white hover:bg-slate-50/60'
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-start space-x-3 pr-2">
                                                    <div
                                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                            task.isUrgent
                                                                ? 'bg-pink-100 text-pink-600'
                                                                : 'bg-purple-100 text-[#8b5cf6]'
                                                        }`}
                                                    >
                                                        {task.icon ===
                                                            'share' && (
                                                            <Share2 className="h-4 w-4" />
                                                        )}
                                                        {task.icon ===
                                                            'receipt' && (
                                                            <Clock className="h-4 w-4" />
                                                        )}
                                                        {task.icon ===
                                                            'book' && (
                                                            <BookOpen className="h-4 w-4" />
                                                        )}
                                                        {task.icon ===
                                                            'mentor' && (
                                                            <CalendarCheck className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center space-x-1.5">
                                                            <span className="text-[10px] font-semibold text-slate-400">
                                                                {task.time}
                                                            </span>
                                                            {task.isUrgent && (
                                                                <span className="py-0.2 rounded bg-rose-100 px-1 text-[9px] font-bold text-rose-600">
                                                                    Penting
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="truncate text-xs font-semibold text-slate-800">
                                                            {task.title}
                                                        </h4>
                                                        <p className="line-clamp-1 text-[11px] text-slate-500">
                                                            {task.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Tombol Aksi */}
                                                {/* TODO: Tautkan aksi masing-masing pengingat */}
                                                <a
                                                    href={task.actionUrl}
                                                    className="shadow-2xs flex min-h-[34px] shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700"
                                                >
                                                    {task.actionText}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-3 text-center">
                                    <p className="text-[11px] text-slate-400">
                                        Semua tugas tersinkronisasi otomatis
                                        dengan asisten tokomu
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* -------------------------------------------------------------
                            BAGIAN 9: PROGRES KELENGKAPAN USAHA
                            - Progress bar "Profil usaha X% lengkap"
                            - Checklist kelengkapan, disembunyikan otomatis jika 100%
                        ------------------------------------------------------------- */}
                        {profileCompleteness < 100 && (
                            <div className="shadow-2xs mb-6 rounded-xl border border-slate-100 bg-white p-5">
                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Kelengkapan Profil Usaha
                                            </h3>
                                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-[#8b5cf6]">
                                                {profileCompleteness}% Lengkap
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Selesaikan checklist di bawah agar
                                            tokomu dipercaya lebih banyak
                                            pelanggan
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">
                                        {completedCount} dari {checklist.length}{' '}
                                        langkah selesai
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-emerald-500 transition-all duration-500"
                                        style={{
                                            width: `${profileCompleteness}%`,
                                        }}
                                    ></div>
                                </div>

                                {/* Checklist Interaktif */}
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {checklist.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                handleToggleChecklist(item.id)
                                            }
                                            className={`flex items-start space-x-2.5 rounded-xl border p-2.5 text-left transition ${
                                                item.done
                                                    ? 'border-emerald-100 bg-emerald-50/30 text-slate-700'
                                                    : 'border-slate-200/80 bg-white text-slate-600 hover:border-purple-300'
                                            }`}
                                        >
                                            <div
                                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                                    item.done
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'border border-slate-300 bg-white'
                                                }`}
                                            >
                                                {item.done && (
                                                    <Check className="h-3 w-3" />
                                                )}
                                            </div>
                                            <span
                                                className={`text-xs ${
                                                    item.done
                                                        ? 'font-normal text-slate-400 line-through'
                                                        : 'font-medium'
                                                }`}
                                            >
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* -------------------------------------------------------------
                            BAGIAN 10 & 11: PINTASAN BELAJAR & SARAN ASISTEN AI (2 KOLOM)
                        ------------------------------------------------------------- */}
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                            {/* -------------------------------------------------------------
                                BAGIAN 10: PINTASAN BELAJAR (Span 6)
                                - Judul modul terakhir, progress bar, tombol "Lanjutkan"
                            ------------------------------------------------------------- */}
                            <div className="shadow-2xs flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 lg:col-span-6">
                                <div>
                                    <div className="mb-3 flex items-center space-x-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                            <GraduationCap className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Lanjutkan Belajar
                                            </h3>
                                            <p className="text-[11px] text-slate-400">
                                                Tingkatkan omzet lewat materi
                                                ringkas 5 menitan
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Modul Terakhir */}
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <div>
                                                <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                                    Modul 4 dari 6
                                                </span>
                                                <h4 className="mt-1 text-xs font-bold text-slate-800">
                                                    Trik Foto Produk Menarik
                                                    Hanya Pakai Kamera HP
                                                </h4>
                                                <p className="mt-0.5 text-[11px] text-slate-500">
                                                    Tersisa 1 bab: "Pencahayaan
                                                    Alami Dekat Jendela Rumah"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar Modul */}
                                        <div className="mt-3">
                                            <div className="mb-1 flex items-center justify-between text-[11px]">
                                                <span className="text-slate-500">
                                                    Progres belajar
                                                </span>
                                                <span className="font-bold text-purple-700">
                                                    65%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                                <div
                                                    className="h-full rounded-full bg-[#8b5cf6]"
                                                    style={{ width: '65%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tombol Lanjutkan */}
                                {/* TODO: Tautkan ke route modul pembelajaran */}
                                <div className="mt-4 pt-1">
                                    <a
                                        href="#"
                                        className="shadow-xs flex min-h-[44px] w-full items-center justify-center space-x-1.5 rounded-xl bg-[#8b5cf6] py-2.5 font-semibold text-white transition hover:bg-purple-700 active:scale-[0.99]"
                                    >
                                        <span className="text-xs">
                                            Lanjutkan Belajar Sekarang
                                        </span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* -------------------------------------------------------------
                                BAGIAN 11: SARAN ASISTEN AI (PLACEHOLDER) (Span 6)
                                - Kartu saran data dummy (dihubungkan ke fitur AI tahap berikutnya)
                            ------------------------------------------------------------- */}
                            {/* NOTE: Placeholder ini akan dihubungkan ke backend AI Assistant pada tahap selanjutnya */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-br from-purple-500/5 via-white to-pink-500/5 p-5 lg:col-span-6">
                                <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 -translate-y-6 translate-x-6 rounded-full bg-purple-400/10 blur-2xl"></div>

                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="shadow-xs flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b5cf6] to-pink-500 text-white">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-1.5">
                                                    <h3 className="text-sm font-bold text-slate-800">
                                                        Saran Asisten AI
                                                    </h3>
                                                    <span className="py-0.2 rounded bg-purple-100 px-1.5 text-[9px] font-bold text-purple-700">
                                                        Otomatis
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400">
                                                    Analisa pintar dari pola kas
                                                    tokomu
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Isi Saran AI Dummy */}
                                    <div className="shadow-2xs rounded-xl border border-purple-100/80 bg-white/90 p-4 backdrop-blur-sm">
                                        <div className="flex items-start space-x-2.5">
                                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-800">
                                                    Pengeluaran bahan baku naik
                                                    18% di minggu ini
                                                </p>
                                                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                                                    Harga cabai rawit terpantau
                                                    naik di pasar. Saran untuk
                                                    Bu Siti: Coba beli langsung
                                                    dalam kuantitas grosir untuk
                                                    2 minggu ke depan, atau buat
                                                    paket sambal porsi promo
                                                    agar margin laba tetap aman
                                                    di angka 45%.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tombol Interaksi AI */}
                                {/* TODO: Tautkan ke modal interaktif tanya AI Assistant */}
                                <div className="mt-4 flex items-center justify-between pt-1">
                                    <span className="text-[10px] text-slate-400">
                                        Dihasilkan berdasarkan data transaksi
                                        terakhir
                                    </span>
                                    <a
                                        href="#"
                                        className="inline-flex min-h-[38px] items-center space-x-1.5 rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                                    >
                                        <span>Tanya Asisten</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
