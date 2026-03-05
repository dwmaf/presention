import { useState } from "react";
import { router } from "@inertiajs/react";

export default function AdminGate({ adminFingerprints = [] }) {
    const [isScanning, setIsScanning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);

    const handleAdminLogin = async () => {
        // Cek dulu, ada data admin gak?
        if (adminFingerprints.length === 0) {
            alert("Belum ada data sidik jari Admin yang terdaftar di sistem.");
            return;
        }

        setIsScanning(true);
        setShowModal(true);
        setStatus("Tempelkan jari Admin...");
        setErrorMsg(null);

        // [TAMBAHAN] Buat controller untuk membatalkan request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 10 Detik timeout

        try {
            // Tunggu sebentar biar UI muncul
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Panggil Service C#
            const response = await fetch("http://localhost:5000/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ database: adminFingerprints }),
                signal: controller.signal, // Sambungkan signal ke fetch
            });

            // Hapus timeout jika berhasil connect sebelum 10 detik
            clearTimeout(timeoutId);

            const result = await response.json();

            if (result.match) {
                setStatus(`✅ Halo Admin (ID: ${result.user_id})! Mengalihkan...`);

                setTimeout(() => {
                    // Redirect ke halaman login Laravel
                    // Karena sudah verifikasi biometrik, user tinggal masukkan password (atau bisa auto-login via magic link kalau mau lebih canggih)
                    // Untuk sekarang, kita arahkan ke login page biasa sebagai layer kedua (2FA).
                    window.location.href = "/login"; 
                }, 1000);
            } else {
                throw new Error("⛔ Akses Ditolak! Sidik jari tidak dikenali sebagai Admin.");
            }
        } catch (err) {
            console.error(err);
            setStatus("");
            // [TAMBAHAN] Tangani Error Timeout
            if (err.name === 'AbortError') {
                setErrorMsg("Waktu habis! Tidak ada jari terdeteksi.");
            } else {
                setErrorMsg(err.message || "Gagal terhubung ke scanner.");
            }

            // Tutup modal otomatis setelah error
            setTimeout(() => {
                handleClose();
            }, 2000);
        } finally {
            clearTimeout(timeoutId); // Pastikan timeout dibersihkan
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