import { Link } from '@inertiajs/react';
import { Mic, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid min-h-svh lg:grid-cols-2 bg-background">
            {/* Sisi Kiri: Branding LAPAK */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700 p-12 text-white lg:flex">
                <div className="relative z-10">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm"
                    >
                        <img
                            src="/logo-horizontal.png"
                            alt="LAPAK Logo"
                            className="h-10 w-auto object-contain brightness-0 invert"
                        />
                    </Link>
                </div>

                <div className="relative z-10 max-w-md space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                        <Sparkles className="size-3.5 text-amber-300" />
                        Voice-First AI untuk Warung & Toko
                    </div>
                    <h2 className="font-heading text-3xl font-extrabold leading-tight">
                        Cukup bicara, usahamu berkembang.
                    </h2>
                    <p className="text-sm leading-relaxed text-white/90 font-sans">
                        Catat pemasukan dan pengeluaran lewat suara, dapatkan analisis pasar sekitar, dan buat poster promosi menarik tanpa repot.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-xs text-white/80">
                    <span className="inline-flex items-center gap-1.5">
                        <Mic className="size-4 text-amber-300" />
                        Catat Suara Cepat
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Store className="size-4 text-amber-200" />
                        Khusus UMKM Indonesia
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-emerald-300" />
                        Data Terlindungi
                    </span>
                </div>
            </div>

            {/* Sisi Kanan: Form Auth */}
            <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
                <div className="flex justify-center lg:hidden">
                    <Link
                        href={home()}
                        className="inline-flex items-center justify-center"
                    >
                        <img
                            src="/logo-horizontal.png"
                            alt="LAPAK Logo"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>
                </div>

                <div className="mx-auto my-auto w-full max-w-md space-y-6">
                    <div className="space-y-1.5 text-center">
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>

                <div className="text-center text-xs text-muted-foreground">
                    &copy; 2026 LAPAK &bull; Cukup bicara, usahamu berkembang.
                </div>
            </div>
        </div>
    );
}
