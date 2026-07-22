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

/**
 * Interface untuk item menu navigasi utama.
 */
export interface NavItem {
    /** Judul label menu. */
    title: string;
    /** URL tujuan navigasi. */
    url: string;
    /** Ikon visual menu. */
    icon: ReactNode;
    /** Menandakan apakah item menu sedang aktif. */
    isActive?: boolean;
}

/**
 * Properti komponen NavMain.
 */
export interface NavMainProps {
    /** Daftar item navigasi utama. */
    items: NavItem[];
}

/**
 * Komponen penyusun daftar menu navigasi utama sidebar.
 *
 * @param props Properti komponen NavMain.
 * @returns Elemen grup menu navigasi sidebar.
 */
export function NavMain({ items }: NavMainProps) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>

            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.url}>
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
