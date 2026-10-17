import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    Circle,
    FileText,
    HelpCircle,
    Lightbulb,
    Megaphone,
    Mic,
    Plus,
    RefreshCw,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Wallet,
    WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DashboardTransaction {
    id: number | string;
    type: 'income' | 'expense';
    item: string;
    quantity: number;
    display_item: string;
    amount: number;
    formatted_amount: string;
    category?: string | null;
    source: 'voice' | 'manual';
    occurred_at: string;
    formatted_time: string;
}

export interface DashboardData {
    business: {
        id: number;
        owner_name: string;
        business_name: string;
        business_type: string;
        address?: string | null;
        analysis_viewed_at?: string | null;
    };
    periode: 'hari' | 'minggu' | 'bulan';
    prev_label: string;
    summary: {
        income: number;
        formatted_income: string;
        expense: number;
        formatted_expense: string;
        profit: number;
        formatted_profit: string;
        is_loss: boolean;
        income_delta: number | null;
        profit_delta: number | null;
        income_prev: number;
        profit_prev: number;
    };
    recent_transactions: DashboardTransaction[];
    total_transactions_count: number;
    campaigns_count: number;
    latest_insight: {
        id: number;
        type: string;
        title: string;
        recommendation: string;
        source: string;
        data_date: string;
    } | null;
    starter_steps: {
        is_all_completed: boolean;
        completed_count: number;
        tasks: Array<{
            id: string;
            title: string;
            completed: boolean;
            href: string;
        }>;
        example_utterance: string;
    };
}

interface Props {
    dashboard: DashboardData;
}

export default function Dashboard({ dashboard: initialDashboard }: Props) {
    const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboard);
    const [currentPeriod, setCurrentPeriod] = useState<'hari' | 'minggu' | 'bulan'>(
        initialDashboard.periode || 'hari'
    );
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    // Keep track of active fetch to prevent race conditions on fast tab clicks
    const abortControllerRef = useRef<AbortController | null>(null);

    // Sync when initialDashboard prop changes (e.g. from server redirects)
    useEffect(() => {
        setDashboardData(initialDashboard);
        setCurrentPeriod(initialDashboard.periode || 'hari');
    }, [initialDashboard]);

    // Handle offline status
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

    // Revalidate data from server
    const fetchDashboardData = useCallback(
        async (periodeToFetch: 'hari' | 'minggu' | 'bulan', updateUrl: boolean = true) => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);
            setErrorMessage(null);

            if (updateUrl && typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set('periode', periodeToFetch);
                window.history.replaceState({}, '', url.toString());
            }

            try {
                const response = await fetch(`/api/dashboard/data?periode=${periodeToFetch}`, {
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (response.status === 401) {
                    window.location.href = '/masuk';
                    return;
                }

                if (!response.ok) {
                    throw new Error('Gagal memuat data.');
                }

                const data: DashboardData = await response.json();
                setDashboardData(data);
                setCurrentPeriod(data.periode);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return; // Ignore aborted requests
                }
                setErrorMessage('Gagal memuat data. Coba lagi.');
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Window focus revalidation
    useEffect(() => {
        const handleFocus = () => {
            fetchDashboardData(currentPeriod, false);
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [currentPeriod, fetchDashboardData]);

    const handlePeriodChange = (newPeriod: 'hari' | 'minggu' | 'bulan') => {
        if (newPeriod === currentPeriod && !errorMessage) return;
        setCurrentPeriod(newPeriod);
        fetchDashboardData(newPeriod, true);
    };

    const {
        business,
        summary,
        recent_transactions,
        starter_steps,
        latest_insight,
        prev_label,
    } = dashboardData;

    return (
        <>
            <Head title={`Beranda Toko - ${business.business_name} - LAPAK`} />

            <div className="w-full max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans">
                {/* Offline Banner */}
                {!isOnline && (
                    <div
                        role="status"
                        className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive animate-in fade-in"
                    >
                        <WifiOff className="size-4 shrink-0" />
                        <span>Kamu sedang offline. Tetap menampilkan data terakhir yang termuat.</span>
                    </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                    <div
                        role="alert"
                        className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-semibold text-destructive"
                    >
                        <span>{errorMessage}</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchDashboardData(currentPeriod, false)}
                            className="h-8 text-xs font-heading"
                        >
                            <RefreshCw className="mr-1.5 size-3.5" />
                            Coba lagi
                        </Button>
                    </div>
                )}

                {/* Sapaan & Quick Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-primary mb-1.5">
                            <Sparkles className="size-3.5" />
                            {business.business_name}
                        </div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Halo, {business.owner_name}!
                        </h1>
                        <p className="text-sm text-lapak-body">
                            Pantau kesehatan keuangan dan kelola penjualan tokomu dengan mudah hari ini.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button asChild size="sm" className="font-heading text-xs sm:text-sm">
                            <Link
                                href="/catat?mulai=1"
                                aria-label="Catat dengan suara"
                            >
                                <Mic className="size-4" />
                                Catat Suara
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="font-heading text-xs sm:text-sm">
                            <Link href="/laporan">
                                <FileText className="size-4" />
                                Buka Laporan
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* SECTION 1: KARTU RINGKASAN KEUANGAN */}
                <section aria-labelledby="financial-summary-heading" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-5 text-primary" />
                            <h2 id="financial-summary-heading" className="font-heading text-lg font-bold text-foreground">
                                Ringkasan Keuangan
                            </h2>
                        </div>

                        {/* Periode Tabs with accessible roles */}
                        <div
                            role="tablist"
                            aria-label="Pilih rentang periode ringkasan"
                            className="inline-flex rounded-xl bg-muted p-1 border border-border text-xs font-semibold self-start sm:self-auto"
                        >
                            {(['hari', 'minggu', 'bulan'] as const).map((p) => {
                                const labels = {
                                    hari: 'Hari Ini',
                                    minggu: 'Minggu Ini',
                                    bulan: 'Bulan Ini',
                                };
                                const isSelected = currentPeriod === p;
                                return (
                                    <button
                                        key={p}
                                        role="tab"
                                        id={`tab-${p}`}
                                        aria-selected={isSelected}
                                        aria-controls={`panel-${p}`}
                                        type="button"
                                        onClick={() => handlePeriodChange(p)}
                                        className={`rounded-lg px-3 py-1.5 cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-card text-foreground shadow-xs font-bold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {labels[p]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Financial Summary Cards with aria-live */}
                    <div
                        id={`panel-${currentPeriod}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${currentPeriod}`}
                        aria-live="polite"
                        className="grid gap-4 sm:grid-cols-3"
                    >
                        {/* 1. Total Pemasukan */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2 relative overflow-hidden">
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-10">
                                    <RefreshCw className="size-5 animate-spin text-primary" />
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Total Pemasukan
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#E4F3E8] text-[#216E45]">
                                    <ArrowUpRight className="size-4" />
                                </div>
                            </div>
                            <p className="font-heading text-2xl font-bold text-[#216E45] sm:text-3xl">
                                {summary.formatted_income}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                {summary.income_delta !== null ? (
                                    summary.income_delta >= 0 ? (
                                        <span className="inline-flex items-center font-bold text-[#216E45]">
                                            <ArrowUpRight className="size-3.5 mr-0.5" />
                                            naik {summary.income_delta}% dari {prev_label}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center font-bold text-[#B3261E]">
                                            <ArrowDownRight className="size-3.5 mr-0.5" />
                                            turun {Math.abs(summary.income_delta)}% dari {prev_label}
                                        </span>
                                    )
                                ) : (
                                    <span>Arus pemasukan tercatat</span>
                                )}
                            </div>
                        </div>

                        {/* 2. Total Pengeluaran */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2 relative overflow-hidden">
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-10">
                                    <RefreshCw className="size-5 animate-spin text-primary" />
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Total Pengeluaran
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#FBE3E1] text-[#B3261E]">
                                    <ArrowDownRight className="size-4" />
                                </div>
                            </div>
                            <p className="font-heading text-2xl font-bold text-[#B3261E] sm:text-3xl">
                                {summary.formatted_expense}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Biaya bahan baku & operasional toko
                            </p>
                        </div>

                        {/* 3. Laba / Rugi Bersih */}
                        <div
                            className={`rounded-2xl border p-5 shadow-xs space-y-2 relative overflow-hidden ${
                                summary.is_loss
                                    ? 'border-[#B3261E]/40 bg-[#FBE3E1]/30'
                                    : 'border-primary/30 bg-secondary/40'
                            }`}
                        >
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-10">
                                    <RefreshCw className="size-5 animate-spin text-primary" />
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`text-xs font-bold uppercase tracking-wider ${
                                            summary.is_loss ? 'text-[#B3261E]' : 'text-primary'
                                        }`}
                                    >
                                        {summary.is_loss ? 'Rugi Bersih' : 'Laba Bersih'}
                                    </span>
                                    {summary.is_loss && (
                                        <span className="rounded bg-[#B3261E] px-1.5 py-0.2 text-[10px] font-bold text-white uppercase">
                                            Rugi
                                        </span>
                                    )}
                                </div>
                                <div
                                    className={`flex size-8 items-center justify-center rounded-lg text-white ${
                                        summary.is_loss ? 'bg-[#B3261E]' : 'bg-primary'
                                    }`}
                                >
                                    {summary.is_loss ? (
                                        <TrendingDown className="size-4" />
                                    ) : (
                                        <TrendingUp className="size-4" />
                                    )}
                                </div>
                            </div>
                            <p
                                className={`font-heading text-2xl font-bold sm:text-3xl ${
                                    summary.is_loss ? 'text-[#B3261E]' : 'text-primary'
                                }`}
                            >
                                {summary.formatted_profit}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                {summary.profit_delta !== null ? (
                                    summary.profit_delta >= 0 ? (
                                        <span className="inline-flex items-center font-bold text-[#216E45]">
                                            <ArrowUpRight className="size-3.5 mr-0.5" />
                                            naik {summary.profit_delta}% dari {prev_label}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center font-bold text-[#B3261E]">
                                            <ArrowDownRight className="size-3.5 mr-0.5" />
                                            turun {Math.abs(summary.profit_delta)}% dari {prev_label}
                                        </span>
                                    )
                                ) : (
                                    <span className={summary.is_loss ? 'text-[#B3261E] font-semibold' : 'text-[#216E45] font-semibold'}>
                                        {summary.is_loss ? 'Pengeluaran melebihi pemasukan' : 'Performa keuntungan sehat'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: KARTU "LANGKAH AWAL" (Hidden once all 3 tasks are completed) */}
                {!starter_steps.is_all_completed && (
                    <section aria-labelledby="starter-steps-heading" className="rounded-2xl border border-primary/30 bg-card p-6 shadow-xs space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/80 pb-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h2 id="starter-steps-heading" className="font-heading text-base font-bold text-foreground">
                                        Langkah Awal Toko
                                    </h2>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Selesaikan 3 langkah mudah ini untuk membiasakan tokomu bertransformasi digital.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                                    {starter_steps.completed_count} dari 3 selesai
                                </span>
                            </div>
                        </div>

                        {/* Task Checklist Items */}
                        <div className="grid gap-3 sm:grid-cols-3">
                            {starter_steps.tasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={task.href}
                                    className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                                        task.completed
                                            ? 'border-border bg-muted/40 text-muted-foreground'
                                            : 'border-primary/40 bg-secondary/30 hover:border-primary hover:bg-secondary/60 text-foreground'
                                    }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {task.completed ? (
                                            <CheckCircle2 className="size-5 text-[#216E45]" />
                                        ) : (
                                            <Circle className="size-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-xs font-bold font-heading ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                            {task.title}
                                        </p>
                                        <span className="text-[11px] font-semibold text-primary group-hover:underline flex items-center gap-1">
                                            {task.completed ? 'Selesai' : 'Mulai Sekarang'}
                                            <ArrowRight className="size-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Speech Example if 0 transactions recorded yet */}
                        {dashboardData.total_transactions_count === 0 && (
                            <div className="flex items-start gap-3 rounded-xl border border-dashed border-primary/40 bg-muted/40 p-3.5">
                                <Mic className="size-4 text-primary shrink-0 mt-0.5" />
                                <div className="space-y-0.5 text-xs">
                                    <p className="font-bold text-foreground">
                                        Contoh ucapan pencatatan untuk usahamu:
                                    </p>
                                    <p className="italic text-primary font-medium">
                                        &ldquo;{starter_steps.example_utterance}&rdquo;
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* SECTION 3: GRID 2 KOLOM (TRANSAKSI TERBARU & KARTU INSIGHT) */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* LEFT COLUMN: TRANSAKSI TERBARU (7 COLS) */}
                    <section aria-labelledby="recent-transactions-heading" className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 id="recent-transactions-heading" className="font-heading text-lg font-bold text-foreground">
                                    Transaksi Terbaru
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    5 catatan pemasukan & pengeluaran terkini
                                </p>
                            </div>

                            <Link
                                href="/catat"
                                className="text-xs font-bold text-primary hover:text-primary/80 underline underline-offset-4"
                            >
                                Lihat semua
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                            {recent_transactions.length === 0 ? (
                                <div className="p-8 text-center space-y-3">
                                    <HelpCircle className="size-8 mx-auto text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="font-heading text-sm font-bold text-foreground">
                                            Belum ada catatan hari ini.
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Tekan mikrofon untuk mulai mencatat penjualan atau belanja tokomu.
                                        </p>
                                    </div>
                                    <Button asChild size="sm" className="font-heading">
                                        <Link href="/catat?mulai=1">
                                            <Mic className="size-4 mr-1.5" />
                                            Catat Sekarang
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {recent_transactions.map((trx) => (
                                        <Link
                                            key={trx.id}
                                            href={`/catat?edit=${trx.id}`}
                                            className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group cursor-pointer block"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex size-10 items-center justify-center rounded-xl ${
                                                        trx.type === 'income'
                                                            ? 'bg-[#E4F3E8] text-[#216E45]'
                                                            : 'bg-[#FBE3E1] text-[#B3261E]'
                                                    }`}
                                                >
                                                    {trx.type === 'income' ? (
                                                        <ArrowUpRight className="size-5" />
                                                    ) : (
                                                        <ArrowDownRight className="size-5" />
                                                    )}
                                                </div>

                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                            {trx.display_item}
                                                        </p>
                                                        {trx.source === 'voice' && (
                                                            <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-primary flex items-center gap-0.5">
                                                                <Mic className="size-2.5" />
                                                                Suara
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
                                                        {trx.category && (
                                                            <>
                                                                <span>&bull;</span>
                                                                <span>{trx.category}</span>
                                                            </>
                                                        )}
                                                        <span>&bull;</span>
                                                        <span>{trx.formatted_time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p
                                                    className={`font-heading text-base font-bold ${
                                                        trx.type === 'income'
                                                            ? 'text-[#216E45]'
                                                            : 'text-[#B3261E]'
                                                    }`}
                                                >
                                                    {trx.formatted_amount}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground">Lunas</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* RIGHT COLUMN: KARTU INSIGHT (5 COLS) */}
                    <section aria-labelledby="insight-heading" className="lg:col-span-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="size-5 text-primary" />
                            <h2 id="insight-heading" className="font-heading text-lg font-bold text-foreground">
                                Wawasan Cerdas AI
                            </h2>
                        </div>

                        <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-xs space-y-4">
                            {latest_insight ? (
                                <>
                                    <div className="flex items-center justify-between border-b border-border/80 pb-3">
                                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary">
                                            Rekomendasi Terkini
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {latest_insight.data_date}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-heading text-base font-bold text-foreground">
                                            {latest_insight.title}
                                        </h3>
                                        <p className="text-xs text-lapak-body leading-relaxed">
                                            {latest_insight.recommendation}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                                        Sumber: <span className="font-semibold text-foreground">{latest_insight.source}</span>
                                    </div>

                                    <div className="pt-2 border-t border-border/80">
                                        <Button asChild className="w-full font-heading text-xs sm:text-sm">
                                            <Link href={`/promosi?insight=${latest_insight.id}`}>
                                                <Megaphone className="size-4 mr-1.5" />
                                                Buat Promosi dari Ini
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 text-center space-y-3">
                                    <Sparkles className="size-8 mx-auto text-primary opacity-60" />
                                    <div className="space-y-1">
                                        <p className="font-heading text-sm font-bold text-foreground">
                                            Catat lebih banyak transaksi agar analisis muncul
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            AI LAPAK mempelajari tren toko dan data pasar untuk memberikan saran akurat.
                                        </p>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="font-heading text-xs">
                                        <Link href="/analisis">
                                            Buka Analisis
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* SECTION 4: TOMBOL MIKROFON UTAMA (Section 3.7) */}
                <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs text-center space-y-4">
                    <div className="space-y-1 max-w-md mx-auto">
                        <h2 className="font-heading text-lg font-bold text-foreground">
                            Pencatatan Suara Instan
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Cukup bicara dalam bahasa santai sehari-hari untuk mencatat penjualan berikutnya.
                        </p>
                    </div>

                    <div className="flex justify-center pt-2">
                        <Link
                            href="/catat?mulai=1"
                            aria-label="Catat dengan suara"
                            className="group flex size-20 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                        >
                            <Mic className="size-9 text-white group-hover:scale-110 transition-transform" />
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
    ],
};
