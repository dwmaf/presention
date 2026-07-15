/**
 * ============================================================================
 * Component   : NavMain
 * Layer       : Feature (Sidebar)
 *
 * Description:
 * Menampilkan daftar menu navigasi utama datar (tanpa dropdown) dengan
 * dukungan status aktif dan SPA routing via Inertia Link.
 * ============================================================================
 */

import type { ReactNode } from "react";
import { Link } from "@inertiajs/react";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
    title: string;
    url: string;
    icon: ReactNode;
    isActive?: boolean;
}

export function NavMain({ items }: { items: NavItem[] }) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            size="md"
                            tooltip={item.title}
                            render={<Link href={item.url} />}
                            isActive={item.isActive}
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
