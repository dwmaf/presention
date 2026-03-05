import { useState } from "react";
import { router } from "@inertiajs/react";

export default function AdminGate({ fingerprintDatabase = [] }) {
    const [isScanning, setIsScanning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);

    // --- LOGIC: DATA ADMIN (Hardcode Sementara) ---
    // Masukkan ID Intern yang dipercaya sebagai admin di sini
    const ADMIN_IDS = [43, 2];

    const handleAdminLogin = async () => {
        setIsScanning(true);
        setShowModal(true);
        setStatus("Tempelkan jari Admin...");
        setErrorMsg(null);

        // Filter database agar valid (sama seperti logic presensi tapi internal sini aja)
        const validDatabase = [];
        fingerprintDatabase.forEach((u) => {
            if (u.fmd && u.fmd.length > 50) validDatabase.push({ id: u.id, fmd: u.fmd });
            if (u.second_fmd && u.second_fmd.length > 50) validDatabase.push({ id: u.id, fmd: u.second_fmd });
            // Tambahkan jari 3-6 jika perlu
        });

        try {
            // Tunggu sebentar biar UI muncul
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Panggil Service C#
            const response = await fetch("http://localhost:5000/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ database: validDatabase }),
            });

            const result = await response.json();

            if (result.match) {
                const userId = parseInt(result.user_id);

                if (ADMIN_IDS.includes(userId)) {
                    setStatus("✅ Akses Diterima! Mengalihkan...");
                    setTimeout(() => {
                        window.location.href = "/login"; // Redirect ke Login Page
                    }, 1000);
                } else {
                    throw new Error("⛔ Akses Ditolak! Anda bukan Admin.");
                }
            } else {
                throw new Error("❌ Sidik jari tidak dikenali.");
            }
        } catch (err) {
            console.error(err);
            setStatus("");
            setErrorMsg(err.message || "Gagal terhubung ke scanner.");

            // Tutup modal otomatis setelah error
            setTimeout(() => {
                handleClose();
            }, 2000);
        } finally {
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setIsScanning(false);
        setStatus("");
        setErrorMsg(null);
    };

    return (
        <>
            {/* --- TRIGGER (LOGO) --- */}
            <div
                onClick={handleAdminLogin}
                className="flex items-center gap-3"
            >
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
            </div>

            {/* --- MODAL KHUSUS ADMIN --- */}
            {showModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center border-t-4 border-blue-600">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Security Check</h3>

                        {isScanning ? (
                            <div className="flex flex-col items-center py-4">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-blue-600 font-medium animate-pulse">{status}</p>
                            </div>
                        ) : errorMsg ? (
                            <div className="py-4">
                                <div className="text-4xl mb-2">🔒</div>
                                <p className="text-red-600 font-bold">{errorMsg}</p>
                            </div>
                        ) : (
                            <div className="py-4">
                                <p className="text-green-600 font-bold text-lg">{status}</p>
                            </div>
                        )}

                        <button
                            onClick={handleClose}
                            className="mt-4 text-gray-400 hover:text-gray-600 text-sm underline"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}