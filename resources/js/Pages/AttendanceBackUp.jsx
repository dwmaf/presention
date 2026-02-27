// resources/js/Pages/Attendance.jsx

import { Head, router, usePage } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import InternCard from "@/Components/InternCard";
import SearchBar from "@/Components/SearchBar";

// Format tanggal ke format Indonesia
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

export default function AttendanceBackUp({
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
    const [feedback, setFeedback] = useState(null);

    const database_payload = [];
    fingerprintDatabase.forEach((u) => {
        if (u.fmd) database_payload.push({ id: u.id, fmd: u.fmd });
        if (u.second_fmd)
            database_payload.push({ id: u.id, fmd: u.second_fmd });
        if (u.fmd_3) database_payload.push({ id: u.id, fmd: u.fmd_3 });
        if (u.fmd_4) database_payload.push({ id: u.id, fmd: u.fmd_4 });
        if (u.fmd_5) database_payload.push({ id: u.id, fmd: u.fmd_5 });
        if (u.fmd_6) database_payload.push({ id: u.id, fmd: u.fmd_6 });
    });

    const startScanAndVerify = async () => {
        if (isScanning) return;
        setIsScanning(true);
        setStatus("⌛ Sedang memindai jari...");
        setFeedback(null);

        try {
            // 1. C# Service untuk Identifikasi
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

                    // Reload data intern di halaman
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
                                width="21"
                                height="21"
                                viewBox="0 0 21 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.75 6.437C0.854 4.337 1.165 3.027 2.097 2.097C3.027 1.165 4.337 0.854 6.437 0.75M19.75 6.437C19.646 4.337 19.335 3.027 18.403 2.097C17.473 1.165 16.163 0.854 14.063 0.75M14.063 19.75C16.163 19.646 17.473 19.335 18.403 18.403C19.335 17.473 19.646 16.163 19.75 14.063M6.437 19.75C4.337 19.646 3.027 19.335 2.097 18.403C1.165 17.473 0.854 16.163 0.75 14.063M14.75 13.75V9.25C14.75 8.05653 14.2759 6.91193 13.432 6.06802C12.5881 5.22411 11.4435 4.75 10.25 4.75C9.05653 4.75 7.91193 5.22411 7.06802 6.06802C6.22411 6.91193 5.75 8.05653 5.75 9.25V13.75"
                                    stroke="white"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M11.75 10.75V9.25C11.75 8.85218 11.592 8.47064 11.3107 8.18934C11.0294 7.90804 10.6478 7.75 10.25 7.75C9.85218 7.75 9.47064 7.90804 9.18934 8.18934C8.90804 8.47064 8.75 8.85218 8.75 9.25V14.75M11.75 13.75V15.75"
                                    stroke="white"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>

                            {isScanning
                                ? "Memindai..."
                                : "Klik untuk Scan & Presensi"}
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
