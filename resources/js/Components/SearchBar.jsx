/**
 * * SearchBar Component
 * * ----------------------------------------
 * * Komponen input pencarian reusable untuk filtering data
 *
 * ! Mendukung 2 mode penggunaan:
 * ! 1. Uncontrolled → state dikelola internal (default)
 * ! 2. Controlled → state dikontrol dari parent via props `value`
 *
 * ? Kenapa dibuat dual-mode (controlled + uncontrolled)?
 * ? - Uncontrolled → lebih simpel untuk penggunaan biasa
 * ? - Controlled → diperlukan untuk kasus advanced (reset dari luar, sync state global, dll)
 *
 * @param {string} [value]
 * * Nilai input (digunakan jika mode controlled aktif)
 *
 * @param {(value: string) => void} [onSearch]
 * * Callback yang dipanggil setelah debounce
 * * Digunakan untuk:
 * * - filtering data
 * * - search global state
 *
 * @param {string} [placeholder="Cari karyawan"]
 * * Placeholder input untuk memberi konteks ke user
 *
 * @param {string} [className]
 * * Class tambahan untuk extend styling dari luar
 *
 * ! Behavior:
 * ! - Input berubah → update value (internal / external)
 * ! - Value akan di-debounce sebelum trigger onSearch
 * ! - onSearch tidak dipanggil setiap ketikan (optimized)
 *
 * ! Performa:
 * ! - Menggunakan debounce (300ms default)
 * ! - Mencegah filtering berat
 *
 * ? Kenapa pakai debounce?
 * ? - Tanpa debounce → onSearch terpanggil setiap karakter
 * ? - Bisa menyebabkan lag UI
 *
 * ! UX Notes:
 * - focus-within → memberi feedback visual saat input aktif
 * - icon search → meningkatkan affordance (user langsung paham fungsi)
 *
 * TODO Improvement Ideas:
 * TODO - Tambahkan clear button (❌) untuk reset input
 * TODO - Tambahkan loading indicator saat fetching data
 * TODO - Support minLength sebelum trigger search
 * TODO - Tambahkan keyboard shortcut (misal: "/" untuk focus)
 */

import { useState, useEffect } from "react";

/**
 * * Simple debounce hook
 * ! Menghindari terlalu banyak trigger saat user mengetik
 */
function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

function SearchIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18px"
            height="18px"
            viewBox="0 0 24 24"
        >
            <path
                fill="oklch(55.1% 0.027 264.364)"
                d="M18 10c0-4.41-3.59-8-8-8s-8 3.59-8 8s3.59 8 8 8c1.85 0 3.54-.63 4.9-1.69l5.1 5.1L21.41 20l-5.1-5.1A8 8 0 0 0 18 10M4 10c0-3.31 2.69-6 6-6s6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6"
            />
        </svg>
    );
}

export default function SearchBar({
    value: controlledValue,
    onSearch = () => {},
    placeholder = "Cari karyawan",
    className = "",
}) {
    /**
     * * Support controlled & uncontrolled mode
     */
    const [internalValue, setInternalValue] = useState("");
    const value =
        controlledValue !== undefined ? controlledValue : internalValue;

    /**
     * * Debounce value agar tidak spam onSearch
     */
    const debouncedValue = useDebounce(value, 300);

    useEffect(() => {
        onSearch(debouncedValue);
    }, [debouncedValue, onSearch]);

    const handleChange = (e) => {
        const newValue = e.target.value;

        if (controlledValue === undefined) {
            setInternalValue(newValue);
        }

        // * tetap update real-time kalau mau
        // onSearch(newValue);
    };

    return (
        <div className="flex items-center rounded-md py-3 px-6 gap-2 flex-1 shadow-md focus-within:ring-2 bg-white">
            <SearchIcon />
            <input
                className="flex-1 border-none focus:outline-none focus:ring-0 p-0"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}
