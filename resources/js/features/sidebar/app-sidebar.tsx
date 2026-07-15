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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = {
        name: "UPA PKK",
        email: "Administrator",
        avatar: "/foto/upa-pkk-logo.jpg.jpeg",
    };

    const navMain = [
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
    ];

    return (
        <Sidebar variant="sidebar" collapsible="icon" {...props}>
            {/* Header: Sistem Absensi */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<a href="#" />}>
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <CalendarDaysIcon size={18} />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    Sistem Absensi
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    UPA PKK
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
