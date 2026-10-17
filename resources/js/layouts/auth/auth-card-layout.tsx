import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-between bg-background p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="inline-flex items-center justify-center self-center transition-transform hover:scale-[1.02]"
                >
                    <img
                        src="/logo-horizontal.png"
                        alt="LAPAK Logo"
                        className="h-12 sm:h-14 w-auto object-contain"
                    />
                </Link>

                <Card className="rounded-2xl border-border bg-card shadow-sm">
                    <CardHeader className="px-6 pt-6 pb-0 text-center sm:px-8 sm:pt-8">
                        <CardTitle className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-sm text-muted-foreground mt-1">
                                {description}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="px-6 py-6 sm:px-8 sm:py-8">
                        {children}
                    </CardContent>
                </Card>
            </div>

            <footer className="text-center text-xs text-muted-foreground">
                <p>&copy; 2026 LAPAK &bull; Cukup bicara, usahamu berkembang.</p>
            </footer>
        </div>
    );
}
