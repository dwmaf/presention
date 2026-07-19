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

export interface FingerprintGroup {
    id: "primary" | "backup";
    title: string;
    subtitle: string;
    dbKeys: readonly string[];
}

export interface GroupState {
    step: number;
    samples: string[];
    images: string[];
    status: string;
}

export type StateMap = Record<"primary" | "backup", GroupState>;

interface EnrollResponse {
    success: boolean;
    fmd?: string;
    image?: string;
    message?: string;
}

export interface UseFingerprintOptions {
    /** Data objek target yang berisi status sidik jari (misal: Intern atau fingerStatus) */
    data: Record<string, any>;
    /** Kolom database untuk grup utama */
    primaryKeys: readonly string[];
    /** Kolom database untuk grup cadangan */
    backupKeys: readonly string[];
}

/**
 * Mengelola state capture sidik jari lokal dan komunikasi hardware.
 *
 * @param options Konfigurasi hook.
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

    // * Memeriksa apakah database sudah memiliki data sidik jari
    const groupHasDb = (g: FingerprintGroup): boolean =>
        g.dbKeys.some((k) => !!data?.[k]);

    // * Menghitung jumlah data sidik jari yang tersimpan di database
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

    // * Mereset state scan lokal untuk satu grup
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

    // * Menghubungi daemon hardware C# untuk menangkap sidik jari berikutnya
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

        const current = state[groupId];
        if (current.samples.length >= 3) {
            setState((prev) => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    status: "Sudah 3/3. Klik Simpan atau Reset Scan untuk ulang scan.",
                },
            }));
            return;
        }

        setActiveGroup(groupId);

        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                status: `Menunggu sidik jari... (Scan ${prev[groupId].samples.length + 1}/3). Tempelkan jari lalu geser sedikit area tiap scan.`,
            },
        }));

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
        } catch (err) {
            console.error(err);
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

    // * Mengubah status UI ke berhasil simpan
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

    // * Mengubah status UI ke error simpan
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

    // * Mengubah status UI ke berhasil reset
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

    // * Mengubah status UI ke error reset
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
