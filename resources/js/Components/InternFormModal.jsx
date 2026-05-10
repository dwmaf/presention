import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import CustomSelect from "@/Components/CustomSelect";

export default function InternFormModal({
    show,
    onClose,
    onSubmit,
    data,
    setData,
    processing,
    errors,
    isEditMode,
    divisions,
    photoPreview,
    setPhotoPreview,
    isAllDaysChecked,
    handleToggleAllDays,
    currentIntern,
}) {
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("foto", file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="fit" maxHeight="fit">
            <form
                onSubmit={onSubmit}
                className="w-fit p-6"
                encType="multipart/form-data"
            >
                <h2 className="text-lg font-medium text-gray-900">
                    {isEditMode ? "Edit Karyawan" : "Tambah Karyawan"}
                </h2>

                <div className="flex gap-4">
                    {/* FOTO */}
                    <div className="mt-2 w-fit">
                        <InputLabel htmlFor="foto">
                            {photoPreview || currentIntern?.foto ? (
                                <div className="relative h-60 w-40">
                                    <img
                                        src={
                                            photoPreview
                                                ? photoPreview
                                                : `/storage/${currentIntern.foto}`
                                        }
                                        className="h-full w-full rounded-xl border-2 border-blue-500 object-cover"
                                    />

                                    {/* Tombol ganti */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhotoPreview(null);
                                            setData("foto", null);
                                        }}
                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="10px"
                                            height="10px"
                                            viewBox="0 0 15 15"
                                        >
                                            <path
                                                fill="#fff"
                                                d="M3.64 2.27L7.5 6.13l3.84-3.84A.92.92 0 0 1 12 2a1 1 0 0 1 1 1a.9.9 0 0 1-.27.66L8.84 7.5l3.89 3.89A.9.9 0 0 1 13 12a1 1 0 0 1-1 1a.92.92 0 0 1-.69-.27L7.5 8.87l-3.85 3.85A.92.92 0 0 1 3 13a1 1 0 0 1-1-1a.9.9 0 0 1 .27-.66L6.16 7.5L2.27 3.61A.9.9 0 0 1 2 3a1 1 0 0 1 1-1c.24.003.47.1.64.27"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex h-60 w-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="60px"
                                        height="60px"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fill="oklch(70.7% 0.022 261.325)"
                                            d="M10 16h4c.55 0 1-.45 1-1v-5h1.59c.89 0 1.34-1.08.71-1.71L12.71 3.7a.996.996 0 0 0-1.41 0L6.71 8.29c-.63.63-.19 1.71.7 1.71H9v5c0 .55.45 1 1 1m-4 2h12c.55 0 1 .45 1 1s-.45 1-1 1H6c-.55 0-1-.45-1-1s.45-1 1-1"
                                        />
                                    </svg>
                                    <p className="text-center text-gray-400">
                                        {data.foto
                                            ? data.foto.name
                                            : "Upload foto"}
                                    </p>
                                    <input
                                        id="foto"
                                        type="file"
                                        name="foto"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </InputLabel>

                        <InputError message={errors.foto} className="mt-2" />
                    </div>

                    {/* FORM */}
                    <div>
                        <InputLabel value="Nama" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Nama Karyawan"
                        />
                        <InputError message={errors.name} className="mt-2" />

                        {/* Divisi */}
                        <div className="mt-2">
                            <InputLabel htmlFor="division_id" value="Divisi" />
                            <CustomSelect
                                value={data.division_id}
                                onChange={(value) =>
                                    setData("division_id", value)
                                }
                                options={divisions.map((div) => ({
                                    value: String(div.id),
                                    label: div.nama_divisi,
                                }))}
                                placeholder="Pilih Divisi"
                                error={errors.division_id}
                            />
                            <InputError
                                message={errors.division_id}
                                className="mt-2"
                            />
                        </div>

                        {/* JADWAL */}
                        <div className="mt-2">
                            <InputLabel value="Jadwal" />

                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                                    <input
                                        type="checkbox"
                                        checked={isAllDaysChecked()}
                                        onChange={(e) =>
                                            handleToggleAllDays(
                                                e.target.checked,
                                            )
                                        }
                                        className="cursor-pointer rounded-sm focus:ring-transparent"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Setiap Hari
                                    </span>
                                </label>
                                {[
                                    "senin",
                                    "selasa",
                                    "rabu",
                                    "kamis",
                                    "jumat",
                                ].map((day) => (
                                    <label
                                        key={day}
                                        className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data[day]}
                                            onChange={(e) =>
                                                setData(day, e.target.checked)
                                            }
                                            className="cursor-pointer rounded-sm focus:ring-transparent"
                                        />
                                        <span className="text-sm capitalize text-gray-700">
                                            {day}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-end">
                    <SecondaryButton onClick={onClose}>Batal</SecondaryButton>
                    <PrimaryButton
                        type="submit"
                        className="ml-3"
                        disabled={processing}
                    >
                        {isEditMode ? "Update" : "Simpan"}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
