import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import InputLabel from "./InputLabel";
import TextInput from "./TextInput";
import InputError from "./InputError";
import CustomSelect from "./CustomSelect";
import DownloadBtn from "./DownloadBtn";

export default function InternDetail({ intern, divisions }) {
    if (!intern) return null;

    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showStatusForm, setShowStatusForm] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentAttendanceId, setCurrentAttendanceId] = useState(null);

    const { data, setData, errors, reset } = useForm({
        name: intern?.name || "",
        division_id: String(intern?.division_id || ""),
        senin: intern?.senin || false,
        selasa: intern?.selasa || false,
        rabu: intern?.rabu || false,
        kamis: intern?.kamis || false,
        jumat: intern?.jumat || false,
        poin: intern?.poin ?? 5,
    });

    const poin = intern.poin ?? 0;
    const poinStyle =
        poin < 3 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";

    const fingerprint = intern.fingerprint_data;
    const fingerStyle = fingerprint
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

    const renderJadwal = () => {
        const days = [];
        if (intern.senin) days.push("Senin");
        if (intern.selasa) days.push("Selasa");
        if (intern.rabu) days.push("Rabu");
        if (intern.kamis) days.push("Kamis");
        if (intern.jumat) days.push("Jumat");

        if (days.length === 5) return "Setiap hari";

        return days.length > 0 ? days.join(", ") : "Belum ada jadwal";
    };

    // Jadwal
    const isAllDaysChecked = () => {
        return (
            data.senin && data.selasa && data.rabu && data.kamis && data.jumat
        );
    };

    const handleToggleAllDays = (checked) => {
        setData({
            ...data,
            senin: checked,
            selasa: checked,
            rabu: checked,
            kamis: checked,
            jumat: checked,
        });
    };

    // Ubah Foto
    const handlePhotoClick = () => {
        document.getElementById("photo-upload").click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
            alert("Format file harus JPG, JPEG, atau PNG");
            return;
        }

        if (file.size > 2048000) {
            alert("Ukuran file maksimal 2MB");
            return;
        }

        // Upload foto
        setUploading(true);
        const formData = new FormData();
        formData.append("foto", file);
        formData.append("_method", "PUT");

        router.post(`/interns/${intern.id}/update-photo`, formData, {
            onSuccess: () => {
                setUploading(false);
                alert("Foto berhasil diubah");
            },
            onError: (errors) => {
                setUploading(false);
                alert(
                    "Gagal mengubah foto: " + Object.values(errors).join(", "),
                );
            },
        });
    };

    // Arahkan ke page FingerPrint Enrollment
    const handleFingerEnrollment = () => {
        router.visit(`/interns/${intern.id}/fingerprint-enrollment`);
    };

    // Simpan perubahan form
    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(`/interns/${intern.id}`, data, {
            onSuccess: () => {
                setShowForm(false);
            },
        });
    };

    // Close form & reset data
    const handleCloseForm = () => {
        reset();
        setShowForm(false);
    };

    const attendanceStyle = (status) => {
        const styles = {
            hadir: "bg-green-100 text-green-700",
            izin: "bg-yellow-100 text-yellow-700",
            sakit: "bg-indigo-100 text-indigo-700",
            alpha: "bg-red-100 text-red-700",
        };

        return styles[status] || "bg-gray-100 text-gray-700";
    };

    const attendanceLabel = (status) => {
        const labels = {
            hadir: "Hadir",
            izin: "Izin",
            sakit: "Sakit",
            alpha: "Alpha",
        };

        return labels[status] || "Tidak ada";
    };

    // ✅ TAMBAHKAN HANDLER untuk toggle form status
    const handleToggleStatusForm = (attendanceId, currentStatus) => {
        setShowStatusForm(!showStatusForm);
        setCurrentAttendanceId(attendanceId);
        setSelectedStatus(currentStatus);
    };

    // ✅ TAMBAHKAN HANDLER untuk update status
    const handleUpdateStatus = (e) => {
        e.preventDefault();

        router.put(
            `/attendances/${currentAttendanceId}/status`,
            {
                status: selectedStatus,
            },
            {
                onSuccess: () => {
                    setShowStatusForm(false);
                    setSelectedStatus("");
                    setCurrentAttendanceId(null);
                },
                onError: (errors) => {
                    alert(
                        "Gagal mengubah status: " +
                            Object.values(errors).join(", "),
                    );
                },
            },
        );
    };

    // ✅ TAMBAHKAN HANDLER untuk cancel
    const handleCancelStatusUpdate = () => {
        setShowStatusForm(false);
        setSelectedStatus("");
        setCurrentAttendanceId(null);
    };

    return (
        <div className="px-8 py-6">
            <div className="flex justify-between relative">
                {/* Foto & Detail Singkat Karyawan */}
                <div className="flex gap-4">
                    <div
                        className="w-40 h-40 relative group cursor-pointer"
                        onClick={handlePhotoClick}
                    >
                        {intern.foto ? (
                            <>
                                <img
                                    src={`/${intern.foto}`}
                                    alt={intern.name}
                                    className="w-full h-full object-cover object-top rounded-xl"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <span className="text-white font-medium">
                                        {uploading
                                            ? "Mengupload..."
                                            : "Ubah Foto"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="w-48 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                {uploading ? "Mengupload..." : "Upload Foto"}
                            </div>
                        )}
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            className="hidden"
                            onChange={handlePhotoChange}
                            disabled={uploading}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-2xl">{intern.name}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <p className="font-medium text-md">
                                {intern.division?.nama_divisi || "-"}
                            </p>
                        </div>

                        {/* Jadwal */}
                        <div className="flex items-center gap-2">
                            <p className="text-sm flex gap-1 items-center font-medium text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                >
                                    <g fill="none">
                                        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                        <path
                                            fill="oklch(55.1% 0.027 264.364)"
                                            d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7zm-5-9a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v3H3V7a2 2 0 0 1 2-2h2V4a1 1 0 0 1 2 0v1h6V4a1 1 0 0 1 1-1"
                                        />
                                    </g>
                                </svg>
                                {renderJadwal()}
                            </p>
                        </div>

                        {/* Poin & Status Fingerprint */}
                        <div className="flex gap-2">
                            <p
                                className={`${poinStyle} w-fit  py-0.5 px-2 rounded-lg text-xs font-semibold flex items-center`}
                            >
                                {poin} Poin
                            </p>
                            {/* Kalo di klik bakal ke Fingerprint Enrollment */}
                            <button
                                onClick={handleFingerEnrollment}
                                className={`${fingerStyle} rounded-full flex items-center `}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14px"
                                    height="14px"
                                    viewBox="0 0 14 14"
                                >
                                    <path
                                        fill="currentColor"
                                        fillRule="evenodd"
                                        d="M1.265 4.185A6.022 6.022 0 0 1 9.512.547a.625.625 0 0 1-.522 1.135a4.772 4.772 0 0 0-6.534 2.883a.625.625 0 1 1-1.191-.38M11.95 2.593a.625.625 0 0 0-1.028.712c.534.77.847 1.705.847 2.714v1.962A4.77 4.77 0 0 1 7 12.75A.625.625 0 1 0 7 14a6.02 6.02 0 0 0 6.02-6.02V6.019a6 6 0 0 0-1.07-3.426M2.23 6.76a.625.625 0 1 0-1.25 0v1.22a6.02 6.02 0 0 0 3.303 5.374a.625.625 0 1 0 .565-1.115A4.77 4.77 0 0 1 2.23 7.981zm2.584-1.513a.625.625 0 1 0-1.179-.417a3.6 3.6 0 0 0-.203 1.19v1.96a3.568 3.568 0 0 0 5.947 2.66a.625.625 0 0 0-.834-.932A2.318 2.318 0 0 1 4.682 7.98V6.02c0-.272.047-.532.132-.772m1.458-2.721a3.568 3.568 0 0 1 4.296 3.493v1.47a.625.625 0 1 1-1.25 0V6.02a2.318 2.318 0 0 0-2.792-2.27a.625.625 0 1 1-.254-1.223M7.625 6.02a.625.625 0 1 0-1.25 0v1.962a.625.625 0 1 0 1.25 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="font-medium text-blue-700"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form edit info */}
                {showForm && (
                    <form
                        action=""
                        className="bg-white shadow-lg border absolute left-[23rem] px-6 py-3 rounded-md space-y-4 w-5/12"
                        onSubmit={handleSubmit}
                    >
                        <p className="font-medium text-lg mb-2">
                            Edit Informasi Karyawan
                        </p>
                        {/* Nama */}
                        <div>
                            <InputLabel htmlFor="name" value="Nama" />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="rounded-md border-gray-400 w-full"
                            />
                        </div>

                        {/* Divisi */}
                        <div>
                            <InputLabel htmlFor="division_id" value="Divisi" />
                            <CustomSelect
                                value={String(data.division_id)}
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

                        {/* Jadwal */}
                        <div className="mt-2">
                            <InputLabel value="Jadwal (Pilih hari masuk)" />
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllDaysChecked()}
                                        onChange={(e) =>
                                            handleToggleAllDays(
                                                e.target.checked,
                                            )
                                        }
                                        className="rounded-sm cursor-pointer focus:ring-transparent"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Setiap Hari
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.senin}
                                        onChange={(e) =>
                                            setData("senin", e.target.checked)
                                        }
                                        className="rounded-sm cursor-pointer focus:ring-transparent"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Senin
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.selasa}
                                        onChange={(e) =>
                                            setData("selasa", e.target.checked)
                                        }
                                        className="rounded-sm cursor-pointer focus:ring-transparent"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Selasa
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.rabu}
                                        onChange={(e) =>
                                            setData("rabu", e.target.checked)
                                        }
                                        className="rounded-sm cursor-pointer focus:ring-transparent"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Rabu
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.kamis}
                                        onChange={(e) =>
                                            setData("kamis", e.target.checked)
                                        }
                                        className="rounded-sm cursor-pointer focus:ring-transparent"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Kamis
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.jumat}
                                        onChange={(e) =>
                                            setData("jumat", e.target.checked)
                                        }
                                        className="rounded-sm cursor-pointer focus:ring-transparent"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Jumat
                                    </span>
                                </label>
                            </div>

                            {/* kalau backend validasi per field, ini nampilin error pertama yang ketemu */}
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
                        <div className="">
                            <InputLabel htmlFor="poin" value="Poin" />
                            <TextInput
                                id="poin"
                                type="number"
                                min="0"
                                name="poin"
                                value={data.poin}
                                onChange={(e) =>
                                    setData("poin", Number(e.target.value))
                                }
                                className="mt-1 block w-full"
                                placeholder="0"
                            />
                            <InputError
                                message={errors.poin}
                                className="mt-2"
                            />
                        </div>

                        {/* Aksi */}
                        <div className="flex gap-2 justify-end">
                            <SecondaryButton
                                onClick={handleCloseForm}
                                className="w-full justify-center"
                            >
                                Batal
                            </SecondaryButton>
                            <PrimaryButton className="w-full justify-center">
                                Simpan
                            </PrimaryButton>
                        </div>
                    </form>
                )}

                {/* Detail Kehadiran Karyawan */}
                <div className="flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm">Total Kehadiran</p>
                            <p className="font-bold text-lg">
                                {intern.total_kehadiran || 0} hari
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">Total Jam</p>
                            <p className="font-bold text-lg">
                                {intern.total_jam || 0} jam
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">
                                Jam Masuk{" "}
                                <span className="text-xs">(rata-rata)</span>
                            </p>
                            <p className="font-bold text-lg">
                                {intern.avg_jam_masuk || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">
                                Jam Pulang{" "}
                                <span className="text-xs">(rata-rata)</span>
                            </p>
                            <p className="font-bold text-lg">
                                {intern.avg_jam_pulang || "-"}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center border-2 border-gray-300 text-center rounded-lg text-sm ">
                        <p className="flex items-center gap-1 font-medium">
                            {" "}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23px"
                                height="23px"
                                viewBox="0 0 15 15"
                            >
                                <path
                                    fill="oklch(72.3% 0.219 149.579)"
                                    d="M7.5 5.125a2.375 2.375 0 1 1 0 4.75a2.375 2.375 0 0 1 0-4.75"
                                />
                            </svg>
                            <span className="text-gray-500">
                                {intern.total_kehadiran || 0}
                            </span>{" "}
                            Hadir
                        </p>
                        <p className="border-r-2 border-l-2 border-gray-300 flex items-center gap-1 font-medium">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23px"
                                height="23px"
                                viewBox="0 0 15 15"
                            >
                                <path
                                    fill="oklch(79.5% 0.184 86.047)"
                                    d="M7.5 5.125a2.375 2.375 0 1 1 0 4.75a2.375 2.375 0 0 1 0-4.75"
                                />
                            </svg>
                            <span className="text-gray-500">
                                {intern.total_izin || 0}
                            </span>{" "}
                            Izin
                        </p>
                        <p className="flex items-center gap-1 font-medium">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23px"
                                height="23px"
                                viewBox="0 0 15 15"
                            >
                                <path
                                    fill="oklch(63.7% 0.237 25.331)"
                                    d="M7.5 5.125a2.375 2.375 0 1 1 0 4.75a2.375 2.375 0 0 1 0-4.75"
                                />
                            </svg>
                            <span className="text-gray-500">
                                {intern.total_alpha || 0}
                            </span>{" "}
                            Alpha
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <p className="font-semibold text-lg">Riwayat Kehadiran</p>

                <DownloadBtn
                    onClick={`/interns/${intern.id}/export-attendance`}
                />
            </div>

            <table className="w-full mt-2">
                <thead className="bg-gray-100 border-b-2 border-gray-400 text-left">
                    <tr>
                        <th className="px-4 py-2 text-gray-500 font-semibold text-md">
                            Tanggal
                        </th>
                        <th className="px-4 py-2 text-gray-500 font-semibold text-md">
                            Hari
                        </th>
                        <th className="px-4 py-2 text-gray-500 font-semibold text-md">
                            Jam Masuk
                        </th>
                        <th className="px-4 py-2 text-gray-500 font-semibold text-md">
                            Jam Pulang
                        </th>
                        <th className="px-4 py-2 text-gray-500 font-semibold text-md">
                            Status Kehadiran
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* Tabel Dinamis - Row tabel otomatis bertambah sesuai dengan jadwal intern & isinya juga*/}
                    {intern.attendances && intern.attendances.length > 0 ? (
                        intern.attendances?.map((attendance) => (
                            <tr
                                key={attendance.id}
                                className="hover:bg-gray-50 border-b-2 border-gray-400"
                            >
                                <td className="px-4 py-2">{attendance.date}</td>
                                <td className="px-4 py-2">{attendance.hari}</td>
                                <td className="px-4 py-2 ">
                                    <div className="flex gap-1 items-center">
                                        {attendance.check_in || "-"}
                                        {attendance.terlambat && (
                                            <span className="text-xs flex items-center bg-yellow-100 text-yellow-700 py-0.5 px-1 font-medium rounded-md">
                                                (+{attendance.terlambat}m)
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    {attendance.check_out}
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() =>
                                            handleToggleStatusForm(
                                                attendance.id,
                                                attendance.status,
                                            )
                                        }
                                        className={`py-0.5 px-2 rounded-md font-medium ${attendanceStyle(attendance.status)}`}
                                    >
                                        {attendanceLabel(attendance.status)}
                                    </button>
                                    {showStatusForm &&
                                        currentAttendanceId ===
                                            attendance.id && (
                                            <form
                                                onSubmit={handleUpdateStatus}
                                                className="bg-white shadow-lg gap-2 rounded-lg absolute w-50 z-50"
                                            >
                                                <label className="flex gap-2 items-center hover:bg-gray-100 cursor-pointer px-3 py-3 rounded-t-lg">
                                                    <input
                                                        type="radio"
                                                        name="status kehadiran"
                                                        value="hadir"
                                                        checked={
                                                            selectedStatus ===
                                                            "hadir"
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedStatus(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="appearance-none border-2 border-blue-700 rounded-full checked:bg-blue-700 checked:border-blue-700 checked:shadow-[inset_0_0_0_9px_rgb(29,78,216)] transition duration-200 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                                                    />
                                                    <span
                                                        className={`py-0.5 px-2 rounded-md font-medium ${attendanceStyle("hadir")}`}
                                                    >
                                                        {attendanceLabel(
                                                            "hadir",
                                                        )}
                                                    </span>
                                                </label>
                                                <label className="flex gap-2 items-center hover:bg-gray-100 cursor-pointer px-3 py-3">
                                                    <input
                                                        type="radio"
                                                        name="status kehadiran"
                                                        value="izin"
                                                        checked={
                                                            selectedStatus ===
                                                            "izin"
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedStatus(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="appearance-none border-2 border-blue-700 rounded-full checked:bg-blue-700 checked:border-blue-700 checked:shadow-[inset_0_0_0_9px_rgb(29,78,216)] transition duration-200 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                                                    />
                                                    <span
                                                        className={`py-0.5 px-2 rounded-md font-medium ${attendanceStyle("izin")}`}
                                                    >
                                                        {attendanceLabel(
                                                            "izin",
                                                        )}
                                                    </span>
                                                </label>
                                                <label className="flex gap-2 items-center hover:bg-gray-100 cursor-pointer px-3 py-3">
                                                    <input
                                                        type="radio"
                                                        name="status kehadiran"
                                                        value="sakit"
                                                        checked={
                                                            selectedStatus ===
                                                            "sakit"
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedStatus(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="appearance-none border-2 border-blue-700 rounded-full checked:bg-blue-700 checked:border-blue-700 checked:shadow-[inset_0_0_0_9px_rgb(29,78,216)] transition duration-200 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                                                    />
                                                    <span
                                                        className={`py-0.5 px-2 rounded-md font-medium ${attendanceStyle("sakit")}`}
                                                    >
                                                        {attendanceLabel(
                                                            "sakit",
                                                        )}
                                                    </span>
                                                </label>
                                                <label className="flex gap-2 items-center hover:bg-gray-100 cursor-pointer px-3 py-3">
                                                    <input
                                                        type="radio"
                                                        name="status kehadiran"
                                                        value="alpha"
                                                        checked={
                                                            selectedStatus ===
                                                            "alpha"
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedStatus(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="appearance-none border-2 border-blue-700 rounded-full checked:bg-blue-700 checked:border-blue-700 checked:shadow-[inset_0_0_0_9px_rgb(29,78,216)] transition duration-200 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                                                    />
                                                    <span
                                                        className={`py-0.5 px-2 rounded-md font-medium ${attendanceStyle("alpha")}`}
                                                    >
                                                        {attendanceLabel(
                                                            "alpha",
                                                        )}
                                                    </span>
                                                </label>
                                                <div className="flex gap-2 my-2 w-full">
                                                    <PrimaryButton
                                                        type="submit"
                                                        className="flex-1 justify-center text-sm ml-2"
                                                    >
                                                        Simpan
                                                    </PrimaryButton>
                                                    <SecondaryButton
                                                        type="button"
                                                        onClick={
                                                            handleCancelStatusUpdate
                                                        }
                                                        className="flex-1 justify-center text-sm mr-2"
                                                    >
                                                        Batal
                                                    </SecondaryButton>
                                                </div>
                                            </form>
                                        )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="5"
                                className="px-4 py-8 text-center text-gray-500"
                            >
                                Belum ada riwayat kehadiran
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
