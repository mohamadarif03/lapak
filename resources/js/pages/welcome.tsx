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
import { Button } from '@/components/ui/button';

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
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-secondary selection:text-primary">
            {/* Skip to Main Content Link for Keyboard Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm font-semibold"
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
                    className="w-full bg-lapak-green-soft border-b border-lapak-green/20 px-4 py-3 text-sm text-lapak-ink"
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Info className="size-5 shrink-0 text-lapak-green" />
                            <p className="font-medium">{pesan}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
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
                            className="text-sm font-semibold text-lapak-body hover:text-primary transition-colors py-2"
                        >
                            Fitur Unggulan
                        </a>
                        <a
                            href="#cara-kerja"
                            onClick={(e) => scrollToSection(e, 'cara-kerja')}
                            className="text-sm font-semibold text-lapak-body hover:text-primary transition-colors py-2"
                        >
                            Cara Kerja
                        </a>
                        <a
                            href="#masalah"
                            onClick={(e) => scrollToSection(e, 'masalah')}
                            className="text-sm font-semibold text-lapak-body hover:text-primary transition-colors py-2"
                        >
                            Statistik UMKM
                        </a>
                    </nav>

                    {/* Desktop Action Buttons */}
                    <div className="hidden sm:flex items-center gap-3">
                        {isLoggedIn ? (
                            <Button asChild size="default" className="font-heading min-h-[44px]">
                                <Link href={ctaTarget}>
                                    {ctaLabel}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="font-heading min-h-[44px] px-4"
                                >
                                    <Link href="/masuk">Masuk</Link>
                                </Button>
                                <Button asChild size="sm" className="font-heading min-h-[44px] px-4">
                                    <Link href={ctaTarget}>{ctaLabel}</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="flex sm:hidden items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2.5 rounded-lg text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] min-w-[48px]"
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
                    <div className="sm:hidden border-t border-border bg-background px-4 py-5 space-y-4 shadow-lg">
                        <nav className="flex flex-col space-y-3" aria-label="Navigasi Menu Seluler">
                            <a
                                href="#fitur"
                                onClick={(e) => scrollToSection(e, 'fitur')}
                                className="text-base font-semibold text-lapak-body hover:text-primary py-2 px-1"
                            >
                                Fitur Unggulan
                            </a>
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="text-base font-semibold text-lapak-body hover:text-primary py-2 px-1"
                            >
                                Cara Kerja
                            </a>
                            <a
                                href="#masalah"
                                onClick={(e) => scrollToSection(e, 'masalah')}
                                className="text-base font-semibold text-lapak-body hover:text-primary py-2 px-1"
                            >
                                Statistik UMKM
                            </a>
                        </nav>

                        <div className="pt-3 border-t border-border/80 flex flex-col gap-2.5">
                            {isLoggedIn ? (
                                <Button asChild size="lg" className="w-full font-heading min-h-[48px]">
                                    <Link href={ctaTarget}>
                                        {ctaLabel}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="lg" className="w-full font-heading min-h-[48px]">
                                        <Link href={ctaTarget}>{ctaLabel}</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="w-full font-heading min-h-[48px]"
                                    >
                                        <Link href="/masuk">Masuk</Link>
                                    </Button>
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
                        <div className="inline-flex items-center gap-2 rounded-full border border-lapak-gold/60 bg-lapak-gold-soft px-4 py-1.5 text-xs font-bold text-lapak-warning shadow-xs">
                            <Sparkles className="size-3.5 text-lapak-gold" />
                            <span>Asisten Pintar UMKM Indonesia</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15]">
                            Cukup Bicara, <br className="hidden sm:inline" />
                            <span className="text-primary">Usahamu Berkembang.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mx-auto max-w-2xl text-base sm:text-lg text-lapak-body leading-relaxed">
                            Pencatatan keuangan harian semudah mengirim pesan suara. Pantau keuntungan
                            usaha dan buat materi promosi kreatif secara otomatis tanpa ribet.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                            {/* Primary CTA */}
                            <Button
                                asChild
                                size="lg"
                                className="w-full sm:w-auto font-heading shadow-md min-h-[48px] px-8 text-base"
                            >
                                <Link href={ctaTarget}>
                                    {ctaLabel}
                                    <ArrowRight className="size-5 ml-1" />
                                </Link>
                            </Button>

                            {/* Demo CTA (Shown only if demoEnabled and not logged in) */}
                            {demoEnabled && !isLoggedIn && (
                                <form
                                    action="/api/demo/start"
                                    method="POST"
                                    onSubmit={handleDemoSubmit}
                                    className="w-full sm:w-auto"
                                >
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        size="lg"
                                        disabled={isStartingDemo}
                                        className="w-full sm:w-auto font-heading min-h-[48px] px-6 text-base cursor-pointer"
                                    >
                                        <Sparkles className="size-5 mr-1 text-primary" />
                                        {isStartingDemo ? 'Menyiapkan Demo...' : 'Lihat Demo'}
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* Assurances */}
                        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-lapak-muted">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-lapak-success" />
                                Tanpa Rumus Akuntansi Rumit
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-lapak-success" />
                                Mendukung Suara Bahasa Indonesia
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="size-4 text-lapak-success" />
                                Data Usaha Aman dan Terenkripsi
                            </span>
                        </div>
                    </div>
                </section>

                {/* Section 1: Three Core Features (#fitur) */}
                <section
                    id="fitur"
                    tabIndex={-1}
                    className="border-t border-border bg-card/60 px-4 py-16 sm:px-6 lg:px-8 outline-none"
                >
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="text-center space-y-2">
                            <div className="inline-block rounded-md bg-secondary px-3 py-1 text-xs font-bold text-primary mb-2">
                                Solusi Lengkap
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                                Tiga Pilar Solusi untuk Usahamu
                            </h2>
                            <p className="text-sm text-lapak-muted max-w-xl mx-auto">
                                Dirancang khusus dengan alur kerja yang hangat, sederhana, dan mudah
                                dipahami oleh pemilik UMKM.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Modul 1: ISIS (Catat) */}
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md space-y-4 text-left block"
                            >
                                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary group-hover:scale-105 transition-transform">
                                    <Mic className="size-6" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-primary">
                                        Modul ISIS
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                        Pencatatan Lewat Suara
                                    </h3>
                                    <p className="text-sm text-lapak-body leading-relaxed">
                                        Cukup tekan mikrofon dan sebutkan penjualan atau belanja barang. AI langsung menyusunnya menjadi transaksi rapi tanpa perlu mengetik manual.
                                    </p>
                                </div>
                            </a>

                            {/* Modul 2: IDATA (Analisis) */}
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md space-y-4 text-left block"
                            >
                                <div className="flex size-12 items-center justify-center rounded-xl bg-lapak-gold-soft text-lapak-warning group-hover:scale-105 transition-transform">
                                    <BarChart3 className="size-6 text-lapak-gold" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-lapak-gold-soft px-2 py-0.5 text-xs font-bold text-lapak-warning">
                                        Modul IDATA
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                        Analisis Perkembangan Usaha
                                    </h3>
                                    <p className="text-sm text-lapak-body leading-relaxed">
                                        Grafik laba bersih, pantauan arus kas harian, dan informasi produk terlaris disajikan dengan visual yang mudah dipahami setiap saat.
                                    </p>
                                </div>
                            </a>

                            {/* Modul 3: INOV (Promosi) */}
                            <a
                                href="#cara-kerja"
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md space-y-4 text-left block"
                            >
                                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary group-hover:scale-105 transition-transform">
                                    <Megaphone className="size-6" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-primary">
                                        Modul INOV
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                        Materi Promosi Otomatis
                                    </h3>
                                    <p className="text-sm text-lapak-body leading-relaxed">
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
                    className="px-4 py-16 sm:px-6 lg:px-8 bg-background outline-none"
                >
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="text-center space-y-2">
                            <div className="inline-block rounded-md bg-lapak-green-soft px-3 py-1 text-xs font-bold text-lapak-green mb-2">
                                Mudah Digunakan
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                                Cara Kerja Sederhana dalam 3 Langkah
                            </h2>
                            <p className="text-sm text-lapak-muted max-w-xl mx-auto">
                                Tidak perlu pelatihan panjang. Mulai dalam beberapa detik dari ponsel Anda.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Step 1 */}
                            <div className="relative rounded-2xl border border-border bg-card p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary font-bold text-lg">
                                        1
                                    </div>
                                    <Mic className="size-6 text-lapak-muted" />
                                </div>
                                <h3 className="font-heading text-lg font-bold text-foreground">
                                    Bicara atau Ketik
                                </h3>
                                <p className="text-sm text-lapak-body leading-relaxed">
                                    Cukup tekan tombol mikrofon dan sebutkan penjualan atau pengeluaran usahamu secara alami, seperti bercerita kepada kasir pribadi.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative rounded-2xl border border-border bg-card p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary font-bold text-lg">
                                        2
                                    </div>
                                    <Sparkles className="size-6 text-lapak-muted" />
                                </div>
                                <h3 className="font-heading text-lg font-bold text-foreground">
                                    AI Merapikan Data
                                </h3>
                                <p className="text-sm text-lapak-body leading-relaxed">
                                    Sistem kecerdasan buatan LAPAK memilah jenis transaksi, harga, dan pos kas secara otomatis ke dalam pembukuan terstruktur.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative rounded-2xl border border-border bg-card p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary font-bold text-lg">
                                        3
                                    </div>
                                    <BarChart3 className="size-6 text-lapak-muted" />
                                </div>
                                <h3 className="font-heading text-lg font-bold text-foreground">
                                    Usaha Siap Tumbuh
                                </h3>
                                <p className="text-sm text-lapak-body leading-relaxed">
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
                    className="border-t border-border bg-card/40 px-4 py-16 sm:px-6 lg:px-8 outline-none"
                >
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="text-center space-y-2">
                            <div className="inline-block rounded-md bg-lapak-gold-soft px-3 py-1 text-xs font-bold text-lapak-warning mb-2">
                                Fakta dan Tantangan
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                                Tantangan Nyata UMKM Indonesia
                            </h2>
                            <p className="text-sm text-lapak-muted max-w-xl mx-auto">
                                Mengapa LAPAK hadir untuk mempermudah operasional harian setiap pelaku usaha kecil.
                            </p>
                        </div>

                        {/* Validated Stats Grid (Rendered only if both source and year exist) */}
                        {stats.length > 0 && (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {stats.map((stat, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <div className="font-heading text-4xl font-extrabold text-primary">
                                                {stat.value}
                                            </div>
                                            <p className="text-sm font-semibold text-foreground leading-snug">
                                                {stat.label}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-border/80 text-xs text-lapak-muted">
                                            {stat.source_url ? (
                                                <a
                                                    href={stat.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline hover:text-primary transition-colors"
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
                <section className="border-t border-border bg-secondary/50 px-4 py-16 sm:px-6 lg:px-8 text-center">
                    <div className="mx-auto max-w-3xl space-y-6">
                        <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-foreground">
                            Siap Mengembangkan Usahamu Hari Ini?
                        </h2>
                        <p className="text-sm sm:text-base text-lapak-body max-w-xl mx-auto leading-relaxed">
                            Mulai catat transaksi semudah mengirim pesan suara. Gratis, mudah, dan dirancang khusus untuk kenyamanan Anda.
                        </p>
                        <div className="pt-2">
                            <Button asChild size="lg" className="font-heading min-h-[48px] px-8 text-base shadow-md">
                                <Link href={ctaTarget}>
                                    {ctaLabel}
                                    <ArrowRight className="size-5 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-background py-10 px-4 sm:px-6 lg:px-8">
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
                                <span className="font-heading text-base font-bold text-foreground">
                                    {site.name}
                                </span>
                            </div>
                            <p className="text-xs text-lapak-muted max-w-sm">
                                {site.tagline}
                            </p>
                        </div>

                        {/* Navigation and Legal Links */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-lapak-body">
                            <Link href="/syarat" target="_blank" rel="noopener noreferrer" className="hover:text-primary min-h-[44px] inline-flex items-center">
                                Syarat dan Ketentuan
                            </Link>
                            <Link href="/privasi" target="_blank" rel="noopener noreferrer" className="hover:text-primary min-h-[44px] inline-flex items-center">
                                Kebijakan Privasi
                            </Link>
                        </div>

                        {/* Dynamic Contact Links */}
                        <div className="flex items-center justify-center gap-4 text-xs font-medium">
                            {contact.email && (
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="inline-flex items-center gap-1.5 text-lapak-muted hover:text-primary p-2 min-h-[44px]"
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
                                    className="inline-flex items-center gap-1.5 text-lapak-muted hover:text-primary p-2 min-h-[44px]"
                                    aria-label="Hubungi WhatsApp LAPAK"
                                >
                                    <MessageCircle className="size-4 text-lapak-success" />
                                    <span>WhatsApp</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-lapak-muted text-center sm:text-left">
                        <p>
                            &copy; {currentYear} {site.name}. Seluruh hak cipta dilindungi.
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1">
                                <ShieldCheck className="size-3.5 text-lapak-success" />
                                Keamanan Terjamin
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
