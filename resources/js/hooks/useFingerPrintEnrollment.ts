/**
 * ============================================================================
 * Hook        : useFingerprintEnrollment
 * Layer       : Hooks
 *
 * Description:
 * Hook kustom pendaftaran sidik jari. Menggunakan penyempitan tipe (type narrowing)
 * untuk menghindari error pemanggilan metode pada union generic Inertia.
 * ============================================================================
 */

import { useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";

declare global {
    function route(
        name: string,
        params?: number | string | Record<string, unknown>,
    ): string;
}

export interface Intern {
    id: number;
    name: string;
    fingerprint_data?: string | null;
    second_fingerprint_data?: string | null;
    fingerprint_data_3?: string | null;
    fingerprint_data_4?: string | null;
    fingerprint_data_5?: string | null;
    fingerprint_data_6?: string | null;
    [key: string]: unknown;
}

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

/**
 * Hook kustom untuk mengelola pendaftaran sidik jari.
 *
 * @param intern Data anak magang.
 * @returns State dan aksi pendaftaran.
 */
export function useFingerprintEnrollment(intern: Intern) {
    const groups: readonly FingerprintGroup[] = useMemo(
        () => [
            {
                id: "primary",
                title: "Fingerprint Utama",
                subtitle:
                    "Scan 3x. Setiap scan geser sedikit posisi jari agar area terbaca merata (seperti daftar fingerprint di HP).",
                dbKeys: [
                    "fingerprint_data",
                    "second_fingerprint_data",
                    "fingerprint_data_3",
                ],
            },
            {
                id: "backup",
                title: "Fingerprint Cadangan",
                subtitle:
                    "Scan 3x untuk cadangan (boleh jari berbeda). Jika ingin mendaftar ulang, klik Reset Scan terlebih dahulu.",
                dbKeys: [
                    "fingerprint_data_4",
                    "fingerprint_data_5",
                    "fingerprint_data_6",
                ],
            },
        ],
        [],
    );

    const groupHasDb = (g: FingerprintGroup): boolean =>
        g.dbKeys.some((k) => !!intern?.[k]);

    const groupDbCount = (g: FingerprintGroup): number =>
        g.dbKeys.reduce((acc, k) => (intern?.[k] ? acc + 1 : acc), 0);

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

    const primaryForm = useForm({
        group: "primary" as const,
        samples: [] as string[],
    });

    const backupForm = useForm({
        group: "backup" as const,
        samples: [] as string[],
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

        // ? Discriminator untuk menghindari error pemanggilan setData pada union generic
        if (groupId === "primary") {
            primaryForm.setData("samples", []);
        } else {
            backupForm.setData("samples", []);
        }
    };

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

    const handleSaveSuccess = (groupId: "primary" | "backup"): void => {
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                status: "✓ Berhasil disimpan ke database! (Tidak menimpa data lama).",
            },
        }));
        toast.success("Berhasil menyimpan sidik jari!");
    };

    const handleSaveError = (
        groupId: "primary" | "backup",
        errors: Record<string, string>,
    ): void => {
        const msg =
            errors?.fingerprint ||
            "Gagal menyimpan. Cek validasi / pastikan Reset Scan jika sudah ada data.";
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                status: "Error: " + msg,
            },
        }));
        toast.error("Gagal menyimpan sidik jari: " + msg);
    };

    const submitGroup = (
        e: React.FormEvent<HTMLFormElement>,
        groupId: "primary" | "backup",
    ): void => {
        e.preventDefault();

        const samples = state[groupId].samples;
        if (!samples || samples.length < 3) {
            setState((prev) => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    status: "Belum lengkap. Harus 3/3 scan dulu sebelum simpan.",
                },
            }));
            toast.error("Scan belum lengkap. Harus 3/3 sebelum simpan.");
            return;
        }

        // ? Discriminator pemanggilan transform & post pada form generic
        if (groupId === "primary") {
            primaryForm.transform((data) => ({ ...data, samples }));
            primaryForm.post(
                route("interns.fingerprint.storeGroup", intern.id),
                {
                    onSuccess: () => handleSaveSuccess(groupId),
                    onError: (errors) => handleSaveError(groupId, errors),
                },
            );
        } else {
            backupForm.transform((data) => ({ ...data, samples }));
            backupForm.post(
                route("interns.fingerprint.storeGroup", intern.id),
                {
                    onSuccess: () => handleSaveSuccess(groupId),
                    onError: (errors) => handleSaveError(groupId, errors),
                },
            );
        }
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
        errors: Record<string, string>,
    ): void => {
        const msg =
            errors?.group || errors?.fingerprint || "Gagal reset Database.";
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                status: "Error: " + msg,
            },
        }));
        toast.error("Gagal reset database: " + msg);
    };

    const resetDbGroup = (groupId: "primary" | "backup"): void => {
        // ? Discriminator pemanggilan delete pada form generic
        if (groupId === "primary") {
            primaryForm.delete(
                route("interns.fingerprint.resetGroup", intern.id),
                {
                    onSuccess: () => handleResetSuccess(groupId),
                    onError: (errors) => handleResetError(groupId, errors),
                },
            );
        } else {
            backupForm.delete(
                route("interns.fingerprint.resetGroup", intern.id),
                {
                    onSuccess: () => handleResetSuccess(groupId),
                    onError: (errors) => handleResetError(groupId, errors),
                },
            );
        }
    };

    return {
        groups,
        activeGroup,
        state,
        forms: {
            primary: primaryForm,
            backup: backupForm,
        },
        startNextCapture,
        submitGroup,
        resetDbGroup,
        resetLocal,
        groupHasDb,
        groupDbCount,
    };
}
