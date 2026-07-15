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

import { Head, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";

import InternCard from "@/features/interns/components/InternCard";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon, UserPlusIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import InternDetail from "@/features/interns/components/InternDetail";
import InternFormModal from "@/features/interns/components/InternFormModal";
import InternDeleteModal from "@/features/interns/components/InternDeleteModal";
import InternResetModal from "@/features/interns/components/InternResetModal";

import type { Division, InternData } from "@/features/interns/types/intern";

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
export default function Intern({ auth, interns, divisions }: InternProps) {
    const [search, setSearch] = useState<string>("");
    const [currentIntern, setCurrentIntern] = useState<InternData | null>(null);

    // * State untuk kontrol modal
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [internToDelete, setInternToDelete] = useState<InternData | null>(
        null,
    );
    const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [backToTop, setBackToTop] = useState<boolean>(false);

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
    const { post: postReset } = useForm();

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
        setIsEditMode(false);
        setCurrentIntern(null);
        setPhotoPreview(null);
        setIsFormOpen(true);
        clearErrors();
    };

    // * Buka modal edit data
    const openEdit = (intern: InternData) => {
        setIsEditMode(true);
        setCurrentIntern(intern);

        setData({
            name: intern.name,
            division_id: String(intern.division_id) || "",
            poin: intern.poin ?? 5,
            foto: null,
            senin: intern.senin,
            selasa: intern.selasa,
            rabu: intern.rabu,
            kamis: intern.kamis,
            jumat: intern.jumat,
            _method: "put",
        });

        setPhotoPreview(null);
        setIsFormOpen(true);
        clearErrors();
    };

    // * Submit data form (Create / Update)
    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const url = isEditMode
            ? route("interns.update", currentIntern?.id)
            : route("interns.store");

        post(url, {
            onSuccess: () => setIsFormOpen(false),
            onFinish: () => {
                if (!isEditMode) {
                    reset();
                }
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
                onSuccess: () => setIsDeleteOpen(false),
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

                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredInterns.map((intern) => (
                            <InternCard
                                key={intern.id}
                                intern={intern}
                                onClick={() => {
                                    setCurrentIntern(intern);
                                    setIsDetailOpen(true);
                                }}
                            />
                        ))}

                        {filteredInterns.length === 0 && (
                            <div className="text-muted-foreground bg-card col-span-full rounded-lg border px-6 py-12 text-center">
                                Tidak ada data Karyawan.
                            </div>
                        )}
                    </div>
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
                    <DialogContent className="custom-scrollbar max-h-[90vh] max-w-[95vw] overflow-y-auto md:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                Detail Karyawan
                            </DialogTitle>
                        </DialogHeader>
                        {currentIntern && (
                            <InternDetail
                                intern={currentIntern}
                                divisions={divisions}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <InternFormModal
                    show={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={submit}
                    data={data}
                    setData={setData}
                    processing={processing}
                    errors={errors}
                    isEditMode={isEditMode}
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
                />

                <InternResetModal
                    show={isResetOpen}
                    onClose={() => setIsResetOpen(false)}
                    onConfirm={resetPoints}
                    isFirstDate={isFirstDate}
                />
            </div>
        </AuthenticatedLayout>
    );
}
