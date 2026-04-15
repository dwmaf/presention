import { Link } from "@inertiajs/react";

/**
 * * NavLink Component
 * * ----------------------------------------
 * * Link navigasi utama (biasanya untuk navbar desktop)
 *
 * ? Kenapa dipisah?
 * ? - Styling active vs inactive cukup kompleks
 * ? - Digunakan berulang di navbar
 * ? - Menjaga konsistensi UI navigasi
 *
 * ! Behavior:
 * - Menggunakan Link dari Inertia (SPA navigation)
 * - Menampilkan underline (border-bottom) saat active
 * - Mendukung custom class tambahan
 *
 * @param {boolean} active - Menentukan apakah link sedang aktif
 * @param {string} className - Class tambahan untuk styling custom
 * @param {ReactNode} children - Isi link (text / icon)
 * @param {Object} props - Props tambahan untuk Link (href, method, dll)
 */
export default function NavLink({
    active = false,
    className = "",
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none " +
                (active
                    ? "border-indigo-400 text-gray-900 focus:border-indigo-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700") +
                className
            }
        >
            {children}
        </Link>
    );
}
