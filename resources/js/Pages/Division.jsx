import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState, useMemo } from "react";
import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";

// SVG puzzle untuk card divisi
const PuzzleBig = () => (
    <svg
        width="40"
        height="40"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect width="60" height="60" rx="8" fill="#DBEAFE" />
        <path
            d="M44.1666 28.3332H41.6666V21.6665C41.6666 20.7824 41.3154 19.9346 40.6903 19.3095C40.0652 18.6844 39.2173 18.3332 38.3333 18.3332H31.6666V15.8332C31.6666 14.7281 31.2276 13.6683 30.4462 12.8869C29.6648 12.1055 28.605 11.6665 27.4999 11.6665C26.3948 11.6665 25.335 12.1055 24.5536 12.8869C23.7722 13.6683 23.3333 14.7281 23.3333 15.8332V18.3332H16.6666C15.7825 18.3332 14.9347 18.6844 14.3096 19.3095C13.6844 19.9346 13.3333 20.7824 13.3333 21.6665V27.9998H15.8333C18.3333 27.9998 20.3333 29.9998 20.3333 32.4998C20.3333 34.9998 18.3333 36.9998 15.8333 36.9998H13.3333V43.3332C13.3333 44.2172 13.6844 45.0651 14.3096 45.6902C14.9347 46.3153 15.7825 46.6665 16.6666 46.6665H22.9999V44.1665C22.9999 41.6665 24.9999 39.6665 27.4999 39.6665C29.9999 39.6665 31.9999 41.6665 31.9999 44.1665V46.6665H38.3333C39.2173 46.6665 40.0652 46.3153 40.6903 45.6902C41.3154 45.0651 41.6666 44.2172 41.6666 43.3332V36.6665H44.1666C45.2717 36.6665 46.3315 36.2275 47.1129 35.4461C47.8943 34.6647 48.3333 33.6049 48.3333 32.4998C48.3333 31.3948 47.8943 30.335 47.1129 29.5536C46.3315 28.7722 45.2717 28.3332 44.1666 28.3332Z"
            fill="#1447E6"
        />
    </svg>
);

// SVG puzzle untuk tombol Tambah Divisi
const PuzzleSmall = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M21.04 12.13C20.9 12.13 20.76 12.19 20.65 12.3L19.65 13.3L21.7 15.35L22.7 14.35C22.92 14.14 22.92 13.79 22.7 13.58L21.42 12.3C21.3714 12.2475 21.3127 12.2053 21.2474 12.1761C21.1821 12.1469 21.1115 12.1312 21.04 12.13ZM19.07 13.88L13 19.94V22H15.06L21.12 15.93L19.07 13.88ZM19 11.12L11.91 18.2C11.5 17.95 11 17.8 10.5 17.8C9 17.8 7.8 19 7.8 20.5V22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V16.2H3.5C5 16.2 6.2 15 6.2 13.5C6.2 12 5 10.8 3.5 10.8H2V7C2 5.9 2.9 5 4 5H8V3.5C8 2.83696 8.26339 2.20107 8.73223 1.73223C9.20107 1.26339 9.83696 1 10.5 1C11.163 1 11.7989 1.26339 12.2678 1.73223C12.7366 2.20107 13 2.83696 13 3.5V5H17C17.5304 5 18.0391 5.21071 18.4142 5.58579C18.7893 5.96086 19 6.46957 19 7V11.12Z"
            fill="#432DD7"
        />
    </svg>
);

export default function Division({ auth, divisions, allInterns = [] }) {
    const { flash } = usePage().props;

    // State modal tambah/edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentDivision, setCurrentDivision] = useState(null);

    // State modal detail
    const [detailDivision, setDetailDivision] = useState(null);

    // State modal hapus
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState(null);

    // State panel tambah anggota
    const [showAddMember, setShowAddMember] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            nama_divisi: "",
            deskripsi: "",
        });

    const deleteForm = useForm({});

    const openModal = (division = null) => {
        setIsModalOpen(true);
        setIsEditMode(!!division);
        setCurrentDivision(division);
        setData({
            nama_divisi: division ? division.nama_divisi : "",
            deskripsi: division ? (division.deskripsi ?? "") : "",
        });
        clearErrors();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentDivision(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route("divisions.update", currentDivision.id), {
                onSuccess: closeModal,
            });
        } else {
            post(route("divisions.store"), { onSuccess: closeModal });
        }
    };

    const confirmDeletion = (division) => {
        setConfirmingDeletion(true);
        setDivisionToDelete(division);
    };

    const closeDeletionModal = () => {
        setConfirmingDeletion(false);
        setDivisionToDelete(null);
    };

    const deleteDivision = () => {
        deleteForm.delete(route("divisions.destroy", divisionToDelete.id), {
            onSuccess: closeDeletionModal,
        });
    };

    const assignIntern = (intern) => {
        router.post(
            route("divisions.assignIntern", detailDivision.id),
            { intern_id: intern.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setMemberSearch("");
                    setShowAddMember(false);
                },
            },
        );
    };

    const removeIntern = (intern) => {
        router.delete(
            route("divisions.removeIntern", [detailDivision.id, intern.id]),
            {
                preserveScroll: true,
            },
        );
    };

    const memberSuggestions = useMemo(() => {
        if (!detailDivision) return [];
        const memberIds = new Set(
            (detailDivision.interns ?? []).map((i) => i.id),
        );
        return allInterns.filter(
            (i) =>
                !memberIds.has(i.id) &&
                i.name.toLowerCase().includes(memberSearch.toLowerCase()),
        );
    }, [allInterns, detailDivision, memberSearch]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manajemen Divisi
                </h2>
            }
        >
            <Head title="Divisi" />

            <div className="flex">
                <div className="py-10">
                    <div className="max-w-7xl mx-auto lg:px-48">
                        {/* Flash messages */}
                        {flash?.success && (
                            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {flash.error}
                            </div>
                        )}

                        {/* Header baris */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-semibold">
                                    Manajemen Divisi
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Daftar divisi yang berperan dalam mendukung
                                    operasional dan pengembangan UPA PKK UNTAN.
                                </p>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-gray-50 transition whitespace-nowrap"
                            >
                                <PuzzleSmall />
                                Tambah Divisi
                            </button>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {divisions.map((division) => (
                                <div
                                    key={division.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3"
                                >
                                    {/* Top row: icon + badge */}
                                    <div className="flex items-start justify-between">
                                        <PuzzleBig />
                                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                                            {division.interns_count ?? 0}{" "}
                                            Anggota
                                        </span>
                                    </div>

                                    {/* Nama */}
                                    <h3 className="text-xl font-bold text-gray-900 leading-snug">
                                        {division.nama_divisi}
                                    </h3>

                                    {/* Deskripsi */}
                                    <p className="text-xs text-gray-500 flex-1 line-clamp-3">
                                        {division.deskripsi || (
                                            <span className="italic text-gray-300">
                                                Belum ada deskripsi.
                                            </span>
                                        )}
                                    </p>

                                    {/* Tombol */}
                                    <div className="flex gap-3 mt-2">
                                        <button
                                            onClick={() => {
                                                setDetailDivision(division);
                                                setShowAddMember(false);
                                                setMemberSearch("");
                                            }}
                                            className="flex-1 border border-blue-600 text-blue-600 rounded-lg py-1.5 text-sm font-semibold hover:bg-blue-50 transition"
                                        >
                                            Lihat Detail
                                        </button>
                                        <button
                                            onClick={() =>
                                                confirmDeletion(division)
                                            }
                                            className="flex-2 border border-red-400 text-red-500 rounded-lg py-1.5 px-2.5 text-sm font-semibold hover:bg-red-50 transition"
                                        >
                                            Hapus
                                        </button>
                                        <button
                                            onClick={() => openModal(division)}
                                            className="border border-gray-100 rounded-lg hover:opacity-80 transition"
                                        >
                                            <svg
                                                width="40"
                                                height="40"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <rect
                                                    width="32"
                                                    height="32"
                                                    rx="8"
                                                    fill="#FEF9C2"
                                                />
                                                <path
                                                    d="M18.9847 10.0026C19.0961 10.0126 19.1447 10.1486 19.0647 10.2279L13.5181 15.7746C13.4554 15.8373 13.4106 15.9155 13.3881 16.0013L12.7214 18.5546C12.6994 18.639 12.6998 18.7276 12.7227 18.8118C12.7455 18.8959 12.79 18.9727 12.8517 19.0343C12.9133 19.096 12.9901 19.1404 13.0742 19.1633C13.1584 19.1862 13.247 19.1866 13.3314 19.1646L15.8841 18.4979C15.9699 18.4753 16.0481 18.4302 16.1107 18.3673L21.7361 12.7419C21.7537 12.7239 21.7761 12.7112 21.8006 12.7055C21.8252 12.6997 21.8509 12.7012 21.8747 12.7096C21.8985 12.718 21.9193 12.7331 21.9348 12.753C21.9503 12.7729 21.9598 12.7968 21.9621 12.8219C22.1962 15.055 22.1828 17.3071 21.9221 19.5373C21.7734 20.8073 20.7527 21.8039 19.4874 21.9459C17.1698 22.2027 14.831 22.2027 12.5134 21.9459C11.2474 21.8039 10.2267 20.8073 10.0781 19.5373C9.8034 17.1873 9.8034 14.8133 10.0781 12.4633C10.2267 11.1926 11.2474 10.1959 12.5134 10.0546C14.6631 9.8163 16.8315 9.79888 18.9847 10.0026Z"
                                                    fill="#A65F00"
                                                />
                                                <path
                                                    d="M19.8819 10.8248C19.8974 10.8093 19.9158 10.797 19.936 10.7886C19.9563 10.7802 19.978 10.7759 19.9999 10.7759C20.0218 10.7759 20.0435 10.7802 20.0638 10.7886C20.084 10.797 20.1024 10.8093 20.1179 10.8248L21.0606 11.7682C21.0917 11.7994 21.1092 11.8417 21.1092 11.8858C21.1092 11.93 21.0917 11.9723 21.0606 12.0035L15.5319 17.5335C15.5109 17.5545 15.4847 17.5694 15.4559 17.5768L14.1799 17.9102C14.1518 17.9175 14.1222 17.9174 14.0942 17.9097C14.0661 17.9021 14.0406 17.8873 14.02 17.8668C13.9995 17.8462 13.9846 17.8206 13.977 17.7926C13.9694 17.7645 13.9693 17.735 13.9766 17.7068L14.3099 16.4308C14.3173 16.4021 14.3323 16.3759 14.3533 16.3548L19.8819 10.8248Z"
                                                    fill="#A65F00"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {divisions.length === 0 && (
                                <div className="col-span-full py-16 text-center text-gray-400">
                                    Belum ada divisi. Klik "Tambah Divisi" untuk
                                    menambahkan.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* â”€â”€ Modal Tambah / Edit â”€â”€ */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6 w-[560px]">
                    <div className="flex items-center gap-3 mb-5">
                        <PuzzleSmall />
                        <h2 className="text-lg font-bold text-gray-900">
                            {isEditMode ? "Edit Divisi" : "Tambah Divisi"}
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">
                        Isi data untuk menambahkan divisi baru.
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Nama Divisi
                        </label>
                        <input
                            type="text"
                            value={data.nama_divisi}
                            onChange={(e) =>
                                setData("nama_divisi", e.target.value)
                            }
                            placeholder="Contoh: IT, HRD, dll"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <InputError
                            message={errors.nama_divisi}
                            className="mt-1"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Deskripsi{" "}
                            <span className="text-gray-400 font-normal">
                                (opsional)
                            </span>
                        </label>
                        <textarea
                            value={data.deskripsi}
                            onChange={(e) =>
                                setData("deskripsi", e.target.value)
                            }
                            rows={3}
                            placeholder="Deskripsikan tugas dan tanggung jawab divisi ini..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        />
                        <InputError
                            message={errors.deskripsi}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {isEditMode ? "Update" : "Simpan"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* â”€â”€ Modal Detail Divisi â”€â”€ */}
            <Modal
                show={!!detailDivision}
                onClose={() => setDetailDivision(null)}
            >
                {detailDivision && (
                    <div className="p-6 flex flex-col h-[450px] w-[560px]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1 shrink-0">
                            <div className="flex items-center gap-3">
                                <PuzzleSmall />
                                <h2 className="text-lg font-bold text-gray-900">
                                    {detailDivision.nama_divisi}
                                </h2>
                            </div>
                            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                                {detailDivision.interns_count ??
                                    detailDivision.interns?.length ??
                                    0}{" "}
                                Anggota
                            </span>
                        </div>
                        {detailDivision.deskripsi && (
                            <p className="text-sm text-gray-500 mb-2 mt-1 shrink-0">
                                {detailDivision.deskripsi}
                            </p>
                        )}

                        {/* Sub-header daftar anggota */}
                        <div className="relative flex items-center justify-between mt-3 mb-2 shrink-0">
                            <p className="text-sm font-semibold text-gray-700">
                                Daftar Anggota
                            </p>
                            <button
                                onClick={() => {
                                    setShowAddMember((v) => !v);
                                    setMemberSearch("");
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                                </svg>
                                Tambah Anggota
                            </button>

                            {/* Dropdown panel search */}
                            {showAddMember && (
                                <div className="absolute right-0 top-full mt-1 z-30 w-56 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col overflow-hidden">
                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <path
                                                fill="oklch(55.1% 0.027 264.364)"
                                                d="M18 10c0-4.41-3.59-8-8-8s-8 3.59-8 8s3.59 8 8 8c1.85 0 3.54-.63 4.9-1.69l5.1 5.1L21.41 20l-5.1-5.1A8 8 0 0 0 18 10M4 10c0-3.31 2.69-6 6-6s6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6"
                                            />
                                        </svg>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={memberSearch}
                                            onChange={(e) =>
                                                setMemberSearch(e.target.value)
                                            }
                                            placeholder="Cari nama intern..."
                                            className="flex-1 bg-transparent text-xs outline-none placeholder-gray-400"
                                        />
                                    </div>
                                    <ul className="max-h-40 overflow-y-auto">
                                        {memberSuggestions.length > 0 ? (
                                            memberSuggestions.map((intern) => (
                                                <li key={intern.id}>
                                                    <button
                                                        onClick={() =>
                                                            assignIntern(intern)
                                                        }
                                                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 transition text-left"
                                                    >
                                                        {intern.foto ? (
                                                            <img
                                                                src={`/${intern.foto}`}
                                                                alt={
                                                                    intern.name
                                                                }
                                                                className="w-6 h-6 rounded-full object-cover object-top shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0">
                                                                ?
                                                            </div>
                                                        )}
                                                        <span className="text-xs text-gray-800">
                                                            {intern.name}
                                                        </span>
                                                    </button>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-3 py-4 text-center text-xs text-gray-400">
                                                {memberSearch
                                                    ? "Intern tidak ditemukan."
                                                    : "Semua intern sudah menjadi anggota."}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Panel search tambah anggota + Tabel anggota — scrollable */}
                        <div className="relative rounded-lg border border-gray-100 overflow-y-auto flex-1 min-h-0 mb-4">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                                            Profil
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                                            Nama
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {detailDivision.interns &&
                                    detailDivision.interns.length > 0 ? (
                                        detailDivision.interns.map((intern) => (
                                            <tr key={intern.id}>
                                                <td className="px-4 py-2">
                                                    {intern.foto ? (
                                                        <img
                                                            src={`/${intern.foto}`}
                                                            alt={intern.name}
                                                            className="w-8 h-8 rounded-full object-cover object-top"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                            ?
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 font-medium text-gray-800">
                                                    {intern.name}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <button
                                                        onClick={() =>
                                                            removeIntern(intern)
                                                        }
                                                        className="text-red-400 hover:text-red-600 transition"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="w-4 h-4"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-4 py-6 text-center text-gray-400"
                                            >
                                                Belum ada anggota.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end shrink-0">
                            <button
                                onClick={() => {
                                    setDetailDivision(null);
                                    setShowAddMember(false);
                                    setMemberSearch("");
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* â”€â”€ Modal Konfirmasi Hapus â”€â”€ */}
            <Modal show={confirmingDeletion} onClose={closeDeletionModal}>
                <div className="p-6 w-[560px]">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                        Hapus Divisi
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Apakah anda yakin ingin menghapus divisi{" "}
                        <strong>{divisionToDelete?.nama_divisi}</strong>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={closeDeletionModal}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={deleteDivision}
                            disabled={deleteForm.processing}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
