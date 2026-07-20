/**
 * ============================================================================
 * Component   : Intern (Daftar Karyawan)
 * Layer       : Feature (Page)
 *
 * Description:
 * Halaman utama untuk manajemen data karyawan (intern). Mengelola data CRUD,
 * poin absensi, hari kerja, dan visual detail karyawan.
 * ============================================================================
 */

import { Head, router, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";

import InternCard from "@/features/interns/components/InternCard";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import {
    DownloadIcon,
    Loader2Icon,
    PowerIcon,
    RotateCcwIcon,
    TrashIcon,
    UserPlusIcon,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import InternDetail from "@/features/interns/components/InternDetail";
import InternAddModal from "@/features/interns/components/InternAddModal";
import InternDeleteModal from "@/features/interns/components/InternDeleteModal";
import InternResetModal from "@/features/interns/components/InternResetModal";

import type { Division, InternData } from "@/features/interns/types/intern";
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
import { toast } from "sonner";

interface Auth {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface InternProps {
    auth: Auth;
    interns: InternData[];
    divisions: Division[];
}

interface InternFormState {
    name: string;
    division_id: string;
    foto: File | null;
    poin: number;
    senin: boolean;
    selasa: boolean;
    rabu: boolean;
    kamis: boolean;
    jumat: boolean;
    _method: "POST" | "put";
}

const DAYS = ["senin", "selasa", "rabu", "kamis", "jumat"] as const;

/**
 * Komponen utama halaman manajemen Karyawan.
 *
 * @param props Properti halaman.
 * @returns Halaman daftar karyawan.
 */
export default function Intern({ interns, divisions }: InternProps) {
    const [search, setSearch] = useState<string>("");
    const [currentIntern, setCurrentIntern] = useState<InternData | null>(null);

    // * State untuk kontrol modal
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [internToDelete, setInternToDelete] = useState<InternData | null>(
        null,
    );
    const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [backToTop, setBackToTop] = useState<boolean>(false);

    const [isToggleActiveOpen, setIsToggleActiveOpen] =
        useState<boolean>(false);
    const [isTogglingActive, setIsTogglingActive] = useState<boolean>(false);

    const toggleActive = () => {
        if (currentIntern) {
            setIsTogglingActive(true);
            router.put(
                `/interns/${currentIntern.id}/toggle-active`,
                {},
                {
                    onSuccess: () => {
                        setIsToggleActiveOpen(false);
                        toast.success("Status keaktifan berhasil diperbarui!");
                    },
                    onError: () => {
                        toast.error("Gagal memperbarui status keaktifan.");
                    },
                    onFinish: () => {
                        setIsTogglingActive(false);
                    },
                },
            );
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const showId = params.get("show");

        if (showId && interns.length > 0) {
            const foundIntern = interns.find((i) => i.id === Number(showId));
            if (foundIntern) {
                setCurrentIntern(foundIntern);
                setIsDetailOpen(true);
                // Bersihkan URL agar modal tidak terbuka lagi saat di-refresh
                window.history.replaceState({}, "", route("interns.index"));
            }
        }
    }, [interns]);

    // * Form state untuk create/update
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<InternFormState>({
            name: "",
            division_id: divisions?.length ? String(divisions[0].id) : "",
            foto: null,
            poin: 5,
            senin: false,
            selasa: false,
            rabu: false,
            kamis: false,
            jumat: false,
            _method: "POST",
        });

    const deleteForm = useForm({});
    const { post: postReset, processing: isResetting } = useForm();

    // * Sinkronkan currentIntern dengan data state terbaru dari server
    useEffect(() => {
        if (currentIntern) {
            const updated = interns.find((i) => i.id === currentIntern.id);
            if (updated) setCurrentIntern(updated);
        }
    }, [interns]);

    // * Buka modal pembuatan data baru
    const openCreate = () => {
        reset();
        setCurrentIntern(null);
        setPhotoPreview(null);
        setIsFormOpen(true);
        clearErrors();
    };

    // * Submit data form (Create / Update)
    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route("interns.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setIsFormOpen(false);
                reset();
                setPhotoPreview(null);
            },
        });
    };

    // * Konfirmasi penghapusan data
    const confirmDelete = (intern: InternData) => {
        setInternToDelete(intern);
        setIsDeleteOpen(true);
    };

    // * Eksekusi penghapusan data
    const deleteIntern = () => {
        if (internToDelete) {
            deleteForm.delete(route("interns.destroy", internToDelete.id), {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setIsDetailOpen(false);
                    toast.success("Karyawan berhasil dihapus.");
                },
                onError: () => {
                    toast.error("Gagal menghapus karyawan.");
                },
            });
        }
    };

    // * Eksekusi reset poin bulanan
    const resetPoints = () => {
        postReset(route("interns.resetPoints"), {
            onSuccess: () => setIsResetOpen(false),
        });
    };

    const isAllDaysChecked = () => {
        return DAYS.every((day) => data[day]);
    };

    const handleToggleAllDays = (checked: boolean) => {
        const updated = {} as Record<(typeof DAYS)[number], boolean>;
        DAYS.forEach((d) => (updated[d] = checked));
        setData({ ...data, ...updated });
    };

    // * Filter pencarian karyawan di client-side
    const filteredInterns = interns.filter((intern) => {
        const keyword = search.toLowerCase();
        return (
            intern.name?.toLowerCase().includes(keyword) ||
            intern.division?.nama_divisi?.toLowerCase().includes(keyword)
        );
    });

    const activeInterns = filteredInterns.filter(
        (intern) => intern.is_active !== false,
    );
    const inactiveInterns = filteredInterns.filter(
        (intern) => intern.is_active === false,
    );

    const today = new Date();
    const isFirstDate = today.getDate() === 1;

    // * Listener scroll untuk tombol kembali ke atas
    useEffect(() => {
        const handleScroll = () => {
            setBackToTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Karyawan" />

            <div className="relative">
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-foreground text-3xl font-bold tracking-tight">
                                Daftar Karyawan
                            </h1>
                            <p className="text-sm text-gray-600">
                                Kelola informasi profil dan akumulasi poin
                                karyawan magang UPA PKK.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="lg"
                                onClick={openCreate}
                                className="flex items-center gap-2"
                            >
                                <UserPlusIcon className="h-4.5 w-4.5" />
                                Tambah Karyawan
                            </Button>
                            <Button
                                size="lg"
                                variant="destructive"
                                onClick={() => setIsResetOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <RotateCcwIcon className="h-4 w-4" />
                                Reset Poin
                            </Button>
                        </div>

                        {isFirstDate && (
                            <div className="flex animate-pulse items-center gap-2 rounded-lg border border-yellow-400 bg-yellow-100 px-3 py-1.5 text-sm text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
                                Sudah tanggal 1, silakan reset poin.
                            </div>
                        )}
                    </div>

                    {/* Section Karyawan Aktif */}
                    <div className="space-y-3">
                        <h2 className="text-md flex items-center gap-2 font-bold tracking-tight text-gray-800">
                            <span>Karyawan Aktif</span>

                            <span className="flex items-center justify-center rounded-full bg-emerald-100 px-2 pb-1 text-xs font-semibold text-emerald-800">
                                {activeInterns.length}
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {activeInterns.map((intern) => (
                                <InternCard
                                    key={intern.id}
                                    intern={intern}
                                    onClick={() => {
                                        setCurrentIntern(intern);
                                        setIsDetailOpen(true);
                                    }}
                                />
                            ))}

                            {activeInterns.length === 0 && (
                                <div className="text-muted-foreground bg-card col-span-full rounded-lg border px-6 py-12 text-center text-sm">
                                    Tidak ada karyawan aktif yang cocok dengan
                                    pencarian.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section Karyawan Nonaktif */}
                    {inactiveInterns.length > 0 && (
                        <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                            <h2 className="text-md flex items-center gap-2 font-bold tracking-tight text-gray-400">
                                <span>Karyawan Nonaktif</span>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                                    {inactiveInterns.length}
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {inactiveInterns.map((intern) => (
                                    <div
                                        key={intern.id}
                                        className="opacity-50 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
                                    >
                                        <InternCard
                                            intern={intern}
                                            onClick={() => {
                                                setCurrentIntern(intern);
                                                setIsDetailOpen(true);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {backToTop && (
                    <button
                        onClick={scrollToTop}
                        className="group bg-primary/10 text-primary hover:bg-primary/20 fixed right-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300"
                        aria-label="Back to top"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform group-hover:-translate-y-1"
                        >
                            <path d="m18 15-6-6-6 6" />
                        </svg>
                    </button>
                )}

                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="scrollbar-none custom-scrollbar max-h-[90%] max-w-[95vw] overflow-y-auto md:max-w-6xl">
                        <DialogHeader className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold tracking-tighter">
                                    Detail Karyawan
                                </DialogTitle>

                                <DialogDescription>
                                    Informasi detail profil, jam kerja, poin,
                                    dan riwayat absensi karyawan.
                                </DialogDescription>
                            </div>

                            {currentIntern && (
                                <div className="flex shrink-0 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            window.location.href = `/interns/${currentIntern.id}/export-attendance`;
                                        }}
                                        className="flex items-center gap-1 border border-gray-200 bg-white focus-visible:ring-0"
                                    >
                                        <DownloadIcon className="h-4 w-4" />
                                        Ekspor Data Kehadiran
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setIsToggleActiveOpen(true)
                                        }
                                        className="flex items-center gap-1 border border-gray-200 bg-white"
                                    >
                                        <PowerIcon
                                            className={`h-4 w-4 ${currentIntern.is_active ? "text-rose-500" : "text-emerald-500"}`}
                                        />
                                        {currentIntern.is_active
                                            ? "Nonaktifkan"
                                            : "Aktifkan"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            confirmDelete(currentIntern)
                                        }
                                        className="flex items-center gap-1"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Hapus Karyawan
                                    </Button>
                                </div>
                            )}
                        </DialogHeader>

                        {currentIntern && (
                            <InternDetail
                                intern={currentIntern}
                                divisions={divisions}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <InternAddModal
                    show={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={submit}
                    data={data}
                    setData={setData}
                    processing={processing}
                    errors={errors}
                    divisions={divisions}
                    photoPreview={photoPreview}
                    setPhotoPreview={setPhotoPreview}
                    isAllDaysChecked={isAllDaysChecked}
                    handleToggleAllDays={handleToggleAllDays}
                    currentIntern={currentIntern}
                />

                <InternDeleteModal
                    show={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onDelete={deleteIntern}
                    processing={deleteForm.processing}
                    internName={currentIntern?.name}
                />

                {/* Modal Konfirmasi Toggle Keaktifan */}
                <AlertDialog
                    open={isToggleActiveOpen}
                    onOpenChange={setIsToggleActiveOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold">
                                {currentIntern?.is_active
                                    ? "Nonaktifkan Karyawan?"
                                    : "Aktifkan Karyawan?"}
                            </AlertDialogTitle>

                            <AlertDialogDescription className="text-sm">
                                {currentIntern?.is_active
                                    ? `Karyawan ${currentIntern?.name} tidak akan dicatat kehadirannya selama berstatus nonaktif.`
                                    : `Karyawan ${currentIntern?.name} akan kembali aktif dan masuk dalam pencatatan kehadiran.`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="border border-gray-200 bg-white">
                                Batal
                            </AlertDialogCancel>

                            <AlertDialogAction
                                onClick={toggleActive}
                                disabled={isTogglingActive}
                            >
                                {isTogglingActive ? (
                                    <>
                                        <Loader2Icon className="size-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <PowerIcon className="size-4" />
                                        Ya, Lanjutkan
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <InternResetModal
                    show={isResetOpen}
                    onClose={() => setIsResetOpen(false)}
                    onConfirm={resetPoints}
                    isFirstDate={isFirstDate}
                    processing={isResetting}
                />
            </div>
        </AuthenticatedLayout>
    );
}
