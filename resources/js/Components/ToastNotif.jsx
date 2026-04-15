import { createContext, useContext, useState, useCallback } from "react";

/**
 * * Toast Notification System (Context-based)
 * * ----------------------------------------
 * * Sistem notifikasi global (toast) menggunakan React Context.
 *
 * ? Kenapa pakai Context?
 * ? - Agar bisa dipanggil dari mana saja tanpa prop drilling
 * ? - Cocok untuk global UI seperti notifikasi
 *
 * ! Responsibility:
 * - Menyediakan function addToast ke seluruh aplikasi
 * - Menyimpan & mengelola state daftar toast
 * - Render UI toast di layer paling atas (fixed position)
 */

/**
 * * useToast
 * * ----------------------------------------
 * * Custom hook untuk mengakses context toast
 *
 * @returns {{ addToast: Function }}
 * - addToast(message, type, duration)
 *
 * ? Cara pakai:
 * const { addToast } = useToast();
 * addToast("Berhasil disimpan!", "success");
 */
const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

/**
 * =========================================================
 * ? ToastNotif Provider
 * =========================================================
 */

/**
 * * ToastNotif Component
 * * ----------------------------------------
 * * Provider yang membungkus aplikasi dan menyediakan
 * * sistem toast notification.
 *
 * @param {ReactNode} children
 * - Semua komponen aplikasi yang membutuhkan akses toast
 *
 * ? Fitur:
 * - Multi toast (bisa tampil banyak sekaligus)
 * - Auto dismiss berdasarkan duration
 * - Manual close (button ×)
 * - Support type: success | error | info
 */
export function ToastNotif({ children }) {
    /**
     * * State: toasts
     * * Menyimpan daftar toast aktif
     * * Format: { id, message, type }
     */
    const [toasts, setToasts] = useState([]);

    /**
     * * addToast
     * * ----------------------------------------
     * * Menambahkan toast baru ke dalam state
     *
     * @param {string} message
     * - Pesan yang ditampilkan
     *
     * @param {"success" | "error" | "info"} [type="info"]
     * - Tipe toast (menentukan warna)
     *
     * @param {number} [duration=3000]
     * - Durasi tampil (ms) sebelum auto close
     *
     * ? Kenapa pakai useCallback?
     * - Supaya tidak re-create function setiap render
     * - Berguna jika dipass ke banyak komponen
     */
    const addToast = useCallback((message, type = "info", duration = 3000) => {
        /**
         * * Generate unique ID
         * - Kombinasi timestamp + random untuk menghindari collision
         */
        const id = Date.now() + Math.random();

        /**
         * * Tambahkan toast baru
         */
        setToasts((prev) => [...prev, { id, message, type }]);

        /**
         * * Auto remove setelah duration
         */
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    /**
     * * removeToast
     * * ----------------------------------------
     * * Menghapus toast secara manual (klik tombol ×)
     *
     * @param {number} id
     * - ID toast yang ingin dihapus
     */
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* =========================================================
                * Toast Container (UI Layer)
                * Posisi fixed di kanan atas layar
            ========================================================= */}
            <div className="fixed right-5 top-5 z-[9999] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-2 rounded px-4 py-3 text-white shadow ${toast.type === "success" ? "bg-green-500" : ""} ${toast.type === "error" ? "bg-red-500" : ""} ${toast.type === "info" ? "bg-blue-500" : ""} `}
                    >
                        {/* Message */}
                        <span>{toast.message}</span>

                        {/* Close Button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 text-white/70 hover:text-white"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
