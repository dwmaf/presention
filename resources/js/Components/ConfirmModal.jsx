import SecondaryButton from "./SecondaryButton";
import DangerButton from "./DangerButton";

/**
 * * ConfirmModal Component
 * * ----------------------------------------
 * * Komponen modal konfirmasi reusable untuk aksi berisiko
 * * seperti delete, reset, atau tindakan irreversible lainnya.
 *
 * ? Kenapa dibuat reusable?
 * ? - Banyak aksi membutuhkan konfirmasi (delete intern, reset poin, dll)
 * ? - Menghindari duplikasi UI & logic di banyak tempat
 * ? - Menjaga konsistensi UX (semua konfirmasi terlihat sama)
 *
 * ! Responsibility:
 * ! - Menampilkan modal overlay
 * ! - Menampilkan pesan konfirmasi dinamis
 * ! - Menyediakan tombol aksi (confirm & cancel)
 * ! - Meng-handle close saat klik backdrop
 *
 * ! Tidak bertanggung jawab:
 * ! - Logic aksi (API call, delete data, dll)
 * ! - State global / business logic
 *
 * @param {boolean} show
 * * Menentukan apakah modal ditampilkan atau tidak
 *
 * @param {string} title
 * * Judul modal (biasanya berupa pertanyaan konfirmasi)
 *
 * @param {string | React.ReactNode} description
 * * Deskripsi tambahan
 * * Bisa berupa string atau JSX (untuk fleksibilitas)
 *
 * @param {string} [confirmText="Hapus"]
 * * Label tombol konfirmasi
 * * Contoh: "Hapus", "Reset", "Ya, lanjutkan"
 *
 * @param {() => void} onCancel
 * * Callback saat user membatalkan aksi
 * * Dipanggil saat:
 * * - Klik tombol "Batal"
 * * - Klik area backdrop
 *
 * @param {() => void} onConfirm
 * * Callback saat user menyetujui aksi
 *
 * ! Behavior:
 * ! - Jika show = false → component tidak dirender (null)
 * ! - Klik backdrop → trigger onCancel
 * ! - Klik dalam modal → tidak menutup (stopPropagation)
 *
 * ! UX Notes:
 * ! - Overlay gelap → fokus ke modal
 * ! - Icon warning → memberi sinyal aksi berbahaya
 * ! - Tombol merah (DangerButton) → mempertegas risiko
 */
export default function ConfirmModal({
    show,
    title,
    description,
    confirmText = "Hapus",
    onCancel,
    onConfirm,
}) {
    /**
     * * Early return
     * ! Hindari render DOM jika modal tidak digunakan
     */
    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-500/75"
            onClick={onCancel}
        >
            <div
                className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title */}
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    {title}
                </h2>

                {/* Description */}
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                    {typeof description === "string" ? (
                        <p>{description}</p>
                    ) : (
                        description
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onCancel}>Batal</SecondaryButton>

                    <DangerButton className="ml-3" onClick={onConfirm}>
                        {confirmText}
                    </DangerButton>
                </div>
            </div>
        </div>
    );
}
