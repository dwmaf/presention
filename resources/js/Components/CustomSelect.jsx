import { useState, useRef, useEffect } from "react";

export default function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Pilih...",
    hasError,
}) {
    /**
     * * Buat ganti dari dropdown select bawaan browser
     * @param value = nilai yang diambil saat user memilih
     * @param onChange = callback function buat update value saat user memilih ulang
     * @param options = data yang mau ditampilkan sebagai pilihan dropdown
     * @param placeholder = teks default saat belum ada data pilihan
     * @param hasError = tanda kalau field lagi invalid
     */

    const selectContainerRef = useRef(null);

    // * Buat track buka/tutup dropdown (true/false)
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((option) => option.value === value);

    // * Tutup dropdown saat klik bagian luar komponen
    useEffect(() => {
        const closeDropdownOnOutsideClick = (event) => {
            if (
                selectContainerRef.current &&
                !selectContainerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        /**
         * * mousedown dipakai biar mengurangi potensi konflik urutan event
         * * saat user berinteraksi cepat
         */
        document.addEventListener("mousedown", closeDropdownOnOutsideClick);
        return () =>
            // * cleanup untuk mengurangi potensi bug / perilaku ui yg aneh
            document.removeEventListener(
                "mousedown",
                closeDropdownOnOutsideClick,
            );
    }, []);

    const handleOptionSelect = (selectedValue) => {
        /**
         * * setelah user memilih, simpan pilihannya
         * * lalu tutup dropdown nya langsung
         */
        onChange(selectedValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={selectContainerRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-2 text-left bg-white border rounded-lg shadow-sm cursor-pointer transition-all ${
                    hasError
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
                } ${isOpen ? "ring-2" : ""}`}
            >
                <span
                    className={
                        selectedOption ? "text-gray-700" : "text-gray-400"
                    }
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            onClick={() => handleOptionSelect(option.value)}
                            className={`px-4 py-2 cursor-pointer transition-colors block w-full text-left ${
                                value === option.value
                                    ? "bg-blue-500 text-white"
                                    : "hover:bg-blue-100 text-gray-700"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
