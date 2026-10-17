import { Link } from '@inertiajs/react';
import {
    ChartNoAxesCombined,
    FileText,
    Headset,
    LayoutDashboard,
    Megaphone,
    Mic,
    Sparkles,
    Store,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Catat Transaksi',
        href: '/catat',
        icon: Mic,
    },
    {
        title: 'Laporan Keuangan',
        href: '/laporan',
        icon: FileText,
    },
    {
        title: 'Analisis Pasar',
        href: '/analisis',
        icon: ChartNoAxesCombined,
    },
    {
        title: 'Promosi Cerdas',
        href: '/promosi',
        icon: Megaphone,
    },
    {
        title: 'Pusat Bantuan',
        href: '/bantuan',
        icon: Headset,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Profil Lapak',
        href: '/onboarding',
        icon: Sparkles,
    },
    {
        title: 'Pengaturan Usaha',
        href: '/settings/usaha',
        icon: Store,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
