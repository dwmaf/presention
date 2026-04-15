import { Link } from "@inertiajs/react";

/**
 * * GuestLayout Component
 * * ----------------------------------------
 * * Layout khusus untuk halaman non-auth (login, register, dll)
 *
 * ? Kenapa dipisah?
 * ? - Memisahkan tampilan user yang belum login
 * ? - Menghindari reuse layout utama (yang ada sidebar, dll)
 * ? - Lebih clean untuk halaman auth
 *
 * ! Behavior:
 * - Menampilkan container tengah (centered layout)
 * - Menyediakan slot (children) untuk konten halaman
 *
 * @param {ReactNode} children - Konten halaman (form login/register, dll)
 */
export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0">
            {/* Logo */}
            <div>
                <Link href="/"></Link>
            </div>

            {/* Container utama */}
            <div className="h-max-[30rem] mt-6 overflow-hidden rounded-xl bg-white shadow-lg">
                {children}
            </div>
        </div>
    );
}
