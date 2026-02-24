import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import SearchBar from "@/Components/SearchBar";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import InternCard from "@/Components/InternCard";
import InternDetail from "@/Components/InternDetail";
import CustomSelect from "@/Components/CustomSelect";
import { Link } from "@inertiajs/react";

export default function Intern({ auth, interns, divisions }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentIntern, setCurrentIntern] = useState(null);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [internToDelete, setInternToDelete] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [search, setSearch] = useState("");
    const [backToTop, setBackToTop] = useState(false);

    // Di Intern.jsx, tambahkan ini
    useEffect(() => {
        if (currentIntern) {
            // Cari data terbaru dari array interns yang sudah di-refresh Inertia
            const updated = interns.find((i) => i.id === currentIntern.id);
            if (updated) setCurrentIntern(updated);
        }
    }, [interns]); // Trigger setiap kali props `interns` berubah

    // Tambahkan ini untuk melihat data
    console.log("Semua interns:", interns);
    console.log(
        "ID interns:",
        interns.map((i) => i.id),
    );

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            division_id: divisions?.length ? String(divisions[0].id) : "",
            barcode: "",
            foto: null,

            // Jadwal (boolean)
            senin: false,
            selasa: false,
            rabu: false,
            kamis: false,
            jumat: false,

            // Poin
            poin: 5,

            _method: "POST",
        });

    const deleteForm = useForm({});

    const openModal = (intern = null) => {
        if (intern) {
            // Mode edit
            setCurrentIntern(intern);
            setIsEditMode(true);
            setData({
                name: intern.name,
                division_id: String(intern.division_id) || "",
                senin: intern.senin,
                selasa: intern.selasa,
                rabu: intern.rabu,
                kamis: intern.kamis,
                jumat: intern.jumat,
                poin: intern.poin ?? 5,
                foto: null,
            });
            setPhotoPreview(null);
        } else {
            // Mode tambah - reset ke default
            setCurrentIntern(null);
            setIsEditMode(false);
            setData({
                name: "",
                division_id: "", // Pastikan ini string kosong
                senin: false,
                selasa: false,
                rabu: false,
                kamis: false,
                jumat: false,
                poin: 5,
                foto: null,
            });
            setPhotoPreview(null);
        }
        setIsModalOpen(true);

        clearErrors();
    };

    const openDetailModal = (intern) => {
        setCurrentIntern(intern);
        setIsDetailOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentIntern(null);
        setPhotoPreview(null);
        reset();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("foto", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        data._method = "PUT";
        if (isEditMode) {
            post(route("interns.update", currentIntern.id), {
                onSuccess: closeModal,
            });
        } else {
            data._method = "POST";
            post(route("interns.store"), {
                onSuccess: closeModal,
            });
        }
    };

    const confirmDeletion = (intern) => {
        setConfirmingDeletion(true);
        setInternToDelete(intern);
    };

    const closeDeletionModal = () => {
        setConfirmingDeletion(false);
        setInternToDelete(null);
    };

    const deleteIntern = () => {
        deleteForm.delete(route("interns.destroy", internToDelete.id), {
            onSuccess: closeDeletionModal,
        });
    };

    const renderJadwal = (intern) => {
        const hari = [
            ["Sen", "senin"],
            ["Sel", "selasa"],
            ["Rab", "rabu"],
            ["Kam", "kamis"],
            ["Jum", "jumat"],
        ];

        const aktif = hari
            .filter(([, key]) => !!intern?.[key])
            .map(([label]) => label);

        if (aktif.length === 5) return "Setiap hari";

        return aktif.length ? aktif.join(", ") : "-";
    };

    const isAllDaysChecked = () => {
        return (
            data.senin && data.selasa && data.rabu && data.kamis && data.jumat
        );
    };

    // Toggle semua hari
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

    const filteredInterns = interns.filter((intern) => {
        const keyword = search.toLowerCase();

        const nameMatch = intern.name?.toLowerCase().includes(keyword);

        const divisionMatch = intern.division?.nama_divisi
            ?.toLowerCase()
            .includes(keyword);

        return nameMatch || divisionMatch;
    });

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
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manajemen Karyawan
                </h2>
            }
        >
            <Head title="Karyawan" />

            <div className="py-12 relative">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash.success && (
                        <div
                            className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                            role="alert"
                        >
                            <span className="block sm:inline">
                                {flash.success}
                            </span>
                        </div>
                    )}
                    {flash.error && (
                        <div
                            className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                            role="alert"
                        >
                            <span className="block sm:inline">
                                {flash.error}
                            </span>
                        </div>
                    )}

                    {/* Search bar dan tambah karyawan */}
                    <div className="flex justify-end mb-4 gap-4">
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
                            onClick={() => openModal()}
                        >
                            Tambah Karyawan
                        </PrimaryButton>
                    </div>

                    {/* Daftar karyawan */}
                    <div className="grid grid-cols-5 gap-4 mb-8">
                        {filteredInterns.map((intern) => (
                            <InternCard
                                key={intern.id}
                                intern={intern}
                                onClick={() => openDetailModal(intern)}
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
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-white rounded-full flex items-center justify-center fixed bottom-8 right-8 shadow-lg transition-all duration-300 z-50 group"
                        aria-label="Back to top"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 12 24"
                            className="-rotate-90 group-hover:-translate-y-1 transition-transform"
                        >
                            <path
                                fill="oklch(42.4% 0.199 265.638)"
                                fillRule="evenodd"
                                d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <Modal
                show={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                maxWidth="80%"
                maxHeight="full"
            >
                {currentIntern && (
                    <InternDetail
                        intern={currentIntern}
                        divisions={divisions}
                        onClose={() => setIsDetailOpen(false)}
                    />
                )}
            </Modal>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                maxWidth="fit"
                maxHeight="fit"
            >
                <form
                    onSubmit={submit}
                    className="p-6 w-fit"
                    encType="multipart/form-data"
                >
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEditMode ? "Edit Karyawan" : "Tambah Karyawan"}
                    </h2>
                    <div className="flex gap-4">
                        {/* Upload & Preview Foto */}
                        <div className="mt-2 w-fit">
                            <InputLabel htmlFor="foto">
                                {photoPreview || currentIntern?.foto ? (
                                    // Preview
                                    <div className="relative w-40 h-60">
                                        <img
                                            src={
                                                photoPreview
                                                    ? photoPreview
                                                    : `/storage/${currentIntern.foto}`
                                            }
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-xl border-2 border-blue-500"
                                        />

                                        {/* Tombol ganti */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPhotoPreview(null);
                                                setData("foto", null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
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
                                    // Upload
                                    <div className="flex justify-center items-center flex-col cursor-pointer border-2 border-dashed rounded-xl py-8 px-6 w-40 h-60">
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
                                        <p className="text-gray-400 text-center">
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

                            <InputError
                                message={errors.foto}
                                className="mt-2"
                            />
                        </div>

                        <div>
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
                                    className="mt-1 block w-full"
                                    isFocused
                                    placeholder="Nama Karyawan"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            {/* Divisi */}
                            <div className="mt-2">
                                <InputLabel
                                    htmlFor="division_id"
                                    value="Divisi"
                                />
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
                                                setData(
                                                    "senin",
                                                    e.target.checked,
                                                )
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
                                                setData(
                                                    "selasa",
                                                    e.target.checked,
                                                )
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
                                                setData(
                                                    "rabu",
                                                    e.target.checked,
                                                )
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
                                                setData(
                                                    "kamis",
                                                    e.target.checked,
                                                )
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
                                                setData(
                                                    "jumat",
                                                    e.target.checked,
                                                )
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

                        </div>
                    </div>

                    <div className="mt-12 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            {isEditMode ? "Update" : "Simpan"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={confirmingDeletion} onClose={closeDeletionModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Apakah anda yakin ingin menghapus data ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeDeletionModal}>
                            Batal
                        </SecondaryButton>
                        <DangerButton
                            className="ml-3"
                            onClick={deleteIntern}
                            disabled={deleteForm.processing}
                        >
                            Hapus
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
