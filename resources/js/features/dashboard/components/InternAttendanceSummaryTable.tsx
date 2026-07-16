import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { InternAttendanceSummary } from "@/features/interns/types/intern";

interface InternAttendanceSummaryTableProps {
    /** Data ringkasan absensi */
    interns: InternAttendanceSummary[];
    /** Jumlah data asli sebelum difilter */
    originalLength: number;
}

/**
 * Komponen tabel ringkasan absensi berbasis Shadcn.
 *
 * @param props Properti komponen.
 * @returns Elemen tabel absensi Shadcn.
 */
export function InternAttendanceSummaryTable({
    interns,
    originalLength,
}: InternAttendanceSummaryTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[5%] text-center">Profil</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-center">Jumlah Hadir</TableHead>
                    <TableHead className="text-center">Jumlah Izin</TableHead>
                    <TableHead className="text-center">Jumlah Alpha</TableHead>
                    <TableHead className="text-center">Total Jam</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {interns.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={6}
                            className="h-24 text-center text-gray-400"
                        >
                            {originalLength === 0
                                ? "Tidak ada data absensi untuk rentang tanggal ini."
                                : "Karyawan tidak ditemukan."}
                        </TableCell>
                    </TableRow>
                ) : (
                    interns.map((intern) => (
                        <TableRow key={intern.id}>
                            <TableCell className="flex justify-center">
                                <img
                                    src={`/storage/${intern.foto}`}
                                    alt={intern.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-gray-900">
                                    {intern.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {intern.division?.nama_divisi ?? "-"}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="font-semibold text-gray-900">
                                    {intern.jumlah_hadir}
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="font-semibold text-gray-900">
                                    {intern.jumlah_izin}
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="font-semibold text-gray-900">
                                    {intern.jumlah_alpha}
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="font-semibold text-gray-900">
                                    {intern.total_jam} jam
                                </span>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
