// resources/js/Pages/Attendance.jsx

import { Head, router, usePage } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import InternCard from "@/Components/InternCard";
import SearchBar from "@/Components/SearchBar";

// Format tanggal ke format Indonesia:
function formatTanggalIndonesia(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function Attendance({
    interns = [],
    selectedDate,
    hariIni = "",
    fingerprintDatabase = [],
}) {
    const { flash = {} } = usePage().props;
    const [date, setDate] = useState(
        selectedDate || new Date().toISOString().split("T")[0],
    );
    const [searchTerm, setSearchTerm] = useState("");
    const dateInputRef = useRef(null);

    // Fingerprint State
    const [status, setStatus] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message: '' }

    const database_payload = [];
    fingerprintDatabase.forEach((u) => {
        if (u.fmd) database_payload.push({ id: u.id, fmd: u.fmd });
        if (u.second_fmd)
            database_payload.push({ id: u.id, fmd: u.second_fmd });
    });

    const startScanAndVerify = async () => {
        if (isScanning) return;
        setIsScanning(true);
        setStatus("⌛ Sedang memindai jari...");
        setFeedback(null);

        try {
            // 1. Minta C# Service untuk Identifikasi
            const payload = { database: database_payload };
            const response = await fetch("http://localhost:5000/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.match) {
                const userId = result.user_id;
                setStatus(`✔️ Terdeteksi! Menghubungi server...`);

                try {
                    // 2. Kirim hasil match ke Laravel
                    const presensiRes = await axios.post("/attendance", {
                        intern_id: userId,
                    });

                    const data = presensiRes.data;
                    setFeedback({
                        type: "success",
                        message: `✅ ${data.name}: ${data.message}`,
                    });
                    setStatus(null);

                    // Reload data intern di halaman agar update status (Hadir/Check-in dsb)
                    router.reload({ only: ["interns"] });
                } catch (err) {
                    let msg = "Gagal mencatat presensi.";
                    if (err.response?.data?.message)
                        msg = err.response.data.message;
                    setFeedback({ type: "error", message: `⚠️ ${msg}` });
                    setStatus(null);
                }
            } else {
                setFeedback({
                    type: "error",
                    message: "❌ Sidik jari tidak dikenali.",
                });
                setStatus(null);
            }
        } catch (err) {
            console.error(err);
            setFeedback({
                type: "error",
                message: "🔌 Gagal terhubung ke Fingerprint Service.",
            });
            setStatus(null);
        } finally {
            setIsScanning(false);
        }
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        router.get(
            route("attendance.index"),
            { date: newDate },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Bersihkan feedback otomatis setelah 5 detik
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const filteredInterns = interns
        .filter((intern) =>
            intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) => {
            const aHadir = a?.attendances?.[0]?.check_in ? 1 : 0;
            const bHadir = b?.attendances?.[0]?.check_in ? 1 : 0;
            return aHadir - bHadir;
        });

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Absensi Harian" />

            {/* ── Navbar ── */}
            <div className="bg-white shadow-md">
                <div className="max-w-[1400px] mx-auto px-10 sm:px-14 lg:px-20 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/foto/upa-pkk-logo.jpg.jpeg"
                            alt="UPA PKK Logo"
                            className="w-12 h-12 rounded-full object-cover shadow-md flex-shrink-0"
                        />
                        <div>
                            <p className="text-gray-900 font-bold text-lg leading-tight">
                                UPA PKK
                            </p>
                            <p className="text-gray-500 text-sm">
                                Attendance System
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Status Kecil / Feedback */}
                        {status && (
                            <span className="text-blue-600 font-medium animate-pulse text-sm">
                                {status}
                            </span>
                        )}
                        {feedback && (
                            <div
                                className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm border ${
                                    feedback.type === "success"
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : "bg-red-50 border-red-200 text-red-700"
                                }`}
                            >
                                {feedback.message}
                            </div>
                        )}

                        <h1 className="text-gray-900 text-3xl font-bold tracking-wide hidden md:block">
                            Absensi Harian
                        </h1>

                        {/* Tombol Scan Kecil */}
                        <button
                            onClick={startScanAndVerify}
                            disabled={isScanning}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition shadow-lg transform active:scale-95 ${
                                isScanning
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M17.81 4.47c-.08 0-.16.02-.23.06a.75.75 0 0 0-.23 1.03a8.51 8.51 0 0 1 1.15 4.19c0 .35-.02.7-.07 1.05c-.03.21-.19.38-.4.41c-.21.03-.41-.09-.48-.29a7.01 7.01 0 0 0-.07-.9a8.42 8.42 0 0 0-.74-2.81a.747.747 0 0 0-1-.36a.75.75 0 0 0-.36 1c.54 1.14.83 2.39.85 3.67c.02 1.35-.19 2.68-.61 3.93c-.07.2-.27.32-.48.29c-.21-.03-.37-.2-.4-.41a8.43 8.43 0 0 1-.03-1.42c-.06-1.61-.41-3.21-1.05-4.7a.753.753 0 0 0-.96-.4a.75.75 0 0 0-.4.96c.55 1.28.85 2.65.9 4.04c.05 1.48-.12 2.95-.51 4.36c-.07.24-.31.39-.56.35c-.24-.04-.42-.25-.43-.5a8.43 8.43 0 0 1 .15-1.92c.16-1.55.07-3.13-.26-4.64a.75.75 0 0 0-.73-.59a.74.74 0 0 0-.73.6a10.02 10.02 0 0 0-.06 4.1c.17 1.71-.02 3.44-.55 5.07c-.08.24-.33.39-.58.34c-.25-.05-.42-.27-.41-.53c.09-1.29-.02-2.58-.33-3.83c-.26-1.07-.65-2.11-1.16-3.1c-.09-.18-.08-.39.04-.56c.12-.17.33-.25.53-.22c.21.03.38.19.41.4a8.42 8.42 0 0 1 .23 2.1c.06.94.19 1.88.39 2.8a.747.747 0 0 0 1.43-.37c-.36-1.4-.52-2.85-.48-4.3c.04-1.4.31-2.77.79-4.08a.753.753 0 0 0-.39-.97a.75.75 0 0 0-.97.39a11.53 11.53 0 0 0-.91 4.67a11.52 11.52 0 0 0 .19 2.5a.75.75 0 0 0 1.48-.2c-.05-.41-.09-.83-.11-1.25a9.92 9.92 0 0 1 .1-1.93c.27-1.7.77-3.34 1.49-4.89a.747.747 0 0 0-.33-1a.75.75 0 0 0-1 .33a12.98 12.98 0 0 0-1.28 4.22a12.94 12.94 0 0 0-.15 2.58c.01.25-.17.47-.41.52c-.25.05-.49-.1-.58-.34a11.37 11.37 0 0 1 .53-5.07a11.4 11.4 0 0 1 1.76-3.83c.12-.17.13-.39.02-.56s-.31-.27-.51-.25c-.2.02-.37.16-.43.35c-.88 2.37-1.32 4.88-1.28 7.42c.01.25-.17.47-.42.52c-.25.04-.49-.11-.57-.34a12.94 12.94 0 0 1 .19-8.49c.86-2.19 2.15-4.17 3.82-5.83a.75.75 0 0 0-.53-1.28a.75.75 0 0 0-.53 1.28c-1.83 1.83-3.26 4.02-4.21 6.43c-.88 2.22-1.31 4.59-1.28 6.96c.03.25-.14.47-.39.52c-.24.05-.49-.09-.58-.33c-.56-1.52-.82-3.13-.77-4.74a12.94 12.94 0 0 1 2.22-6.6a14.473 14.473 0 0 1 5.3-4.74a.753.753 0 0 0-.71-1.32c-2.12.87-4.04 2.19-5.63 3.86a14.39 14.39 0 0 0-3.33 11a.75.75 0 0 0 .75.68c.05 0 .1-.01.15-.02c.24-.05.42-.26.41-.51a11.46 11.46 0 0 1 .23-2.58a11.48 11.48 0 0 1 2.15-4.9c1.61-2.09 3.66-3.84 6.01-5.11a15.93 15.93 0 0 1 6.32-1.63a.75.75 0 0 0 .58-.89a.75.75 0 0 0-.74-.61z"
                                />
                            </svg>
                            {isScanning
                                ? "Memindai..."
                                : "Pukul Mesin Presensi"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-10 sm:px-14 lg:px-20 py-8">
                {/* ── Search + Date ── */}
                <div className="flex items-center gap-3 mb-8">
                    {/* Search */}
                    <SearchBar onSearch={setSearchTerm} />

                    {/* Date Picker */}
                    <div
                        onClick={() => dateInputRef.current?.showPicker()}
                        className="relative flex items-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-xl px-4 py-3 shadow-sm cursor-pointer transition whitespace-nowrap select-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-white flex-shrink-0"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14zM7 10h5v5H7z"
                            />
                        </svg>
                        <span className="text-white text-sm font-medium">
                            {formatTanggalIndonesia(date)}
                        </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-blue-200"
                            viewBox="0 0 24 24"
                        >
                            <path fill="currentColor" d="M7 10l5 5 5-5z" />
                        </svg>
                        <input
                            ref={dateInputRef}
                            type="date"
                            value={date || ""}
                            onChange={handleDateChange}
                            className="absolute opacity-0 w-0 h-0 pointer-events-none"
                        />
                    </div>
                </div>

                {/* ── Cards Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {filteredInterns.length > 0 ? (
                        filteredInterns.map((intern) => {
                            const att =
                                intern?.attendances?.length > 0
                                    ? intern.attendances[0]
                                    : null;
                            return (
                                <InternCard
                                    key={intern.id}
                                    intern={intern}
                                    attendance={att}
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 text-center">
                            {interns.length === 0 ? (
                                <p className="text-gray-400 text-lg font-medium">
                                    Tidak ada intern terjadwal pada hari{" "}
                                    <span className="font-bold capitalize">
                                        {hariIni}
                                    </span>
                                    .
                                </p>
                            ) : (
                                <p className="text-gray-400 text-lg font-medium">
                                    Intern tidak ditemukan.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
