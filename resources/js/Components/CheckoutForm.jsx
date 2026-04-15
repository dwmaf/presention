import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

/**
 * * CheckOutForm Component
 * * ----------------------------------------
 * * Dropdown form untuk edit / hapus jam pulang
 *
 * ? Kenapa dipisah?
 * ? - Sebelumnya inline di table (complex & sulit maintain)
 * ? - Mirip pattern dengan StatusForm → bisa distandarkan
 *
 * ! Responsibility:
 * - Render input waktu (check_out)
 * - Emit perubahan ke parent
 *
 * ! Tidak bertanggung jawab:
 * - API call (ditangani parent)
 */
export default function CheckOutForm({
    show,
    position = "bottom", // "top" | "bottom"
    value,
    setValue,
    onSave,
    onDelete,
    onCancel,
}) {
    if (!show) return null;

    /**
     * * Dynamic positioning
     * ! Menggantikan logic inline sebelumnya
     */
    const positionClass =
        position === "top" ? "bottom-20 right-0" : "top-10 right-0";

    /**
     * * Submit handler
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(value || null); // null kalau kosong
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`absolute z-10 w-64 rounded-lg bg-white p-4 shadow-lg ${positionClass}`}
        >
            <p className="mb-2 text-sm font-semibold">Edit Jam Pulang</p>

            <input
                type="time"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="00:00"
                max="23:59"
                step="60"
                className="w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-3 flex gap-2">
                <PrimaryButton
                    type="submit"
                    className="flex-1 justify-center text-xs"
                >
                    Simpan
                </PrimaryButton>

                <button
                    type="button"
                    onClick={onDelete}
                    className="flex-1 justify-center rounded-md bg-red-500 px-4 py-2 text-xs font-medium text-white hover:bg-red-600"
                >
                    Hapus
                </button>
            </div>

            <SecondaryButton
                type="button"
                onClick={onCancel}
                className="mt-2 w-full justify-center text-xs"
            >
                Batal
            </SecondaryButton>
        </form>
    );
}
