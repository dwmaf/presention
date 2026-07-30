/**
 * ============================================================================
 * Component   : AdminGate
 * Layer       : UI (Component)
 *
 * Description:
 * Gerbang autentikasi admin menggunakan pemindai biometrik sidik jari.
 * Membuka entri rahasia admin dan mengalihkan ke halaman masuk (login).
 * ============================================================================
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

/**
 * Data sidik jari admin.
 */
interface AdminFingerprint {
    id: number;
    fmd: string;
}

/**
 * Properti untuk komponen AdminGate.
 */
export interface AdminGateProps {
    /** Kumpulan data sidik jari admin dari database */
    adminFingerprints?: AdminFingerprint[];
    /** Judul utama instansi/sistem */
    title?: string;
    /** Subjudul instansi/sistem */
    subtitle?: string;
}

/**
 * Komponen gerbang autentikasi admin.
 *
 * @param props Properti komponen.
 * @returns Komponen logo pemicu login admin.
 */
export default function AdminGate({
    adminFingerprints = [],
    title = "UPA PKK",
    subtitle = "Attendance System",
}: AdminGateProps) {
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleClose = useCallback(() => {
        setShowModal(false);
        setIsScanning(false);
        setStatus("");
        setErrorMsg(null);
    }, []);

    /**
     * Memulai pemindaian sidik jari admin.
     */
    const handleAdminLogin = async () => {
        // ! Guard Clause jika database sidik jari admin kosong
        if (adminFingerprints.length === 0) {
            toast.error(
                "Belum ada data sidik jari Admin yang terdaftar di sistem.",
            );
            return;
        }

        setIsScanning(true);
        setShowModal(true);
        setStatus("Tempelkan jari Admin...");
        setErrorMsg(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const response = await fetch("http://localhost:5000/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ database: adminFingerprints }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = (await response.json()) as {
                match: boolean;
                user_id: number;
            };

            if (result.match) {
                setStatus(`Halo Admin (ID: ${result.user_id})! Mengalihkan...`);
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            } else {
                throw new Error(
                    "Akses Ditolak! Sidik jari tidak dikenali sebagai Admin.",
                );
            }
        } catch (err) {
            clearTimeout(timeoutId);
            setStatus("");

            if (err instanceof Error && err.name === "AbortError") {
                setErrorMsg("Waktu habis! Tidak ada jari terdeteksi.");
            } else if (err instanceof Error) {
                setErrorMsg(err.message || "Gagal terhubung ke scanner.");
            } else {
                setErrorMsg("Gagal terhubung ke scanner.");
            }

            // Tutup dialog otomatis setelah terjadi error
            setTimeout(() => {
                handleClose();
            }, 2000);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <>
            {/* Trigger Area Logo */}
            <div
                onClick={handleAdminLogin}
                className="group flex cursor-pointer items-center gap-3 select-none"
            >
                <img
                    src="/foto/upa-pkk-logo.jpg.jpeg"
                    alt="UPA PKK Logo"
                    className="size-11 flex-shrink-0 rounded-full object-cover transition-transform group-hover:scale-105"
                />
                <div>
                    <p className="text-foreground group-hover:text-primary text-xl font-bold tracking-tighter transition-colors">
                        {title}
                    </p>
                    <p className="text-muted-foreground text-sm font-medium">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Dialog Modal Hasil Pemindaian */}
            <Dialog
                open={showModal}
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleClose();
                }}
            >
                <DialogContent
                    showCloseButton={!isScanning}
                    className="flex flex-col items-center justify-center gap-4 p-6 text-center sm:max-w-sm"
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>Security Check</DialogTitle>
                    </DialogHeader>

                    <h3 className="text-foreground text-lg font-bold">
                        Security Check
                    </h3>

                    {isScanning ? (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <Loader2 className="text-primary h-12 w-12 animate-spin" />
                            <p className="text-primary animate-pulse text-sm font-medium">
                                {status}
                            </p>
                        </div>
                    ) : errorMsg ? (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="bg-destructive/10 text-destructive flex aspect-square w-16 items-center justify-center rounded-full">
                                <Lock className="h-8 w-8" />
                            </div>
                            <p className="text-destructive max-w-[25ch] text-sm font-bold">
                                {errorMsg}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="flex aspect-square w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                {status}
                            </p>
                        </div>
                    )}

                    {!isScanning && (
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="text-muted-foreground hover:bg-muted mt-2 text-sm"
                        >
                            Batal
                        </Button>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
