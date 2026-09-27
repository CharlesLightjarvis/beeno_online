import { Link, usePage } from '@inertiajs/react';
import { CalendarRange, GraduationCap, LayoutGrid, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
import adminRoutes from '@/routes/admin';
import teacher from '@/routes/teacher';
import sessions from '@/routes/teacher/sessions';
import students from '@/routes/teacher/students';
import type { Auth, NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const dashboardHref = auth.permissions.includes('view.admin-dashboard')
        ? adminRoutes.dashboard()
        : teacher.dashboard();

    // Declarative: add a nav item here with an optional `permission` —
    // no extra branching needed anywhere else to show/hide it.
    const navItemsConfig: (NavItem & { permission?: string })[] = [
        {
            title: 'Dashboard',
            href: dashboardHref,
            icon: LayoutGrid,
        },
        {
            title: 'Étudiants',
            href: students.index(),
            icon: Users,
            permission: 'manage.own-students',
        },
        {
            title: 'Professeurs',
            href: adminRoutes.teachers.index(),
            icon: GraduationCap,
            permission: 'view.admin-teachers',
        },
        {
            title: 'Sessions',
            href: auth.permissions.includes('view.admin-sessions')
                ? adminRoutes.sessions.index()
                : sessions.index(),
            icon: CalendarRange,
            permission: auth.permissions.includes('view.admin-sessions')
                ? 'view.admin-sessions'
                : 'manage.own-sessions',
        },
    ];

    const mainNavItems = navItemsConfig.filter(
        (item) =>
            !item.permission || auth.permissions.includes(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={mainNavItems[0].href} prefetch>
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
