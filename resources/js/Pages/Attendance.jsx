import AdminGate from "@/Components/AdminGate";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import InternCard from "@/Components/InternCard";
import SearchBar from "@/Components/SearchBar";
import { Link } from "@inertiajs/react";
import CustomDatePicker from "@/Components/DatePicker";

/**
 * * Attendance Page Component
 * * ----------------------------------------
 * * Halaman utama untuk mengelola absensi harian intern
 *
 * ! Fitur:
 * ! - Scan fingerprint → verifikasi → simpan attendance
 * ! - Filter intern berdasarkan nama
 * ! - Filter berdasarkan tanggal
 * ! - Feedback hasil scan (success / error)
 *
 * ! Flow:
 * ! 1. Scan → kirim fingerprint database
 * ! 2. Service return user_id
 * ! 3. Kirim ke backend → simpan attendance
 *
 * @param {Array} interns
 * * Data intern + attendance
 *
 * @param {string} selectedDate
 * * Tanggal aktif (YYYY-MM-DD)
 *
 * @param {string} hariIni
 * * Nama hari (display)
 *
 * @param {Array} fingerprintDatabase
 * * Data fingerprint user
 *
 * @param {Array} adminFingerprints
 * * Data fingerprint admin
 */

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

// * Hindari magic number
const MIN_FMD_LENGTH = 50;

// * Field fingerprint (biar scalable)
const FINGERPRINT_KEYS = [
    "fmd",
    "second_fmd",
    "fmd_3",
    "fmd_4",
    "fmd_5",
    "fmd_6",
];

/**
 * * Build fingerprint payload
 * ? - Menghindari logic berulang
 * ? - Lebih scalable jika field bertambah
 */
function buildFingerprintPayload(database = []) {
    return database.flatMap((user) =>
        FINGERPRINT_KEYS.filter(
            (key) => user[key]?.length > MIN_FMD_LENGTH,
        ).map((key) => ({ id: user.id, fmd: user[key] })),
    );
}

export default function Attendance({
    interns = [],
    selectedDate,
    hariIni = "",
    fingerprintDatabase = [],
    adminFingerprints = [],
}) {
    const { flash = {} } = usePage().props;

    const [date, setDate] = useState(
        selectedDate || new Date().toISOString().split("T")[0],
    );

    const [searchTerm, setSearchTerm] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [status, setStatus] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [open, setOpen] = useState(false);

    /**
     * ? Kenapa pakai useMemo?
     * ? - Hindari rebuild payload setiap render
     */
    const fingerprintPayload = useMemo(() => {
        return buildFingerprintPayload(fingerprintDatabase);
    }, [fingerprintDatabase]);

    /**
     * ? Kenapa pakai useMemo?
     * ? - Filter + sort cukup mahal jika data besar
     */
    const filteredInterns = useMemo(() => {
        return interns
            .filter((intern) =>
                intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .sort((a, b) => {
                const aHadir = a?.attendances?.[0]?.check_in ? 1 : 0;
                const bHadir = b?.attendances?.[0]?.check_in ? 1 : 0;
                return aHadir - bHadir;
            });
    }, [interns, searchTerm]);

    /**
     * * Identify user dari fingerprint service
     */
    const identifyUser = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const res = await fetch(
                import.meta.env.VITE_FINGERPRINT_API ||
                    "http://localhost:5000/identify",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ database: fingerprintPayload }),
                    signal: controller.signal,
                },
            );

            clearTimeout(timeoutId); // Hapus timer jika berhasil
            const result = await res.json();

            //! Jika tidak dikenali
            if (!result.match) {
                throw new Error("Sidik jari tidak dikenali");
            }

            return result.user_id;
        } catch (err) {
            if (err.name === "AbortError") {
                throw new Error("Waktu scan habis (tidak ada jari dideteksi)");
            }
            // Jika error BUKAN AbortError, kemungkinan besar service mati
            throw new Error("Scan gagal! Silahkan coba lagi");
        }
    };

    /**
     * * Kirim attendance ke backend
     */
    const submitAttendance = async (userId) => {
        const res = await axios.post("/attendance", {
            intern_id: userId,
        });

        return res.data;
    };

    /**
     * * Main scan flow
     * ? Kenapa dipisah?
     * ? - Biar flow jelas (identify → submit)
     * ? - Mudah di-debug
     */
    const startScanAndVerify = useCallback(async () => {
        //! Prevent double click
        if (isScanning) return;

        setIsScanning(true);
        setStatus("Memindai jari...");
        setModalOpen(true);
        setFeedback(null);

        try {
            await new Promise((r) => setTimeout(r, 500));

            const userId = await identifyUser();

            setStatus("Terdeteksi! Menghubungi server...");

            const data = await submitAttendance(userId);

            setFeedback({
                type: "success",
                message: data.message || `Berhasil Masuk: ${data.name}`,
            });

            router.reload({ only: ["interns"] });
        } catch (err) {
            //! Error handling unified
            const message =
                err?.response?.data?.message ||
                err.message ||
                "Gagal mencatat presensi! Silahkan coba lagi";

            setFeedback({ type: "error", message });
        } finally {
            //* Pastikan state reset
            setStatus(null);
            setIsScanning(false);
        }
    }, [isScanning, fingerprintPayload]);

    const handleDateChange = (formatted) => {
        setDate(formatted);

        router.get(
            route("attendance.index"),
            { date: formatted },
            { preserveState: true, replace: true },
        );
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setIsScanning(false);
        setStatus(null);
        setFeedback(null);
    };

    // * Bersihkan feedback otomatis setelah 5 detik
    /**
     * ? Kenapa auto-clear feedback?
     * ? - Menghindari UI kotor / stale state
     */
    useEffect(() => {
        if (!feedback) return;
        const t = setTimeout(() => setFeedback(null), 5000);
        return () => clearTimeout(t);
    }, [feedback]);

    /**
     * * Auto close modal?
     * ? - UX lebih smooth tanpa perlu klik manual
     */
    useEffect(() => {
        if (!feedback || isScanning) return;
        const t = setTimeout(handleCloseModal, 2000);
        return () => clearTimeout(t);
    }, [feedback, isScanning]);

    const renderInternList = () => {
        if (filteredInterns.length === 0) {
            return (
                <div className="col-span-full py-16 text-center">
                    {interns.length === 0 ? (
                        <p className="text-lg font-medium text-gray-400">
                            Tidak ada intern terjadwal pada hari{" "}
                            <span className="font-bold capitalize">
                                {hariIni}
                            </span>
                            .
                        </p>
                    ) : (
                        <p className="text-lg font-medium text-gray-400">
                            Intern tidak ditemukan.
                        </p>
                    )}
                </div>
            );
        }

        return filteredInterns.map((intern) => (
            <InternCard
                key={intern.id}
                intern={intern}
                attendance={intern?.attendances?.[0] || null}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Absensi Harian" />

            {/* ── Navbar ── */}
            <div className="bg-white shadow-md">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-10 py-4 sm:px-14 lg:px-20">
                    <AdminGate adminFingerprints={adminFingerprints} />
                </div>
            </div>

            <div className="mx-auto max-w-[1400px] px-10 py-8 sm:px-14 lg:px-20">
                <div className="mb-8 flex justify-between">
                    <h1 className="hidden text-2xl font-semibold md:block">
                        Absensi Harian
                    </h1>
                    {/* Tombol Scan Kecil */}
                    <button
                        onClick={startScanAndVerify}
                        disabled={isScanning}
                        className={`flex transform items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition active:scale-95 ${
                            isScanning
                                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                                : "bg-blue-400 text-white hover:bg-blue-300"
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
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 19v-8m-3 7v-7c0-1 .6-3 3-3s3 2 3 3v6m-9-3v-3c0-2 1.2-6 6-6s6 4 6 6m0 4v-1M6.001 17H6M7 3H5a2 2 0 0 0-2 2v2m0 10v2a2 2 0 0 0 2 2h2m10 0h2a2 2 0 0 0 2-2v-2m0-10V5a2 2 0 0 0-2-2h-2"
                            />
                        </svg>

                        {isScanning
                            ? "Memindai..."
                            : "Klik untuk Scan & Presensi"}
                    </button>
                </div>

                {/* ── Search + Date ── */}
                <div className="mb-8 flex items-center">
                    {/* Date Picker */}
                    <div
                        className="relative flex cursor-pointer items-center"
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
                            value={new Date(date)}
                            onChange={(d) => {
                                if (!d) return;
                                const formatted = (Array.isArray(d) ? d[0] : d)
                                    .toISOString()
                                    .split("T")[0];
                                handleDateChange(formatted);
                            }}
                            open={open}
                            onClickOutside={() => setOpen(false)}
                            dateFormat="dd MMM yyyy"
                            className="text-md border-none bg-transparent font-medium text-blue-700"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            className="mr-4 -rotate-90"
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
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {renderInternList()}
                </div>
            </div>

            {/* Modal muncul saat scanning ATAU ada feedback */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="relative max-w-md rounded-xl bg-white p-8 shadow-lg">
                        {/* Pesan scanning */}
                        {isScanning && (
                            <div className="mb-2 flex animate-pulse flex-col items-center gap-8 text-blue-600">
                                <div className="flex aspect-square w-40 items-center justify-center">
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
                                <div className="flex flex-col items-center">
                                    <div className="flex aspect-square w-40 items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="70"
                                            height="70"
                                            viewBox="0 0 24 24"
                                        >
                                            <g
                                                fill="none"
                                                stroke="oklch(57.7% 0.245 27.325)"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                            >
                                                <path d="M7 16v-4.639c0-.51.1-.999.285-1.453M17 14v-1.185m-7.778-5.08A5.5 5.5 0 0 1 12 7c2.28 0 4.203 1.33 4.805 3.15M10 17v-2.177M14 17v-5.147C14 10.83 13.105 10 12 10s-2 .83-2 1.853v.794" />
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10a10 10 0 0 1-.458 3m-4.421 7.364l2.122-2.121m0 0l2.121-2.122m-2.121 2.122L17.12 18.12m2.122 2.122l2.121 2.121" />
                                            </g>
                                        </svg>
                                    </div>
                                    <p className="max-w-[25ch] text-center font-semibold text-red-700">
                                        {feedback.message}
                                    </p>
                                </div>
                            )}

                        {!isScanning &&
                            feedback &&
                            feedback.type === "success" && (
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex aspect-square w-40 items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="80"
                                            height="80"
                                            viewBox="0 0 24 24"
                                        >
                                            <g
                                                fill="none"
                                                stroke="oklch(52.7% 0.154 150.069)"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                            >
                                                <path d="M7 16v-4.639c0-.51.1-.999.285-1.453M17 16v-3.185m-7.778-5.08A5.5 5.5 0 0 1 12 7c2.28 0 4.203 1.33 4.805 3.15M10 17v-2.177M14 17v-5.147C14 10.83 13.105 10 12 10s-2 .83-2 1.853v.794" />
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10a10 10 0 0 1-.458 3M15.5 20.5l2 2l5-5" />
                                            </g>
                                        </svg>
                                    </div>
                                    <p className="text-center font-semibold text-green-700">
                                        {feedback.message}
                                    </p>
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}
