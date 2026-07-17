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
                    <div className="relative w-full max-w-xs md:max-w-sm">
                        <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                        <Input
                            type="search"
                            placeholder="Cari karyawan, divisi..."
                            className="bg-muted/20 focus-visible:ring-sidebar-ring h-9 w-full border-none pl-9 shadow-none focus-visible:ring-1"
                        />
                    </div>
                </header>

                <main className="min-h-screen flex-1 bg-gray-50 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
