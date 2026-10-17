import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChartNoAxesCombined,
    CheckCircle2,
    Headset,
    LogIn,
    Megaphone,
    Mic,
    ShieldCheck,
    Sparkles,
    UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-secondary selection:text-primary">
            <Head title="LAPAK - Layanan Asisten Pintar untuk Akselerasi Kewirausahaan" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
                        <img
                            src="/Lapak Market Signal Logo.png"
                            alt="Logo LAPAK"
                            className="h-12 sm:h-14 w-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.src = '/logo-horizontal.png';
                            }}
                        />
                    </Link>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Button asChild size="default" className="font-heading">
                                <Link href="/dashboard">
                                    Buka Dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex font-heading">
                                    <Link href={login()}>
                                        <LogIn className="size-4" />
                                        Masuk
                                    </Link>
                                </Button>
                                <Button asChild size="sm" className="font-heading">
                                    <Link href={register()}>
                                        <UserPlus className="size-4" />
                                        Daftar Akun
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="relative overflow-hidden px-4 pt-12 pb-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center space-y-6">
                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-lapak-gold/60 bg-lapak-gold-soft px-4 py-1.5 text-xs font-bold text-lapak-warning shadow-xs">
                            <Sparkles className="size-3.5 text-lapak-gold" />
                            <span>Asisten Pintar UMKM Indonesia &bull; Deep Green & Warm Cream</span>
                        </div>

                        {/* Title */}
                        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15]">
                            Cukup Bicara, <br className="hidden sm:inline" />
                            <span className="text-primary">Usahamu Berkembang.</span>
                        </h1>

                        {/* Description */}
                        <p className="mx-auto max-w-2xl text-base sm:text-lg text-lapak-body leading-relaxed">
                            Pencatatan keuangan harian semudah mengirim pesan suara. Pantau keuntungan usaha dan buat materi promosi kreatif secara otomatis tanpa ribet.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                            <Button asChild size="lg" className="w-full sm:w-auto font-heading shadow-md">
                                <Link href="/dashboard">
                                    <Mic className="size-5" />
                                    Coba Demo Catat Suara
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-heading">
                                <Link href="/onboarding">
                                    <Sparkles className="size-5" />
                                    Mulai Atur Profil Usaha
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto font-heading text-xs text-muted-foreground hover:text-foreground">
                                <Link href={login()}>
                                    <LogIn className="size-4" />
                                    Sudah Punya Akun? Masuk
                                </Link>
                            </Button>
                        </div>

                        {/* Assurances */}
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-lapak-muted">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-lapak-success" />
                                Tanpa Rumus Akuntansi Rumit
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-lapak-success" />
                                Mendukung Suara Bahasa Indonesia & Daerah
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="size-4 text-lapak-success" />
                                Data Usaha Aman & Terenkripsi
                            </span>
                        </div>
                    </div>
                </section>

                {/* 3 Core Modules Section */}
                <section className="border-t border-border bg-card/60 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="text-center space-y-2">
                            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                                Tiga Pilar Solusi untuk Usahamu
                            </h2>
                            <p className="text-sm text-lapak-muted max-w-xl mx-auto">
                                Dirancang khusus dengan alur kerja yang hangat, sederhana, dan mudah dipahami oleh pemilik UMKM.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Modul 1: ISIS (Catat) */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md space-y-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                                    <Mic className="size-6" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-primary">
                                        Modul ISIS
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-foreground">
                                        Pencatatan Lewat Suara
                                    </h3>
                                    <p className="text-sm text-lapak-body leading-relaxed">
                                        Cukup tekan mikrofon dan sebutkan penjualan atau belanja barang. AI langsung menyusunnya menjadi transaksi rapi.
                                    </p>
                                </div>
                            </div>

                            {/* Modul 2: IDATA (Analisis) */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md space-y-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-lapak-gold-soft text-lapak-warning">
                                    <ChartNoAxesCombined className="size-6 text-lapak-gold" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-lapak-gold-soft px-2 py-0.5 text-xs font-bold text-lapak-warning">
                                        Modul IDATA
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-foreground">
                                        Analisis Perkembangan Usaha
                                    </h3>
                                    <p className="text-sm text-lapak-body leading-relaxed">
                                        Grafik laba bersih, pantauan arus kas, dan informasi produk terlaris disajikan dengan visual yang mudah dipindai.
                                    </p>
                                </div>
                            </div>

                            {/* Modul 3: INOV (Promosi) */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md space-y-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                                    <Megaphone className="size-6" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-primary">
                                        Modul INOV
                                    </div>
                                    <h3 className="font-heading text-lg font-bold text-foreground">
                                        Materi Promosi Otomatis
                                    </h3>
                                    <p className="text-sm text-lapak-body leading-relaxed">
                                        Buat caption media sosial dan ide promosi jualan dalam hitungan detik untuk menarik lebih banyak pembeli setia.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-background py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <img
                            src="/Logo Kanopi dan Grafik Naik.png"
                            alt="Ikon LAPAK"
                            className="size-7 object-contain"
                            onError={(e) => {
                                e.currentTarget.src = '/logo-icon.png';
                            }}
                        />
                        <span className="font-heading text-sm font-bold text-foreground">LAPAK</span>
                        <span className="text-xs text-lapak-muted">&mdash; Cukup bicara, usahamu berkembang.</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-lapak-muted">
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="size-4 text-lapak-success" />
                            Keamanan Data Terjamin
                        </span>
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-1.5">
                            <Headset className="size-4 text-primary" />
                            Dukungan Komunitas UMKM
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
