/**
 * ============================================================================
 * Component   : InternDetail
 * Layer       : Feature (Component)
 *
 * Description:
 * Komponen tampilan detail profil lengkap karyawan magang, termasuk foto profil,
 * divisi, statistik absensi, tabel riwayat presensi, dan modal-modal aksi terkait.
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
    UploadIcon,
    Loader2Icon,
    SaveIcon,
    TrashIcon,
} from "lucide-react";

import AttendanceTable, {
    type AttendanceRecord,
} from "@/components/AttendanceTable";
import InternEditForm from "./InternEditForm";
import InternToleranceModal from "@/features/interns/components/InternToleranceModal";
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
import { useInternEditForm } from "../hooks/useInternEditForm";
import { useInternActions } from "../hooks/useInternActions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TimePicker from "@/components/TimePicker";
import { Label } from "@/components/ui/label";
import type { KeyboardEvent } from "react";

/**
 * Kontrak properti untuk komponen detail karyawan magang.
 */
export interface InternDetailProps {
    intern: InternData;
    divisions: Division[];
}

type ExtendedAttendance = Attendance & AttendanceRecord & { date: string };

const ATTENDANCE_STYLE: Record<string, string> = {
    hadir: "bg-green-100 text-green-700",
    izin: "bg-amber-100 text-amber-700",
    sakit: "bg-blue-100 text-blue-700",
    alpha: "bg-red-100 text-red-700",
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
 * Komponen detail profil karyawan magang. Mengordinasikan tampilan statistik
 * dan modal-modal mutasi data.
 */
export default function InternDetail({ intern, divisions }: InternDetailProps) {
    if (!intern) return null;

    // ? Memanggil kustom hooks untuk memisahkan logika aksi dan state
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
        isDeletingCheckOut,
    } = useInternAttendance();

    const {
        showForm,
        setShowForm,
        data,
        setData,
        errors,
        handleSubmit,
        handleCloseForm,
        processing,
    } = useInternEditForm({ intern });

    const {
        showToleranceModal,
        setShowToleranceModal,
        confirmingDeletion,
        setConfirmingDeletion,
        handleSaveTolerance,
        handleDeleteIntern,
        isSavingTolerance,
        isDeleting,
    } = useInternActions({ internId: intern.id });

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
    const renderStatus = (attendance: ExtendedAttendance) => {
        return (
            <Badge
                className={`font-medium ${getAttendanceStyle(attendance.status)}`}
            >
                {getAttendanceLabel(attendance.status)}
            </Badge>
        );
    };

    // ? Menampilkan menu aksi dengan 2 pilihan: Edit dan Hapus
    const renderActions = (attendance: ExtendedAttendance) => {
        return (
            <div className="relative inline-block text-left">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-8 cursor-pointer p-0"
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

    const handlePhotoKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!uploading) {
                handlePhotoClick();
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={handlePhotoKeyDown}
                        className="group border-border bg-muted relative flex h-36 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border shadow-sm transition-colors duration-300 hover:bg-black/10 dark:hover:bg-white/10"
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
                                <UserIcon className="size-8 group-hover:hidden" />
                                <UploadIcon className="hidden size-8 group-hover:block" />

                                <span className="text-xs font-semibold">
                                    {uploading ? (
                                        "Mengupload..."
                                    ) : (
                                        <>
                                            <span className="group-hover:hidden">
                                                Belum ada foto
                                            </span>
                                            <span className="hidden group-hover:inline">
                                                Unggah foto
                                            </span>
                                        </>
                                    )}
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
                                onClick={() => setShowToleranceModal(true)}
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

                        <DialogDescription className="text-sm">
                            Perbarui nama, divisi, poin, dan jadwal kerja
                            karyawan di sini.
                        </DialogDescription>
                    </DialogHeader>

                    <InternEditForm
                        show={showForm}
                        setShow={setShowForm}
                        data={data}
                        setData={setData}
                        errors={errors}
                        divisions={divisions}
                        onSubmit={handleSubmit}
                        onCancel={handleCloseForm}
                        processing={processing}
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
                    attendances={
                        (intern.attendances as ExtendedAttendance[]) || []
                    }
                    renderActions={(att) =>
                        renderActions(att as ExtendedAttendance)
                    }
                    renderStatus={(att) =>
                        renderStatus(att as ExtendedAttendance)
                    }
                />
            </div>

            <InternToleranceModal
                show={showToleranceModal}
                intern={intern}
                onClose={() => setShowToleranceModal(false)}
                onSave={handleSaveTolerance}
                processing={isSavingTolerance}
            />

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-[400px] bg-white p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            Edit Kehadiran{" "}
                            {editingAttendance &&
                                `(${formatDate((editingAttendance as ExtendedAttendance).date)})`}
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
                        <div className="space-y-2">
                            <Label className="">Status Kehadiran</Label>

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

                        <div className="space-y-2">
                            <Label className="">Jam Pulang</Label>

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
                                {isSaving ? (
                                    <>
                                        <Loader2Icon className="size-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon className="size-4" />
                                        Simpan
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={confirmingDeletion}
                onOpenChange={(open) =>
                    !open && !isDeleting && setConfirmingDeletion(false)
                }
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
                        <AlertDialogCancel disabled={isDeleting}>
                            Batal
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDeleteIntern}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                "Hapus Permanen"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={confirmingCheckOutDeletion}
                onOpenChange={(open) =>
                    !open &&
                    !isDeletingCheckOut &&
                    setConfirmingCheckOutDeletion(false)
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">
                            Hapus Jam Pulang
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-sm">
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
                            disabled={isDeletingCheckOut}
                        >
                            Batal
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDeleteCheckOut}
                            disabled={isDeletingCheckOut}
                            variant="destructive"
                        >
                            {isDeletingCheckOut ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <TrashIcon className="size-4" />
                                    Ya, Hapus
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
