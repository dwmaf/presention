/**
 * ============================================================================
 * Hook        : useAttendanceDashboard
 * Layer       : Feature (Hook)
 *
 * Description:
 * Mengelola logika bisnis, filter tanggal berbasis DateRange, pencarian,
 * dan unduhan laporan dashboard.
 * ============================================================================
 */

import { useState, useMemo, useEffect } from "react";
import { router } from "@inertiajs/react";
import type { DateRange } from "react-day-picker";
import type { InternAttendanceSummary } from "@/features/interns/types/intern";

// * Helper format tanggal internal
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

interface UseAttendanceDashboardProps {
    interns: InternAttendanceSummary[];
    startDate?: string;
    endDate?: string;
}

declare function route(
    name: string,
    params?: Record<string, string | number | undefined>,
): string;

/**
 * Hook untuk memisahkan logic dari UI Dashboard Absensi.
 */
export function useAttendanceDashboard({
    interns,
    startDate,
    endDate,
}: UseAttendanceDashboardProps) {
    const [searchTerm, setSearchTerm] = useState<string>("");

    // * Menggunakan tipe DateRange dari react-day-picker untuk sinkronisasi komponen
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startDate ? new Date(startDate) : new Date(),
        to: endDate ? new Date(endDate) : new Date(),
    });

    // * Sinkronisasi state lokal dengan props jika navigasi browser berubah
    useEffect(() => {
        setDateRange({
            from: startDate ? new Date(startDate) : new Date(),
            to: endDate ? new Date(endDate) : new Date(),
        });
    }, [startDate, endDate]);

    const handleDateRangeChange = (newValue: DateRange | undefined) => {
        setDateRange(newValue);

        if (!newValue?.from || !newValue?.to) return;

        router.get(
            route("dashboard"),
            {
                start_date: formatDate(newValue.from),
                end_date: formatDate(newValue.to),
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDownload = () => {
        if (!dateRange?.from || !dateRange?.to) {
            alert(
                "Silakan pilih rentang tanggal terlebih dahulu untuk mengunduh laporan.",
            );
            return;
        }

        const start = formatDate(dateRange.from);
        const end = formatDate(dateRange.to);

        window.location.href = route("dashboard.export", {
            start_date: start,
            end_date: end,
        });
    };

    const filteredInterns = useMemo(() => {
        return interns.filter((intern) =>
            intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [interns, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        dateRange,
        handleDateRangeChange,
        handleDownload,
        filteredInterns,
    };
}
