import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";

/**
 * * InternResetModal Component
 * * ----------------------------------------
 * * Modal konfirmasi untuk mereset poin seluruh karyawan (intern).
 *
 * ! Responsibility:
 * - Menampilkan konfirmasi reset poin
 * - Menampilkan warning kontekstual (tanggal 1 atau bukan)
 * - Emit aksi confirm / cancel
 *
 * ! Tidak bertanggung jawab:
 * - Logic reset poin (API / backend)
 * - Validasi tanggal (hanya menerima hasil dari parent)
 *
 * ------------------------------------------------------------
 * @param {boolean} show
 * * Menentukan apakah modal ditampilkan atau tidak
 *
 * @param {() => void} onClose
 * * Callback untuk menutup modal (cancel action)
 *
 * @param {() => void} onConfirm
 * * Callback saat user mengkonfirmasi reset
 * * → biasanya trigger API reset semua poin
 *
 * @param {boolean} isFirstDate
 * * Flag apakah hari ini tanggal 1
 * *
 * * Behavior:
 * * - true  → tampilkan konfirmasi normal
 * * - false → tampilkan warning tambahan (bukan tanggal 1)
 *
 * ------------------------------------------------------------
 * ! Behavior penting:
 * - Jika bukan tanggal 1 → tampilkan warning merah
 * - Tidak ada blocking logic → tetap bisa confirm
 *
 * ? Kenapa tidak diblok jika bukan tanggal 1?
 * ? - Bisa jadi admin butuh reset manual
 * ? - UX: beri warning, bukan larangan
 *
 * ! UX Notes:
 * - Icon warning → mempertegas aksi berbahaya
 * - Tombol merah → reinforce destructive action
 * - Pesan dinamis → meningkatkan awareness user
 */
export default function InternResetModal({
    show,
    onClose,
    onConfirm,
    isFirstDate,
}) {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-orange-500"
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
                    Konfirmasi Reset Poin
                </h2>

                <p className="mt-4 text-sm text-gray-600">
                    {isFirstDate ? (
                        "Apakah anda yakin ingin mereset poin semua karyawan menjadi 5?"
                    ) : (
                        <>
                            Peringatan:{" "}
                            <span className="text-red-700">
                                Hari ini <b>BUKAN</b> tanggal 1.
                            </span>{" "}
                            Apakah anda yakin ingin mereset poin semua karyawan
                            saat ini walaupun bukan tanggal 1?
                        </>
                    )}
                </p>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Batal</SecondaryButton>

                    <PrimaryButton
                        className="ml-3 bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 active:bg-red-800"
                        onClick={onConfirm}
                    >
                        Reset Semua Poin
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
