/**
 * ============================================================================
 * Layout      : AuthenticatedLayout
 * Layer       : Layout
 *
 * Description:
 * Layout utama untuk halaman terautentikasi (admin). Menyediakan wrapper
 * SidebarProvider dan menempelkan komponen AppSidebar baru.
 * ============================================================================
 */

import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/sidebar/app-sidebar";
import { Separator } from "@base-ui/react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GlobalSearch } from "@/components/GlobalSearch";

interface AuthenticatedLayoutProps {
    header?: ReactNode;
    children: ReactNode;
}

export default function AuthenticatedLayout({
    children,
}: AuthenticatedLayoutProps) {
    return (
        <SidebarProvider>
            {/* Sidebar Kiri */}
            <AppSidebar />

            {/* Area Konten Utama */}
            <div className="flex min-h-screen flex-1 flex-col bg-gray-50">
                {/* Navbar Atas */}
                <header className="bg-background sticky top-0 right-0 left-0 z-50 flex h-16 shrink-0 items-center gap-4 border-b px-4">
                    {/* Trigger Sidebar */}
                    <SidebarTrigger />

                    {/* Separator Vertikal */}
                    <Separator
                        orientation="vertical"
                        className="bg-border h-4 w-px"
                    />

                    {/* Search Bar */}
                    <GlobalSearch />
                </header>

                <main className="min-h-screen flex-1 bg-gray-50 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
