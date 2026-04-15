/**
 * * DownloadBtn Component
 * * ----------------------------------------
 * * Tombol untuk melakukan download file (biasanya CSV / export data).
 *
 * ! Responsibility:
 * - Menampilkan tombol download
 * - Men-trigger aksi download ke endpoint tertentu
 *
 * ! Tidak bertanggung jawab:
 * - Generate file (CSV, Excel, dll)
 * - Logic backend export
 *
 * ------------------------------------------------------------------------
 * @param {string} href
 * * URL endpoint untuk download file
 * * Contoh:
 * * "/attendances/export"
 *
 * @param {() => void} [onClick]
 * * Optional handler tambahan (misalnya tracking / logging)
 *
 * @param {string} [label="Download CSV"]
 * * Teks tombol (bisa diubah sesuai kebutuhan)
 */

export default function DownloadBtn({ onClick }) {
    return (
        <button
            href={onClick} // URL endpoint untuk download file
            className="flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium text-green-700 transition hover:bg-green-100"
        >
            {/* Icon download */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
            >
                <path
                    fill="oklch(52.7% 0.154 150.069)"
                    d="M20.68 7.014a3.85 3.85 0 0 0-.92-1.22l-3-2.72a4.15 4.15 0 0 0-2.39-1.07H8.21A5 5 0 0 0 3 6.864v10.3a5 5 0 0 0 3.31 4.53a4.7 4.7 0 0 0 1.92.3h7.56a5 5 0 0 0 5.21-4.86v-8.57a3.75 3.75 0 0 0-.32-1.55m-4.84 8.08l-2.66 2.67a1.7 1.7 0 0 1-.53.35q-.201.09-.42.11a.9.9 0 0 1-.4 0a1.3 1.3 0 0 1-.42-.11a1.7 1.7 0 0 1-.53-.35l-2.66-2.67a1 1 0 0 1 1.41-1.41l1.4 1.4v-4.61a1 1 0 1 1 2 0v4.61l1.4-1.4a1 1 0 0 1 1.41 1.41m.22-7.69a1.08 1.08 0 0 1-1.09-1.08v-2.65q.42.228.81.51l3 2.73q.25.211.42.49z"
                />
            </svg>
            {/* Label */}
            Download CSV
        </button>
    );
}
