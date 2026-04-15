import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import RangeDatePicker from "@/Components/RangeDatePicker";
import SearchBar from "@/Components/SearchBar";
import DownloadBtn from "@/Components/DownloadBtn";

/**
 * * Dashboard Attendance Page
 * * ----------------------------------------
 * * Menampilkan data absensi intern dalam bentuk tabel
 * * dengan fitur filter tanggal dan pencarian
 *
 * ! Fitur:
 * ! - Filter berdasarkan range tanggal
 * ! - Search berdasarkan nama intern
 * ! - Export data absensi ke file
 *
 * ! Flow:
 * ! 1. User pilih range tanggal → request ke server
 * ! 2. Server kirim data sesuai range
 * ! 3. User search → filter di frontend
 *
 * @param {Array} interns
 * * Data intern + agregasi absensi
 *
 * @param {string} startDate
 * * Tanggal awal filter (YYYY-MM-DD)
 *
 * @param {string} endDate
 * * Tanggal akhir filter (YYYY-MM-DD)
 */

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function Dashboard({ interns = [], startDate, endDate }) {
    const [searchTerm, setSearchTerm] = useState("");

    const [dateRange, setDateRange] = useState([
        startDate ? new Date(startDate) : new Date(),
        endDate ? new Date(endDate) : new Date(),
    ]);

    const handleDateRangeChange = (newValue) => {
        setDateRange(newValue);

        if (!newValue?.[0] || !newValue?.[1]) return;

        router.get(
            route("dashboard"),
            {
                start_date: formatDate(newValue[0]),
                end_date: formatDate(newValue[1]),
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDownload = (e) => {
        e.preventDefault();

        if (!dateRange?.[0] || !dateRange?.[1]) {
            alert(
                "Silakan pilih rentang tanggal terlebih dahulu untuk mengunduh laporan.",
            );
            return;
        }

        const startDate = dateRange[0].toISOString().split("T")[0];
        const endDate = dateRange[1].toISOString().split("T")[0];

        window.location.href = route("dashboard.export", {
            start_date: startDate,
            end_date: endDate,
        });
    };

    /**
     * ? Kenapa pakai useMemo?
     * ? - Menghindari filter ulang setiap render
     */
    const filteredInterns = useMemo(() => {
        return interns.filter((intern) =>
            intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [interns, searchTerm]);

    const renderTableBody = () => {
        if (filteredInterns.length === 0) {
            return (
                <tr>
                    <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-sm text-gray-400"
                    >
                        {interns.length === 0
                            ? "Tidak ada data absensi untuk rentang tanggal ini."
                            : "Karyawan tidak ditemukan."}
                    </td>
                </tr>
            );
        }

        return filteredInterns.map((intern) => (
            <tr key={intern.id} className="transition hover:bg-gray-50">
                <td className="px-6 py-4">
                    <img
                        src={`/storage/${intern.foto}`}
                        alt={intern.name}
                        className="h-10 w-10 rounded-full object-cover"
                    />
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                        {intern.name}
                    </div>
                    <div className="text-xs text-gray-500">
                        {intern.division?.nama_divisi ?? "-"}
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                        {intern.jumlah_hadir}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                        {intern.jumlah_izin}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                        {intern.jumlah_alpha}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                        {intern.total_jam} jam
                    </span>
                </td>
            </tr>
        ));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Absensi" />

            <div className="space-y-6 py-12 pr-16">
                {/* ── Title ── */}
                <h1 className="text-2xl font-bold">Data Absensi</h1>

                {/* ── Header dengan Range Date Picker & Download ── */}
                <div className="relative z-20 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="w-full sm:w-auto">
                        <RangeDatePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="dd/MM/yyyy"
                            maxDate={new Date()}
                        />
                    </div>

                    <a href="#" onClick={handleDownload}>
                        <DownloadBtn />
                    </a>
                </div>

                {/* ── Search Bar ── */}
                <SearchBar
                    onSearch={setSearchTerm}
                    placeholder="Cari karyawan"
                />

                {/* ── Table ── */}
                <div className="overflow-hidden rounded-md bg-white shadow-md">
                    <div className="custom-scrollbar max-h-screen overflow-x-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                        Profil
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                                        Nama
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-600">
                                        Jumlah Hadir
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-600">
                                        Jumlah Izin
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-600">
                                        Jumlah Alpha
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-600">
                                        Total Jam
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {renderTableBody()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
