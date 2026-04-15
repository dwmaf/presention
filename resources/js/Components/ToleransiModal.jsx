import { useState, useEffect } from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

/**
 * * Konfigurasi hari (single source of truth)
 * ! Menghindari hardcoded berulang
 */
const DAYS = ["senin", "selasa", "rabu", "kamis", "jumat"];

/**
 * * ToleransiModal Component
 * * ----------------------------------------
 * * Modal untuk mengatur toleransi keterlambatan per hari.
 *
 * ? Kenapa dipisah?
 * ? - Mengandung logic state yang cukup kompleks (checked + time per hari)
 * ? - Digunakan untuk konfigurasi berbasis hari (scalable jika ada fitur lain)
 * ? - Menghindari penumpukan logic di parent component
 *
 * ! Responsibility:
 * - Inisialisasi & reset state toleransi berdasarkan data intern
 * - Mengelola perubahan checkbox (aktif/nonaktif per hari)
 * - Mengelola perubahan waktu toleransi
 * - Mengirim data hasil perubahan ke parent melalui onSave
 *
 * ! Tidak bertanggung jawab:
 * - Validasi backend / penyimpanan data (ditangani parent)
 * - Format payload API (hanya kirim state mentah)
 *
 * @param {Object} props
 * @param {boolean} props.show
 *   → Menentukan apakah modal ditampilkan
 *
 * @param {Object} props.intern
 *   → Data intern yang berisi toleransi awal
 *   → Digunakan untuk inisialisasi state (checked & time)
 *
 * @param {Function} props.onClose
 *   → Handler untuk menutup modal
 *
 * @param {Function} props.onSave
 *   → Callback saat tombol simpan ditekan
 *   → Menerima parameter:
 *      {
 *        senin: { checked: boolean, time: string },
 *        selasa: { checked: boolean, time: string },
 *        ...
 *      }
 *
 * ? Behavior penting:
 * - State akan di-reset setiap kali intern berubah
 *   → mencegah data lama terbawa
 * - Input waktu hanya aktif jika checkbox hari dicentang
 * - Default waktu fallback ke "08:30" jika tidak ada data
 *
 * ? Struktur state:
 * {
 *   senin: { checked: true, time: "08:30" },
 *   selasa: { checked: false, time: "08:30" },
 *   ...
 * }
 */
export default function ToleransiModal({ show, intern, onClose, onSave }) {
    if (!show) return null;

    /**
     * * Membuat initial state dari data intern
     *
     * ? Kenapa function?
     * - Agar bisa dipakai ulang (init + reset)
     * - Menghindari duplikasi logic seperti di kode awal
     */
    const createInitialState = () => {
        const state = {};

        DAYS.forEach((day) => {
            state[day] = {
                checked: Boolean(intern?.[`toleransi_${day}`]),
                time: intern?.[`toleransi_${day}_time`]?.slice(0, 5) || "08:30",
            };
        });

        return state;
    };

    /**
     * * State utama toleransi
     * ! Struktur:
     * {
     *   senin: { checked: true, time: "08:30" }
     * }
     */
    const [toleransiDays, setToleransiDays] = useState(createInitialState);

    /**
     * * Reset state ketika:
     * - intern berubah
     * - modal dibuka ulang
     *
     * ! Mencegah data lama "nempel"
     */
    useEffect(() => {
        setToleransiDays(createInitialState());
    }, [intern]);

    // ================= HANDLER =================

    /**
     * * Toggle aktif/tidaknya toleransi pada hari tertentu
     */
    const toggleDay = (day) => {
        setToleransiDays((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                checked: !prev[day].checked,
            },
        }));
    };

    /**
     * * Update waktu toleransi
     */
    const changeTime = (day, value) => {
        setToleransiDays((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                time: value,
            },
        }));
    };

    const handleSubmit = () => {
        onSave(toleransiDays);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[40%] rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-2 text-lg font-semibold">
                    Pilih Hari Toleransi Terlambat
                </h2>

                <p className="mb-4 text-xs">
                    Pilih hari di mana toleransi keterlambatan diperbolehkan.
                    Seperti ada jadwal kuliah pagi atau keperluan lain.
                </p>

                <div className="mb-4 grid grid-cols-2 gap-2">
                    {DAYS.map((day) => (
                        <label
                            key={day}
                            className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2"
                        >
                            <input
                                type="checkbox"
                                checked={toleransiDays[day].checked}
                                onChange={() => toggleDay(day)}
                                className="cursor-pointer rounded-sm focus:ring-transparent"
                            />

                            <span className="text-sm capitalize text-gray-700">
                                {day}
                            </span>

                            <input
                                type="time"
                                min="07:00"
                                max="17:00"
                                step="60"
                                value={toleransiDays[day].time}
                                onChange={(e) =>
                                    changeTime(day, e.target.value)
                                }
                                disabled={!toleransiDays[day].checked}
                                className="ml-2 w-24 cursor-pointer rounded border px-2 py-1 text-sm"
                            />
                        </label>
                    ))}
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton
                        onClick={onClose}
                        className="flex-1 justify-center"
                    >
                        Batal
                    </SecondaryButton>

                    <PrimaryButton
                        onClick={handleSubmit}
                        className="flex-1 justify-center"
                    >
                        Simpan
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
