/**
 * * Checkbox Component
 * * ----------------------------------------
 * * Wrapper sederhana untuk elemen <input type="checkbox">
 * * dengan styling default agar konsisten di seluruh aplikasi.
 *
 * ? Kenapa dibuat component?
 * ? - Menghindari duplikasi class Tailwind di banyak tempat
 * ? - Menjaga konsistensi UI (warna, border, focus state)
 * ? - Mudah diubah secara global jika style berubah
 *
 * ! Responsibility:
 * - Menyediakan checkbox dengan styling default
 * - Menerima semua props native input (checked, onChange, dll)
 * - Menggabungkan custom class tambahan dari parent
 *
 * ? Cara pakai:
 * <Checkbox
 *     checked={value}
 *     onChange={handleChange}
 * />
 */

export default function Checkbox({ className = "", ...props }) {
    return (
        <input
            {...props} // pass semua props agar fleksibel (controlled / uncontrolled)
            type="checkbox"
            className={
                "rounded border-gray-300 text-blue-600 shadow-sm focus:ring-0 " +
                className // memungkinkan override dari luar
            }
        />
    );
}
