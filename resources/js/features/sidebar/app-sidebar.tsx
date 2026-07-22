/**
 * ============================================================================
 * Component   : AppSidebar
 * Layer       : Feature (Sidebar)
 *
 * Description:
 * Komponen utama penyusun sidebar. Mengintegrasikan header "Sistem Absensi",
 * isi menu NavMain, dan footer NavUser.
 * ============================================================================
 */

import * as React from "react";
import { NavMain } from "@/features/sidebar/nav-main";
import { NavUser } from "@/features/sidebar/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    LayoutDashboardIcon,
    UsersIcon,
    LayersIcon,
    CalendarCheckIcon,
} from "lucide-react";
import { CalendarDaysIcon } from "@/components/icons/calendar-days";

/**
 * Interface data profil pengguna sidebar.
 */
export interface SidebarUser {
    /** Nama pengguna yang akan ditampilkan. */
    name: string;
    /** Email atau informasi role pengguna. */
    email: string;
    /** URL foto avatar pengguna. */
    avatar: string;
}

/**
 * Properti untuk komponen AppSidebar.
 */
export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    /** Detail data pengguna yang sedang login. */
    user?: SidebarUser;
}

// * Data pengguna default jika prop user tidak diberikan.
const DEFAULT_USER: SidebarUser = {
    name: "UPA PKK",
    email: "Administrator",
    avatar: "/foto/upa-pkk-logo.jpg.jpeg",
};

/**
 * Komponen utama penyusun sidebar aplikasi Presention.
 *
 * @param props Properti komponen AppSidebar.
 * @returns Komponen sidebar navigasi utama.
 */
export function AppSidebar({ user = DEFAULT_USER, ...props }: AppSidebarProps) {
    // ? Memoize item menu navigasi agar tidak dibuat ulang pada setiap render.
    const navMain = React.useMemo(
        () => [
            {
                title: "Data Absensi",
                url: route("dashboard"),
                icon: <LayoutDashboardIcon />,
                isActive: route().current("dashboard"),
            },
            {
                title: "Daftar Karyawan",
                url: route("interns.index"),
                icon: <UsersIcon />,
                isActive: route().current("interns.*"),
            },
            {
                title: "Divisi",
                url: route("divisions.index"),
                icon: <LayersIcon />,
                isActive: route().current("divisions.*"),
            },
            {
                title: "Absensi Harian",
                url: route("attendance.index"),
                icon: <CalendarCheckIcon />,
                isActive: route().current("attendance.*"),
            },
        ],
        [],
    );

    return (
        <Sidebar
            variant="sidebar"
            collapsible="icon"
            {...props}
            className="[&>[data-slot=sidebar-inner]]:bg-white"
        >
            {/* Header: Sistem Absensi */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            render={<a href={route("dashboard")} />}
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <CalendarDaysIcon size={18} />
                            </div>

                            <div className="grid flex-1 text-left text-sm">
                                <span className="text-lg font-semibold tracking-tighter">
                                    Presention
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    Sistem Absensi UPA PKK
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content: List Menu */}
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>

            {/* Footer: Detail Admin & Dropdown */}
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
