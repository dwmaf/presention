import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

import SearchBar from "@/Components/SearchBar";
import PrimaryButton from "@/Components/PrimaryButton";
import InternCard from "@/Components/InternCard";
import InternDetail from "@/Components/InternDetail";
import Modal from "@/Components/Modal";

import InternFormModal from "@/Components/InternFormModal";
import InternDeleteModal from "@/Components//InternDeleteModal";
import InternResetModal from "@/Components//InternResetModal";

/**
 * * InternPage Component
 * * ----------------------------------------
 * * Halaman utama untuk manajemen data karyawan (intern)
 *
 * ! Tanggung jawab utama:
 * ! - Mengelola state global (interns, modal, form)
 * ! - Meng-handle interaksi CRUD (create, update, delete)
 * ! - Menjadi "controller" untuk seluruh komponen child
 */

/**
 * * Constant Hari
 *
 * ? WHY:
 * ? Menghindari hardcode berulang
 * ? Single source of truth untuk semua logic jadwal
 * ? Memudahkan scaling (misal tambah sabtu)
 */
const DAYS = ["senin", "selasa", "rabu", "kamis", "jumat"];

export default function Intern({ auth, interns, divisions }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState("");

    const [currentIntern, setCurrentIntern] = useState(null);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [internToDelete, setInternToDelete] = useState(null);
    const [isResetOpen, setIsResetOpen] = useState(false);

    const [photoPreview, setPhotoPreview] = useState(null);

    const [backToTop, setBackToTop] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
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

    /**
     * * Sync currentIntern dengan data terbaru
     *
     * ! Masalah:
     * - Setelah update → data dari server berubah
     * - Tapi currentIntern masih referensi lama (stale)
     *
     * ! Solusi:
     * - Cari ulang dari props interns
     */
    useEffect(() => {
        if (currentIntern) {
            const updated = interns.find((i) => i.id === currentIntern.id);
            if (updated) setCurrentIntern(updated);
        }
    }, [interns]);

    /**
     * * Open Create Modal
     *
     * ! Reset semua state agar:
     * ? tidak membawa data lama
     * ? form dalam kondisi fresh
     */
    const openCreate = () => {
        reset();
        setIsEditMode(false);
        setCurrentIntern(null);
        setPhotoPreview(null);
        setIsFormOpen(true);
    };

    // Tambahkan ini untuk melihat data
    // console.log("Semua interns:", interns);
    // console.log(
    //     "ID interns:",
    //     interns.map((i) => i.id),
    // );

    /**
     * * Open Edit Modal
     *
     * ! WHY:
     * - Isi form dengan data existing
     * - Mode diubah agar submit jadi PUT
     */
    const openEdit = (intern) => {
        setIsEditMode(true);
        setCurrentIntern(intern);

        console.log("Data yang akan dikirim:", data);

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

    /**
     * * Submit Form (Create / Update)
     *
     * ! Single entry point untuk semua submit
     */
    const submit = (e) => {
        e.preventDefault();

        const url = isEditMode
            ? route("interns.update", currentIntern.id)
            : route("interns.store");

        post(url, {
            onSuccess: () => setIsFormOpen(false),
            // Hapus data form setelah berhasil create, tapi tidak saat edit
            onFinish: () => {
                if (!isEditMode) {
                    reset();
                }
            },
        });
    };

    /**
     * * Delete Flow
     *
     * ? WHY:
     * ? Simpan target sebelum buka modal
     * ? Hindari race condition
     */
    const confirmDelete = (intern) => {
        setInternToDelete(intern);
        setIsDeleteOpen(true);
    };

    const deleteIntern = () => {
        deleteForm.delete(route("interns.destroy", internToDelete.id), {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    const resetPoints = () => {
        postReset(route("interns.resetPoints"), {
            onSuccess: () => setIsResetOpen(false),
        });
    };

    const isAllDaysChecked = () => {
        return DAYS.every((day) => data[day]);
    };

    const handleToggleAllDays = (checked) => {
        const updated = {};
        DAYS.forEach((d) => (updated[d] = checked));
        setData({ ...data, ...updated });
    };

    /**
     * * Filtering Intern
     *
     * ! Client-side filtering
     *
     * ? Kenapa tidak backend?
     * ? - Data masih kecil
     * ? - UX lebih cepat (no loading)
     */
    const filteredInterns = interns.filter((intern) => {
        const keyword = search.toLowerCase();

        return (
            intern.name?.toLowerCase().includes(keyword) ||
            intern.division?.nama_divisi?.toLowerCase().includes(keyword)
        );
    });

    /**
     * * Cek tanggal 1
     *
     * ! Digunakan untuk:
     * - warning reset poin
     * - bukan sebagai pembatas (UX decision)
     */
    const today = new Date();
    const isFirstDate = today.getDate() === 1;

    // Balik ke atas
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setBackToTop(true);
            } else {
                setBackToTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Manajemen Karyawan
                </h2>
            }
        >
            <Head title="Karyawan" />

            <div className="relative py-12">
                <div className="mx-auto max-w-7xl pr-16">
                    {/* HEADER */}
                    <div className="mt-4 flex items-center justify-between sm:mt-0">
                        <h1 className="text-2xl font-bold">Daftar Karyawan</h1>
                        {isFirstDate && (
                            <div className="flex animate-pulse items-center gap-2 rounded-lg border border-yellow-400 bg-yellow-100 px-3 py-1.5 text-sm text-yellow-700">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                </svg>
                                Sudah tanggal 1, silahkan reset poin.
                            </div>
                        )}

                        <button
                            onClick={() => setIsResetOpen(true)}
                            className="text-md inline-flex items-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-300 focus:outline-none active:bg-red-400"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2 h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                            Reset Poin
                        </button>
                    </div>

                    {/* Search bar dan tambah karyawan */}
                    <div className="my-12 flex justify-end gap-4">
                        <SearchBar onSearch={setSearch} />
                        <PrimaryButton
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18px"
                                    height="18px"
                                    viewBox="0 0 24 24"
                                >
                                    <g fill="none">
                                        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                        <path
                                            fill="oklch(42.4% 0.199 265.638)"
                                            d="M16 14a5 5 0 0 1 5 5v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a5 5 0 0 1 5-5zm4-6a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1V9a1 1 0 0 1 1-1m-8-6a5 5 0 1 1 0 10a5 5 0 0 1 0-10"
                                        />
                                    </g>
                                </svg>
                            }
                            onClick={openCreate}
                        >
                            Tambah Karyawan
                        </PrimaryButton>
                    </div>

                    {/* Daftar karyawan */}
                    <div className="mb-8 grid grid-cols-5 gap-4">
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
                            <div className="col-span-5 px-6 py-4 text-center text-gray-500">
                                Tidak ada data Karyawan.
                            </div>
                        )}
                    </div>
                </div>

                {/* Back to Top Button */}
                {backToTop && (
                    <button
                        onClick={scrollToTop}
                        className="group fixed bottom-8 right-8 z-50 flex items-center justify-center rounded-full bg-blue-100 p-2 text-white shadow-lg transition-all duration-300 hover:bg-blue-200"
                        aria-label="Back to top"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 12 24"
                            className="-rotate-90 transition-transform group-hover:-translate-y-1"
                        >
                            <path
                                fill="oklch(42.4% 0.199 265.638)"
                                fillRule="evenodd"
                                d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"
                            />
                        </svg>
                    </button>
                )}

                {/* DETAIL MODAL */}
                {isDetailOpen && currentIntern && (
                    <Modal
                        show={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                        maxWidth="80%"
                        maxHeight="full"
                    >
                        {currentIntern && (
                            <InternDetail
                                intern={currentIntern}
                                onClose={() => setIsDetailOpen(false)}
                                onEdit={openEdit}
                                onDelete={confirmDelete}
                                divisions={divisions}
                            />
                        )}
                    </Modal>
                )}

                <InternFormModal
                    show={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log("Submit dari InternFormModal terpicu!");
                    }}
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
