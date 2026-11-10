import AppSidebar from '@/Components/AppSidebar';
import React, { useState, useEffect, useId } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  ArrowRight,
  BadgePercent,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Gift,
  GraduationCap,
  HelpCircle,
  Home,
  Info,
  Lightbulb,
  LineChart,
  LogOut,
  MapPin,
  Megaphone,
  Moon,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Wallet,
  WifiOff,
} from 'lucide-react';

interface TopProduct {
  item: string;
  normalized_key: string;
  quantity: number;
  total_revenue: number;
}

interface HourlyItem {
  hour: number;
  time: string;
  label: string;
  count: number;
  revenue: number;
  percentage: number;
  is_peak: boolean;
}

interface SalesStats {
  sufficient_data: boolean;
  income_count: number;
  distinct_days_count: number;
  min_transactions_required?: number;
  min_days_required?: number;
  progress_text?: string;
  message?: string;
  total_revenue?: number;
  average_transaction_value?: number;
  top_products?: TopProduct[];
  peak_hour?: {
    hour: number;
    label: string;
    count: number;
    revenue: number;
  };
  peak_day?: {
    day_iso: number;
    day_name: string;
    average_revenue: number;
  };
  periode?: {
    start: string;
    end: string;
    start_iso: string;
    end_iso: string;
  };
  hourly_distribution?: HourlyItem[];
  data_date?: string;
  source?: string;
}

interface InsightData {
  id: number;
  type: string;
  title: string;
  recommendation: string;
  source: string;
  data_date: string;
  radius_m?: number | null;
  generated_by: string;
}

interface GeoPayload {
  resolution: string;
  areas: string[];
  population_estimate: number;
  age_groups: { label: string; share: number }[];
  density_per_km2: number;
  spending_power?: string;
  landmarks?: string;
  radius_m: number;
  radius_label: string;
  precision_note: string;
  source: string;
  data_date: string;
}

interface TrendKeyword {
  term: string;
  note: string;
}

interface TrendFormat {
  format: string;
  note: string;
}

interface TrendsPayload {
  keywords: TrendKeyword[];
  content_formats: TrendFormat[];
  source: string;
  fetched_at: string;
}

interface AnalisisPageProps {
  business: {
    id: number;
    business_name: string;
    business_type: string;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
  };
  selectedRadius?: number;
  sales?: {
    stats?: SalesStats;
    insight?: InsightData | null;
    error?: string | null;
  };
  geo?: {
    data?: GeoPayload | null;
    insight?: InsightData | null;
    error?: string | null;
  };
  trends?: {
    data?: TrendsPayload | null;
    insight?: InsightData | null;
    error?: string | null;
  };
}

const RADIUS_OPTIONS = ['500m', '1km', '3km'] as const;
type RadiusType = (typeof RADIUS_OPTIONS)[number];

function radiusToMeters(r: RadiusType): number {
  if (r === '500m') return 500;
  if (r === '3km') return 3000;
  return 1000;
}

function metersToRadius(m?: number): RadiusType {
  if (m === 500) return '500m';
  if (m === 3000) return '3km';
  return '1km';
}

function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export default function AnalisisIndex({
  business,
  selectedRadius = 1000,
  sales,
  geo,
  trends,
}: AnalisisPageProps) {
  const [radius, setRadius] = useState<RadiusType>(() => metersToRadius(selectedRadius));
  const [geoData, setGeoData] = useState<GeoPayload | null>(geo?.data ?? null);
  const [geoInsight, setGeoInsight] = useState<InsightData | null>(geo?.insight ?? null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(geo?.error ?? null);
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const radiogroupId = useId();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check browser online / offline state
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync with URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qRadius = urlParams.get('radius');
    if (qRadius && ['500', '1000', '3000'].includes(qRadius)) {
      const mapped = metersToRadius(Number(qRadius));
      if (mapped !== radius) {
        setRadius(mapped);
      }
    }
  }, []);

  // Handle Radius Change without full page reload
  const handleRadiusChange = (newRadius: RadiusType) => {
    if (newRadius === radius && !geoError) return;
    setRadius(newRadius);

    const meters = radiusToMeters(newRadius);
    const url = new URL(window.location.href);
    url.searchParams.set('radius', String(meters));
    window.history.replaceState({}, '', url.toString());

    setGeoLoading(true);
    setAnnouncement(`Memuat data profil warga sekitar radius ${newRadius}`);

    fetch(`/api/analisis/geo?radius=${meters}`, {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((res) => {
        if (res.data) {
          setGeoData(res.data);
          setGeoInsight(res.insight ?? null);
          setGeoError(null);
          setAnnouncement(`Data profil warga sekitar radius ${newRadius} berhasil diperbarui.`);
        } else if (res.error) {
          setGeoError(res.error);
          setAnnouncement(`Pemberitahuan: ${res.error}`);
        }
      })
      .catch(() => {
        setGeoError('server_error');
        setAnnouncement(`Gagal memuat data radius ${newRadius}. Silakan coba lagi.`);
      })
      .finally(() => {
        setGeoLoading(false);
      });
  };

  const handleRadioKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % RADIUS_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + RADIUS_OPTIONS.length) % RADIUS_OPTIONS.length;
    }

    if (nextIndex !== currentIndex) {
      handleRadiusChange(RADIUS_OPTIONS[nextIndex]);
    }
  };

  const handleCreatePromotionFromInsight = (insightId: number) => {
    router.visit(`/promosi?insight=${insightId}`);
  };

  const salesStats = sales?.stats;
  const isSalesSufficient = salesStats?.sufficient_data ?? false;

  const hourlyTraffic = salesStats?.hourly_distribution?.filter(
    (item) => item.hour >= 8 && item.hour <= 21
  ) ?? [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb] font-sans text-slate-700 antialiased print:bg-white print:text-black">
      <Head title="Analisis Pasar & Demografi - Lapak Digital UMKM" />

      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl print:hidden">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div
          role="alert"
          className="sticky top-0 z-50 flex items-center justify-center space-x-2 bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md"
        >
          <WifiOff className="h-4 w-4" />
          <span>Kamu sedang offline. Menampilkan data analisis terakhir yang sudah termuat.</span>
        </div>
      )}

      <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
        <AppSidebar
          current="analisis"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onShowToast={showToast}
        />

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-6 backdrop-blur">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 lg:hidden"
                title="Buka/Tutup Menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="font-heading text-lg font-bold text-slate-800">
                Analisis Pasar & Demografi
              </h1>
              <span className="hidden sm:inline-block rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-[#8b5cf6]">
                {business.business_name}
              </span>
            </div>

            {/* Radius Selector */}
            <div
              role="radiogroup"
              aria-labelledby={radiogroupId}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs"
            >
              <span id={radiogroupId} className="text-xs font-bold text-slate-500 pl-2 hidden sm:inline">
                Jarak Analisis:
              </span>
              <div className="flex gap-1 text-xs font-bold">
                {RADIUS_OPTIONS.map((r, index) => {
                  const isSelected = radius === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onKeyDown={(e) => handleRadioKeyDown(e, index)}
                      onClick={() => handleRadiusChange(r)}
                      className={`rounded-lg px-3 py-1.5 min-h-[38px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#8b5cf6] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      Radius {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
            {/* Title Banner */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-0.5 text-xs font-bold text-[#8b5cf6] mb-1.5">
                <Sparkles className="size-3.5 text-purple-600" />
                Modul IDATA &bull; Analisis Pasar & Lokasi
              </div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Pahami Pembeli di Sekitar Lapakmu
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Gabungan data riwayat penjualan tokomu dengan informasi resmi BPS dan tren digital setempat.
              </p>
            </div>

            {/* SECTION 1: 3 REKOMENDASI TINDAKAN AI UTAMA */}
            <section aria-labelledby="heading-rekomendasi" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-amber-500" />
                  <h3 id="heading-rekomendasi" className="font-heading text-lg font-bold text-slate-800">
                    Rekomendasi Tindakan Usaha (Maks. 3 Insight Penting)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Disarankan untuk minggu ini
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* INSIGHT 1: Rekomendasi Penjualan */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-purple-300 hover:shadow-md space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                        Peluang Penjualan
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Rekomendasi Utama
                      </span>
                    </div>

                    {sales?.insight ? (
                      <>
                        <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                          {sales.insight.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sales.insight.recommendation}
                        </p>
                        <div className="pt-1 text-[11px] text-slate-500">
                          {sales.insight.source} &bull; {sales.insight.data_date}
                        </div>
                      </>
                    ) : !isSalesSufficient ? (
                      <>
                        <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                          Catat Lebih Banyak Transaksi
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Catat sedikitnya 10 transaksi pemasukan dalam 3 hari berbeda agar asisten AI dapat membaca pola jam ramai dan produk terlarismu.
                        </p>
                        <div className="pt-1 text-[11px] text-slate-500 font-semibold">
                          Progres: {salesStats?.progress_text ?? '0 dari 10 transaksi'}
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                          Pola Penjualan Sedang Dianalisis
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Pantau jam ramai dan maksimalkan stok barang paling dicari pembeli tokomu.
                        </p>
                      </>
                    )}
                  </div>

                  {sales?.insight ? (
                    <button
                      type="button"
                      onClick={() => handleCreatePromotionFromInsight(sales.insight!.id)}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 min-h-[44px]"
                    >
                      <Megaphone className="size-3.5 mr-1.5" />
                      Buat Promosi dari Ini &rarr;
                    </button>
                  ) : (
                    <Link
                      href="/catat?mulai=1"
                      className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 min-h-[44px]"
                    >
                      Catat Transaksi Sekarang &rarr;
                    </Link>
                  )}
                </div>

                {/* INSIGHT 2: Rekomendasi Geodemografis */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-purple-300 hover:shadow-md space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                        Tren Lingkungan Sekitar
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Radius {radius}
                      </span>
                    </div>

                    {geoLoading ? (
                      <div className="space-y-2 py-4 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                      </div>
                    ) : geoInsight ? (
                      <>
                        <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                          {geoInsight.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {geoInsight.recommendation}
                        </p>
                        <div className="pt-1 text-[11px] text-slate-500">
                          {geoInsight.source} &bull; {geoInsight.data_date}
                        </div>
                      </>
                    ) : geoError === 'location_missing' ? (
                      <>
                        <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                          Lokasi Toko Belum Ditentukan
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Tentukan lokasi usahamu di peta untuk melihat potensi pasar dan karakter pembeli di sekitarmu.
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                          Pasar di Sekitar Lapak
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Sesuaikan produk dan layanan dengan kelompok usia dan daya beli warga di sekitarmu.
                        </p>
                      </>
                    )}
                  </div>

                  {geoInsight ? (
                    <button
                      type="button"
                      onClick={() => handleCreatePromotionFromInsight(geoInsight.id)}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 min-h-[44px]"
                    >
                      <Megaphone className="size-3.5 mr-1.5" />
                      Buat Promosi dari Ini &rarr;
                    </button>
                  ) : geoError === 'location_missing' ? (
                    <Link
                      href="/profil-usaha?ubah=1"
                      className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 min-h-[44px]"
                    >
                      Atur Lokasi Usaha &rarr;
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRadiusChange(radius)}
                      className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 min-h-[44px]"
                    >
                      <RefreshCw className="size-3.5 mr-1.5" />
                      Coba Muat Ulang
                    </button>
                  )}
                </div>

                {/* INSIGHT 3: Rekomendasi Tren Digital */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-purple-300 hover:shadow-md space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                        Tren Pencarian Digital
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Peluang Promosi
                      </span>
                    </div>

                    {trends?.insight ? (
                      <>
                        <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                          {trends.insight.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {trends.insight.recommendation}
                        </p>
                        <div className="pt-1 text-[11px] text-slate-500">
                          {trends.insight.source} &bull; {trends.insight.data_date}
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                          Tren Sedang Dipantau
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {trends?.error === 'trends_unavailable'
                            ? 'Data tren belum tersedia. Coba lagi nanti.'
                            : 'Gunakan kata kunci yang sedang populer di sekitarmu pada materi promosi usahamu.'}
                        </p>
                      </>
                    )}
                  </div>

                  {trends?.insight ? (
                    <button
                      type="button"
                      onClick={() => handleCreatePromotionFromInsight(trends.insight!.id)}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 min-h-[44px]"
                    >
                      <Megaphone className="size-3.5 mr-1.5" />
                      Buat Promosi dari Ini &rarr;
                    </button>
                  ) : (
                    <Link
                      href="/promosi"
                      className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 min-h-[44px]"
                    >
                      Buka Modul Promosi &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 2: KARAKTERISTIK PENJUALAN TOKO & TREN DIGITAL */}
            <section className="grid gap-6 lg:grid-cols-3">
              {/* Jam Ramai Heatmap Visual (Kartu 1) */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-[#8b5cf6]" />
                    <div>
                      <h3 className="font-heading text-base font-bold text-slate-900">
                        Pola Jam Ramai Pembeli Tokomu
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isSalesSufficient
                          ? `Berdasarkan ${salesStats?.income_count} transaksi pemasukan yang kamu catat di LAPAK`
                          : 'Catat lebih banyak transaksi agar analisis muncul'}
                      </p>
                    </div>
                  </div>
                  {isSalesSufficient && salesStats?.peak_hour && (
                    <span className="rounded-full bg-[#E4F3E8] px-2.5 py-0.5 text-xs font-bold text-[#216E45]">
                      Puncak: {salesStats.peak_hour.label} WIB
                    </span>
                  )}
                </div>

                {!isSalesSufficient ? (
                  /* State 4.1: Transaksi belum cukup */
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center space-y-4">
                    <div className="max-w-md mx-auto space-y-2">
                      <h4 className="font-heading text-base font-bold text-slate-900">
                        Catat lebih banyak transaksi agar analisis muncul
                      </h4>
                      <p className="text-xs text-slate-500">
                        Dibutuhkan sedikitnya 10 transaksi pemasukan pada minimal 3 hari berbeda.
                      </p>
                    </div>

                    <div className="max-w-xs mx-auto space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Progres Data</span>
                        <span className="text-[#8b5cf6]">
                          {salesStats?.income_count ?? 0} dari 10 transaksi
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-[#8b5cf6] transition-all duration-300 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round(((salesStats?.income_count ?? 0) / 10) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      href="/catat?mulai=1"
                      className="inline-flex items-center justify-center rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 min-h-[44px]"
                    >
                      Catat Sekarang &rarr;
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Accessible text for screen readers */}
                    <div className="sr-only">
                      Grafik jam ramai pembeli toko:
                      Puncak transaksi pada jam {salesStats?.peak_hour?.label} WIB dengan total {salesStats?.peak_hour?.count} transaksi.
                      Hari paling ramai adalah {salesStats?.peak_day?.day_name}.
                      Rata-rata belanja pembeli: {formatRupiah(salesStats?.average_transaction_value ?? 0)}.
                    </div>

                    {/* Traffic Bars */}
                    <div className="space-y-3 pt-1">
                      {hourlyTraffic.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-bold text-slate-800 shrink-0">{item.time}</span>
                          <div className="h-4 flex-1 rounded-full bg-slate-100 overflow-hidden relative">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.is_peak ? 'bg-[#8b5cf6]' : 'bg-purple-200'
                              }`}
                              style={{ width: `${Math.max(6, item.percentage)}%` }}
                            />
                          </div>
                          <span
                            className={`w-40 text-right shrink-0 text-[11px] font-semibold ${
                              item.is_peak ? 'text-[#8b5cf6] font-bold' : 'text-slate-500'
                            }`}
                          >
                            {item.is_peak ? `${item.count} trx (Paling Ramai)` : `${item.count} trx`}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-purple-50 p-3 text-xs text-[#8b5cf6] flex items-center gap-2 font-medium">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>
                        Paling ramai sekitar jam <strong>{salesStats?.peak_hour?.label} WIB</strong>.
                        Hari dengan penjualan rata-rata tertinggi: <strong>{salesStats?.peak_day?.day_name}</strong>.
                      </span>
                    </div>

                    {/* Sumber & Tanggal Data */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Sumber: {salesStats?.source ?? 'Data transaksi kamu di LAPAK'}</span>
                      <span>Tanggal data: {salesStats?.data_date ?? 'Hari ini'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Tren Digital Lokal (Kartu 3) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="size-5 text-amber-500" />
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Tren Pencarian Lokal
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {business.business_type || 'UMKM'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Kata kunci yang paling sering dicari calon pembeli di internet:
                </p>

                <div className="space-y-3">
                  {trends?.data?.keywords && trends.data.keywords.length > 0 ? (
                    trends.data.keywords.map((trend, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-100 p-3 space-y-1 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{trend.term}</span>
                          <span className="font-bold text-[#216E45]">{trend.note}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                      Data tren belum tersedia. Coba lagi nanti.
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex justify-between">
                  <span>Sumber: {trends?.data?.source ?? 'Google Trends'}</span>
                  <span>
                    {trends?.data?.fetched_at ? `Data per ${trends.data.fetched_at.slice(0, 10)}` : 'Terbaru'}
                  </span>
                </div>

                <Link
                  href="/promosi"
                  className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 min-h-[44px]"
                >
                  Bikin Promo Mengikuti Tren &rarr;
                </Link>
              </div>
            </section>

            {/* SECTION 3: PROFIL GEODEMOGRAFIS SEKITAR USAHA (Kartu 2) */}
            <section aria-labelledby="heading-geodemografis" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <MapPin className="size-5 text-[#8b5cf6]" />
                  <div>
                    <h3 id="heading-geodemografis" className="font-heading text-lg font-bold text-slate-900">
                      Profil Warga Sekitar Toko (Radius {radius})
                    </h3>
                    <p className="text-xs text-slate-500">
                      {business.address || 'Lokasi usaha'} &bull; Data agregat wilayah
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="size-4 text-[#216E45]" />
                  <span>
                    {geoData?.precision_note ?? `Data tingkat kecamatan, perkiraan untuk radius ${radius}`}
                  </span>
                </div>
              </div>

              {geoError === 'location_missing' || (!business.lat && !business.lng) ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Tentukan lokasi usahamu untuk melihat pasar di sekitarmu.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    LAPAK memadukan koordinat tokomu dengan data BPS untuk memetakan kepadatan penduduk dan kelompok usia pembeli.
                  </p>
                  <Link
                    href="/profil-usaha?ubah=1"
                    className="inline-flex items-center justify-center rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 min-h-[44px]"
                  >
                    Atur Lokasi Toko Sekarang &rarr;
                  </Link>
                </div>
              ) : geoLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 rounded-xl border border-slate-100 bg-slate-50 p-4"></div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Kepadatan Penduduk
                    </span>
                    <p className="font-heading text-xl font-bold text-slate-900">
                      {geoData?.population_estimate ? `${geoData.population_estimate.toLocaleString('id-ID')} jiwa` : '-'}
                    </p>
                    <p className="text-[11px] text-slate-500">Potensi jangkauan pelanggan</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Kelompok Usia Dominan
                    </span>
                    <p className="font-heading text-sm font-bold text-slate-900 leading-snug">
                      {geoData?.age_groups?.[1]?.label ?? '25-39'} tahun (Usia Produktif)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {geoData?.age_groups?.[1]?.share
                        ? `${Math.round(geoData.age_groups[1].share * 100)}% dari total warga`
                        : 'Karakter pasar utama'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Rata-rata Belanja Harian
                    </span>
                    <p className="font-heading text-sm font-bold text-[#8b5cf6] leading-snug">
                      {geoData?.spending_power ?? 'Rp 30.000 - Rp 60.000 / hari'}
                    </p>
                    <p className="text-[11px] text-slate-500">Estimasi daya beli per orang</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Titik Keramaian Dekat Toko
                    </span>
                    <p className="font-heading text-xs font-bold text-slate-900 leading-snug">
                      {geoData?.landmarks ?? 'Pasar Tradisional, Pemukiman Warga'}
                    </p>
                    <p className="text-[11px] text-slate-500">Target sebaran pembeli</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Sumber: {geoData?.source ?? 'BPS'}</span>
                <span>Tanggal data: {geoData?.data_date ?? '2025-12-31'}</span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
