import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    alt = 'Logo LAPAK',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/Logo Kanopi dan Grafik Naik.png"
            alt={alt}
            onError={(e) => {
                e.currentTarget.src = '/logo-icon.png';
            }}
            className={cn('size-8 object-contain shrink-0', className)}
            {...props}
        />
    );
}
