/**
 * * InputError Component
 * * ----------------------------------------
 * * Komponen kecil untuk menampilkan pesan error pada field form.
 *
 * ? Kenapa perlu komponen khusus?
 * ? - Error message hampir selalu muncul di setiap form field
 * ? - Tanpa abstraction → akan banyak duplikasi markup & styling
 * ? - Jika ingin ubah style (warna, ukuran, spacing) → cukup di satu tempat
 *
 * ! Responsibility:
 * - Menampilkan pesan error jika tersedia
 * - Menghilangkan render jika tidak ada error
 *
 * ! Tidak bertanggung jawab:
 * - Validasi data (frontend/backend)
 * - Menentukan kapan error muncul (itu tugas parent)
 *
 * ------------------------------------------------------------------------
 * @param {string | null | undefined} message
 * * Pesan error dari validation
 * * Bisa berasal dari:
 * * - Backend (Laravel validation)
 * * - Frontend validation
 *
 * @param {string} [className]
 * * Class tambahan untuk extend styling
 * * Contoh:
 * * "mt-2", "italic", dll
 *
 * @param {object} props
 * * Props tambahan (spread)
 * * Biasanya digunakan untuk:
 * * - id (accessibility)
 * * - data-attributes
 *
 * ------------------------------------------------------------------------
 * ! Behavior penting:
 * - Jika message falsy (null, undefined, "")
 *   → return null (tidak render apapun)
 *
 * ? Kenapa return null?
 * ? - Menghindari elemen kosong di DOM
 * ? - Tidak mengganggu layout (no extra spacing)
 * ? - Lebih efisien daripada render <p></p>
 *
 * ! Design Pattern:
 * - Conditional Rendering (React best practice)
 * - Presentational Component (pure UI)
 */
export default function InputError({ message, className = "", ...props }) {
    return message ? (
        <p {...props} className={"text-sm text-red-600 " + className}>
            {message}
        </p>
    ) : null; // tidak render jika tidak ada error
}
