import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * * RangeDatePicker Component
 * * ----------------------------------------
 * * Input tanggal dengan mode range (start - end)
 *
 * ? Kenapa dibuat custom?
 * ? - react-datepicker default belum UX-friendly untuk range display
 * ? - Perlu format tampilan custom (Indonesia)
 *
 * ! Features:
 * - Pilih rentang tanggal (range)
 * - Disable tanggal tertentu (past / future)
 * - Format tampilan custom
 * - Clearable input
 *
 * @param {[Date|null, Date|null]} value - nilai range [startDate, endDate]
 * @param {(dates: [Date|null, Date|null]) => void} onChange - handler perubahan tanggal
 * @param {string} rangeLabel - placeholder utama input
 * @param {string} startLabel - (opsional) label tanggal mulai (future use)
 * @param {string} endLabel - (opsional) label tanggal selesai (future use)
 * @param {boolean} disabled - disable input
 * @param {Date|null} minDate - batas minimal tanggal
 * @param {Date|null} maxDate - batas maksimal tanggal
 * @param {boolean} disablePast - disable tanggal sebelum hari ini
 * @param {boolean} disableFuture - disable tanggal setelah hari ini
 * @param {string} format - format internal datepicker
 * @param {string} className - tambahan class styling
 */
export default function RangeDatePicker({
    value = [null, null],
    onChange,
    rangeLabel = "Pilih Rentang Tanggal",
    startLabel = "Tanggal Mulai",
    endLabel = "Tanggal Selesai",
    disabled = false,
    minDate = null,
    maxDate = null,
    disablePast = false,
    disableFuture = false,
    format = "dd/MM/yyyy",
    className = "",
}) {
    /**
     * * Destructure value
     * * ----------------------------------------
     * * Kenapa array?
     * * - mengikuti API dari react-datepicker (range mode)
     */
    const [startDate, endDate] = value;

    /**
     * * Format tampilan range ke string
     * * ----------------------------------------
     * * Kenapa custom format?
     * * - UX lebih readable (contoh: 01 Jan 2025 - 10 Jan 2025)
     */
    const FormatRange = (start, end) => {
        if (!start) return "";
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        const startStr = start.toLocaleDateString("id-ID", opts);
        const endStr = end ? end.toLocaleDateString("id-ID", opts) : "";
        return end ? `${startStr} - ${endStr}` : startStr;
    };

    /**
     * * Handle perubahan tanggal
     * * ----------------------------------------
     * * Kenapa wrapper?
     * * - supaya bisa tambah logic di masa depan (validasi, transform, dll)
     */
    const handleChange = (dates) => {
        if (onChange) {
            onChange(dates);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    selected={startDate}
                    onChange={onChange}
                    minDate={disablePast ? new Date() : minDate}
                    maxDate={disableFuture ? new Date() : maxDate}
                    disabled={disabled}
                    dateFormat={format}
                    placeholderText={rangeLabel}
                    className="min-w-80 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={FormatRange(startDate, endDate)}
                    isClearable
                />
            </div>
        </div>
    );
}
