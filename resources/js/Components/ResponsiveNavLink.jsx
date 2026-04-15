import { Link } from "@inertiajs/react";

/**
 * * ResponsiveNavLink Component
 * * ----------------------------------------
 * * Link navigasi khusus untuk tampilan responsive (mobile / sidebar collapse)
 *
 * ? Kenapa dipisah?
 * ? - Styling active vs non-active cukup kompleks
 * ? - Digunakan berulang di menu navigasi
 * ? - Mempermudah konsistensi UI di seluruh aplikasi
 *
 * ! Behavior:
 * - Menggunakan Link dari Inertia (SPA navigation)
 * - Menyesuaikan style berdasarkan state active
 * - Mendukung custom class tambahan
 *
 * @param {boolean} active - Menentukan apakah link sedang aktif (halaman saat ini)
 * @param {string} className - Class tambahan untuk styling custom
 * @param {ReactNode} children - Isi link (text / icon / kombinasi)
 * @param {Object} props - Props tambahan untuk komponen Link (href, method, dll)
 */
export default function ResponsiveNavLink({
    active = false,
    className = "",
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800"
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
