import { useState } from "react";

export default function SearchBar({ onSearch }) {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearch) onSearch(value);
    };

    return (
        <div className="flex items-center rounded-md py-3 px-6 gap-2 flex-1 shadow-sm focus-within:ring-2 bg-white">
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
            <input
                className="flex-1 rounded-md border-none focus:outline-none focus:ring-0 p-0"
                type="text"
                placeholder="Cari karyawan"
                value={searchTerm}
                onChange={handleSearch}
            />
        </div>
    );
}
