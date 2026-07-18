/**
 * ============================================================================
 * Component   : InternDetail
 * Layer       : UI (Component)
 *
 * Description:
 * Menampilkan detail profil karyawan, riwayat absensi, grafik/statistik,
 * serta kontrol edit foto, toleransi, status, dan hapus karyawan.
 * ============================================================================
 */

import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CalendarDaysIcon,
    ClockIcon,
    FingerprintIcon,
    EditIcon,
    SparklesIcon,
    UserIcon,
    Trash2,
    MoreHorizontal,
    Edit2,
} from "lucide-react";

// @ts-ignore
import AttendanceTable from "@/components/AttendanceTable";
import InternForm from "./InternForm";
import ToleransiModal from "@/features/interns/components/ToleransiModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import type {
    Division,
    Attendance,
    InternData,
} from "@/features/interns/types/intern";

import { useInternPhoto } from "../hooks/useInternPhoto";
import { useInternAttendance } from "../hooks/useInternAttendance";
import { useInternForm } from "../hooks/useInternForm";
import { useInternActions } from "../hooks/useInternActions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TimePicker from "@/components/TimePicker";

interface InternDetailProps {
    intern: InternData;
    divisions: Division[];
}

const ATTENDANCE_STYLE: Record<string, string> = {
    hadir: "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200",
    izin: "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200",
    sakit: "bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200",
    alpha: "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200",
};

const ATTENDANCE_LABEL: Record<string, string> = {
    hadir: "Hadir",
    izin: "Izin",
    sakit: "Sakit",
    alpha: "Alpha",
};

const getAttendanceStyle = (status: string) =>
    ATTENDANCE_STYLE[status] || "bg-gray-100 text-gray-700";

const getAttendanceLabel = (status: string) =>
    ATTENDANCE_LABEL[status] || "Tidak ada";

/**
 * Komponen detail profil karyawan magang.
 *
 * @param props Properti komponen.
 * @returns Komponen detail karyawan magang.
 */
export default function InternDetail({ intern, divisions }: InternDetailProps) {
    if (!intern) return null;

    // * Panggil hooks terpisah
    const { uploading, handlePhotoClick, handlePhotoChange } = useInternPhoto({
        internId: intern.id,
    });

    const {
        showEditModal,
        setShowEditModal,
        editingAttendance,
        setEditingAttendance,
        selectedStatus,
        setSelectedStatus,
        checkOutValue,
        setCheckOutValue,
        confirmingCheckOutDeletion,
        setConfirmingCheckOutDeletion,
        handleOpenEditModal,
        handleSaveAttendance,
        handleDeleteCheckOut,
        isSaving,
    } = useInternAttendance();

    const {
        showForm,
        setShowForm,
        data,
        setData,
        errors,
        handleSubmit,
        handleCloseForm,
    } = useInternForm({ intern });

    const {
        showToleransiModal,
        setShowToleransiModal,
        confirmingDeletion,
        setConfirmingDeletion,
        handleSaveToleransi,
        handleDeleteIntern,
    } = useInternActions({ internId: intern.id });

    // ── Derived States ─────────────────────────────────────────
    const rawPoin = intern.poin ?? 0;
    const poin = rawPoin < 0 ? 0 : rawPoin;
    const poinStyle =
        poin < 3
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary";

    const fingerStyle = intern.fingerprint_data
        ? "bg-emerald-100 text-emerald-700"
        : "bg-destructive/10 text-destructive";

    const renderJadwal = () => {
        const days: string[] = [];
        if (intern.senin) days.push("Senin");
        if (intern.selasa) days.push("Selasa");
        if (intern.rabu) days.push("Rabu");
        if (intern.kamis) days.push("Kamis");
        if (intern.jumat) days.push("Jumat");

        if (days.length === 5) return "Setiap hari";
        return days.length > 0 ? days.join(", ") : "Belum ada jadwal";
    };

    // ? Menampilkan status secara statis (tanpa klik inline)
    const renderStatus = (attendance: Attendance) => {
        return (
            <Badge
                className={`font-medium ${getAttendanceStyle(attendance.status)}`}
            >
                {getAttendanceLabel(attendance.status)}
            </Badge>
        );
    };

    // ? Menampilkan menu aksi dengan 2 pilihan: Edit dan Hapus
    const renderActions = (attendance: Attendance) => {
        return (
            <div className="relative inline-block text-left">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8 cursor-pointer p-0"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-40 bg-white">
                        <DropdownMenuItem
                            onClick={() => handleOpenEditModal(attendance)}
                            className="cursor-pointer"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Kehadiran
                        </DropdownMenuItem>

                        {attendance.check_out && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setEditingAttendance(attendance);
                                    setConfirmingCheckOutDeletion(true);
                                }}
                                variant="destructive"
                                className="cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                                Hapus Kehadiran
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        try {
            const parsedDate = new Date(dateString);
            return parsedDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                        className="group border-border bg-muted relative flex h-36 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border shadow-sm"
                        onClick={handlePhotoClick}
                    >
                        {intern.foto ? (
                            <>
                                <img
                                    src={`/storage/${intern.foto}`}
                                    alt={intern.name}
                                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 hover:opacity-100">
                                    <span className="text-xs font-semibold text-white">
                                        {uploading
                                            ? "Mengupload..."
                                            : "Ubah Foto"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-muted-foreground flex flex-col items-center gap-1 p-3 text-center">
                                <UserIcon className="h-8 w-8" />

                                <span className="text-xs font-semibold">
                                    {uploading
                                        ? "Mengupload..."
                                        : "Upload Foto"}
                                </span>
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

                    <div className="space-y-2.5">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold tracking-tight">
                                    {intern.name}
                                </h2>

                                <Badge
                                    className={`h-5 text-xs font-semibold ${
                                        intern.is_active
                                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}
                                >
                                    {intern.is_active ? "Aktif" : "Nonaktif"}
                                </Badge>
                            </div>
                            <p className="text-primary text-sm font-semibold">
                                {intern.division?.nama_divisi ||
                                    "Belum ada divisi"}
                            </p>
                        </div>

                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            <span className="flex items-center gap-1.5 font-medium">
                                <CalendarDaysIcon className="h-4 w-4" />
                                {renderJadwal()}
                            </span>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowToleransiModal(true)}
                                className="text-muted-foreground hover:text-foreground h-7 px-2 font-medium"
                            >
                                <ClockIcon className="mr-1 h-4 w-4" />
                                Toleransi Terlambat
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge className={poinStyle}>{poin} Poin</Badge>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    router.visit(
                                        `/interns/${intern.id}/create-fingerprint`,
                                    )
                                }
                                className={`flex h-7 items-center gap-1.5 rounded-full border px-2 ${fingerStyle}`}
                            >
                                <FingerprintIcon className="h-3.5 w-3.5" />
                                <span className="text-xs font-semibold">
                                    {intern.fingerprint_data
                                        ? "Terdaftar"
                                        : "Belum Terdaftar"}
                                </span>
                            </Button>

                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => setShowForm(!showForm)}
                                className="h-7 text-xs font-semibold"
                            >
                                <EditIcon className="mr-1 h-3 w-3" />
                                Edit Info
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full min-w-[240px] space-y-4 md:w-auto">
                    <div className="border-border bg-card grid grid-cols-2 gap-4 rounded-xl border p-4">
                        <div>
                            <p className="text-muted-foreground text-xs">
                                Total Kehadiran
                            </p>
                            <p className="text-base font-semibold">
                                {intern.total_kehadiran || 0} hari
                            </p>
                        </div>

                        <div>
                            <p className="text-muted-foreground text-xs">
                                Total Jam Kerja
                            </p>
                            <p className="text-base font-semibold">
                                {intern.total_jam || 0} jam
                            </p>
                        </div>

                        <div>
                            <p className="text-muted-foreground text-xs">
                                Rata-rata Jam Masuk
                            </p>
                            <p className="text-base font-semibold">
                                {intern.avg_jam_masuk || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">
                                Rata-rata Jam Pulang
                            </p>
                            <p className="text-base font-semibold">
                                {intern.avg_jam_pulang || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="no-scrollbar max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-lg md:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            Edit Informasi Karyawan
                        </DialogTitle>
                    </DialogHeader>

                    <InternForm
                        show={showForm}
                        setShow={setShowForm}
                        data={data}
                        setData={setData}
                        errors={errors}
                        divisions={divisions}
                        onSubmit={(e) => handleSubmit(e as unknown as Event)}
                        onCancel={handleCloseForm}
                    />
                </DialogContent>
            </Dialog>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold tracking-tight">
                        Riwayat Kehadiran
                    </h3>

                    <div className="border-border bg-card/50 flex shrink-0 justify-between gap-4 rounded-lg border px-4 py-2 text-xs font-semibold">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <SparklesIcon className="h-3.5 w-3.5 fill-emerald-500/20" />
                            Hadir: {intern.total_kehadiran || 0}
                        </span>

                        <span className="flex items-center gap-1 border-r border-l px-4 text-amber-600 dark:text-amber-400">
                            <SparklesIcon className="h-3.5 w-3.5 fill-amber-500/20" />
                            Izin: {intern.total_izin || 0}
                        </span>

                        <span className="text-destructive flex items-center gap-1">
                            <SparklesIcon className="fill-destructive/20 h-3.5 w-3.5" />
                            Alpha: {intern.total_alpha || 0}
                        </span>
                    </div>
                </div>

                <AttendanceTable
                    attendances={intern.attendances || []}
                    renderActions={(att) => renderActions(att as Attendance)}
                    renderStatus={(att) => renderStatus(att as Attendance)}
                />
            </div>

            <ToleransiModal
                show={showToleransiModal}
                intern={intern}
                onClose={() => setShowToleransiModal(false)}
                onSave={handleSaveToleransi}
            />

            {/* Modal Dialog Edit Kehadiran Terpadu (Status & Jam Pulang) */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-[400px] bg-white p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Edit Kehadiran{" "}
                            {editingAttendance &&
                                `(${formatDate((editingAttendance as unknown as { date: string }).date)})`}
                        </DialogTitle>

                        <DialogDescription className="text-muted-foreground text-sm">
                            Ubah status dan jam pulang karyawan magang.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveAttendance(selectedStatus, checkOutValue);
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-1.5">
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                                Status Kehadiran
                            </label>
                            <Select
                                value={selectedStatus}
                                onValueChange={(value) => {
                                    if (value !== null) {
                                        setSelectedStatus(value);
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue
                                        placeholder="Pilih status"
                                        className="capitalize"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="hadir">Hadir</SelectItem>
                                    <SelectItem value="izin">Izin</SelectItem>
                                    <SelectItem value="sakit">Sakit</SelectItem>
                                    <SelectItem value="alpha">Alpha</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700">
                                Jam Pulang
                            </label>

                            <TimePicker
                                value={checkOutValue}
                                onChange={setCheckOutValue}
                                disabled={isSaving}
                                placeholder="Pilih jam pulang"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEditModal(false)}
                                disabled={isSaving}
                                className="border-gray-200 font-semibold text-gray-700"
                            >
                                Batal
                            </Button>

                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                            >
                                {isSaving ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={confirmingDeletion}
                onOpenChange={setConfirmingDeletion}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Karyawan</AlertDialogTitle>

                        <AlertDialogDescription className="space-y-3 pt-2">
                            <p className="text-foreground font-semibold">
                                Apakah Anda yakin ingin menghapus data &quot;
                                {intern.name}&quot;?
                            </p>

                            <p className="text-destructive bg-destructive/10 border-destructive/20 rounded-lg border p-2.5 font-medium">
                                Peringatan: Seluruh riwayat absensi, akumulasi
                                poin, dan foto akan dihapus selamanya dari
                                sistem.
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Silakan ekspor/unduh data kehadiran terlebih
                                dahulu jika Anda membutuhkannya untuk cadangan.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDeleteIntern}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            Hapus Permanen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={confirmingCheckOutDeletion}
                onOpenChange={setConfirmingCheckOutDeletion}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Jam Pulang</AlertDialogTitle>

                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus catatan jam pulang
                            untuk baris kehadiran ini? Tindakan ini tidak dapat
                            dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setConfirmingCheckOutDeletion(false);
                            }}
                        >
                            Batal
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDeleteCheckOut}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
