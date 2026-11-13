import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Info,
    Mail,
    Megaphone,
    Menu,
    MessageCircle,
    Mic,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface LandingStat {
    value: string;
    label: string;
    source: string;
    source_url?: string | null;
    year: number;
    source_text: string;
}

interface LandingContact {
    email?: string | null;
    whatsapp?: string | null;
    whatsapp_url?: string | null;
}

interface LandingSite {
    name: string;
    tagline: string;
    url: string;
}

interface WelcomeProps {
    site?: LandingSite;
    stats?: LandingStat[];
    contact?: LandingContact;
    isLoggedIn?: boolean;
    ctaTarget?: string;
    ctaLabel?: string;
    demoEnabled?: boolean;
    pesan?: string | null;
    currentYear?: number;
}

export default function Welcome({
    site = {
        name: 'LAPAK',
        tagline: 'Cukup Bicara, Usahamu Berkembang.',
        url: 'http://localhost:8000',
    },
    stats = [],
    contact = {},
    isLoggedIn = false,
    ctaTarget = '/masuk',
    ctaLabel = 'Mulai Sekarang',
    demoEnabled = false,
    pesan = null,
    currentYear = new Date().getFullYear(),
}: WelcomeProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isStartingDemo, setIsStartingDemo] = useState(false);

    // Clean ?pesan= query parameter from address bar after mount
    useEffect(() => {
        if (pesan && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.has('pesan')) {
                url.searchParams.delete('pesan');
                window.history.replaceState(
                    {},
                    document.title,
                    url.pathname + (url.search ? url.search : '')
                );
            }
        }
    }, [pesan]);

    // Handle smooth scrolling to anchors with focus management
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        setMobileMenuOpen(false);

        const target = document.getElementById(targetId);
        if (!target) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
        });

        target.focus({ preventScroll: true });
        if (typeof window !== 'undefined') {
            window.history.pushState(null, '', `#${targetId}`);
        }
    };

    const handleDemoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsStartingDemo(true);
        router.post(
            '/api/demo/start',
            {},
            {
                onFinish: () => setIsStartingDemo(false),
            }
        );
    };

    const pageTitle = 'LAPAK - Asisten Pintar UMKM Indonesia';
    const pageDescription =
        'LAPAK adalah asisten digital berbasis AI untuk pelaku UMKM Indonesia. Catat transaksi keuangan lewat suara, pantau laba harian, dan buat materi promosi otomatis.';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Skip to Main Content Link for Keyboard Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-800 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 text-sm font-semibold"
            >
                Lewati ke konten utama
            </a>

            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={site.url} />

                {/* Open Graph Meta Tags */}
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={site.url} />
                <meta property="og:site_name" content={site.name} />
                <meta property="og:image" content={`${site.url}/Lapak Market Signal Logo.png`} />

                {/* Twitter Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={`${site.url}/Lapak Market Signal Logo.png`} />

                {/* Schema.org SoftwareApplication Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: site.name,
                            applicationCategory: 'BusinessApplication',
                            operatingSystem: 'All',
                            description: pageDescription,
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'IDR',
                            },
                        }),
                    }}
                />
            </Head>

            {/* Notification Banner for ?pesan= */}
            {pesan && (
                <div
                    role="status"
                    aria-live="polite"
                    className="w-full bg-emerald-50 border-b border-emerald-200 px-4 py-3 text-sm text-emerald-900"
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Info className="size-5 shrink-0 text-emerald-700" />
                            <p className="font-medium">{pesan}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 transition-opacity hover:opacity-90 min-h-[48px]"
                        aria-label="Beranda LAPAK"
                    >
                        <img
                            src="/Lapak Market Signal Logo.png"
                            alt="Logo LAPAK"
                            className="h-12 sm:h-14 w-auto object-contain"
                            width={160}
                            height={56}
                            onError={(e) => {
                                e.currentTarget.src = '/logo-horizontal.png';
                            }}
                        />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8" aria-label="Navigasi Utama">
                        <a
                            href="#fitur"
                            onClick={(e) => scrollToSection(e, 'fitur')}
                            className="text-sm font-semibold text-slate-700 hover:text-emerald-800 transition-colors py-2"
                        >
                            Fitur Unggulan
                        </a>
                        <a
                            href="#cara-kerja"
                            onClick={(e) => scrollToSection(e, 'cara-kerja')}
                            className="text-sm font-semibold text-slate-700 hover:text-emerald-800 transition-colors py-2"
                        >
                            Cara Kerja
                        </a>
                        <a
                            href="#masalah"
                            onClick={(e) => scrollToSection(e, 'masalah')}
                            className="text-sm font-semibold text-slate-700 hover:text-emerald-800 transition-colors py-2"
                        >
                            Statistik UMKM
                        </a>
                    </nav>

                    {/* Desktop Action Buttons */}
                    <div className="hidden sm:flex items-center gap-3">
                        {isLoggedIn ? (
                            <Link
                                href={ctaTarget}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-700 min-h-[44px]"
                            >
                                {ctaLabel}
                                <ArrowRight className="size-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/masuk"
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-700 min-h-[44px]"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={ctaTarget}
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-700 min-h-[44px]"
                                >
                                    {ctaLabel}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="flex sm:hidden items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 min-h-[48px] min-w-[48px]"
                            aria-expanded={mobileMenuOpen}
                            aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                        >
                            {mobileMenuOpen ? (
                                <X className="size-6" />
                            ) : (
                                <Menu className="size-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-lg">
                        <nav className="flex flex-col space-y-3" aria-label="Navigasi Menu Seluler">
                            <a
                                href="#fitur"
                                onClick={(e) => scrollToSection(e, 'fitur')}
                                className="text-base font-semibold text-slate-700 hover:text-emerald-800 py-2 px-1"
                            >
                                Fitur Unggulan
                            </a>
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="text-base font-semibold text-slate-700 hover:text-emerald-800 py-2 px-1"
                            >
                                Cara Kerja
                            </a>
                            <a
                                href="#masalah"
                                onClick={(e) => scrollToSection(e, 'masalah')}
                                className="text-base font-semibold text-slate-700 hover:text-emerald-800 py-2 px-1"
                            >
                                Statistik UMKM
                            </a>
                        </nav>

                        <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
                            {isLoggedIn ? (
                                <Link
                                    href={ctaTarget}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-900 transition min-h-[48px]"
                                >
                                    {ctaLabel}
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={ctaTarget}
                                        className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-800 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-900 transition min-h-[48px]"
                                    >
                                        {ctaLabel}
                                    </Link>
                                    <Link
                                        href="/masuk"
                                        className="w-full inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[48px]"
                                    >
                                        Masuk
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 pt-12 pb-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center space-y-6">
                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800 shadow-xs">
                            <Sparkles className="size-3.5 text-amber-600" />
                            <span>Asisten Pintar UMKM Indonesia</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
                            Cukup Bicara, <br className="hidden sm:inline" />
                            <span className="text-emerald-800">Usahamu Berkembang.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
                            Pencatatan keuangan harian semudah mengirim pesan suara. Pantau keuntungan
                            usaha dan buat materi promosi kreatif secara otomatis tanpa ribet.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                            {/* Primary CTA */}
                            <Link
                                href={ctaTarget}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-emerald-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-700 min-h-[48px]"
                            >
                                {ctaLabel}
                                <ArrowRight className="size-5 ml-1" />
                            </Link>

                            {/* Demo CTA (Shown only if demoEnabled and not logged in) */}
                            {demoEnabled && !isLoggedIn && (
                                <form
                                    action="/api/demo/start"
                                    method="POST"
                                    onSubmit={handleDemoSubmit}
                                    className="w-full sm:w-auto"
                                >
                                    <button
                                        type="submit"
                                        disabled={isStartingDemo}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-700 min-h-[48px] cursor-pointer"
                                    >
                                        <Sparkles className="size-5 mr-1 text-emerald-800" />
                                        {isStartingDemo ? 'Menyiapkan Demo...' : 'Lihat Demo'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Assurances */}
                        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-emerald-700" />
                                Tanpa Rumus Akuntansi Rumit
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-emerald-700" />
                                Mendukung Suara Bahasa Indonesia
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="size-4 text-emerald-700" />
                                Data Usaha Aman dan Terenkripsi
                            </span>
                        </div>
                    </div>
                </section>

                {/* Section 1: Three Core Features (#fitur) */}
                <section
                    id="fitur"
                    tabIndex={-1}
                    className="border-t border-slate-200 bg-slate-100/60 px-4 py-16 sm:px-6 lg:px-8 outline-none"
                >
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="text-center space-y-2">
                            <div className="inline-block rounded-md bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 mb-2">
                                Solusi Lengkap
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Tiga Pilar Solusi untuk Usahamu
                            </h2>
                            <p className="text-sm text-slate-600 max-w-xl mx-auto">
                                Dirancang khusus dengan alur kerja yang hangat, sederhana, dan mudah
                                dipahami oleh pemilik UMKM.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Modul 1: ISIS (Catat) */}
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-600 hover:shadow-md space-y-4 text-left block"
                            >
                                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 group-hover:scale-105 transition-transform">
                                    <Mic className="size-6" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                                        Modul ISIS
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                        Pencatatan Lewat Suara
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Cukup tekan mikrofon dan sebutkan penjualan atau belanja barang. AI langsung menyusunnya menjadi transaksi rapi tanpa perlu mengetik manual.
                                    </p>
                                </div>
                            </a>

                            {/* Modul 2: IDATA (Analisis) */}
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-600 hover:shadow-md space-y-4 text-left block"
                            >
                                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
                                    <BarChart3 className="size-6 text-amber-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                                        Modul IDATA
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                        Analisis Perkembangan Usaha
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Grafik laba bersih, pantauan arus kas harian, dan informasi produk terlaris disajikan dengan visual yang mudah dipahami setiap saat.
                                    </p>
                                </div>
                            </a>

                            {/* Modul 3: INOV (Promosi) */}
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-600 hover:shadow-md space-y-4 text-left block"
                            >
                                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 group-hover:scale-105 transition-transform">
                                    <Megaphone className="size-6" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                                        Modul INOV
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                        Materi Promosi Otomatis
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Buat caption media sosial, tagar relevan, dan poster promosi jualan dalam hitungan detik untuk menarik lebih banyak pelanggan setia.
                                    </p>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Section 2: How It Works (#cara-kerja) */}
                <section
                    id="cara-kerja"
                    tabIndex={-1}
                    className="px-4 py-16 sm:px-6 lg:px-8 bg-white outline-none"
                >
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="text-center space-y-2">
                            <div className="inline-block rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
                                Mudah Digunakan
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Cara Kerja Sederhana dalam 3 Langkah
                            </h2>
                            <p className="text-sm text-slate-600 max-w-xl mx-auto">
                                Tidak perlu pelatihan panjang. Mulai dalam beberapa detik dari ponsel Anda.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Step 1 */}
                            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold text-lg">
                                        1
                                    </div>
                                    <Mic className="size-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Bicara atau Ketik
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Cukup tekan tombol mikrofon dan sebutkan penjualan atau pengeluaran usahamu secara alami, seperti bercerita kepada kasir pribadi.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold text-lg">
                                        2
                                    </div>
                                    <Sparkles className="size-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    AI Merapikan Data
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Sistem kecerdasan buatan LAPAK memilah jenis transaksi, harga, dan pos kas secara otomatis ke dalam pembukuan terstruktur.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold text-lg">
                                        3
                                    </div>
                                    <BarChart3 className="size-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Usaha Siap Tumbuh
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Lihat laporan laba rugi berkala, dapatkan rekomendasi cerdas dari data sekitar, dan buat materi promosi tanpa bantuan desainer.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Issues & Statistics (#masalah) */}
                <section
                    id="masalah"
                    tabIndex={-1}
                    className="border-t border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 outline-none"
                >
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="text-center space-y-2">
                            <div className="inline-block rounded-md bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 mb-2">
                                Fakta dan Tantangan
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Tantangan Nyata UMKM Indonesia
                            </h2>
                            <p className="text-sm text-slate-600 max-w-xl mx-auto">
                                Mengapa LAPAK hadir untuk mempermudah operasional harian setiap pelaku usaha kecil.
                            </p>
                        </div>

                        {/* Validated Stats Grid (Rendered only if both source and year exist) */}
                        {stats.length > 0 && (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {stats.map((stat, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <div className="text-4xl font-extrabold text-emerald-800">
                                                {stat.value}
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 leading-snug">
                                                {stat.label}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                                            {stat.source_url ? (
                                                <a
                                                    href={stat.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline hover:text-emerald-800 transition-colors"
                                                >
                                                    {stat.source_text}
                                                </a>
                                            ) : (
                                                <span>{stat.source_text}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="border-t border-slate-200 bg-emerald-50/60 px-4 py-16 sm:px-6 lg:px-8 text-center">
                    <div className="mx-auto max-w-3xl space-y-6">
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                            Siap Mengembangkan Usahamu Hari Ini?
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                            Mulai catat transaksi semudah mengirim pesan suara. Gratis, mudah, dan dirancang khusus untuk kenyamanan Anda.
                        </p>
                        <div className="pt-2">
                            <Link
                                href={ctaTarget}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-emerald-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-700 min-h-[48px]"
                            >
                                {ctaLabel}
                                <ArrowRight className="size-5 ml-1" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        {/* Logo and Tagline */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <img
                                    src="/Logo Kanopi dan Grafik Naik.png"
                                    alt="Ikon LAPAK"
                                    className="size-7 object-contain"
                                    width={28}
                                    height={28}
                                    onError={(e) => {
                                        e.currentTarget.src = '/logo-icon.png';
                                    }}
                                />
                                <span className="text-base font-bold text-slate-900">
                                    {site.name}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 max-w-sm">
                                {site.tagline}
                            </p>
                        </div>

                        {/* Navigation and Legal Links */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-700">
                            <Link href="/syarat" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-800 min-h-[44px] inline-flex items-center">
                                Syarat dan Ketentuan
                            </Link>
                            <Link href="/privasi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-800 min-h-[44px] inline-flex items-center">
                                Kebijakan Privasi
                            </Link>
                        </div>

                        {/* Dynamic Contact Links */}
                        <div className="flex items-center justify-center gap-4 text-xs font-medium">
                            {contact.email && (
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-800 p-2 min-h-[44px]"
                                    aria-label={`Kirim email ke ${contact.email}`}
                                >
                                    <Mail className="size-4" />
                                    <span>{contact.email}</span>
                                </a>
                            )}
                            {contact.whatsapp_url && (
                                <a
                                    href={contact.whatsapp_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-800 p-2 min-h-[44px]"
                                    aria-label="Hubungi WhatsApp LAPAK"
                                >
                                    <MessageCircle className="size-4 text-emerald-700" />
                                    <span>WhatsApp</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
                        <p>
                            &copy; {currentYear} {site.name}. Seluruh hak cipta dilindungi.
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1">
                                <ShieldCheck className="size-3.5 text-emerald-700" />
                                Keamanan Terjamin
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
