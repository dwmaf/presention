import React, { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";

export default function Kehadiran({
    fingerprintDatabase,
    hariIni,
    tanggalHariIni,
}) {
    const [status, setStatus] = useState(
        "Siap. Klik tombol di bawah untuk mulai sesi presensi.",
    );
    const [localData, setLocalData] = useState(fingerprintDatabase);
    const [matchResult, setMatchResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // Kumpulkan orang-orangnya, serta semua sidik jari (utama & cadangan) dalam array datar untuk C#
    const database_payload = [];
    localData.forEach((u) => {
        if (u.fmd) database_payload.push({ id: String(u.id), fmd: u.fmd });
        if (u.second_fmd)
            database_payload.push({ id: String(u.id), fmd: u.second_fmd });
    });

    const startScanAndVerify = async () => {
        if (database_payload.length === 0) {
            setStatus("Belum ada data sidik jari satupun untuk hari ini.");
            return;
        }

        setMatchResult(null);
        setIsScanning(true);
        setStatus(
            "Menghubungkan ke Local Service (Port 5000)... Silakan tempelkan jari saat lampu menyala.",
        );

        try {
            // Kita kirimkan array datar (tiap orang bisa punya sampai 2 elemen)
            const payload = { database: database_payload };

            const response = await fetch("http://localhost:5000/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.match) {
                // User ID dikembalikan oleh C# service
                const user = localData.find(
                    (u) => String(u.id) === String(result.user_id),
                );

                if (user) {
                    // Update status sedang memproses ke backend
                    setStatus(
                        `[⏳ PROSES] Mencatat presensi untuk ${user.name}...`,
                    );

                    try {
                        const token =
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content") || "";

                        const presensiRes = await fetch("/kehadiran", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": token,
                            },
                            body: JSON.stringify({ intern_id: user.id }),
                        });

                        const presensiData = await presensiRes.json();

                        if (presensiRes.ok && presensiData.success) {
                            setMatchResult({ success: true, user: user });
                            setStatus(
                                `[✅ ${presensiData.type === "check_in" ? "CHECK-IN" : "CHECK-OUT"} BERHASIL] Halo, ${user.name}! ${presensiData.message}`,
                            );

                            // Langsung update state UI agar reaktif tidak perlu reload
                            setLocalData((prev) =>
                                prev.map((intern) => {
                                    if (intern.id === user.id) {
                                        if (presensiData.type === "check_in") {
                                            return {
                                                ...intern,
                                                check_in: presensiData.time,
                                            };
                                        } else if (
                                            presensiData.type === "check_out"
                                        ) {
                                            return {
                                                ...intern,
                                                check_out: presensiData.time,
                                            };
                                        }
                                    }
                                    return intern;
                                }),
                            );
                        } else {
                            setMatchResult({ success: false, user: user }); // Tampilkan error mode
                            setStatus(
                                `[⚠️ DITOLAK] Halo, ${user.name}. ${presensiData.message}`,
                            );
                        }
                    } catch (err) {
                        console.error("Presensi API Error:", err);
                        setMatchResult({ success: false });
                        setStatus(
                            `[❌ ERROR] Gagal memproses presensi ke server.`,
                        );
                    }
                } else {
                    setStatus(
                        `Match found but User ID not in current list (ID: ${result.user_id})`,
                    );
                }
            } else {
                setMatchResult({ success: false });
                setStatus(
                    "❌ Tidak ada kecocokan. (" +
                        result.message +
                        ") Coba lagi.",
                );
            }
        } catch (err) {
            console.error(err);
            setStatus(
                "Error: Gagal menghubungi Local Service. Pastikan FingerprintBridge.exe berjalan.",
            );
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Head title="Presensi Harian" />

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Bagian Scanner (Kiri) */}
                <div className="flex-1 bg-white p-8 rounded-lg shadow-lg text-center h-fit">
                    <h1 className="text-3xl font-bold mb-2 text-indigo-700">
                        Presensi Harian
                    </h1>
                    <p className="text-gray-500 mb-8 font-medium">
                        <span className="text-indigo-600 font-bold">
                            {hariIni}, {tanggalHariIni}
                        </span>
                    </p>

                    <div
                        className={`mb-6 p-4 rounded-md border text-lg ${
                            status.includes("BERHASIL")
                                ? "bg-green-100 border-green-200 text-green-800 font-bold"
                                : status.includes("❌")
                                  ? "bg-red-100 border-red-200 text-red-700 font-medium"
                                  : "bg-blue-50 border-blue-200 text-blue-800"
                        }`}
                    >
                        {status}
                    </div>

                    <div className="mb-6">
                        <button
                            onClick={startScanAndVerify}
                            disabled={isScanning || localData.length === 0}
                            className={`px-8 py-4 rounded-md w-full shadow-lg font-bold text-lg transition transform 
                                ${isScanning ? "bg-gray-400 text-white cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105"}`}
                        >
                            {isScanning
                                ? "⏳ Sedang Menunggu Sidik Jari..."
                                : "MUKUL MESIN PRESENSI"}
                        </button>
                    </div>

                    <div className="mt-8 min-h-[140px]">
                        {matchResult && matchResult.success && (
                            <div className="p-6 bg-green-500 text-white rounded-lg animate-bounce shadow-xl">
                                <h2 className="text-4xl font-extrabold mb-2">
                                    ✅ TERIDENTIFIKASI
                                </h2>
                                <p className="text-2xl">
                                    {matchResult.user.name}
                                </p>
                            </div>
                        )}

                        {matchResult && !matchResult.success && (
                            <div className="p-6 bg-red-500 text-white rounded-lg shadow-xl">
                                <h2 className="text-3xl font-bold mb-2">
                                    ❌ TIDAK DIKENALI
                                </h2>
                                <p className="text-xl">
                                    Sidik jari tidak ditemukan di database hari
                                    ini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daftar Intern Hari Ini (Kanan) */}
                <div className="flex-1 bg-white p-8 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Daftar Jadwal Anak Magang
                        </h2>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {localData.length} Orang
                        </span>
                    </div>

                    {localData.length === 0 ? (
                        <p className="text-gray-500 italic">
                            Tidak ada anak magang yang dijadwalkan masuk hari
                            ini (Atau tidak ada yang memiliki sidik jari
                            terdaftar).
                        </p>
                    ) : (
                        <div className="grid gap-4">
                            {localData.map((intern) => (
                                <div
                                    key={intern.id}
                                    className="p-4 border border-gray-100 bg-gray-50 rounded-lg flex items-center justify-between shadow-sm"
                                >
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg">
                                            {intern.name}
                                        </p>
                                        <div className="flex gap-4 mt-1 text-sm font-mono">
                                            <p
                                                className={
                                                    intern.check_in !== "-" &&
                                                    intern.check_in
                                                        ? "text-green-600 font-bold"
                                                        : "text-gray-400"
                                                }
                                            >
                                                IN: {intern.check_in || "-"}
                                            </p>
                                            <p
                                                className={
                                                    intern.check_out !== "-" &&
                                                    intern.check_out
                                                        ? "text-blue-600 font-bold"
                                                        : "text-gray-400"
                                                }
                                            >
                                                OUT: {intern.check_out || "-"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <span
                                            title="Sidik Jari Utama"
                                            className={`text-xl ${intern.fmd ? "text-green-500" : "text-gray-300"}`}
                                        >
                                            ☝️
                                        </span>
                                        <span
                                            title="Sidik Jari Cadangan"
                                            className={`text-xl ${intern.second_fmd ? "text-blue-500" : "text-gray-300"}`}
                                        >
                                            ✌️
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
