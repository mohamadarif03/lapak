import React, { useState, useEffect, useId } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppSidebar from '@/Components/AppSidebar';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowLeft,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FileText,
    HelpCircle,
    Info,
    Percent,
    PieChart,
    Plus,
    Printer,
    RefreshCw,
    Share2,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
    Wallet,
    WifiOff,
    X,
} from 'lucide-react';

interface CategoryItem {
    category: string;
    count: number;
    amount: number;
    percentage: number;
    amount_formatted: string;
}

interface PeriodicRow {
    key: string;
    label: string;
    date_formatted?: string;
    income: number;
    expense: number;
    net_profit: number;
    income_formatted: string;
    expense_formatted: string;
    net_profit_formatted: string;
}

interface TransactionItem {
    id: number;
    date: string;
    time: string;
    type: string;
    item: string;
    quantity: number;
    category: string;
    amount: number;
    note: string;
    source: string;
}

interface DeltaComparison {
    diff: number;
    percentage: number;
    direction: string;
    text: string;
}

interface ReportData {
    header: {
        business_name: string;
        owner_name: string;
        periode_label: string;
        dari: string;
        sampai: string;
        dari_formatted: string;
        sampai_formatted: string;
        generated_at: string;
        disclaimer: string;
    };
    summary: {
        total_income: number;
        total_expense: number;
        net_profit: number;
        profit_label: string;
        transaction_count: number;
        income_count: number;
        expense_count: number;
        avg_income_transaction: number | null;
        total_income_formatted: string;
        total_expense_formatted: string;
        net_profit_formatted: string;
        avg_income_formatted: string;
        income_delta: DeltaComparison | null;
        profit_delta: DeltaComparison | null;
    };
    categories: {
        income: CategoryItem[];
        expense: CategoryItem[];
        income_total: number;
        expense_total: number;
    };
    periodic: {
        is_monthly: boolean;
        type: 'monthly' | 'daily';
        rows: PeriodicRow[];
    };
    transactions: TransactionItem[];
}

interface ReportProps {
    report?: ReportData;
    warning?: string | null;
    range?: {
        periode: string;
        label: string;
        dari: string;
        sampai: string;
        is_valid: boolean;
        error_message: string | null;
        is_monthly: boolean;
    };
    business?: {
        id: number;
        business_name: string;
        owner_name: string;
    };
}

export default function LaporanKeuangan({ report: initialReport, warning: initialWarning, range: initialRange, business }: ReportProps) {
    const report = initialReport ?? {
        header: {
            business_name: business?.business_name ?? 'Usaha Saya',
            owner_name: business?.owner_name ?? 'Pemilik',
            periode_label: 'Bulan Ini',
            dari: '',
            sampai: '',
            dari_formatted: '',
            sampai_formatted: '',
            generated_at: '',
            disclaimer: 'Laporan sederhana berdasarkan transaksi yang dicatat pengguna, bukan laporan akuntansi resmi.',
        },
        summary: {
            total_income: 0,
            total_expense: 0,
            net_profit: 0,
            profit_label: 'Laba',
            transaction_count: 0,
            income_count: 0,
            expense_count: 0,
            avg_income_transaction: null,
            total_income_formatted: 'Rp 0',
            total_expense_formatted: 'Rp 0',
            net_profit_formatted: 'Rp 0',
            avg_income_formatted: '-',
            income_delta: null,
            profit_delta: null,
        },
        categories: {
            income: [],
            expense: [],
            income_total: 0,
            expense_total: 0,
        },
        periodic: {
            is_monthly: false,
            type: 'daily',
            rows: [],
        },
        transactions: [],
    };

    const currentPeriode = initialRange?.periode ?? 'bulan';
    const [selectedPeriode, setSelectedPeriode] = useState<string>(currentPeriode);
    const [customDari, setCustomDari] = useState<string>(initialRange?.dari ?? '');
    const [customSampai, setCustomSampai] = useState<string>(initialRange?.sampai ?? '');
    const [showCustomInputs, setShowCustomInputs] = useState<boolean>(currentPeriode === 'kustom');

    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
    const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);

    const announceId = useId();

    useEffect(() => {
        if (initialRange?.periode) {
            setSelectedPeriode(initialRange.periode);
            setShowCustomInputs(initialRange.periode === 'kustom');
            if (initialRange.dari) setCustomDari(initialRange.dari);
            if (initialRange.sampai) setCustomSampai(initialRange.sampai);
        }
    }, [initialRange]);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const onFocus = () => {
            router.reload({ only: ['report', 'range', 'warning'] });
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    const handlePeriodeChange = (newPeriode: string) => {
        setSelectedPeriode(newPeriode);
        setDownloadError(null);

        if (newPeriode === 'kustom') {
            setShowCustomInputs(true);
            return;
        }

        setShowCustomInputs(false);
        router.get(
            '/laporan',
            { periode: newPeriode },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleApplyCustom = (e: React.FormEvent) => {
        e.preventDefault();
        setDownloadError(null);

        if (!customDari || !customSampai) {
            setDownloadError('Tanggal mulai dan tanggal akhir wajib diisi.');
            return;
        }

        router.get(
            '/laporan',
            { periode: 'kustom', dari: customDari, sampai: customSampai },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        if (report.summary.transaction_count === 0) {
            setDownloadError('Belum ada transaksi pada periode ini.');
            return;
        }

        if (isOffline) {
            setDownloadError('Kamu sedang offline. Sambungkan internet untuk mengunduh laporan.');
            return;
        }

        setDownloadError(null);
        if (format === 'pdf') setIsExportingPdf(true);
        if (format === 'excel') setIsExportingExcel(true);

        const params = new URLSearchParams();
        params.set('format', format === 'pdf' ? 'pdf' : 'xlsx');
        params.set('periode', selectedPeriode);
        if (selectedPeriode === 'kustom') {
            if (customDari) params.set('dari', customDari);
            if (customSampai) params.set('sampai', customSampai);
        }

        try {
            const response = await fetch(`/api/laporan/export?${params.toString()}`, {
                method: 'GET',
                headers: {
                    Accept: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });

            if (!response.ok) {
                let errorMsg = 'Laporan gagal dibuat. Coba lagi.';
                try {
                    const errorJson = await response.json();
                    if (errorJson.message) errorMsg = errorJson.message;
                } catch {
                    // Ignore non-json error
                }
                setDownloadError(errorMsg);
                return;
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `laporan-${selectedPeriode}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            setDownloadSuccess(`Laporan ${format.toUpperCase()} berhasil diunduh!`);
            setTimeout(() => setDownloadSuccess(null), 4000);
        } catch {
            setDownloadError('Koneksi bermasalah. Coba lagi.');
        } finally {
            setIsExportingPdf(false);
            setIsExportingExcel(false);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        const bizName = report.header.business_name;
        const periode = report.header.periode_label;
        const inc = report.summary.total_income_formatted;
        const exp = report.summary.total_expense_formatted;
        const profit = report.summary.net_profit_formatted;
        const label = report.summary.profit_label;

        const shareText = `Halo, berikut ringkasan Laporan Keuangan ${bizName} (${periode}):\n` +
            `- Total Pemasukan: ${inc}\n` +
            `- Total Pengeluaran: ${exp}\n` +
            `- ${label} Bersih: ${profit}\n` +
            `- Total Transaksi: ${report.summary.transaction_count}\n\n` +
            `Dibuat secara otomatis lewat LAPAK UMKM.`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Laporan Keuangan ${bizName}`,
                    text: shareText,
                });
                setDownloadSuccess('Ringkasan laporan berhasil dibagikan!');
                setTimeout(() => setDownloadSuccess(null), 3000);
            } catch {
                fallbackWhatsApp(shareText);
            } finally {
                setIsSharing(false);
            }
        } else {
            fallbackWhatsApp(shareText);
            setIsSharing(false);
        }
    };

    const fallbackWhatsApp = (text: string) => {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setDownloadSuccess('Ringkasan laporan disiapkan untuk dikirim ke WhatsApp!');
        setTimeout(() => setDownloadSuccess(null), 4000);
    };

    const isProfit = report.summary.net_profit >= 0;
    const hasTransactions = report.summary.transaction_count > 0;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800 print:h-auto print:overflow-visible">
            <Head title="Laporan Keuangan & Laba Rugi - LAPAK UMKM" />
            <AppSidebar
                current="laporan"
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onShowToast={(msg) => setDownloadSuccess(msg)}
            />

            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 print:h-auto print:overflow-visible">
                <div className="w-full max-w-[1400px] mx-auto space-y-8">
                {/* Offline Warning Banner */}
                {isOffline && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-800" role="alert">
                        <WifiOff className="size-4 shrink-0" />
                        <span>Kamu sedang offline. Menampilkan data laporan yang terakhir termuat.</span>
                    </div>
                )}

                {/* Validation Warning / Error Banner */}
                {(initialWarning || downloadError) && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800" role="alert" aria-live="assertive">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="size-4 shrink-0 text-rose-600" />
                            <span>{initialWarning || downloadError}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDownloadError(null)}
                            className="text-rose-600 hover:text-rose-800"
                            aria-label="Tutup pesan peringatan"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                )}

                {/* Feedback Toast */}
                {downloadSuccess && (
                    <div
                        id={announceId}
                        className="flex items-center gap-2.5 rounded-xl border border-[#216E45]/40 bg-[#E4F3E8] p-3.5 text-xs font-semibold text-[#216E45] animate-in fade-in duration-200"
                        role="status"
                        aria-live="polite"
                    >
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>{downloadSuccess}</span>
                    </div>
                )}

                {/* Header Title & Period Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 mb-1.5">
                            <FileText className="size-3.5" />
                            Laporan Standar Keuangan UMKM
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Laporan Laba & Rugi Usaha
                        </h1>
                        <p className="text-sm text-slate-600">
                            Format rapi dan terstandarisasi untuk pengajuan kredit KUR, perbankan, atau evaluasi pribadi.
                        </p>
                    </div>

                    {/* Export Actions & Period Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Period Selector Dropdown */}
                        <div className="relative">
                            <label htmlFor="select-periode" className="sr-only">Pilih Periode Laporan</label>
                            <select
                                id="select-periode"
                                value={selectedPeriode}
                                onChange={(e) => handlePeriodeChange(e.target.value)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none shadow-sm cursor-pointer focus:ring-2 focus:ring-emerald-600"
                                aria-label="Pilih Periode Laporan"
                            >
                                <option value="bulan">Bulan Ini</option>
                                <option value="minggu">Minggu Ini</option>
                                <option value="bulan-lalu">Bulan Lalu</option>
                                <option value="kustom">Rentang Kustom...</option>
                            </select>
                        </div>

                        {/* Excel Export Button */}
                        <button
                            type="button"
                            onClick={() => handleExport('excel')}
                            disabled={!hasTransactions || isExportingExcel || isOffline}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!hasTransactions ? 'Belum ada transaksi pada periode ini.' : 'Unduh laporan Excel (.xlsx)'}
                            aria-label="Unduh laporan Excel (.xlsx)"
                        >
                            <FileSpreadsheet className="size-4 text-[#216E45]" />
                            {isExportingExcel ? 'Memproses...' : 'Unduh Excel'}
                        </button>

                        {/* PDF Export Button */}
                        <button
                            type="button"
                            onClick={() => handleExport('pdf')}
                            disabled={!hasTransactions || isExportingPdf || isOffline}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!hasTransactions ? 'Belum ada transaksi pada periode ini.' : 'Ekspor Dokumen PDF'}
                            aria-label="Ekspor Dokumen PDF (1-Klik)"
                        >
                            <Download className="size-4" />
                            {isExportingPdf ? 'Menyiapkan...' : 'Ekspor PDF (1-Klik)'}
                        </button>
                    </div>
                </div>

                {/* Custom Date Form (Visible when 'kustom' is selected) */}
                {showCustomInputs && (
                    <form
                        onSubmit={handleApplyCustom}
                        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        aria-label="Form Rentang Tanggal Kustom"
                    >
                        <div className="space-y-1">
                            <label htmlFor="custom-dari" className="text-xs font-bold text-slate-700">
                                Dari Tanggal
                            </label>
                            <input
                                id="custom-dari"
                                type="date"
                                value={customDari}
                                onChange={(e) => setCustomDari(e.target.value)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="custom-sampai" className="text-xs font-bold text-slate-700">
                                Sampai Tanggal
                            </label>
                            <input
                                id="custom-sampai"
                                type="date"
                                value={customSampai}
                                onChange={(e) => setCustomSampai(e.target.value)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
                        >
                            Terapkan
                        </button>
                    </form>
                )}

                {/* Empty State Banner (When 0 transactions) */}
                {!hasTransactions && (
                    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
                        <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <FileText className="size-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">
                                Belum ada transaksi pada periode ini.
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm">
                                Catat transaksi pemasukan atau pengeluaran usahamu agar laporan laba rugi terhitung otomatis.
                            </p>
                        </div>
                        <Link href="/catat?mulai=1">
                            <button
                                type="button"
                                className="inline-flex items-center rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
                            >
                                <Plus className="size-3.5 mr-1" />
                                Catat Sekarang
                            </button>
                        </Link>
                    </div>
                )}

                {/* Credit Readiness Banner (G5) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-base font-bold text-slate-900">
                                Status Keuangan: Layak Pengajuan Kredit Usaha (KUR)
                            </h3>
                            <p className="text-xs text-slate-600">
                                Laporanmu mencerminkan arus transaksi riil tercatat dengan {report.summary.transaction_count} transaksi pada periode {report.header.periode_label}.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleShare}
                        disabled={isSharing}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 w-full sm:w-auto"
                    >
                        <Share2 className="size-3.5 mr-1" />
                        {isSharing ? 'Menyiapkan...' : 'Kirim ke Pendamping UMKM'}
                    </button>
                </div>

                {/* SECTION 1: 4 Ringkasan Finansial Utama */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Pemasukan */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Total Pemasukan
                        </span>
                        <p className="text-2xl font-bold text-[#216E45]">
                            {report.summary.total_income_formatted}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            {report.summary.income_delta ? (
                                <>
                                    {report.summary.income_delta.direction === 'naik' && <ArrowUpRight className="size-3.5 text-[#216E45]" />}
                                    {report.summary.income_delta.direction === 'turun' && <ArrowDownRight className="size-3.5 text-[#B3261E]" />}
                                    <span className={report.summary.income_delta.direction === 'naik' ? 'text-[#216E45] font-semibold' : 'text-[#B3261E] font-semibold'}>
                                        {report.summary.income_delta.text}
                                    </span>
                                </>
                            ) : (
                                <span>{report.summary.income_count} transaksi masuk</span>
                            )}
                        </div>
                    </div>

                    {/* Card 2: Total Pengeluaran */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Total Pengeluaran
                        </span>
                        <p className="text-2xl font-bold text-[#B3261E]">
                            {report.summary.total_expense_formatted}
                        </p>
                        <p className="text-[11px] text-slate-500">
                            {report.summary.expense_count} transaksi belanja & operasional
                        </p>
                    </div>

                    {/* Card 3: Laba / Rugi Bersih */}
                    <div className={`rounded-2xl border p-5 shadow-sm space-y-2 ${isProfit ? 'border-emerald-300 bg-emerald-50/50' : 'border-rose-300 bg-rose-50/50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isProfit ? 'text-emerald-800' : 'text-rose-700'}`}>
                            {report.summary.profit_label} Bersih
                        </span>
                        <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-800' : 'text-rose-700'}`}>
                            {report.summary.net_profit_formatted}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                            {report.summary.profit_delta ? (
                                <>
                                    {report.summary.profit_delta.direction === 'naik' && <ArrowUpRight className="size-3.5 text-[#216E45]" />}
                                    {report.summary.profit_delta.direction === 'turun' && <ArrowDownRight className="size-3.5 text-[#B3261E]" />}
                                    <span className={report.summary.profit_delta.direction === 'naik' ? 'text-[#216E45]' : 'text-[#B3261E]'}>
                                        {report.summary.profit_delta.text}
                                    </span>
                                </>
                            ) : (
                                <span className={isProfit ? 'text-[#216E45]' : 'text-rose-700'}>
                                    Status usaha: {report.summary.profit_label}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Card 4: Transaksi & Rata-rata */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Rata-rata Transaksi Masuk
                        </span>
                        <p className="text-2xl font-bold text-slate-900">
                            {report.summary.avg_income_formatted}
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Dari total {report.summary.transaction_count} transaksi tercatat
                        </p>
                    </div>
                </div>

                {/* SECTION 2: Tabel Rincian Arus Keuangan (Per Kategori) */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Sumber Pendapatan */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="size-5 text-[#216E45]" />
                                <h3 className="text-base font-bold text-slate-900">
                                    Rincian Penjualan per Kategori
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-[#216E45]">Pemasukan</span>
                        </div>

                        <div className="space-y-3">
                            {report.categories.income.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center">
                                    Belum ada kategori pemasukan pada periode ini.
                                </p>
                            ) : (
                                report.categories.income.map((item, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-800">
                                                {item.category} ({item.count} tx)
                                            </span>
                                            <span className="font-bold text-[#216E45]">
                                                {item.amount_formatted} ({item.percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#216E45]"
                                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pengeluaran Toko */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <ArrowDownRight className="size-5 text-[#B3261E]" />
                                <h3 className="text-base font-bold text-slate-900">
                                    Rincian Beban & Belanja Toko
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-[#B3261E]">Pengeluaran</span>
                        </div>

                        <div className="space-y-3">
                            {report.categories.expense.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center">
                                    Belum ada kategori pengeluaran pada periode ini.
                                </p>
                            ) : (
                                report.categories.expense.map((item, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-800">
                                                {item.category} ({item.count} tx)
                                            </span>
                                            <span className="font-bold text-[#B3261E]">
                                                {item.amount_formatted} ({item.percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#B3261E]"
                                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 3: Rincian Berkala (Harian / Bulanan) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-5 text-emerald-700" />
                            <h3 className="text-base font-bold text-slate-900">
                                {report.periodic.is_monthly ? 'Rincian per Bulan' : 'Rincian Harian'}
                            </h3>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                            Total {report.periodic.rows.length} {report.periodic.is_monthly ? 'bulan' : 'hari'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs" aria-label="Tabel Rincian Harian Laba Rugi">
                            <caption className="sr-only">Rincian Laba Rugi Harian atau Bulanan</caption>
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-900">
                                    <th scope="col" className="py-2.5 px-3">
                                        {report.periodic.is_monthly ? 'Bulan' : 'Tanggal'}
                                    </th>
                                    <th scope="col" className="py-2.5 px-3 text-right">Pemasukan</th>
                                    <th scope="col" className="py-2.5 px-3 text-right">Pengeluaran</th>
                                    <th scope="col" className="py-2.5 px-3 text-right">Laba / Rugi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {report.periodic.rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-slate-500">
                                            Tidak ada data untuk ditampilkan.
                                        </td>
                                    </tr>
                                ) : (
                                    report.periodic.rows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="py-2 px-3 font-medium text-slate-900">
                                                {row.date_formatted ?? row.label}
                                            </td>
                                            <td className="py-2 px-3 text-right font-medium text-[#216E45]">
                                                {row.income_formatted}
                                            </td>
                                            <td className="py-2 px-3 text-right font-medium text-[#B3261E]">
                                                {row.expense_formatted}
                                            </td>
                                            <td className={`py-2 px-3 text-right font-bold ${row.net_profit >= 0 ? 'text-[#216E45]' : 'text-[#B3261E]'}`}>
                                                {row.net_profit_formatted}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION 4: Lembar Laporan Siap Cetak Pratinjau */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/Logo Kanopi dan Grafik Naik.png"
                                alt="Logo LAPAK"
                                className="size-9 object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = '/logo-icon.png';
                                }}
                            />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Pratinjau Lembar Laba Rugi Sederhana
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {report.header.business_name} &bull; Periode {report.header.periode_label}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            <Printer className="size-4" />
                            Cetak Lembar
                        </button>
                    </div>

                    {/* Statement Table */}
                    <div className="divide-y divide-slate-200 text-sm">
                        <div className="flex justify-between py-2.5 font-bold text-slate-900 bg-slate-50 px-3 rounded-lg">
                            <span>1. Total Pendapatan Penjualan Bersih</span>
                            <span className="text-[#216E45]">{report.summary.total_income_formatted}</span>
                        </div>
                        <div className="flex justify-between py-2.5 px-3 text-slate-600">
                            <span>2. Total Pengeluaran & Biaya Toko</span>
                            <span className="text-[#B3261E]">- {report.summary.total_expense_formatted}</span>
                        </div>
                        <div className="flex justify-between py-3 font-bold text-emerald-800 bg-emerald-50 px-3 rounded-lg text-base">
                            <span>3. Laba / Rugi Bersih Usaha ({report.summary.profit_label})</span>
                            <span className={isProfit ? 'text-emerald-800' : 'text-rose-700'}>
                                {report.summary.net_profit_formatted}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                        <span>{report.header.disclaimer} Dibuat pada {report.header.generated_at}.</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleExport('pdf')}
                                disabled={!hasTransactions || isExportingPdf}
                                className="inline-flex items-center rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
                            >
                                <Download className="size-3.5 mr-1" />
                                {isExportingPdf ? 'Menyiapkan...' : 'Unduh Dokumen PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
