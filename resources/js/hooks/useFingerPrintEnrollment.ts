/**
 * ============================================================================
 * Hook        : useFingerprintEnrollment
 * Layer       : Hooks
 *
 * Description:
 * Hook kustom untuk mengelola proses pendaftaran sidik jari.
 * Terbuka dan dapat digunakan kembali untuk Admin maupun Magang.
 * ============================================================================
 */

import { useMemo, useState } from "react";
import { toast } from "sonner";

/**
 * Representasi data anak magang (Intern) atau subjek pendaftar sidik jari.
 */
export interface Intern {
    /** ID unik data subjek. */
    id: number;
    /** Nama lengkap subjek. */
    name: string;
    /** Data FMD sidik jari utama 1. */
    fingerprint_data?: string | null;
    /** Data FMD sidik jari utama 2. */
    second_fingerprint_data?: string | null;
    /** Data FMD sidik jari utama 3. */
    fingerprint_data_3?: string | null;
    /** Data FMD sidik jari cadangan 1. */
    fingerprint_data_4?: string | null;
    /** Data FMD sidik jari cadangan 2. */
    fingerprint_data_5?: string | null;
    /** Data FMD sidik jari cadangan 3. */
    fingerprint_data_6?: string | null;
    [key: string]: unknown;
}

/**
 * Struktur grup sidik jari (utama atau cadangan).
 */
export interface FingerprintGroup {
    /** Identifikasi unik grup sidik jari. */
    id: "primary" | "backup";
    /** Judul tampilan grup. */
    title: string;
    /** Deskripsi petunjuk penggunaan scan. */
    subtitle: string;
    /** Daftar nama kolom database penyimpan data FMD. */
    dbKeys: readonly string[];
}

/**
 * State scan lokal per grup sidik jari.
 */
export interface GroupState {
    /** Jumlah langkah scan yang telah diselesaikan (0-3). */
    step: number;
    /** Array string FMD hasil scan lokal. */
    samples: string[];
    /** Array string gambar pratinjau sidik jari (base64). */
    images: string[];
    /** Pesan status proses scan. */
    status: string;
}

/**
 * Pemetaan state untuk seluruh grup sidik jari.
 */
export type StateMap = Record<"primary" | "backup", GroupState>;

/**
 * Respon dari service hardware C# local (port 5000).
 */
interface EnrollResponse {
    /** Status keberhasilan proses pendaftaran hardware. */
    success: boolean;
    /** String FMD sidik jari jika sukses. */
    fmd?: string;
    /** String gambar sidik jari (base64) jika ada. */
    image?: string;
    /** Pesan error jika gagal. */
    message?: string;
}

/**
 * Opsi parameter konfigurasi untuk hook useFingerprintEnrollment.
 */
export interface UseFingerprintOptions {
    /** Data objek target yang berisi status sidik jari (misal: Intern atau fingerStatus). */
    data: Record<string, unknown>;
    /** Daftar kolom database untuk grup utama. */
    primaryKeys: readonly string[];
    /** Daftar kolom database untuk grup cadangan. */
    backupKeys: readonly string[];
}

/**
 * Mengelola state capture sidik jari lokal dan komunikasi hardware.
 *
 * @param options Konfigurasi hook.
 * @returns State dan aksi pengelola pendaftaran sidik jari.
 */
export function useFingerprintEnrollment({
    data,
    primaryKeys,
    backupKeys,
}: UseFingerprintOptions) {
    const groups: readonly FingerprintGroup[] = useMemo(
        () => [
            {
                id: "primary",
                title: "Fingerprint Utama",
                subtitle:
                    "Scan 3x. Setiap scan geser sedikit posisi jari agar area terbaca merata (seperti daftar fingerprint di HP).",
                dbKeys: primaryKeys,
            },
            {
                id: "backup",
                title: "Fingerprint Cadangan",
                subtitle:
                    "Scan 3x untuk cadangan (boleh jari berbeda). Jika ingin mendaftar ulang, klik Reset Scan terlebih dahulu.",
                dbKeys: backupKeys,
            },
        ],
        [primaryKeys, backupKeys],
    );

    const groupHasDb = (g: FingerprintGroup): boolean =>
        g.dbKeys.some((k) => !!data?.[k]);

    const groupDbCount = (g: FingerprintGroup): number =>
        g.dbKeys.reduce((acc, k) => (data?.[k] ? acc + 1 : acc), 0);

    const [activeGroup, setActiveGroup] = useState<"primary" | "backup" | null>(
        null,
    );

    const [state, setState] = useState<StateMap>(() => {
        const init = {} as StateMap;
        for (const g of groups) {
            const count = groupDbCount(g);
            init[g.id] = {
                step: 0,
                samples: [],
                images: [],
                status:
                    count > 0
                        ? `Sudah tersimpan di database (${count}/3). Jika ingin daftar ulang, klik Reset Scan.`
                        : "Belum terdaftar. Mulai scan 3x.",
            };
        }
        return init;
    });

    const resetLocal = (groupId: "primary" | "backup"): void => {
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                step: 0,
                samples: [],
                images: [],
                status: "Local scan di-reset. Silakan scan 3x lagi.",
            },
        }));
    };

    // ! Membutuhkan service C# FingerprintBridge.exe berjalan di http://localhost:5000/enroll
    const startNextCapture = async (
        groupId: "primary" | "backup",
    ): Promise<void> => {
        if (activeGroup) return;

        const g = groups.find((x) => x.id === groupId);
        if (g && groupHasDb(g)) {
            setState((prev) => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    status: "Sudah tersimpan di database. Jika ingin daftar ulang, klik Reset Scan.",
                },
            }));
            return;
        }

        let isCapacityReached = false;

        setState((prev) => {
            const cur = prev[groupId];
            if (cur.samples.length >= 3) {
                isCapacityReached = true;
                return {
                    ...prev,
                    [groupId]: {
                        ...cur,
                        status: "Sudah 3/3. Klik Simpan atau Reset Scan untuk ulang scan.",
                    },
                };
            }
            return {
                ...prev,
                [groupId]: {
                    ...cur,
                    status: `Menunggu sidik jari... (Scan ${cur.samples.length + 1}/3). Tempelkan jari lalu geser sedikit area tiap scan.`,
                },
            };
        });

        if (isCapacityReached) return;

        setActiveGroup(groupId);

        try {
            const response = await fetch("http://localhost:5000/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const result = (await response.json()) as EnrollResponse;

            if (result.success && result.fmd) {
                setState((prev) => {
                    const cur = prev[groupId];
                    const nextSamples = [...cur.samples, result.fmd!].slice(
                        0,
                        3,
                    );
                    const nextImages = result.image
                        ? [...cur.images, result.image].slice(0, 3)
                        : cur.images;

                    const done = nextSamples.length === 3;

                    return {
                        ...prev,
                        [groupId]: {
                            ...cur,
                            step: nextSamples.length,
                            samples: nextSamples,
                            images: nextImages,
                            status: done
                                ? "✓ Scan 3/3 selesai. Klik Simpan untuk menyimpan ke database."
                                : `✓ Scan ${nextSamples.length}/3 berhasil. Lanjut scan berikutnya (ubah sedikit posisi jari).`,
                        },
                    };
                });
            } else {
                setState((prev) => ({
                    ...prev,
                    [groupId]: {
                        ...prev[groupId],
                        status: "Gagal: " + (result.message || "Unknown error"),
                    },
                }));
            }
        } catch {
            setState((prev) => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    status: "Error: Tidak dapat menghubungi Service C# (Port 5000). Pastikan FingerprintBridge.exe berjalan.",
                },
            }));
        } finally {
            setActiveGroup(null);
        }
    };

    const handleSaveSuccess = (groupId: "primary" | "backup"): void => {
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                status: "✓ Berhasil disimpan ke database!",
            },
        }));
        toast.success("Berhasil menyimpan sidik jari!");
    };

    const handleSaveError = (
        groupId: "primary" | "backup",
        msg: string,
    ): void => {
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                status: "Error: " + msg,
            },
        }));
        toast.error("Gagal menyimpan sidik jari: " + msg);
    };

    const handleResetSuccess = (groupId: "primary" | "backup"): void => {
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                step: 0,
                samples: [],
                images: [],
                status: "DB sudah di-reset. Sekarang kamu bisa scan ulang 3x lalu simpan.",
            },
        }));
        toast.success("Berhasil reset database sidik jari!");
    };

    const handleResetError = (
        groupId: "primary" | "backup",
        msg: string,
    ): void => {
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                status: "Error: " + msg,
            },
        }));
        toast.error("Gagal reset database: " + msg);
    };

    return {
        groups,
        activeGroup,
        state,
        startNextCapture,
        resetLocal,
        groupHasDb,
        groupDbCount,
        handleSaveSuccess,
        handleSaveError,
        handleResetSuccess,
        handleResetError,
    };
}
