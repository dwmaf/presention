import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import RangeDatePicker from "@/Components/RangeDatePicker";
import SearchBar from "@/Components/SearchBar";
import DownloadBtn from "@/Components/DownloadBtn";

export default function Dashboard({ interns = [], startDate, endDate }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState([
        startDate ? new Date(startDate) : new Date(),
        endDate ? new Date(endDate) : new Date(),
    ]);

    const handleDateRangeChange = (newValue) => {
        setDateRange(newValue);

        if (newValue[0] && newValue[1]) {
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };

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
        }
    };

    const handleDownload = () => {
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };
        // Implementasi download CSV
        const csvData = [
            [
                "Nama",
                "Divisi",
                "Jumlah Hadir",
                "Jumlah Izin",
                "Jumlah Alpha",
                "Total Jam",
            ],
            ...filteredInterns.map((intern) => [
                intern.name,
                intern.division,
                intern.jumlah_hadir,
                intern.jumlah_izin,
                intern.jumlah_alpha,
                intern.total_jam + " jam",
            ]),
        ];

        const csvContent = csvData.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `data_absensi_${dateRange[0]?.format("DD-MM-YYYY")}_${dateRange[1]?.format("DD-MM-YYYY")}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredInterns = interns.filter((intern) =>
        intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    console.log("Filtered Interns:", filteredInterns);

    return (
        <AuthenticatedLayout>
            <Head title="Data Absensi" />

            <div className="pr-16 py-12 space-y-6">
                {/* ── Title ── */}
                <h1 className="text-2xl font-bold">Data Absensi</h1>

                {/* ── Summary ── */}
                {/* {filteredInterns.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-gray-500 text-sm mb-1">
                                    Total Karyawan
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredInterns.length}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 text-sm mb-1">
                                    Total Hadir
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {filteredInterns.reduce(
                                        (sum, i) => sum + i.jumlah_hadir,
                                        0,
                                    )}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 text-sm mb-1">
                                    Total Izin
                                </p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {filteredInterns.reduce(
                                        (sum, i) => sum + i.jumlah_izin,
                                        0,
                                    )}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 text-sm mb-1">
                                    Total Alpha
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {filteredInterns.reduce(
                                        (sum, i) => sum + i.jumlah_alpha,
                                        0,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* ── Header dengan Range Date Picker & Download ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="w-full sm:w-auto">
                        <RangeDatePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="dd/MM/yyyy"
                            maxDate={new Date()}
                        />
                    </div>

                    <DownloadBtn />
                </div>

                {/* ── Search Bar ── */}
                <SearchBar
                    onSearch={setSearchTerm}
                    placeholder="Cari karyawan"
                />

                {/* ── Table ── */}
                <div className="bg-white rounded-md shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase ">
                                        Profil
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase ">
                                        Nama
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase ">
                                        Jumlah Hadir
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase ">
                                        Jumlah Izin
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase ">
                                        Jumlah Alpha
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase ">
                                        Total Jam
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredInterns.length > 0 ? (
                                    filteredInterns.map((intern) => (
                                        <tr
                                            key={intern.id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <img
                                                    src={`/${intern.foto}`}
                                                    alt={intern.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {intern.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {intern.division}
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
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-12 text-center text-gray-400 text-sm"
                                        >
                                            {interns.length === 0
                                                ? "Tidak ada data absensi untuk rentang tanggal ini."
                                                : "Karyawan tidak ditemukan."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
