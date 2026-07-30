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
import { usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/sidebar/app-sidebar";
import { Separator } from "@base-ui/react";
import { GlobalSearch } from "@/components/GlobalSearch";

/**
 * Properti komponen AuthenticatedLayout.
 */
export interface AuthenticatedLayoutProps {
    /** Elemen header khusus halaman yang bersifat opsional. */
    header?: ReactNode;
    /** Konten utama halaman terautentikasi. */
    children: ReactNode;
}

/**
 * Layout utama untuk halaman aplikasi terautentikasi (halaman admin).
 *
 * @param props Properti komponen layout.
 * @returns Pembungkus layout terautentikasi dengan sidebar dan navbar.
 */
export default function AuthenticatedLayout({
    header,
    children,
}: AuthenticatedLayoutProps) {
    // ? Mengambil data pengguna terautentikasi dari props halaman Inertia.
    const { auth } = usePage<PageProps>().props;

    const sidebarUser = auth?.user
        ? {
              name: auth.user.name,
              email: auth.user.email,
              avatar: "/foto/upa-pkk-logo.jpg.jpeg",
          }
        : undefined;

    return (
        <SidebarProvider>
            {/* Sidebar Kiri */}
            <AppSidebar user={sidebarUser} />

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

                {/* Header Opsional Halaman */}
                {header && (
                    <div className="border-b bg-white px-4 py-3 shadow-2xs md:px-8">
                        {header}
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 bg-gray-50 p-4 md:p-8">{children}</main>
            </div>
        </SidebarProvider>
    );
}
