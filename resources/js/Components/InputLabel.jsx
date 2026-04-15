/**
 * * InputLabel Component
 * * ----------------------------------------
 * * Abstraksi elemen <label> untuk menjaga konsistensi UI form.
 *
 * ! Responsibility:
 * - Menampilkan label untuk input field
 * - Menjaga konsistensi styling (font, warna, spacing)
 * - Mendukung konten sederhana & kompleks
 *
 * ! Tidak bertanggung jawab:
 * - Validasi input
 * - Menghubungkan ke input (htmlFor tetap dikontrol parent)
 *
 * ------------------------------------------------------------------------
 * @param {string} [value]
 * * Teks label (cara paling umum & cepat)
 * * Cocok untuk label sederhana
 *
 * @param {React.ReactNode} [children]
 * * Alternatif jika butuh konten kompleks
 * * Contoh:
 * * - Label dengan icon
 * * - Label dengan tooltip
 *
 * @param {string} [className]
 * * Class tambahan untuk extend styling
 *
 * @param {object} props
 * * Props tambahan untuk elemen <label>
 * * Contoh:
 * * - htmlFor (penting untuk accessibility)
 * * - id, data-attributes, dll
 *
 * ------------------------------------------------------------------------
 * ! Behavior penting:
 * - Jika `value` tersedia → digunakan sebagai isi label
 * - Jika tidak → fallback ke `children`
 *
 * ! Design Pattern:
 * - Presentational Component (pure UI)
 * - Flexible API (simple + advanced use case)
 */

export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block cursor-pointer text-sm font-medium text-gray-700 ` +
                className
            }
        >
            {/* Prioritas: value → children */}
            {value ? value : children}
        </label>
    );
}
