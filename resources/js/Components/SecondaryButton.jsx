/**
 * * SecondaryButton Component
 * * ----------------------------------------
 * * Tombol sekunder (non-primary action) dengan styling netral.
 *
 * ? Kenapa dibuat component?
 * ? - Menjaga konsistensi UI untuk tombol sekunder
 * ? - Menghindari duplikasi class Tailwind
 * ? - Mudah diubah global (warna, padding, dll)
 *
 * ! Responsibility:
 * - Menampilkan tombol dengan style sekunder
 * - Mendukung state disabled
 * - Meneruskan semua props tambahan ke <button>
 *
 * @param {string} [type="button"]
 * - Menentukan tipe button (button | submit | reset)
 *
 * @param {string} [className=""]
 * - Tambahan class styling dari parent (override / extend)
 *
 * @param {boolean} [disabled]
 * - Menentukan apakah button dalam kondisi non-aktif
 *
 * @param {ReactNode} children
 * - Isi konten button (text / icon / kombinasi)
 *
 * @param {object} props
 * - Props tambahan (onClick, id, dll)
 *
 * ? Catatan:
 * - Default type = "button" untuk menghindari submit tidak sengaja
 * - Styling disabled tetap diberi class tambahan untuk memastikan konsistensi
 */

export default function SecondaryButton({
    type = "button",
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none disabled:opacity-25 ${
                    disabled && "opacity-25"
                } ` + className
            }
            disabled={disabled} // disable interaksi
        >
            {children}
        </button>
    );
}
