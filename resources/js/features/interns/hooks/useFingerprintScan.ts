/**
 * ============================================================================
 * Hook        : useFingerprintScan
 * Layer       : Feature (Hook)
 *
 * Description:
 * Hook kustom untuk mengelola alur pemindaian biometrik sidik jari,
 * verifikasi identitas, dan pencatatan kehadiran ke server.
 * ============================================================================
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import axios from "axios";

/**
 * Representasi database sidik jari pengguna.
 */
interface FingerprintUser {
    id: number;
    fmd?: string | null;
    second_fmd?: string | null;
    fmd_3?: string | null;
    fmd_4?: string | null;
    fmd_5?: string | null;
    fmd_6?: string | null;
    [key: string]: string | number | null | undefined;
}

/**
 * Langkah-langkah status pemindaian sidik jari.
 */
export type ScanStep = "idle" | "scanning" | "submitting" | "success" | "error";

interface UseFingerprintScanProps {
    /** Database sidik jari karyawan magang */
    fingerprintDatabase: FingerprintUser[];
    /** Callback ketika pemindaian dan pencatatan kehadiran sukses */
    onSuccess?: () => void;
}

const MIN_FMD_LENGTH = 50;

const FINGERPRINT_KEYS = [
    "fmd",
    "second_fmd",
    "fmd_3",
    "fmd_4",
    "fmd_5",
    "fmd_6",
] as const;

/**
 * Membangun payload data sidik jari untuk dikirim ke layanan identifikasi.
 */
function buildFingerprintPayload(
    database: FingerprintUser[] = [],
): Array<{ id: number; fmd: string }> {
    return database.flatMap((user) =>
        FINGERPRINT_KEYS.filter((key) => {
            const val = user[key];
            return typeof val === "string" && val.length > MIN_FMD_LENGTH;
        }).map((key) => ({
            id: user.id,
            fmd: user[key] as string,
        })),
    );
}

/**
 * Mengirim data absensi ke backend server.
 */
const submitAttendance = async (
    userId: number,
): Promise<{ message?: string; name?: string }> => {
    const res = await axios.post<{ message?: string; name?: string }>(
        "/attendance",
        {
            intern_id: userId,
        },
    );
    return res.data;
};

/**
 * Hook untuk memproses pemindaian biometrik sidik jari.
 */
export function useFingerprintScan({
    fingerprintDatabase,
    onSuccess,
}: UseFingerprintScanProps) {
    const [scanStep, setScanStep] = useState<ScanStep>("idle");
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const isScanning = scanStep === "scanning" || scanStep === "submitting";

    // ? Derivasi teks status pemindaian untuk visualisasi UI
    const statusText = useMemo(() => {
        switch (scanStep) {
            case "scanning":
                return "Memindai jari...";
            case "submitting":
                return "Terdeteksi! Menghubungi server...";
            default:
                return null;
        }
    }, [scanStep]);

    const fingerprintPayload = useMemo(() => {
        return buildFingerprintPayload(fingerprintDatabase);
    }, [fingerprintDatabase]);

    const identifyUser = useCallback(async (): Promise<number> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const fingerprintApi =
                (import.meta.env.VITE_FINGERPRINT_API as string) ||
                "http://localhost:5000/identify";

            const res = await fetch(fingerprintApi, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ database: fingerprintPayload }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = (await res.json()) as {
                match: boolean;
                user_id: number;
            };

            if (!result.match) {
                throw new Error("Sidik jari tidak dikenali");
            }

            return result.user_id;
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                throw new Error("Waktu scan habis (tidak ada jari dideteksi)");
            }
            throw new Error("Scan gagal! Silahkan coba lagi");
        }
    }, [fingerprintPayload]);

    const startScan = useCallback(async () => {
        if (isScanning) return;

        setScanStep("scanning");
        setFeedback(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const userId = await identifyUser();

            setScanStep("submitting");
            const data = await submitAttendance(userId);

            setFeedback({
                type: "success",
                message: data.message || `Berhasil Masuk: ${data.name || ""}`,
            });
            setScanStep("success");

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            let message = "Gagal mencatat presensi! Silahkan coba lagi";
            if (err instanceof Error) {
                message = err.message;
            } else if (axios.isAxiosError(err) && err.response?.data?.message) {
                message = err.response.data.message as string;
            }
            setFeedback({ type: "error", message });
            setScanStep("error");
        }
    }, [isScanning, identifyUser, onSuccess]);

    const resetScan = useCallback(() => {
        setScanStep("idle");
        setFeedback(null);
    }, []);

    // ? Menutup modal dan membersihkan feedback secara otomatis
    useEffect(() => {
        if (!feedback) return;
        const timeout = setTimeout(() => setFeedback(null), 5000);
        return () => clearTimeout(timeout);
    }, [feedback]);

    useEffect(() => {
        if (scanStep === "success" || scanStep === "error") {
            const timeout = setTimeout(resetScan, 2000);
            return () => clearTimeout(timeout);
        }
    }, [scanStep, resetScan]);

    return {
        scanStep,
        feedback,
        statusText,
        isScanning,
        startScan,
        resetScan,
    };
}
