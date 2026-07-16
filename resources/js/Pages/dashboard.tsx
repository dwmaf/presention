/**
 * ============================================================================
 * Page        : Dashboard
 * Layer       : Page (View Assembly)
 *
 * Description:
 * Halaman utama ringkasan absensi karyawan. Mengintegrasikan filter tanggal,
 * tombol unduh, bar pencarian, dan tabel data absensi.
 * ============================================================================
 */

import { Head } from "@inertiajs/react";
import RangeDatePicker from "@/components/RangeDatePicker";
import SearchBar from "@/components/SearchBar";
import DownloadBtn from "@/components/DownloadBtn";

import type { InternAttendanceSummary } from "@/features/interns/types/intern";
import { useAttendanceDashboard } from "@/features/dashboard/hooks/useAttendanceDashboard";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { InternAttendanceSummaryTable } from "@/features/dashboard/components/InternAttendanceSummaryTable";

interface DashboardProps {
    interns?: InternAttendanceSummary[];
    startDate?: string;
    endDate?: string;
}

/**
 * Komponen halaman Dashboard Absensi Karyawan.
 *
 * @param props Properti halaman dari controller.
 * @returns Halaman dashboard absensi.
 */
export default function Dashboard({
    interns = [],
    startDate,
    endDate,
}: DashboardProps) {
    const {
        searchTerm,
        setSearchTerm,
        dateRange,
        handleDateRangeChange,
        handleDownload,
        filteredInterns,
    } = useAttendanceDashboard({ interns, startDate, endDate });

    return (
        <AuthenticatedLayout>
            <Head title="Data Absensi" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    {/* ── Title ── */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Absensi Harian
                        </h1>
                        <p className="text-sm text-gray-500">
                            Laporan rekapitulasi kehadiran dan total jam kerja
                            karyawan magang.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-full sm:w-auto">
                            <RangeDatePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                            />
                        </div>

                        <DownloadBtn onClick={handleDownload} />
                    </div>
                </div>

                {/* ── Tabel Ringkasan Absensi ── */}
                <InternAttendanceSummaryTable
                    interns={filteredInterns}
                    originalLength={interns.length}
                />
            </div>
        </AuthenticatedLayout>
    );
}
