import * as React from "react";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./ui/pagination";

export interface AttendanceRecord {
    id: number | string;
    date?: string;
    hari?: string;
    check_in?: string | null;
    check_out?: string | null;
    terlambat?: number | null;
    // [key: string]: unknown;
}

export interface AttendanceTableProps {
    attendances?: AttendanceRecord[];
    itemsPerPage?: number;
    renderStatus: (
        record: any,
        index: number,
        total: number,
    ) => React.ReactNode;
    renderActions: (
        record: AttendanceRecord,
        index: number,
        total: number,
    ) => React.ReactNode;
}

/**
 * Komponen tabel absensi karyawan dengan pagination.
 *
 * @param props Properti komponen.
 * @returns Elemen tabel absensi.
 */
export default function AttendanceTable({
    attendances = [],
    itemsPerPage = 7,
    renderStatus,
    renderActions,
}: AttendanceTableProps) {
    const [currentPage, setCurrentPage] = useState<number>(1);

    const totalPages = Math.ceil(attendances.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentAttendances = attendances.slice(startIndex, endIndex);

    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-4">
            {/* Wrapper Border dengan Sudut Membulat (Rounded Corners) */}
            <div className="overflow-hidden rounded-lg bg-white shadow-xs">
                <Table>
                    <TableHeader className="text-foreground bg-gray-50/75">
                        <TableRow>
                            <TableHead className="px-4 font-semibold">
                                Tanggal
                            </TableHead>

                            <TableHead className="px-4 font-semibold">
                                Hari
                            </TableHead>

                            <TableHead className="px-4 font-semibold">
                                Jam Masuk
                            </TableHead>

                            <TableHead className="px-4 font-semibold">
                                Jam Pulang
                            </TableHead>

                            <TableHead className="px-4 font-semibold">
                                Status
                            </TableHead>

                            <TableHead className="px-4 text-center font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {currentAttendances.length > 0 ? (
                            currentAttendances.map((attendance, index) => (
                                <TableRow
                                    key={attendance.id}
                                    className="hover:bg-gray-50/50"
                                >
                                    <TableCell className="px-4 py-3">
                                        {attendance.date}
                                    </TableCell>

                                    <TableCell className="px-4 py-3">
                                        {attendance.hari}
                                    </TableCell>

                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span>
                                                {attendance.check_in
                                                    ? attendance.check_in.slice(
                                                          0,
                                                          5,
                                                      )
                                                    : "-"}
                                            </span>

                                            {attendance.terlambat ? (
                                                <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                                                    (+{attendance.terlambat}m)
                                                </span>
                                            ) : null}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-4 py-3">
                                        {attendance.check_out
                                            ? attendance.check_out.slice(0, 5)
                                            : "-"}
                                    </TableCell>

                                    <TableCell className="px-4 py-3">
                                        {renderStatus(
                                            attendance,
                                            index,
                                            currentAttendances.length,
                                        )}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-center">
                                        {renderActions(
                                            attendance,
                                            index,
                                            currentAttendances.length,
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-muted-foreground h-24 text-center"
                                >
                                    Belum ada data kehadiran.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Kontrol Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                        Menampilkan {currentAttendances.length} dari{" "}
                        {attendances.length} data
                    </p>

                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    text="Prev"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1)
                                            handlePageChange(currentPage - 1);
                                    }}
                                    className={
                                        currentPage === 1
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }).map((_, i) => {
                                const page = i + 1;
                                const isActive = currentPage === page;

                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            isActive={isActive}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(page);
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    text="Next"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages)
                                            handlePageChange(currentPage + 1);
                                    }}
                                    className={
                                        currentPage === totalPages
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
