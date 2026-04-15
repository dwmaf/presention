import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";

/**
 * * InternDeleteModal Component
 * * ----------------------------------------
 * * Modal konfirmasi khusus untuk menghapus data karyawan (intern).
 *
 * ! Responsibility:
 * - Menampilkan konfirmasi sebelum aksi delete
 * - Mengarahkan user ke aksi yang jelas (hapus / batal)
 *
 * ! Tidak bertanggung jawab:
 * - Logic delete (API call, state update)
 * - Menentukan kapan modal muncul (dikontrol parent)
 *
 * ------------------------------------------------------------------------
 * @param {boolean} show
 * * Menentukan apakah modal ditampilkan
 *
 * @param {() => void} onClose
 * * Callback untuk menutup modal
 * * Dipanggil saat:
 * * - klik tombol "Batal"
 * * - klik backdrop (jika Modal support)
 *
 * @param {() => void} onDelete
 * * Callback saat user konfirmasi delete
 * * Biasanya akan trigger API call di parent
 *
 * @param {boolean} processing
 * * Status loading saat proses delete berlangsung
 * * Digunakan untuk:
 * * - disable tombol
 * * - mencegah double submit
 *
 * ------------------------------------------------------------------------
 * ! UX Notes:
 * - Menggunakan warna merah (DangerButton) untuk menegaskan aksi destruktif
 * - Teks dibuat eksplisit → user sadar bahwa aksi tidak bisa dibatalkan
 *
 * ! Design Pattern:
 * - Controlled Component → visibility dikontrol parent
 * - Presentational Component → hanya UI, tanpa logic bisnis
 *
 * TODO Improvement Ideas:
 * TODO - Tambahkan nama karyawan dalam pesan konfirmasi
 */
export default function InternDeleteModal({
    show,
    onClose,
    onDelete,
    processing,
}) {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Apakah anda yakin ingin menghapus data ini?
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Batal</SecondaryButton>

                    <DangerButton
                        className="ml-3"
                        onClick={onDelete}
                        disabled={processing}
                    >
                        Hapus
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
