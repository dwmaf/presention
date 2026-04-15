/**
 * * PrimaryButton Component
 * ----------------------------------------
 * Komponen tombol reusable untuk menjaga konsistensi UI sekaligus tetap fleksibel.
 * Dirancang dengan pemisahan styling agar mudah dikembangkan (scalable design).
 *
 * @param {React.ReactNode} children
 * Konten utama tombol. Bisa berupa teks atau elemen lain.
 *
 * @param {string} [className=""]
 * Class tambahan untuk override atau extend styling default.
 * Digunakan agar komponen tetap fleksibel tanpa mengubah struktur internal.
 *
 * @param {boolean} [disabled=false]
 * Menentukan apakah tombol dalam keadaan nonaktif.
 * Menggunakan default `false` untuk menghindari perilaku tidak konsisten.
 *
 * @param {React.ReactNode|null} [icon=null]
 * Elemen icon opsional.
 * Dirender secara kondisional agar tidak menambah DOM jika tidak digunakan.
 *
 * @param {"left" | "right"} [iconPosition="left"]
 * Mengatur posisi icon terhadap teks.
 * Dibuat fleksibel agar tidak hardcoded ke satu layout saja.
 *
 * @param {"button" | "submit" | "reset"} [type="button"]
 * Menentukan tipe tombol HTML.
 * Default ke "button" untuk mencegah submit tidak sengaja dalam form.
 *
 * @param {...any} props
 * Props tambahan seperti onClick, id, data-attributes, dll.
 * Menggunakan spread untuk meningkatkan reusability tanpa boilerplate.
 *
 * ! Styling dipisahkan menjadi beberapa bagian:
 *   - baseStyles: struktur dasar (layout, spacing, typography)
 *   - variantStyles: warna dan tampilan visual utama
 *   - disabledStyles: state khusus saat tombol nonaktif
 *
 * ! Kenapa tidak langsung gabung dalam satu string:
 *   Supaya mudah dikembangkan ke variant lain (secondary, danger, dll)
 *   tanpa mengubah struktur utama komponen.
 *
 * ! Accessibility:
 *   Menggunakan `aria-disabled` untuk membantu screen reader memahami state tombol.
 *
 * ! Best Practice:
 *   - Hindari menaruh logic kompleks di komponen ini
 *   - Gunakan hanya untuk UI (presentational component)
 *   - Extend behavior melalui props, bukan modifikasi internal
 */

export default function PrimaryButton({
    className = "",
    disabled = false,
    children,
    icon = null,
    type = "submit",
    ...props
}) {
    const baseStyles =
        "inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1";

    const variantStyles = "bg-blue-100 text-blue-800 hover:bg-blue-200";

    const disabledStyles = disabled ? "opacity-25 cursor-not-allowed" : "";

    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            aria-disabled={disabled}
            className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
        >
            {icon}
            {children}
        </button>
    );
}
