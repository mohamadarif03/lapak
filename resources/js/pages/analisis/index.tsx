import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Calendar,
    ChartNoAxesCombined,
    CheckCircle2,
    Clock,
    Compass,
    Flame,
    Info,
    Lightbulb,
    MapPin,
    Megaphone,
    Percent,
    Search,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalisisIndex() {
    const [radius, setRadius] = useState<'500m' | '1km' | '3km'>('1km');

    // Handle flow into Promosi module with recommendation topic
    const handleCreatePromotionFromInsight = (topic: string) => {
        router.visit(`/promosi?topic=${encodeURIComponent(topic)}`);
    };

    // Demographic data based on radius (DAT-01)
    const demographicData = {
        '500m': {
            populationDensity: '4.200 jiwa',
            primaryAge: '20 - 35 tahun (Pekerja & Mahasiswa)',
            spendingPower: 'Rp25.000 - Rp45.000 / hari',
            topLandmarks: 'Dekat Halte Bus, 2 Kantor Bank, 1 Sekolah Menengah',
        },
        '1km': {
            populationDensity: '16.800 jiwa',
            primaryAge: '18 - 40 tahun (Mahasiswa, Pekerja Kantoran, Warga Lokal)',
            spendingPower: 'Rp30.000 - Rp60.000 / hari',
            topLandmarks: 'Pasar Tradisional, Kampus Swasta, 4 Kompleks Perumahan',
        },
        '3km': {
            populationDensity: '58.400 jiwa',
            primaryAge: 'Semua Kelompok Usia Produktif',
            spendingPower: 'Rp35.000 - Rp75.000 / hari',
            topLandmarks: 'Stasiun Kereta, Pusat Grosir, Area Kuliner Malam',
        },
    };

    // Busy Hours Heatmap Data (DAT-02)
    const hourlyTraffic = [
        { time: '08:00', traffic: 25, label: 'Pagi santai' },
        { time: '10:00', traffic: 40, label: 'Kudapan pagi' },
        { time: '12:00', traffic: 70, label: 'Makan siang' },
        { time: '14:00', traffic: 55, label: 'Siang kerja' },
        { time: '16:00', traffic: 95, peak: true, label: 'Jam Paling Ramai (Sore)' },
        { time: '18:00', traffic: 85, label: 'Pulang kantor' },
        { time: '20:00', traffic: 60, label: 'Nongkrong malam' },
    ];

    // Popular Local Digital Trends (DAT-03)
    const digitalTrends = [
        { keyword: 'Es Kopi Susu Creamy Aren', searchVolume: 'Naik +48%', category: 'Minuman' },
        { keyword: 'Paket Ngemil Sore Hemat', searchVolume: 'Naik +35%', category: 'Promo' },
        { keyword: 'Roti Bakar Keju Meleleh', searchVolume: 'Naik +22%', category: 'Makanan' },
    ];

    // AI Actionable Recommendations (DAT-04 - Max 3 per screen)
    const aiRecommendations = [
        {
            id: 'rec-1',
            badge: 'Peluang Terbesar',
            title: 'Sore Hari Selalu Ramai Kopi (Jam 15.00 - 17.00)',
            desc: 'Penjualan kopi susu melonjak 3x lipat saat jam pulang kerja. Coba buat "Paket Ngemil Sore" (Kopi + Roti) dengan diskon 15% khusus jam tersebut.',
            actionTopic: 'Paket Ngemil Sore Hemat Kopi dan Roti',
            urgency: 'Rekomendasi Utama',
        },
        {
            id: 'rec-2',
            badge: 'Tren Lingkungan Sekitar',
            title: 'Radius 1 KM Didominasi Anak Muda & Mahasiswa',
            desc: 'Warga sekitar suka produk manis dengan kemasan praktis. Promosikan menu "Es Coklat Aren Jumbo" di media sosial.',
            actionTopic: 'Promo Khusus Pelajar dan Mahasiswa',
            urgency: 'Potensi Omzet Baru',
        },
        {
            id: 'rec-3',
            badge: 'Efisiensi Stok',
            title: 'Hari Jumat & Sabtu Permintaan Roti Naik 50%',
            desc: 'Pastikan belanja bahan roti tawar dan keju lebih banyak di hari Kamis sore agar tidak kehabisan stok saat jam ramai.',
            actionTopic: 'Diskon Akhir Pekan Kopi Kita',
            urgency: 'Optimasi Stok',
        },
    ];

    return (
        <>
            <Head title="Analisis Pasar & Demografi - LAPAK UMKM" />

            <div className="w-full max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-lapak-gold-soft px-3 py-0.5 text-xs font-bold text-lapak-warning mb-1.5">
                            <Sparkles className="size-3.5 text-lapak-gold" />
                            Modul IDATA &bull; Analisis Pasar & Lokasi
                        </div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Pahami Pembeli di Sekitar Lapakmu
                        </h1>
                        <p className="text-sm text-lapak-body">
                            Gabungan data riwayat penjualan tokomu dengan informasi resmi BPS dan tren digital setempat.
                        </p>
                    </div>

                    {/* Radius Selector (DAT-01) */}
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-xs">
                        <span className="text-xs font-bold text-muted-foreground pl-2 hidden sm:inline">
                            Jarak Analisis:
                        </span>
                        <div className="flex gap-1 text-xs font-bold">
                            {(['500m', '1km', '3km'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRadius(r)}
                                    className={`rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
                                        radius === r
                                            ? 'bg-primary text-white shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Radius {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 1: 3 REKOMENDASI TINDAKAN AI UTAMA (DAT-04 - Prinsip "AI Mengusulkan, Manusia Menyetujui") */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="size-5 text-lapak-gold" />
                            <h2 className="font-heading text-lg font-bold text-foreground">
                                Rekomendasi Tindakan Usaha (Maks. 3 Insight Penting)
                            </h2>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Disarankan untuk minggu ini
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {aiRecommendations.map((rec) => (
                            <div
                                key={rec.id}
                                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md space-y-4"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="rounded-full bg-lapak-gold-soft px-2.5 py-0.5 text-[11px] font-bold text-lapak-warning">
                                            {rec.badge}
                                        </span>
                                        <span className="text-[10px] font-semibold text-muted-foreground">
                                            {rec.urgency}
                                        </span>
                                    </div>

                                    <h3 className="font-heading text-base font-bold text-foreground leading-snug">
                                        {rec.title}
                                    </h3>

                                    <p className="text-xs text-lapak-body leading-relaxed">
                                        {rec.desc}
                                    </p>
                                </div>

                                {/* Flow into Promosi Module */}
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleCreatePromotionFromInsight(rec.actionTopic)}
                                    className="w-full font-heading text-xs"
                                >
                                    <Megaphone className="size-3.5 mr-1" />
                                    Buat Promosi dari Ini &rarr;
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 2: KARAKTERISTIK PENJUALAN TOKO & JAM RAMAI (DAT-02, DAT-05) */}
                <section className="grid gap-6 lg:grid-cols-3">
                    {/* Jam Ramai Heatmap Visual */}
                    <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="size-5 text-primary" />
                                <div>
                                    <h3 className="font-heading text-base font-bold text-foreground">
                                        Pola Jam Ramai Pembeli Tokomu
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Berdasarkan 342 transaksi yang kamu catat di modul ISIS
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-[#E4F3E8] px-2.5 py-0.5 text-xs font-bold text-[#216E45]">
                                Puncak: 16.00 WIB
                            </span>
                        </div>

                        {/* Traffic Bars */}
                        <div className="space-y-3 pt-1">
                            {hourlyTraffic.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-xs">
                                    <span className="w-12 font-bold text-foreground shrink-0">{item.time}</span>
                                    <div className="h-4 flex-1 rounded-full bg-muted overflow-hidden relative">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                item.peak ? 'bg-primary' : 'bg-secondary'
                                            }`}
                                            style={{ width: `${item.traffic}%` }}
                                        />
                                    </div>
                                    <span className={`w-36 text-right shrink-0 text-[11px] font-semibold ${
                                        item.peak ? 'text-primary font-bold' : 'text-muted-foreground'
                                    }`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl bg-secondary/50 p-3 text-xs text-primary flex items-center gap-2">
                            <CheckCircle2 className="size-4 shrink-0" />
                            <span>Paling efektif membuka lapak pada <strong>14.30 - 18.00 WIB</strong> untuk memaksimalkan keuntungan harian.</span>
                        </div>
                    </div>

                    {/* Tren Digital Lokal (DAT-03) */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <Flame className="size-5 text-lapak-warning" />
                                <h3 className="font-heading text-base font-bold text-foreground">
                                    Tren Pencarian Lokal
                                </h3>
                            </div>
                            <span className="text-[11px] text-muted-foreground">Surabaya</span>
                        </div>

                        <p className="text-xs text-lapak-body">
                            Kata kunci yang paling sering dicari warga sekitar usahamu di internet:
                        </p>

                        <div className="space-y-3">
                            {digitalTrends.map((trend, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-border p-3 space-y-1 bg-muted/20"
                                >
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-foreground">{trend.keyword}</span>
                                        <span className="font-bold text-[#216E45]">{trend.searchVolume}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">Kategori: {trend.category}</p>
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full text-xs font-heading"
                        >
                            <Link href="/promosi">
                                Bikin Promo Mengikuti Tren &rarr;
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* SECTION 3: PROFIL GEODEMOGRAFIS SEKITAR USAHA (DAT-01) */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
                        <div className="flex items-center gap-2.5">
                            <MapPin className="size-5 text-primary" />
                            <div>
                                <h3 className="font-heading text-lg font-bold text-foreground">
                                    Profil Warga Sekitar Toko (Radius {radius})
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Jl. Pasar Wonokromo, Surabaya &bull; Data agregat resmi
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ShieldCheck className="size-4 text-[#216E45]" />
                            <span>Sumber: BPS Kota Surabaya & Google Maps (Diperbarui Okt 2026)</span>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                Kepadatan Penduduk
                            </span>
                            <p className="font-heading text-xl font-bold text-foreground">
                                {demographicData[radius].populationDensity}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Potensi jangkauan pelanggan</p>
                        </div>

                        <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                Kelompok Usia Dominan
                            </span>
                            <p className="font-heading text-sm font-bold text-foreground leading-snug">
                                {demographicData[radius].primaryAge}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Karakter pasar utama</p>
                        </div>

                        <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                Rata-rata Belanja Harian
                            </span>
                            <p className="font-heading text-sm font-bold text-primary leading-snug">
                                {demographicData[radius].spendingPower}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Daya beli per orang</p>
                        </div>

                        <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                Titik Keramaian Dekat Toko
                            </span>
                            <p className="font-heading text-xs font-bold text-foreground leading-snug">
                                {demographicData[radius].topLandmarks}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Target sebaran pembeli</p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

AnalisisIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Analisis Pasar', href: '/analisis' },
    ],
};
