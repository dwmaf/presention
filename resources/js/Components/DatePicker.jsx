import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * * CustomDatePicker Component
 * * ----------------------------------------
 * * Wrapper dari react-datepicker untuk konsistensi UI & konfigurasi
 *
 * ? Kenapa dibuat wrapper?
 * ? - Menghindari styling berulang di banyak tempat
 * ? - Mempermudah perubahan global (format, style, behavior)
 * ? - Menyederhanakan penggunaan di component lain
 *
 * ! Behavior:
 * - Mengontrol selected date dari parent (controlled component)
 * - Mendukung format tanggal custom
 * - Menyediakan placeholder default
 * - Bisa di-extend dengan props tambahan dari react-datepicker
 *
 * @param {Date|null} value - Nilai tanggal yang dipilih
 * @param {Function} onChange - Handler saat tanggal berubah
 * @param {string} dateFormat - Format tampilan tanggal (default: yyyy-MM-dd)
 * @param {string} placeholder - Placeholder input
 * @param {string} className - Custom styling tambahan
 * @param {Object} props - Props tambahan untuk react-datepicker (spread)
 */
export default function CustomDatePicker({
    value,
    onChange,
    dateFormat = "yyyy-MM-dd",
    placeholder = "Pilih tanggal",
    className = "",
    ...props
}) {
    return (
        <DatePicker
            /**
             * * Controlled Input
             * ? Nilai dikontrol oleh parent component
             */
            selected={value}
            onChange={onChange}
            /**
             * * Format & Placeholder
             */
            dateFormat={dateFormat}
            placeholderText={placeholder}
            /**
             * * Styling
             * ? Default + extensible via className
             */
            className={`border-2 py-2 focus:ring-0 ${className} w-32`}
            /**
             * * Fix layering issue (z-index calendar)
             * ? Supaya tidak ketutup modal / container lain
             */
            calendarClassName="z-50"
            {...props}
        />
    );
}
