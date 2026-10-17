import { Link } from '@inertiajs/react';
import { Headset, ShieldCheck } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
            {/* Main Content Card */}
            <main className="w-full max-w-md">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    {/* Header Logo & Title inside Card */}
                    <div className="mb-6 flex flex-col items-center space-y-3 text-center">
                        <Link
                            href={home()}
                            className="inline-flex items-center justify-center transition-transform duration-200 hover:scale-[1.02]"
                        >
                            <img
                                src="/Lapak Market Signal Logo.png"
                                alt="LAPAK Logo"
                                className="h-14 sm:h-16 w-auto object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = '/logo-horizontal.png';
                                }}
                            />
                        </Link>
                        <p className="font-heading text-xs font-semibold text-muted-foreground">
                            Cukup bicara, usahamu berkembang.
                        </p>

                        <div className="pt-1 space-y-1">
                            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {children}
                </div>
            </main>

            {/* Footer Assurance & Copyright */}
            <footer className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-[#216E45]" />
                        Data Usaha Aman & Terenkripsi
                    </span>
                    <span className="text-border">•</span>
                    <span className="inline-flex items-center gap-1.5">
                        <Headset className="size-4 text-primary" />
                        Bantuan Pendamping UMKM
                    </span>
                </div>
                <p className="text-[11px] text-muted-foreground/80">
                    &copy; 2026 LAPAK &bull; Layanan Asisten Pintar untuk Akselerasi Kewirausahaan
                </p>
            </footer>
        </div>
    );
}
