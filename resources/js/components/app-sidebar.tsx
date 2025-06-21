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
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import {
    HelpCircle,
    LayoutGrid,
    List,
    LogOut,
    ScrollText,
    Settings
} from 'lucide-react';
import AppLogo from './app-logo';
import { type NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Cashier', href: '/cashier', icon: ScrollText },
    { title: 'Product', href: '/products', icon: List },
    { title: 'Settings', href: '/settings', icon: Settings }
];

const supportNavItems: NavItem[] = [
    {
        title: 'Help & Support',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: HelpCircle
    }
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
                <NavFooter items={supportNavItems} className="mt-auto" />
                <SidebarMenu className="mb-2">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-muted"
                            >
                                <LogOut className="h-4 w-4" />
                                Log Out
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
