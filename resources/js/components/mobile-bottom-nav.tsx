import { Link } from '@inertiajs/react';
import {
    ChartNoAxesCombined,
    FileText,
    Headset,
    Megaphone,
    Mic,
} from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
    const { isCurrentUrl } = useCurrentUrl();

    const items = [
        {
            title: 'Laporan',
            href: '/laporan',
            icon: FileText,
            isPrimaryMic: false,
        },
        {
            title: 'Analisis',
            href: '/analisis',
            icon: ChartNoAxesCombined,
            isPrimaryMic: false,
        },
        {
            title: 'Catat',
            href: '/catat',
            icon: Mic,
            isPrimaryMic: true,
        },
        {
            title: 'Promosi',
            href: '/promosi',
            icon: Megaphone,
            isPrimaryMic: false,
        },
        {
            title: 'Bantuan',
            href: '/bantuan',
            icon: Headset,
            isPrimaryMic: false,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden shadow-lg safe-area-bottom">
            <nav className="mx-auto flex h-16 max-w-md items-center justify-between px-2">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);
                    const Icon = item.icon;

                    if (item.isPrimaryMic) {
                        return (
                            <div key={item.title} className="flex flex-1 items-center justify-center">
                                <Link
                                    href={item.href}
                                    aria-label="Catat Transaksi Suara"
                                    className={cn(
                                        '-mt-6 flex size-14 items-center justify-center rounded-full border-4 border-background bg-primary text-white shadow-xl transition-transform hover:scale-105 active:scale-95',
                                        active && 'ring-2 ring-primary ring-offset-2'
                                    )}
                                >
                                    <Icon className="size-6 text-white" />
                                    <span className="sr-only">{item.title}</span>
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-semibold transition-colors',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className={cn('size-5 mb-0.5', active ? 'text-primary' : 'text-muted-foreground')} />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
