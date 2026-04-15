import { useState } from "react";

/**
 * * AdminGate Component
 * * ----------------------------------------
 * * Gerbang autentikasi admin menggunakan fingerprint scanner
 *
 * ? Kenapa dibuat terpisah?
 * ? - Logic biometric cukup kompleks (async + error handling)
 * ? - Tidak semua user butuh fitur ini
 * ? - Memudahkan maintenance & scaling (misal nanti tambah face recognition)
 *
 * ! Behavior:
 * - Trigger scan saat logo diklik
 * - Kirim data fingerprint ke service (C# API)
 * - Validasi apakah fingerprint cocok dengan admin
 * - Redirect ke halaman login jika valid (layer kedua / 2FA)
 * - Tampilkan feedback (loading / error / success)
 *
 * @param {Array} adminFingerprints - Data fingerprint admin dari database
 * ! default [] untuk menghindari crash saat undefined
 */
export default function AdminGate({ adminFingerprints = [] }) {
    /**
     * * State Management
     * * ----------------------------------------
     * - isScanning : apakah proses scan fingerprint sedang berjalan
     * - showModal  : kontrol visibility modal
     * - status     : pesan status ke user
     * - errorMsg   : pesan error
     */
    const [isScanning, setIsScanning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);

    /**
     * * Handle Admin Login (Fingerprint Scan)
     */
    const handleAdminLogin = async () => {
        /**
         * ! Guard Clause
         * ! ----------------------------------------
         * Hindari request jika tidak ada data fingerprint
         */
        if (adminFingerprints.length === 0) {
            alert("Belum ada data sidik jari Admin yang terdaftar di sistem.");
            return;
        }

        setIsScanning(true);
        setShowModal(true);
        setStatus("Tempelkan jari Admin...");
        setErrorMsg(null);

        /**
         * * AbortController
         * * ----------------------------------------
         * Untuk membatalkan request jika terlalu lama (timeout)
         */
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 10 Detik timeout

        try {
            /**
             * * Delay kecil untuk UX
             * ? Supaya modal muncul dulu sebelum request dimulai
             */
            await new Promise((resolve) => setTimeout(resolve, 500));

            /**
             * * Request ke service fingerprint (C#)
             */
            const response = await fetch("http://localhost:5000/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ database: adminFingerprints }),
                signal: controller.signal, // Sambungkan signal ke fetch
            });

            // Hapus timeout jika berhasil connect sebelum 10 detik
            clearTimeout(timeoutId);

            const result = await response.json();

            /**
             * * Validasi hasil fingerprint
             */
            if (result.match) {
                setStatus(
                    `✅ Halo Admin (ID: ${result.user_id})! Mengalihkan...`,
                );

                /**
                 * * Redirect (2FA Layer)
                 * ? Setelah biometrik lolos, tetap arahkan ke login
                 */
                setTimeout(() => {
                    // Redirect ke halaman login Laravel
                    // Karena sudah verifikasi biometrik, user tinggal masukkan password (atau bisa auto-login via magic link kalau mau lebih canggih)
                    // Untuk sekarang, kita arahkan ke login page biasa sebagai layer kedua (2FA).
                    window.location.href = "/login";
                }, 1000);
            } else {
                throw new Error(
                    "⛔ Akses Ditolak! Sidik jari tidak dikenali sebagai Admin.",
                );
            }
        } catch (err) {
            console.error(err);
            setStatus("");
            // [TAMBAHAN] Tangani Error Timeout
            if (err.name === "AbortError") {
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
            {/*
             * * Trigger Area (Logo)
             * ? Bisa dianggap sebagai "hidden admin entry"
             */}
            <div onClick={handleAdminLogin} className="flex items-center gap-3">
                <img
                    src="/foto/upa-pkk-logo.jpg.jpeg"
                    alt="UPA PKK Logo"
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
                <div>
                    <p className="text-lg font-bold leading-tight text-gray-900">
                        UPA PKK
                    </p>
                    <p className="text-sm text-gray-500">Attendance System</p>
                </div>
            </div>

            {/*
             * * Modal Fingerprint
             * * ----------------------------------------
             * Menampilkan:
             * - Loading (scan)
             * - Error message
             * - Success message
             */}
            {showModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-xl border-t-4 border-blue-600 bg-white p-6 text-center shadow-2xl">
                        <h3 className="mb-4 text-lg font-bold text-gray-800">
                            Security Check
                        </h3>

                        {isScanning ? (
                            <div className="flex flex-col items-center py-4">
                                <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                                <p className="animate-pulse font-medium text-blue-600">
                                    {status}
                                </p>
                            </div>
                        ) : errorMsg ? (
                            <div className="py-4">
                                <div className="mb-2 text-4xl">🔒</div>
                                <p className="font-bold text-red-600">
                                    {errorMsg}
                                </p>
                            </div>
                        ) : (
                            <div className="py-4">
                                <p className="text-lg font-bold text-green-600">
                                    {status}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleClose}
                            className="mt-4 text-sm text-gray-400 underline hover:text-gray-600"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
