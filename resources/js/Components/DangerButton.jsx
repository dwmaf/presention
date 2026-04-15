/**
 * * DangerButton Component
 * * ----------------------------------------
 * * Tombol aksi berbahaya (destructive action)
 * * Digunakan untuk:
 * * - Hapus data
 * * - Reset data
 * * - Aksi irreversible lainnya
 *
 * ! Responsibility:
 * ! - Menyediakan tombol dengan style "danger"
 * ! - Mendukung state disabled
 * ! - Mendukung extensibility via props & className
 *
 * @param {string} [className]
 * * Class tambahan untuk override / extend styling
 *
 * @param {boolean} [disabled=false]
 * * Menentukan apakah tombol dalam keadaan non-aktif
 *
 * @param {React.ReactNode} children
 * * Isi tombol (text / icon / kombinasi)
 *
 * @param {...any} props
 * * Props tambahan (onClick, type, dll)
 *
 * ! Behavior:
 * ! - Hover → warna sedikit lebih terang (feedback interaktif)
 * ! - Active → warna lebih gelap (feedback klik)
 * ! - Focus → ring merah (aksesibilitas keyboard)
 * ! - Disabled → opacity turun + tidak bisa diklik
 *
 * ! UX Notes:
 * ! - Warna merah → memberi sinyal bahaya ke user
 * ! - Konsisten dengan ConfirmModal (danger action)
 */
export default function DangerButton({
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 ${
                    disabled && "opacity-25"
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
