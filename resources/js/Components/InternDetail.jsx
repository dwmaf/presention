import { useState } from "react";
import { router, useForm } from "@inertiajs/react";

import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import DangerButton from "./DangerButton";
import DownloadBtn from "./DownloadBtn";
import { useToast } from "@/Components/ToastNotif";

import AttendanceTable from "./AttendanceTable";
import InternForm from "./InternForm";
import ToleransiModal from "./ToleransiModal";
import CheckOutForm from "./CheckOutForm";
import EditStatusForm from "./EditStatusForm";
import ConfirmModal from "./ConfirmModal";

/**
 * * Attendance Config (Single Source of Truth)
 * ? Kenapa penting?
 * ? - Menghindari hardcode berulang di banyak component
 * ? - Jika ada perubahan label/style → cukup di sini
 *
 * ! Digunakan oleh:
 * - Badge di tabel
 * - EditStatusForm
 * - Render helper
 */
const ATTENDANCE_STYLE = {
    hadir: "bg-green-100 text-green-700",
    izin: "bg-yellow-100 text-yellow-700",
    sakit: "bg-indigo-100 text-indigo-700",
    alpha: "bg-red-100 text-red-700",
};

const ATTENDANCE_LABEL = {
    hadir: "Hadir",
    izin: "Izin",
    sakit: "Sakit",
    alpha: "Alpha",
};

const getAttendanceStyle = (status) =>
    ATTENDANCE_STYLE[status] || "bg-gray-100 text-gray-700";

const getAttendanceLabel = (status) => ATTENDANCE_LABEL[status] || "Tidak ada";

/**
 * * InternDetail Page Component
 * * ------------------------------------------------------------
 * * Halaman detail untuk satu intern (karyawan magang)
 *
 * ? Kenapa component ini kompleks?
 * ? - Menggabungkan banyak fitur dalam satu halaman:
 * ?   - Edit profil intern
 * ?   - Upload foto
 * ?   - Manajemen kehadiran (status & jam pulang)
 * ?   - Statistik
 * ?   - Export & delete data
 *
 * ! Architecture decision:
 * ! - Logic dipusatkan di sini (state orchestration)
 * ! - UI kompleks dipisah ke component kecil:
 * !   - AttendanceTable
 * !   - EditStatusForm
 * !   - CheckOutForm
 * !   - ConfirmModal
 * !   - InternForm
 *
 * ? Kenapa pakai pattern ini?
 * ? - Menghindari "God Component UI"
 * ? - Tapi tetap centralize business logic (lebih mudah tracing)
 *
 * ! Responsibility:
 * - Mengelola seluruh state halaman
 * - Handle komunikasi API (Inertia router)
 * - Mengatur interaksi antar component
 *
 * ! Tidak bertanggung jawab:
 * - Styling detail tiap UI kecil
 * - Rendering tabel detail (delegated ke AttendanceTable)
 *
 * @param {Object} props
 * @param {Object} props.intern
 * * Data lengkap intern (profil + attendance + statistik)
 *
 * @param {Array} props.divisions
 * * List divisi untuk dropdown edit intern
 */
export default function InternDetail({ intern, divisions }) {
    if (!intern) return null;

    const { addToast } = useToast();

    // ── Form data (edit info intern) ──────────────────────────
    const { data, setData, errors, reset } = useForm({
        name: intern?.name || "",
        division_id: String(intern?.division_id || ""),
        senin: intern?.senin || false,
        selasa: intern?.selasa || false,
        rabu: intern?.rabu || false,
        kamis: intern?.kamis || false,
        jumat: intern?.jumat || false,
        poin: (intern?.poin ?? 5) < 0 ? 0 : (intern?.poin ?? 5),
    });

    /**
     * * UI State Management
     * ? Kenapa banyak state?
     * ? - Setiap fitur punya lifecycle sendiri:
     * ?   - modal buka/tutup
     * ?   - form aktif/tidak
     * ?   - selected item
     *
     * ! Trade-off:
     * - Banyak state → verbose
     * - Tapi lebih explicit & predictable
     */

    // ── UI State ──────────────────────────────────────────────
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showToleransiModal, setShowToleransiModal] = useState(false);

    // ── Status kehadiran ──────────────────────────────────────
    const [showStatusForm, setShowStatusForm] = useState(false);
    const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");

    // ── Jam Pulang ────────────────────────────────────────────
    const [showCheckOutForm, setShowCheckOutForm] = useState(false);
    const [editingCheckOutId, setEditingCheckOutId] = useState(null);
    const [checkOutValue, setCheckOutValue] = useState("");

    // ── Confirm modals ────────────────────────────────────────
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [confirmingCheckOutDeletion, setConfirmingCheckOutDeletion] =
        useState(false);

    /**
     * * Derived Values
     * ? Kenapa dipisah?
     * ? - Menghindari perhitungan ulang di JSX
     * ? - Meningkatkan readability
     *
     * ! Contoh:
     * - poinStyle → UI logic
     * - renderJadwal → transform data → display
     */

    const rawPoin = intern.poin ?? 0;
    const poin = rawPoin < 0 ? 0 : rawPoin;
    const poinStyle =
        poin < 3 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";

    const fingerStyle = intern.fingerprint_data
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

    /**
     * * Photo Upload Handler
     *
     * ! Validasi:
     * - Format file
     * - Ukuran file (2MB)
     *
     * ! Flow:
     * - User pilih file
     * - Validasi
     * - Upload via Inertia
     * - Reload data
     */
    const handlePhotoClick = () => {
        document.getElementById("photo-upload").click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
            addToast("Format file harus JPG, JPEG, atau PNG", "error");
            return;
        }

        if (file.size > 2048000) {
            addToast("Ukuran file maksimal 2MB", "error");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("foto", file);
        formData.append("_method", "PUT");

        router.post(`/interns/${intern.id}/update-photo`, formData, {
            onSuccess: () => {
                setUploading(false);
                addToast("Foto berhasil diubah!", "success");
                router.reload();
            },
            onError: (errors) => {
                setUploading(false);
                addToast(
                    "Gagal mengubah foto: " + Object.values(errors).join(", "),
                    "error",
                );
            },
        });
    };

    /**
     * * Edit Intern Handler
     *
     * ? Kenapa pakai useForm (Inertia)?
     * ? - Built-in error handling
     * ? - Simplify binding input → backend
     *
     * ! Behavior:
     * - Submit → PUT request
     * - Success → close form
     * - Cancel → reset state
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(`/interns/${intern.id}`, data, {
            onSuccess: () => setShowForm(false),
        });
    };

    const handleCloseForm = () => {
        reset();
        setShowForm(false);
    };

    // ============================================================
    // HANDLERS — TOLERANSI
    // ============================================================

    const handleSaveToleransi = (toleransiDays) => {
        router.put(`/interns/${intern.id}/update-toleransi`, toleransiDays, {
            onSuccess: () => {
                setShowToleransiModal(false);
                addToast("Toleransi keterlambatan berhasil diubah!", "success");
                router.reload();
            },
            onError: (errors) => {
                addToast(
                    "Gagal mengubah toleransi: " +
                        Object.values(errors).join(", "),
                    "error",
                );
            },
        });
    };

    /**
     * * Attendance Status Handler
     *
     * ? Kenapa pakai toggle pattern?
     * ? - UX: klik lagi untuk close
     * ? - Menghindari multiple dropdown terbuka
     *
     * ! State penting:
     * - currentAttendanceId → row aktif
     * - selectedStatus → value sementara
     */
    const handleToggleStatusForm = (attendanceId, currentStatus) => {
        if (showStatusForm && currentAttendanceId === attendanceId) {
            setShowStatusForm(false);
            setCurrentAttendanceId(null);
            setSelectedStatus("");
        } else {
            setShowStatusForm(true);
            setCurrentAttendanceId(attendanceId);
            setSelectedStatus(currentStatus);
        }
    };

    const handleSaveStatus = (status) => {
        router.put(
            `/attendances/${currentAttendanceId}/status`,
            { status },
            {
                onSuccess: () => {
                    setShowStatusForm(false);
                    setSelectedStatus("");
                    setCurrentAttendanceId(null);
                    addToast("Status kehadiran berhasil diubah!", "success");
                },
                onError: (errors) => {
                    addToast(
                        "Gagal mengubah status: " +
                            Object.values(errors).join(", "),
                        "error",
                    );
                },
            },
        );
    };

    const handleCancelStatusUpdate = () => {
        setShowStatusForm(false);
        setSelectedStatus("");
        setCurrentAttendanceId(null);
    };

    /**
     * * Check-Out Handler
     *
     * ? Kenapa dipisah dari status?
     * ? - Domain berbeda:
     * ?   - Status → kehadiran
     * ?   - CheckOut → waktu kerja
     *
     * ! Edge case:
     * - Bisa null (belum checkout)
     * - Bisa dihapus (reset)
     */
    const handleToggleCheckOutForm = (attendanceId, currentCheckOut) => {
        if (showCheckOutForm && editingCheckOutId === attendanceId) {
            setShowCheckOutForm(false);
            setEditingCheckOutId(null);
            setCheckOutValue("");
        } else {
            setShowCheckOutForm(true);
            setEditingCheckOutId(attendanceId);
            setCheckOutValue(
                currentCheckOut ? currentCheckOut.slice(0, 5) : "",
            );
        }
    };

    const handleSaveCheckOut = (value) => {
        router.put(
            `/attendances/${editingCheckOutId}/check-out`,
            { check_out: value },
            {
                onSuccess: () => {
                    setShowCheckOutForm(false);
                    setEditingCheckOutId(null);
                    setCheckOutValue("");
                    addToast("Jam pulang berhasil diubah!", "success");
                },
                onError: (errors) => {
                    addToast(
                        "Gagal mengubah jam pulang: " +
                            Object.values(errors).join(", "),
                        "error",
                    );
                },
            },
        );
    };

    const handleCancelCheckOutUpdate = () => {
        setShowCheckOutForm(false);
        setEditingCheckOutId(null);
        setCheckOutValue("");
    };

    const handleDeleteCheckOut = () => {
        router.put(
            `/attendances/${editingCheckOutId}/check-out`,
            { check_out: null },
            {
                onSuccess: () => {
                    setShowCheckOutForm(false);
                    setEditingCheckOutId(null);
                    setCheckOutValue("");
                    setConfirmingCheckOutDeletion(false);
                    addToast("Jam pulang berhasil dihapus!", "success");
                },
                onError: (errors) => {
                    addToast(
                        "Gagal menghapus jam pulang: " +
                            Object.values(errors).join(", "),
                        "error",
                    );
                    setShowCheckOutForm(false);
                    setEditingCheckOutId(null);
                    setCheckOutValue("");
                    setConfirmingCheckOutDeletion(false);
                },
            },
        );
    };

    /**
     * * Delete Intern Handler
     *
     * ! Danger Zone:
     * - Menghapus semua data (attendance, foto, dll)
     *
     * ? Kenapa pakai confirm modal?
     * ? - Mencegah destructive action tanpa sadar
     */
    const handleDeleteIntern = () => {
        router.delete(route("interns.destroy", intern.id), {
            onSuccess: () => {
                addToast("Data berhasil dihapus selamanya.", "success");
                setConfirmingDeletion(false);
                window.location.reload();
            },
            onError: () => {
                addToast("Gagal menghapus data.", "error");
                setConfirmingDeletion(false);
            },
        });
    };

    /**
     * * Render Helper Pattern
     *
     * ? Kenapa tidak langsung di AttendanceTable?
     * ? - Karena butuh akses ke state parent
     * ? - AttendanceTable harus tetap generic
     *
     * ! Pattern:
     * - Parent inject logic via render props
     *
     * ? Benefit:
     * - Table reusable
     * - Logic tetap centralized
     */

    /**
     * * Render kolom Jam Pulang + CheckOutForm
     * ! Dipakai sebagai render prop di AttendanceTable
     */
    const renderCheckOut = (attendance, indexInPage, totalInPage) => {
        const position =
            indexInPage >= totalInPage - (totalInPage > 4 ? totalInPage - 3 : 0)
                ? "top"
                : "bottom";

        return (
            <div className="relative">
                <button
                    onClick={() =>
                        handleToggleCheckOutForm(
                            attendance.id,
                            attendance.check_out,
                        )
                    }
                    className="cursor-pointer rounded px-2 py-1 hover:bg-gray-100"
                >
                    {attendance.check_out
                        ? attendance.check_out.slice(0, 5)
                        : "-"}
                </button>

                {!confirmingCheckOutDeletion && (
                    <CheckOutForm
                        show={
                            showCheckOutForm &&
                            editingCheckOutId === attendance.id
                        }
                        position={position}
                        value={checkOutValue}
                        setValue={setCheckOutValue}
                        onSave={handleSaveCheckOut}
                        onDelete={() => setConfirmingCheckOutDeletion(true)}
                        onCancel={handleCancelCheckOutUpdate}
                    />
                )}
            </div>
        );
    };

    /**
     * * Render kolom Status + EditStatusForm
     * ! Dipakai sebagai render prop di AttendanceTable
     */
    const renderStatus = (attendance, indexInPage, totalInPage) => {
        const position = indexInPage >= 3 ? "top" : "bottom";

        return (
            <div className="relative">
                <button
                    onClick={() =>
                        handleToggleStatusForm(attendance.id, attendance.status)
                    }
                    className={`rounded-md px-2 py-0.5 font-medium ${getAttendanceStyle(attendance.status)}`}
                >
                    {getAttendanceLabel(attendance.status)}
                </button>

                <EditStatusForm
                    show={
                        showStatusForm && currentAttendanceId === attendance.id
                    }
                    position={position}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    onSave={handleSaveStatus}
                    onCancel={handleCancelStatusUpdate}
                    getStyle={getAttendanceStyle}
                    getLabel={getAttendanceLabel}
                />
            </div>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="px-8 py-6">
            {/* ── Profile Section ─────────────────────────────── */}
            <div className="relative flex justify-between">
                {/* Foto & Info Singkat */}
                <div className="flex gap-4">
                    {/* Foto */}
                    <div
                        className="group relative h-40 w-40 cursor-pointer"
                        onClick={handlePhotoClick}
                    >
                        {intern.foto ? (
                            <>
                                <img
                                    src={`/storage/${intern.foto}`}
                                    alt={intern.name}
                                    className="h-full w-full rounded-xl object-cover object-top"
                                />
                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black bg-opacity-0 opacity-0 transition-all duration-300 group-hover:bg-opacity-50 group-hover:opacity-100">
                                    <span className="font-medium text-white">
                                        {uploading
                                            ? "Mengupload..."
                                            : "Ubah Foto"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-64 w-48 items-center justify-center rounded-xl bg-gray-200 text-gray-500">
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

                    {/* Info */}
                    <div className="flex flex-col gap-4">
                        <p className="text-2xl font-bold">{intern.name}</p>

                        <p className="text-md font-medium">
                            {intern.division?.nama_divisi || "-"}
                        </p>

                        {/* Jadwal + Toleransi */}
                        <div className="flex items-center gap-4">
                            <p className="flex items-center gap-1 text-sm font-medium text-gray-500">
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

                            <button
                                type="button"
                                className="flex items-center gap-1"
                                onClick={() => setShowToleransiModal(true)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 640 640"
                                >
                                    <path
                                        fill="oklch(55.1% 0.027 264.364)"
                                        d="M256 72c66.3 0 120 53.7 120 120s-53.7 120-120 120s-120-53.7-120-120S189.7 72 256 72m-29.7 296h59.4c3.9 0 7.9.1 11.8.4c-16.2 28.2-25.5 60.8-25.5 95.6c0 41.8 13.4 80.5 36 112H77.7C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368m93.7 96c0-79.5 64.5-144 144-144s144 64.5 144 144s-64.5 144-144 144s-144-64.5-144-144m144-80c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16h-32v-48c0-8.8-7.2-16-16-16"
                                    />
                                </svg>
                                <p className="text-sm">Toleransi Terlambat</p>
                            </button>
                        </div>

                        {/* Poin + Fingerprint + Edit */}
                        <div className="flex gap-2">
                            <p
                                className={`${poinStyle} flex w-fit items-center rounded-lg px-2 py-0.5 text-xs font-semibold`}
                            >
                                {poin} Poin
                            </p>

                            <button
                                onClick={() =>
                                    router.visit(
                                        `/interns/${intern.id}/create-fingerprint`,
                                    )
                                }
                                className={`${fingerStyle} flex items-center rounded-full px-2`}
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
                                {intern.fingerprint_data ? (
                                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                        Terdaftar
                                    </span>
                                ) : (
                                    <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                                        Belum Terdaftar
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="font-medium text-blue-700"
                            >
                                Edit Info
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Edit Info */}
                <InternForm
                    show={showForm}
                    setShow={setShowForm}
                    data={data}
                    setData={setData}
                    errors={errors}
                    divisions={divisions}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                />

                {/* Statistik Kehadiran */}
                <div className="flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm">Total Kehadiran</p>
                            <p className="text-lg font-medium">
                                {intern.total_kehadiran || 0} hari
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">Total Jam</p>
                            <p className="text-lg font-medium">
                                {intern.total_jam || 0} jam
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">
                                Jam Masuk{" "}
                                <span className="text-xs">(rata-rata)</span>
                            </p>
                            <p className="text-lg font-medium">
                                {intern.avg_jam_masuk || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">
                                Jam Pulang{" "}
                                <span className="text-xs">(rata-rata)</span>
                            </p>
                            <p className="text-lg font-medium">
                                {intern.avg_jam_pulang || "-"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center rounded-lg border-2 border-gray-300 text-center text-sm">
                        <p className="flex items-center gap-1 font-medium">
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
                        <p className="flex items-center gap-1 border-l-2 border-r-2 border-gray-300 font-medium">
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

            {/* ── Riwayat Kehadiran ────────────────────────────── */}
            <div className="mt-8 flex items-center justify-between">
                <p className="text-lg font-semibold">Riwayat Kehadiran</p>

                <div className="flex gap-4">
                    <DownloadBtn
                        onClick={`/interns/${intern.id}/export-attendance`}
                    />

                    <button
                        onClick={() => setConfirmingDeletion(true)}
                        className="inline-flex items-center rounded-lg px-4 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                        <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                        Hapus Intern
                    </button>
                </div>
            </div>

            {/* Tabel Kehadiran */}
            <AttendanceTable
                attendances={intern.attendances || []}
                renderCheckOut={(attendance, indexInPage, totalInPage) =>
                    renderCheckOut(attendance, indexInPage, totalInPage)
                }
                renderStatus={(attendance, indexInPage, totalInPage) =>
                    renderStatus(attendance, indexInPage, totalInPage)
                }
            />

            {/* ── Modals ───────────────────────────────────────── */}

            {/* Toleransi */}
            <ToleransiModal
                show={showToleransiModal}
                intern={intern}
                onClose={() => setShowToleransiModal(false)}
                onSave={handleSaveToleransi}
            />

            {/* Konfirmasi Hapus Intern */}
            <ConfirmModal
                show={confirmingDeletion}
                title={`PERINGATAN: Apakah Anda yakin ingin menghapus "${intern.name}"?`}
                description={
                    <div className="space-y-2">
                        <p className="font-semibold">
                            Semua data riwayat absensi, poin, dan foto akan{" "}
                            <span className="font-bold text-red-700">
                                HILANG PERMANEN.
                            </span>
                        </p>
                        <p>
                            Jika ini data duplikat, pastikan Anda menghapus yang
                            benar.
                        </p>
                        <p>
                            Jika ini data lama, silahkan download data
                            kehadirannya dulu jika ingin membackupnya.
                        </p>
                    </div>
                }
                confirmText="Hapus Permanen"
                onCancel={() => setConfirmingDeletion(false)}
                onConfirm={handleDeleteIntern}
            />

            {/* Konfirmasi Hapus Jam Pulang */}
            <ConfirmModal
                show={confirmingCheckOutDeletion}
                title="Yakin ingin menghapus jam pulang?"
                description="Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                onCancel={() => {
                    setShowCheckOutForm(false);
                    setEditingCheckOutId(null);
                    setCheckOutValue("");
                    setConfirmingCheckOutDeletion(false);
                }}
                onConfirm={handleDeleteCheckOut}
            />
        </div>
    );
}
