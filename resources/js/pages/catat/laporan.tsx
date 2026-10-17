import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeft,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FileText,
    Percent,
    PieChart,
    Printer,
    Share2,
    ShieldCheck,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LaporanKeuangan() {
    const [selectedMonth, setSelectedMonth] = useState('Oktober 2026');
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

    const handleExport = (type: 'pdf' | 'excel' | 'whatsapp') => {
        if (type === 'pdf') {
            setDownloadSuccess('Laporan Keuangan PDF berhasil digenerate dan siap diunduh!');
        } else if (type === 'excel') {
            setDownloadSuccess('File Excel Laporan Laba Rugi berhasil diunduh!');
        } else {
            setDownloadSuccess('Ringkasan laporan disiapkan untuk dikirim ke nomor WhatsApp pendamping/bank!');
        }

        setTimeout(() => {
            setDownloadSuccess(null);
        }, 4000);
    };

    // Data Laporan Keuangan Bulanan
    const reportData = {
        month: selectedMonth,
        grossRevenue: 14850000,
        cogs: 6200000, // Bahan baku
        operationalExpense: 2450000, // Listrik, gas, sewa, kemasan
        netProfit: 6200000,
        profitMargin: 41.7,
        totalTransactions: 342,
        dailyAverageRevenue: 479032,
    };

    const expenseBreakdown = [
        { name: 'Bahan Baku (Biji Kopi, Susu, Gula, Roti)', amount: 6200000, percentage: 71.7 },
        { name: 'Kemasan & Cup Plastik', amount: 950000, percentage: 11.0 },
        { name: 'Gas LPG & Listrik', amount: 800000, percentage: 9.2 },
        { name: 'Es Batu & Air Galon', amount: 700000, percentage: 8.1 },
    ];

    const revenueBreakdown = [
        { name: 'Minuman Kopi (Aren, Susu, Hitam)', amount: 9800000, percentage: 66.0 },
        { name: 'Makanan Ringan & Roti Bakar', amount: 3600000, percentage: 24.2 },
        { name: 'Non-Kopi (Teh, Coklat, Matcha)', amount: 1450000, percentage: 9.8 },
    ];

    return (
        <>
            <Head title="Laporan Keuangan & Laba Rugi - LAPAK UMKM" />

            <div className="w-full max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header Title & Month Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-primary mb-1.5">
                            <FileText className="size-3.5" />
                            Laporan Standar Keuangan UMKM
                        </div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Laporan Laba & Rugi Usaha
                        </h1>
                        <p className="text-sm text-lapak-body">
                            Format rapi dan terstandarisasi untuk pengajuan kredit KUR, perbankan, atau evaluasi pribadi.
                        </p>
                    </div>

                    {/* Export Actions & Month Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground outline-none shadow-xs cursor-pointer"
                        >
                            <option value="Oktober 2026">Oktober 2026 (Bulan Ini)</option>
                            <option value="September 2026">September 2026</option>
                            <option value="Agustus 2026">Agustus 2026</option>
                        </select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('excel')}
                            className="text-xs font-heading"
                        >
                            <FileSpreadsheet className="size-4 text-[#216E45]" />
                            Unduh Excel
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => handleExport('pdf')}
                            className="text-xs font-heading"
                        >
                            <Download className="size-4" />
                            Ekspor PDF (1-Klik)
                        </Button>
                    </div>
                </div>

                {/* Feedback Toast */}
                {downloadSuccess && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-[#216E45]/40 bg-[#E4F3E8] p-3.5 text-xs font-semibold text-[#216E45] animate-in fade-in duration-200">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>{downloadSuccess}</span>
                    </div>
                )}

                {/* Credit Readiness Banner (G5) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-lapak-gold/60 bg-lapak-gold-soft p-5 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-lapak-gold text-white shadow-xs shrink-0">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-heading text-base font-bold text-foreground">
                                Status Keuangan: Layak Pengajuan Kredit Usaha (KUR)
                            </h3>
                            <p className="text-xs text-lapak-body">
                                Laporanmu memiliki rasio laba bersih stabil <strong>{reportData.profitMargin}%</strong> dan catatan transaksi harian konsisten selama 3 bulan.
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => handleExport('whatsapp')}
                        className="w-full sm:w-auto font-heading text-xs"
                    >
                        <Share2 className="size-3.5 mr-1" />
                        Kirim ke Pendamping UMKM
                    </Button>
                </div>

                {/* SECTION 1: 4 Ringkasan Finansial Utama */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Pendapatan Kotor
                        </span>
                        <p className="font-heading text-2xl font-bold text-[#216E45]">
                            Rp{reportData.grossRevenue.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            Rata-rata Rp{reportData.dailyAverageRevenue.toLocaleString('id-ID')} / hari
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Biaya Bahan Baku (HPP)
                        </span>
                        <p className="font-heading text-2xl font-bold text-[#B3261E]">
                            Rp{reportData.cogs.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            41.7% dari total pendapatan
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Biaya Operasional Toko
                        </span>
                        <p className="font-heading text-2xl font-bold text-[#8A5700]">
                            Rp{reportData.operationalExpense.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            Gas, listrik, cup, operasional
                        </p>
                    </div>

                    <div className="rounded-2xl border border-primary/40 bg-secondary/50 p-5 shadow-xs space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            Laba Bersih Akhir
                        </span>
                        <p className="font-heading text-2xl font-bold text-primary">
                            Rp{reportData.netProfit.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-[#216E45] font-bold">
                            Margin Keuntungan {reportData.profitMargin}%
                        </p>
                    </div>
                </div>

                {/* SECTION 2: Tabel Rincian Arus Keuangan */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Sumber Pendapatan */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="size-5 text-[#216E45]" />
                                <h3 className="font-heading text-base font-bold text-foreground">
                                    Rincian Penjualan per Kategori
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-[#216E45]">Pemasukan</span>
                        </div>

                        <div className="space-y-3">
                            {revenueBreakdown.map((item, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-foreground">{item.name}</span>
                                        <span className="font-heading font-bold text-[#216E45]">
                                            Rp{item.amount.toLocaleString('id-ID')} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[#216E45]"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pengeluaran Toko */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <ArrowDownRight className="size-5 text-[#B3261E]" />
                                <h3 className="font-heading text-base font-bold text-foreground">
                                    Rincian Beban & Belanja Toko
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-[#B3261E]">Pengeluaran</span>
                        </div>

                        <div className="space-y-3">
                            {expenseBreakdown.map((item, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-foreground">{item.name}</span>
                                        <span className="font-heading font-bold text-[#B3261E]">
                                            Rp{item.amount.toLocaleString('id-ID')} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[#B3261E]"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 3: Lembar Laporan Siap Cetak Pratinjau */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
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
                                <h3 className="font-heading text-lg font-bold text-foreground">
                                    Pratinjau Lembar Laba Rugi Sederhana
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Warung Kopi Mantap Bu Rara &bull; Periode {selectedMonth}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="hidden sm:inline-flex"
                        >
                            <Printer className="size-4" />
                            Cetak Lembar
                        </Button>
                    </div>

                    {/* Statement Table */}
                    <div className="divide-y divide-border text-sm">
                        <div className="flex justify-between py-2.5 font-bold text-foreground bg-muted/40 px-3 rounded-lg">
                            <span>1. Total Pendapatan Penjualan Bersih</span>
                            <span className="font-heading">Rp{reportData.grossRevenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-2.5 px-3 text-muted-foreground">
                            <span>2. Harga Pokok Penjualan (Bahan Baku)</span>
                            <span className="font-heading text-[#B3261E]">- Rp{reportData.cogs.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-2.5 font-bold text-foreground px-3">
                            <span>3. Laba Kotor Usaha</span>
                            <span className="font-heading text-[#216E45]">Rp{(reportData.grossRevenue - reportData.cogs).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-2.5 px-3 text-muted-foreground">
                            <span>4. Total Beban Operasional Toko</span>
                            <span className="font-heading text-[#B3261E]">- Rp{reportData.operationalExpense.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-3 font-bold text-primary bg-secondary/40 px-3 rounded-lg text-base">
                            <span>5. Laba Bersih Usaha (Net Profit)</span>
                            <span className="font-heading">Rp{reportData.netProfit.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                        <span>Dihasilkan secara otomatis oleh sistem pencatatan suara LAPAK.</span>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleExport('pdf')} className="font-heading">
                                Unduh Dokumen PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

LaporanKeuangan.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan Keuangan', href: '/laporan' },
    ],
};
