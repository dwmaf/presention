// resources/js/Pages/Attendance.jsx

import { Head, router, usePage } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import InternCard from "@/Components/InternCard";
import SearchBar from "@/Components/SearchBar";
import { Link } from "@inertiajs/react";
import CustomDatePicker from "@/Components/DatePicker";

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
    const [modalOpen, setModalOpen] = useState(false);

    // Fingerprint State
    const [status, setStatus] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const datePickerRef = useRef(null);
    const [open, setOpen] = useState(false);

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
        setStatus("Memindai jari...");
        setFeedback(null);
        setModalOpen(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 3000));

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

                setFeedback({
                    type: "success",
                    message: `✅ ${data.name}: ${data.message}`,
                });

                try {
                    // 2. Kirim hasil match ke Laravel
                    const presensiRes = await axios.post("/attendance", {
                        intern_id: userId,
                    });

                    const data = presensiRes.data;
                    setFeedback({
                        type: "success",
                        message: `✅ ${data.name} masuk pada ${data.time}`,
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
            }
        } catch (err) {
            console.error(err);
            setFeedback({
                type: "error",
                message: "🔌 Gagal terhubung ke Fingerprint Service.",
            });
        } finally {
            setIsScanning(false);
            setStatus(null);
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

    const handleCloseModal = () => {
        setModalOpen(false);
        setIsScanning(false);
        setStatus(null);
        setFeedback(null);
    };

    // Bersihkan feedback otomatis setelah 5 detik
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    useEffect(() => {
        if (feedback && !isScanning) {
            const timer = setTimeout(() => {
                setModalOpen(false);
                setFeedback(null);
                setStatus(null);
            }, 2000); // modal tertutup otomatis setelah 2 detik
            return () => clearTimeout(timer);
        }
    }, [feedback, isScanning]);

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
                    <Link href="/login" className="flex items-center gap-3">
                        <img
                            src="/foto/upa-pkk-logo.jpg.jpeg"
                            alt="UPA PKK Logo"
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                            <p className="text-gray-900 font-bold text-lg leading-tight">
                                UPA PKK
                            </p>
                            <p className="text-gray-500 text-sm">
                                Attendance System
                            </p>
                        </div>
                    </Link>

                    {/* <div className="flex items-center gap-6">
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
                    </div> */}
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-10 sm:px-14 lg:px-20 py-8">
                <div className="flex justify-between mb-8">
                    <h1 className="text-2xl font-semibold hidden md:block">
                        Absensi Harian
                    </h1>
                    {/* Tombol Scan Kecil */}
                    <button
                        onClick={startScanAndVerify}
                        disabled={isScanning}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition transform active:scale-95 ${
                            isScanning
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-400 hover:bg-blue-300 text-white"
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 19v-8m-3 7v-7c0-1 .6-3 3-3s3 2 3 3v6m-9-3v-3c0-2 1.2-6 6-6s6 4 6 6m0 4v-1M6.001 17H6M7 3H5a2 2 0 0 0-2 2v2m0 10v2a2 2 0 0 0 2 2h2m10 0h2a2 2 0 0 0 2-2v-2m0-10V5a2 2 0 0 0-2-2h-2"
                            />
                        </svg>

                        {isScanning
                            ? "Memindai..."
                            : "Klik untuk Scan & Presensi"}
                    </button>
                </div>

                {/* Modal muncul saat scanning ATAU ada feedback */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md relative">
                            {/* <h2 className="text-lg font-bold mb-4">
                                Scan Sidik Jari
                            </h2> */}

                            {/* Pesan scanning */}
                            {isScanning && (
                                <div className="text-blue-600 flex flex-col gap-8 items-center animate-pulse mb-2">
                                    <div className="w-40 aspect-square flex justify-center items-center ">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="60"
                                            height="60"
                                            viewBox="0 0 24 24"
                                        >
                                            <g>
                                                <path
                                                    fill="oklch(54.6% 0.245 262.881)"
                                                    d="M7 3H17V7.2L12 12L7 7.2V3Z"
                                                >
                                                    <animate
                                                        id="SVGFjnOndxt"
                                                        fill="freeze"
                                                        attributeName="opacity"
                                                        begin="0;SVGn6mLadge.end"
                                                        dur="2s"
                                                        from="1"
                                                        to="0"
                                                    />
                                                </path>
                                                <path
                                                    fill="oklch(54.6% 0.245 262.881)"
                                                    d="M17 21H7V16.8L12 12L17 16.8V21Z"
                                                >
                                                    <animate
                                                        fill="freeze"
                                                        attributeName="opacity"
                                                        begin="0;SVGn6mLadge.end"
                                                        dur="2s"
                                                        from="0"
                                                        to="1"
                                                    />
                                                </path>
                                                <path
                                                    fill="oklch(54.6% 0.245 262.881)"
                                                    d="M6 2V8H6.01L6 8.01L10 12L6 16L6.01 16.01H6V22H18V16.01H17.99L18 16L14 12L18 8.01L17.99 8H18V2H6ZM16 16.5V20H8V16.5L12 12.5L16 16.5ZM12 11.5L8 7.5V4H16V7.5L12 11.5Z"
                                                />
                                                <animateTransform
                                                    id="SVGn6mLadge"
                                                    attributeName="transform"
                                                    attributeType="XML"
                                                    begin="SVGFjnOndxt.end"
                                                    dur="0.5s"
                                                    from="0 12 12"
                                                    to="180 12 12"
                                                    type="rotate"
                                                />
                                            </g>
                                        </svg>
                                    </div>
                                    <p className="font-semibold">
                                        Memindai jari...
                                    </p>
                                </div>
                            )}

                            {/* Pesan hasil */}
                            {!isScanning &&
                                feedback &&
                                feedback.type === "error" && (
                                    <div className="">
                                        <div className="w-40 aspect-square flex justify-center items-center ">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="70"
                                                height="70"
                                                viewBox="0 0 24 24"
                                            >
                                                <g
                                                    fill="none"
                                                    stroke="oklch(57.7% 0.245 27.325)"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="1.5"
                                                >
                                                    <path d="M7 16v-4.639c0-.51.1-.999.285-1.453M17 14v-1.185m-7.778-5.08A5.5 5.5 0 0 1 12 7c2.28 0 4.203 1.33 4.805 3.15M10 17v-2.177M14 17v-5.147C14 10.83 13.105 10 12 10s-2 .83-2 1.853v.794" />
                                                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10a10 10 0 0 1-.458 3m-4.421 7.364l2.122-2.121m0 0l2.121-2.122m-2.121 2.122L17.12 18.12m2.122 2.122l2.121 2.121" />
                                                </g>
                                            </svg>
                                        </div>
                                        <p className="text-red-700 font-semibold">
                                            Gagal Tersambung
                                        </p>
                                    </div>
                                )}

                            {!isScanning &&
                                feedback &&
                                feedback.type === "success" && (
                                    <div className="">
                                        <div className="w-40 aspect-square flex justify-center items-center ">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="60"
                                                height="60"
                                                viewBox="0 0 24 24"
                                            >
                                                <g
                                                    fill="none"
                                                    stroke="oklch(52.7% 0.154 150.069)"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="1.5"
                                                >
                                                    <path d="M7 16v-4.639c0-.51.1-.999.285-1.453M17 16v-3.185m-7.778-5.08A5.5 5.5 0 0 1 12 7c2.28 0 4.203 1.33 4.805 3.15M10 17v-2.177M14 17v-5.147C14 10.83 13.105 10 12 10s-2 .83-2 1.853v.794" />
                                                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10a10 10 0 0 1-.458 3M15.5 20.5l2 2l5-5" />
                                                </g>
                                            </svg>
                                        </div>
                                        <p className="text-green-700 text-center font-semibold">
                                            {feedback?.type === "success" &&
                                            feedback?.message
                                                ? feedback.message
                                                : "Berhasil Absen!"}
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                )}

                {/* ── Search + Date ── */}
                <div className="flex items-center mb-8">
                    {/* Date Picker */}
                    <div
                        className="relative flex items-center cursor-pointer"
                        onClick={() => setOpen(true)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="oklch(48.8% 0.243 264.376)"
                                d="M2 19c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-8H2zM19 4h-2V3c0-.6-.4-1-1-1s-1 .4-1 1v1H9V3c0-.6-.4-1-1-1s-1 .4-1 1v1H5C3.3 4 2 5.3 2 7v2h20V7c0-1.7-1.3-3-3-3"
                            />
                        </svg>
                        <CustomDatePicker
                            ref={datePickerRef}
                            value={new Date(date)}
                            onChange={(d) => {
                                if (!d) return;
                                const newDate = Array.isArray(d) ? d[0] : d;
                                const formatted = newDate
                                    .toISOString()
                                    .split("T")[0];
                                setDate(formatted);
                                router.get(
                                    route("attendance.index"),
                                    { date: formatted },
                                    {
                                        preserveState: true,
                                        replace: true,
                                    },
                                );
                            }}
                            open={open}
                            onClickOutside={() => setOpen(false)}
                            dateFormat="dd MMM yyyy"
                            className="bg-transparent border-none text-blue-700 text-md font-medium "
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            className="-rotate-90 mr-4"
                        >
                            <path
                                fill="oklch(48.8% 0.243 264.376)"
                                d="m13.15 16.15l-3.625-3.625q-.125-.125-.175-.25T9.3 12t.05-.275t.175-.25L13.15 7.85q.075-.075.163-.112T13.5 7.7q.2 0 .35.138T14 8.2v7.6q0 .225-.15.363t-.35.137q-.05 0-.35-.15"
                            />
                        </svg>
                    </div>

                    {/* Search */}
                    <SearchBar onSearch={setSearchTerm} />
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
