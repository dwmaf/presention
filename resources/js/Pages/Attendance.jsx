// resources/js/Pages/Attendance.jsx

import { Head, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import InternCard from '@/Components/InternCard';
import SearchBar from '@/Components/SearchBar';

// Format tanggal ke format Indonesia:
function formatTanggalIndonesia(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function Attendance({ interns = [], selectedDate, hariIni = '' }) {
    const { flash = {} } = usePage().props;
    const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const dateInputRef = useRef(null);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        router.get(route('attendance.index'), { date: newDate }, {
            preserveState: true,
            replace: true,
        });
    };

    const filteredInterns = interns.filter((intern) =>
        intern.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Absensi Harian" />

            {/* ── Navbar ── */}
            <div className="bg-white shadow-md">
                <div className="max-w-[1400px] mx-auto px-10 sm:px-14 lg:px-20 py-4 flex items-center justify-between">
                    {/* Logo + Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/foto/upa-pkk-logo.jpg.jpeg"
                            alt="UPA PKK Logo"
                            className="w-12 h-12 rounded-full object-cover shadow-md flex-shrink-0"
                        />
                        <div>
                            <p className="text-gray-900 font-bold text-lg leading-tight">UPA PKK</p>
                            <p className="text-gray-500 text-sm">Admin</p>
                        </div>
                    </div>
                    <h1 className="text-gray-900 text-3xl font-bold tracking-wide">Absensi Harian</h1>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-10 sm:px-14 lg:px-20 py-8">

                {/* Flash messages */}
                {flash?.success && <div className="mb-5 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl text-center font-semibold animate-pulse">{flash.success}</div>}
                {flash?.error   && <div className="mb-5 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center font-semibold animate-pulse">{flash.error}</div>}
                {flash?.info    && <div className="mb-5 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-xl text-center font-semibold">{flash.info}</div>}

                {/* ── Search + Date ── */}
                <div className="flex items-center gap-3 mb-8">
                    {/* Search */}
                    <SearchBar onSearch={setSearchTerm} />

                    {/* Date Picker */}
                    <div
                        onClick={() => dateInputRef.current?.showPicker()}
                        className="relative flex items-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-xl px-4 py-3 shadow-sm cursor-pointer transition whitespace-nowrap select-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white flex-shrink-0" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14zM7 10h5v5H7z" />
                        </svg>
                        <span className="text-white text-sm font-medium">
                            {formatTanggalIndonesia(date)}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-200" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M7 10l5 5 5-5z" />
                        </svg>
                        <input
                            ref={dateInputRef}
                            type="date"
                            value={date || ''}
                            onChange={handleDateChange}
                            className="absolute opacity-0 w-0 h-0 pointer-events-none"
                        />
                    </div>
                </div>

                {/* ── Cards Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {filteredInterns.length > 0 ? (
                        filteredInterns.map((intern) => (
                            <InternCard key={intern.id} intern={intern} />
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center">
                            {interns.length === 0 ? (
                                <p className="text-gray-400 text-lg font-medium">
                                    Tidak ada intern terjadwal pada hari <span className="font-bold capitalize">{hariIni}</span>.
                                </p>
                            ) : (
                                <p className="text-gray-400 text-lg font-medium">Intern tidak ditemukan.</p>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}