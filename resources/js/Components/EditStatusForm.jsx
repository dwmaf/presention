import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

/**
 * * Konfigurasi status kehadiran (Single Source of Truth)
 * * ----------------------------------------
 * * Semua opsi status didefinisikan di satu tempat
 *
 * ? Kenapa penting?
 * ? - Menghindari hardcoded string di banyak file
 * ? - Konsistensi value (tidak typo: "hadir" vs "Hadir")
 * ? - Mudah ditambah (misal: "WFH", "cuti", dll)
 *
 * ! Jika status bertambah → cukup update di sini
 */
const STATUS_OPTIONS = [
    { value: "hadir", label: "Hadir" },
    { value: "izin", label: "Izin" },
    { value: "sakit", label: "Sakit" },
    { value: "alpha", label: "Alpha" },
];

/**
 * * EditStatusForm Component
 * * ----------------------------------------
 * * Dropdown form untuk mengubah status kehadiran dalam bentuk popup.
 *
 * ! Responsibility:
 * - Menampilkan opsi status (radio button)
 * - Menampilkan style & label status secara dinamis
 * - Mengirim perubahan ke parent (melalui callback)
 *
 * ! Tidak bertanggung jawab:
 * - API call / persistence (diserahkan ke parent)
 * - Menentukan kapan muncul (dikontrol prop `show`)
 *
 * ------------------------------------------------------------------------
 * @param {boolean} show
 * * Menentukan apakah dropdown ditampilkan
 *
 * @param {"top" | "bottom"} [position="bottom"]
 * * Menentukan arah muncul dropdown
 * * - "top" → muncul ke atas
 * * - "bottom" → muncul ke bawah
 *
 * @param {string} selectedStatus
 * * Status yang sedang dipilih (state dari parent)
 *
 * @param {(value: string) => void} setSelectedStatus
 * * Setter untuk update status sementara
 * * (controlled component pattern)
 *
 * @param {(value: string) => void} onSave
 * * Callback saat user klik "Simpan"
 * * Biasanya akan trigger API call di parent
 *
 * @param {() => void} onCancel
 * * Callback saat user membatalkan perubahan
 *
 * @param {(status: string) => string} getStyle
 * * Function untuk mapping status → class styling
 * * Contoh:
 * * "hadir" → "bg-green-100 text-green-700"
 *
 * @param {(status: string) => string} getLabel
 * * Function untuk mapping status → label display
 * * Berguna jika label ingin di-custom atau i18n
 *
 * ------------------------------------------------------------------------
 * ! Design Pattern:
 * ! - Controlled Component → state dikontrol dari parent
 * ! - Presentational Component → fokus ke UI saja
 *
 * ! Kenapa tidak pakai state internal?
 * ! - Supaya parent punya kontrol penuh
 * ! - Memudahkan sync dengan data lain (misal table)
 *
 * TODO Improvement Ideas:
 * TODO - Tutup otomatis saat klik di luar (click outside handler)
 */
export default function EditStatusForm({
    show,
    position = "bottom", // "top" | "bottom"
    selectedStatus,
    setSelectedStatus,
    onSave,
    onCancel,
    getStyle,
    getLabel,
}) {

    if (!show) return null;

    const positionClass =
        position === "top" ? "bottom-20 right-20" : "top-10 right-20";

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(selectedStatus);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`w-50 absolute z-10 rounded-lg bg-white shadow-lg ${positionClass}`}
        >
            {STATUS_OPTIONS.map((status) => (
                <label
                    key={status.value}
                    className="flex cursor-pointer items-center gap-2 rounded-t-lg px-3 py-3 hover:bg-gray-100"
                >
                    <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={selectedStatus === status.value}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="cursor-pointer appearance-none rounded-full border-2 border-blue-700 transition duration-200 checked:border-blue-700 checked:bg-blue-700 checked:shadow-[inset_0_0_0_9px_rgb(29,78,216)] focus:outline-none focus:ring-0 focus:ring-offset-0"
                    />

                    <span
                        className={`rounded-md px-2 py-0.5 font-medium ${getStyle(
                            status.value,
                        )}`}
                    >
                        {getLabel(status.value)}
                    </span>
                </label>
            ))}

            <div className="my-2 flex w-full gap-2">
                <PrimaryButton
                    type="submit"
                    className="ml-2 flex-1 justify-center text-sm"
                >
                    Simpan
                </PrimaryButton>

                <SecondaryButton
                    type="button"
                    onClick={onCancel}
                    className="mr-2 flex-1 justify-center text-sm"
                >
                    Batal
                </SecondaryButton>
            </div>
        </form>
    );
}
