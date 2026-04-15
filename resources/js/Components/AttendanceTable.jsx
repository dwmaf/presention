import { useState } from "react";

export default function AttendanceTable({
    attendances = [],
    itemsPerPage = 7,
    renderStatus,
    renderCheckOut,
}) {
    /**
     * * AttendanceTable Component
     * * ----------------------------------------
     * * Komponen reusable untuk menampilkan data kehadiran dalam bentuk tabel
     * * lengkap dengan pagination.
     *
     * ? Kenapa komponen ini dipisah?
     * ? - Logic tabel (render + pagination) cukup kompleks
     * ? - Digunakan berulang di beberapa halaman (reusable)
     * ? - Mengurangi beban komponen parent (separation of concerns)
     *
     * ! Responsibility:
     * ! - Mengelola pagination (state halaman aktif)
     * ! - Melakukan slicing data berdasarkan halaman
     * ! - Render tabel kehadiran
     * ! - Menyediakan fleksibilitas render via render props
     *
     * @param {Array<Object>} attendances
     * * Data kehadiran yang akan ditampilkan
     * * Struktur minimal:
     * * - id
     * * - date
     * * - hari
     * * - check_in
     * * - check_out
     * * - terlambat
     *
     * @param {number} [itemsPerPage=7]
     * * Jumlah data yang ditampilkan per halaman
     * * Default: 7 (biar tidak terlalu panjang di UI)
     *
     * @param {(attendance: Object, index: number, length: number) => ReactNode} renderStatus
     * * Function untuk custom render kolom status
     * * Digunakan agar parent bisa inject logic status sendiri
     *
     * @param {(attendance: Object, index: number, length: number) => ReactNode} renderCheckOut
     * * Function untuk custom render kolom jam pulang
     * * Biasanya digunakan untuk:
     * * - Tombol check-out
     * * - Status pulang
     *
     * ! Behavior:
     * ! - Data akan di-slice berdasarkan currentPage
     * ! - Pagination akan menyesuaikan jumlah data
     * ! - Render fallback jika data kosong
     *
     * ! UX Notes:
     * ! - Hover row → meningkatkan readability
     * ! - Pagination sederhana → mudah dipahami user
     * ! - Disabled button → mencegah invalid navigation
     *
     * ! Performa:
     * ! - Tidak ada heavy computation (hanya slice array)
     * ! - Aman untuk data ukuran kecil - menengah
     *
     * TODO Improvement Ideas:
     * TODO - Tambahkan "Go to page" input
     * TODO - Tambahkan page size selector (5, 10, 20)
     * TODO - Tambahkan sorting kolom (tanggal, status)
     * TODO - Tambahkan skeleton loading state
     * TODO - Tambahkan empty state yang lebih informatif
     */

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(attendances.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentAttendances = attendances.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <>
            <table className="mt-2 w-full">
                <thead className="border-b-2 border-gray-400 bg-gray-100 text-left">
                    <tr>
                        <th className="px-4 py-2">Tanggal</th>
                        <th className="px-4 py-2">Hari</th>
                        <th className="px-4 py-2">Jam Masuk</th>
                        <th className="px-4 py-2">Jam Pulang</th>
                        <th className="px-4 py-2">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {currentAttendances.length > 0 ? (
                        currentAttendances.map((attendance, index) => (
                            <tr
                                key={attendance.id}
                                className="border-b-2 border-gray-400 hover:bg-gray-50"
                            >
                                <td className="px-4 py-2">{attendance.date}</td>

                                <td className="px-4 py-2">{attendance.hari}</td>

                                <td className="px-4 py-2">
                                    {attendance.check_in
                                        ? attendance.check_in.slice(0, 5)
                                        : "-"}
                                    {attendance.terlambat && (
                                        <span className="flex items-center rounded-md bg-yellow-100 px-1 py-0.5 text-xs font-medium text-yellow-700">
                                            (+{attendance.terlambat}m)
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-2">
                                    {renderCheckOut(
                                        attendance,
                                        index,
                                        currentAttendances.length,
                                    )}
                                </td>

                                <td className="px-4 py-2">
                                    {renderStatus(
                                        attendance,
                                        index,
                                        currentAttendances.length,
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="py-6 text-center">
                                Belum ada data
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <p className="items-center text-gray-500">
                    Menampilkan {endIndex} dari {attendances.length}
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;

                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`rounded-md px-3 py-1 ${
                                    currentPage === page
                                        ? "bg-blue-700 text-white"
                                        : "border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}
