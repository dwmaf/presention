import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import SearchBar from "@/Components/SearchBar";
import { useToast } from "@/Components/ToastNotif";

/**
 * * Division Management Page
 * * ----------------------------------------
 * * Mengelola data divisi dan anggota (intern)
 *
 * ! Fitur:
 * ! - CRUD divisi (create, update, delete)
 * ! - Lihat detail divisi
 * ! - Assign & remove anggota divisi
 *
 * @param {Object} auth
 * * Data user login
 *
 * @param {Array} divisions
 * * Data seluruh divisi + relasi intern
 *
 * @param {Array} allInterns
 * * Semua intern (untuk assign ke divisi)
 */

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
    const { addToast } = useToast();

    const [modal, setModal] = useState({
        form: false,
        delete: false,
        detail: null,
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState(null);

    // State panel tambah anggota
    const [memberSearch, setMemberSearch] = useState("");
    const [showAddMember, setShowAddMember] = useState(false);

    const form = useForm({
        nama_divisi: "",
        deskripsi: "",
    });

    const deleteForm = useForm({});

    /**
     * ? Kenapa modal state dijadikan object?
     * ? - Lebih scalable dibanding banyak useState terpisah
     */
    const openFormModal = (division = null) => {
        setModal((prev) => ({ ...prev, form: true }));
        setIsEditMode(!!division);
        setSelectedDivision(division);

        form.setData({
            nama_divisi: division?.nama_divisi ?? "",
            deskripsi: division?.deskripsi ?? "",
        });

        form.clearErrors();
    };

    const closeFormModal = () => {
        setModal((prev) => ({ ...prev, form: false }));
        setSelectedDivision(null);
        form.reset();
    };

    const openDeleteModal = (division) => {
        setSelectedDivision(division);
        setModal((prev) => ({ ...prev, delete: true }));
    };

    const closeDeleteModal = () => {
        setModal((prev) => ({ ...prev, delete: false }));
        setSelectedDivision(null);
    };

    /**
     * ? Kenapa detail disimpan di state?
     * ? - Agar bisa reactive saat data divisions berubah
     */
    useEffect(() => {
        if (!modal.detail) return;

        const updated = divisions.find((d) => d.id === modal.detail.id);

        if (updated) {
            setModal((prev) => ({ ...prev, detail: updated }));
        }
    }, [divisions, modal.detail]);

    /**
     * ? Kenapa pakai useMemo?
     * ? - Filtering bisa berat jika data besar
     */
    const memberSuggestions = useMemo(() => {
        if (!modal.detail) return [];

        const memberIds = new Set(modal.detail.interns?.map((i) => i.id));

        return allInterns.filter(
            (i) =>
                !memberIds.has(i.id) &&
                i.name.toLowerCase().includes(memberSearch.toLowerCase()),
        );
    }, [allInterns, modal.detail, memberSearch]);

    const submit = (e) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                closeFormModal();
                addToast("Berhasil!", "success");
            },
            onError: () => {
                addToast("Terjadi kesalahan.", "error");
            },
        };

        if (isEditMode) {
            form.put(route("divisions.update", selectedDivision.id), options);
        } else {
            form.post(route("divisions.store"), options);
        }
    };

    const deleteDivision = () => {
        deleteForm.delete(route("divisions.destroy", selectedDivision.id), {
            onSuccess: (page) => {
                if (page.props.flash.error) {
                    closeDeleteModal();
                    addToast(page.props.flash.error, "error");
                } else {
                    closeDeleteModal();
                    addToast("Divisi dihapus!", "success");
                }
            },
            onError: () => {
                addToast("Gagal menghapus.", "error");
            },
        });
    };

    const assignIntern = (intern) => {
        router.post(
            route("divisions.assignIntern", modal.detail.id),
            { intern_id: intern.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setMemberSearch("");
                    setShowAddMember(false);
                    addToast("Anggota ditambahkan!", "success");
                },
            },
        );
    };

    const removeIntern = (intern) => {
        router.delete(
            route("divisions.removeIntern", [modal.detail.id, intern.id]),
            {
                preserveScroll: true,
                onSuccess: () => {
                    addToast("Anggota dihapus!", "success");
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Manajemen Divisi
                </h2>
            }
        >
            <Head title="Divisi" />

            <div className="flex">
                <div className="py-10">
                    <div className="mx-auto max-w-7xl pr-16">
                        {/* Header baris */}
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold">
                                    Manajemen Divisi
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Daftar divisi yang berperan dalam mendukung
                                    operasional dan pengembangan UPA PKK UNTAN.
                                </p>
                            </div>
                            <button
                                onClick={() => openFormModal()}
                                className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-gray-50"
                            >
                                <PuzzleSmall />
                                Tambah Divisi
                            </button>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            {divisions.map((division) => (
                                <div
                                    key={division.id}
                                    className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                                >
                                    {/* Top row: icon + badge */}
                                    <div className="flex items-start justify-between">
                                        <PuzzleBig />
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                            {division.interns_count ?? 0}{" "}
                                            Anggota
                                        </span>
                                    </div>

                                    {/* Nama */}
                                    <h3 className="text-xl font-bold leading-snug text-gray-900">
                                        {division.nama_divisi}
                                    </h3>

                                    {/* Deskripsi */}
                                    <p className="line-clamp-3 flex-1 text-xs text-gray-500">
                                        {division.deskripsi || (
                                            <span className="italic text-gray-300">
                                                Belum ada deskripsi.
                                            </span>
                                        )}
                                    </p>

                                    {/* Tombol */}
                                    <div className="mt-2 flex gap-3">
                                        <button
                                            onClick={() =>
                                                setModal((prev) => ({
                                                    ...prev,
                                                    detail: division,
                                                }))
                                            }
                                            className="flex-1 rounded-lg border border-blue-600 py-1.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                                        >
                                            Lihat Detail
                                        </button>

                                        <button
                                            onClick={() =>
                                                openDeleteModal(division)
                                            }
                                            className="flex-2 rounded-lg border border-red-400 px-2.5 py-1.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                                        >
                                            Hapus
                                        </button>

                                        <button
                                            onClick={() =>
                                                openFormModal(division)
                                            }
                                            className="rounded-lg border border-gray-100 transition hover:opacity-80"
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

            {/* Modal Tambah / Edit */}
            <Modal show={modal.form} onClose={closeFormModal}>
                <form onSubmit={submit} className="w-[560px] p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <PuzzleSmall />
                        <h2 className="text-lg font-bold text-gray-900">
                            {isEditMode ? "Edit Divisi" : "Tambah Divisi"}
                        </h2>
                    </div>
                    <p className="mb-5 text-sm text-gray-500">
                        Isi data untuk menambahkan divisi baru.
                    </p>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Nama Divisi
                        </label>
                        <input
                            type="text"
                            value={form.data.nama_divisi}
                            onChange={(e) =>
                                form.setData("nama_divisi", e.target.value)
                            }
                            placeholder="Contoh: IT, HRD, dll"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <InputError
                            message={form.errors.nama_divisi}
                            className="mt-1"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Deskripsi{" "}
                            <span className="font-normal text-gray-400">
                                (opsional)
                            </span>
                        </label>
                        <textarea
                            value={form.data.deskripsi}
                            onChange={(e) =>
                                form.setData("deskripsi", e.target.value)
                            }
                            rows={3}
                            placeholder="Deskripsikan tugas dan tanggung jawab divisi ini..."
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <InputError
                            message={form.errors.deskripsi}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeFormModal}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isEditMode ? "Update" : "Simpan"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail Divisi */}
            <Modal
                show={!!modal.detail}
                onClose={() => setModal((prev) => ({ ...prev, detail: null }))}
            >
                {modal.detail && (
                    <div className="flex h-[450px] w-[560px] flex-col p-6">
                        {/* Header */}
                        <div className="mb-1 flex shrink-0 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PuzzleSmall />
                                <h2 className="text-lg font-bold text-gray-900">
                                    {modal.detail.nama_divisi}
                                </h2>
                            </div>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                {modal.detail.interns_count ??
                                    modal.detail.interns?.length ??
                                    0}{" "}
                                Anggota
                            </span>
                        </div>
                        {modal.detail.deskripsi && (
                            <p className="mb-2 mt-1 shrink-0 text-sm text-gray-500">
                                {modal.detail.deskripsi}
                            </p>
                        )}

                        {/* Sub-header daftar anggota */}
                        <div className="relative mb-4 mt-3 flex shrink-0 items-center justify-between">
                            <p className="text-sm font-semibold text-gray-700">
                                Daftar Anggota
                            </p>
                            <button
                                onClick={() => {
                                    setShowAddMember((v) => !v);
                                    setMemberSearch("");
                                }}
                                className="flex items-center text-xs font-semibold text-indigo-600 hover:underline"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                                </svg>
                                Tambah Anggota
                            </button>

                            {/* Dropdown panel search */}
                            {showAddMember && (
                                <div className="absolute right-0 top-full z-30 mt-1 flex w-56 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                    <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-3 py-2">
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
                                            className="flex-1 border-0 bg-transparent text-xs placeholder-gray-400 outline-none focus:ring-0"
                                        />
                                    </div>
                                    <ul className="custom-scrollbar max-h-40 overflow-y-auto">
                                        {memberSuggestions.length > 0 ? (
                                            memberSuggestions.map((intern) => (
                                                <li key={intern.id}>
                                                    <button
                                                        onClick={() =>
                                                            assignIntern(intern)
                                                        }
                                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition hover:bg-blue-50"
                                                    >
                                                        {intern.foto ? (
                                                            <img
                                                                src={`/storage/${intern.foto}`}
                                                                alt={
                                                                    intern.name
                                                                }
                                                                className="h-6 w-6 shrink-0 rounded-full object-cover object-top"
                                                            />
                                                        ) : (
                                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-400">
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
                        <div className="custom-scrollbar relative mb-4 min-h-0 flex-1 overflow-y-auto rounded-lg border border-gray-100">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10 bg-gray-50">
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
                                    {modal.detail.interns &&
                                        modal.detail.interns.length > 0 ? (
                                        modal.detail.interns.map((intern) => (
                                            <tr key={intern.id}>
                                                <td className="px-4 py-2">
                                                    {intern.foto ? (
                                                        <img
                                                            src={`/storage/${intern.foto}`}
                                                            alt={intern.name}
                                                            className="h-8 w-8 rounded-full object-cover object-top"
                                                        />
                                                    ) : (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-400">
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
                                                        className="text-red-400 transition hover:text-red-600"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
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

                        <div className="flex shrink-0 justify-end">
                            <button
                                onClick={() => {
                                    setModal((prev) => ({
                                        ...prev,
                                        detail: null,
                                    }));
                                    setShowAddMember(false);
                                    setMemberSearch("");
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal show={modal.delete} onClose={closeDeleteModal}>
                <div className="w-[560px] p-6">
                    <h2 className="mb-2 text-lg font-bold text-gray-900">
                        Hapus Divisi
                    </h2>
                    <p className="mb-6 text-sm text-gray-600">
                        Apakah anda yakin ingin menghapus divisi{" "}
                        <strong>{selectedDivision?.nama_divisi}</strong>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={closeDeleteModal}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={deleteDivision}
                            disabled={deleteForm.processing}
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
