import InputLabel from "./InputLabel";
import TextInput from "./TextInput";
import InputError from "./InputError";
import CustomSelect from "./CustomSelect";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

/**
 * * Konfigurasi hari (single source of truth)
 *
 * ? Kenapa dibuat konstanta?
 * ? - Menghindari hardcode berulang
 * ? - Mempermudah penambahan hari di masa depan
 * ? - Digunakan untuk mapping UI & logic sekaligus
 */
const DAYS = [
    { key: "senin", label: "Senin" },
    { key: "selasa", label: "Selasa" },
    { key: "rabu", label: "Rabu" },
    { key: "kamis", label: "Kamis" },
    { key: "jumat", label: "Jumat" },
];

/**
 * * InternForm Component
 * * --------------------------------------------------
 * * Form untuk mengedit data intern (karyawan magang)
 *
 * ? Kenapa dipisah dari page utama?
 * ? - Form punya kompleksitas sendiri (input, validation, state)
 * ? - Menghindari file parent menjadi terlalu besar
 * ? - Reusable untuk create/edit di masa depan
 *
 * ! Responsibility:
 * - Render seluruh input form
 * - Handle perubahan jadwal (hari kerja)
 * - Mapping data → UI
 *
 * ! Tidak bertanggung jawab:
 * - Submit ke API (delegated ke parent)
 * - Validasi backend
 *
 * @param {Object} props
 *
 * @param {boolean} props.show
 * * Menentukan apakah form ditampilkan atau tidak
 *
 * @param {(value: boolean) => void} props.setShow
 * * Setter untuk toggle visibility form
 *
 * @param {Object} props.data
 * * State form (name, division_id, hari, poin, dll)
 *
 * @param {(key: string, value: any) => void} props.setData
 * * Setter dari useForm (Inertia)
 *
 * @param {Object} props.errors
 * * Object error dari backend validation
 *
 * @param {Array} props.divisions
 * * List divisi untuk dropdown select
 *
 * @param {(e: Event) => void} props.onSubmit
 * * Handler submit form (diproses di parent)
 *
 * @param {() => void} props.onCancel
 * * Handler cancel form (reset + close)
 */
export default function InternForm({
    show,
    setShow,
    data,
    setData,
    errors,
    divisions,
    onSubmit,
    onCancel,
}) {
    if (!show) return null;

    /**
     * * Cek apakah semua hari dicentang
     */
    const isAllDaysChecked = () => {
        return DAYS.every((day) => data[day.key]);
    };

    /**
     * * Toggle semua hari sekaligus
     */
    const handleToggleAllDays = (checked) => {
        const updated = {};
        DAYS.forEach((day) => {
            updated[day.key] = checked;
        });

        setData({
            ...data,
            ...updated,
        });
    };

    return (
        <form
            className="absolute left-[23rem] z-20 w-5/12 space-y-4 rounded-md border bg-white px-6 py-3 shadow-lg"
            onSubmit={onSubmit}
        >
            <p className="mb-2 text-lg font-medium">Edit Informasi Karyawan</p>

            {/* Nama */}
            <div>
                <InputLabel htmlFor="name" value="Nama" />
                <TextInput
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="w-full rounded-md border-gray-400"
                />
            </div>

            {/* Divisi */}
            <div>
                <InputLabel value="Divisi" />
                <CustomSelect
                    value={String(data.division_id)}
                    onChange={(value) => setData("division_id", value)}
                    options={divisions.map((div) => ({
                        value: String(div.id),
                        label: div.nama_divisi,
                    }))}
                    placeholder="Pilih Divisi"
                    hasError={errors.division_id}
                />
                <InputError message={errors.division_id} className="mt-2" />
            </div>

            {/* Jadwal */}
            <div className="mt-2">
                <InputLabel value="Jadwal (Pilih hari masuk)" />

                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {/* Semua hari */}
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                        <input
                            type="checkbox"
                            checked={isAllDaysChecked()}
                            onChange={(e) =>
                                handleToggleAllDays(e.target.checked)
                            }
                        />
                        <span className="text-sm text-gray-700">
                            Setiap Hari
                        </span>
                    </label>

                    {/* Per hari */}
                    {DAYS.map((day) => (
                        <label
                            key={day.key}
                            className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2"
                        >
                            <input
                                type="checkbox"
                                checked={data[day.key]}
                                onChange={(e) =>
                                    setData(day.key, e.target.checked)
                                }
                                className="cursor-pointer rounded-sm focus:ring-transparent"
                            />
                            <span className="text-sm text-gray-700">
                                {day.label}
                            </span>
                        </label>
                    ))}
                </div>

                {(errors.senin ||
                    errors.selasa ||
                    errors.rabu ||
                    errors.kamis ||
                    errors.jumat) && (
                    <InputError
                        message={
                            errors.senin ||
                            errors.selasa ||
                            errors.rabu ||
                            errors.kamis ||
                            errors.jumat
                        }
                        className="mt-2"
                    />
                )}
            </div>

            {/* Poin */}
            <div>
                <InputLabel value="Poin" />
                <TextInput
                    type="number"
                    min="0"
                    value={data.poin}
                    onChange={(e) => setData("poin", Number(e.target.value))}
                    // className="mt-1 block w-full"
                    placeholder="0"
                    Edit
                />
                <InputError message={errors.poin} className="mt-2" />
            </div>

            {/* Action */}
            <div className="flex justify-end gap-2">
                <SecondaryButton
                    type="button"
                    onClick={onCancel}
                    className="w-full justify-center"
                >
                    Batal
                </SecondaryButton>

                <PrimaryButton className="w-full justify-center">
                    Simpan
                </PrimaryButton>
            </div>
        </form>
    );
}
