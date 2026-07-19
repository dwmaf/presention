/**
 * ============================================================================
 * Component   : AdminFingerprintEnrollment
 * Layer       : Pages
 *
 * Description:
 * Halaman pendaftaran sidik jari untuk Admin.
 * Menggunakan hook useFingerprintEnrollment untuk mengelola state hardware.
 * ============================================================================
 */

import React, { useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useFingerprintEnrollment } from "@/hooks/useFingerPrintEnrollment";

export interface AdminFingerprintEnrollmentProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            [key: string]: unknown;
        };
    };
    fingerStatus: Record<string, boolean>;
}

/**
 * Halaman utama pendaftaran sidik jari Admin.
 *
 * @param props Properti komponen.
 * @returns Elemen halaman pendaftaran sidik jari Admin.
 */
export default function AdminFingerprintEnrollment({
    fingerStatus,
}: AdminFingerprintEnrollmentProps) {
    const primaryForm = useForm({
        group: "primary" as const,
        samples: [] as string[],
    });
    const backupForm = useForm({
        group: "backup" as const,
        samples: [] as string[],
    });

    // ? Mengelompokkan form berdasarkan ID grup untuk memudahkan rujukan dinamis
    const forms = {
        primary: primaryForm,
        backup: backupForm,
    };

    const dbKeysPrimary = useMemo(
        () => ["fingerprint_1", "fingerprint_2", "fingerprint_3"] as const,
        [],
    );
    const dbKeysBackup = useMemo(
        () => ["fingerprint_4", "fingerprint_5", "fingerprint_6"] as const,
        [],
    );

    // * Menggunakan hook kustom yang sudah didecoupling dari data intern
    const {
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
    } = useFingerprintEnrollment({
        data: fingerStatus,
        primaryKeys: dbKeysPrimary,
        backupKeys: dbKeysBackup,
    });

    // * Mengirimkan data sidik jari ke server Laravel
    const submitGroup = (
        e: React.FormEvent<HTMLFormElement>,
        groupId: "primary" | "backup",
    ): void => {
        e.preventDefault();
        const samples = state[groupId].samples;
        const currentForm = forms[groupId];

        currentForm.transform((data) => ({ ...data, samples }));
        currentForm.post(route("profile.fingerprint.storeGroup"), {
            onSuccess: () => handleSaveSuccess(groupId),
            onError: (errors) => {
                const msg = errors?.fingerprint || "Gagal menyimpan.";
                handleSaveError(groupId, msg);
            },
        });
    };

    // * Melakukan reset data sidik jari di database
    const resetDbGroup = (groupId: "primary" | "backup"): void => {
        if (
            !confirm(
                "Yakin ingin mereset data jari admin ini? Anda harus scan ulang.",
            )
        )
            return;

        const currentForm = forms[groupId];
        currentForm.delete(route("profile.fingerprint.resetGroup"), {
            onSuccess: () => {
                resetLocal(groupId);
                handleResetSuccess(groupId);
            },
            onError: (errors) => {
                const msg =
                    errors?.group ||
                    errors?.fingerprint ||
                    "Gagal reset database.";
                handleResetError(groupId, msg);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Admin Fingerprint" />

            <div>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-start justify-between">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter">
                                Setup Sidik Jari Admin
                            </h2>

                            <p className="text-gray-600">
                                Kelola akses login Admin menggunakan scan jari.
                            </p>

                            <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                                <span className="animate-pulse">●</span>{" "}
                                Pastikan FingerprintBridge.exe berjalan sebelum
                                memulai scan
                            </p>
                        </div>
                        <Link
                            href={route("interns.index")}
                            className="flex items-center gap-2 font-semibold text-blue-700 hover:underline"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                style={{ transform: "rotate(-90deg)" }}
                            >
                                <path
                                    fill="none"
                                    stroke="oklch(48.8% 0.243 264.376)"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 5v14m6-8l-6-6m-6 6l6-6"
                                />
                            </svg>
                            Kembali
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {groups.map((g) => {
                            const st = state[g.id];
                            const done = st.samples.length === 3;
                            const hasDb = groupHasDb(g);
                            const dbCount = groupDbCount(g);
                            const isProcessing = forms[g.id].processing;

                            return (
                                <div
                                    key={g.id}
                                    className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                                >
                                    {/* Bagian Header Card */}
                                    <div className="border-b border-gray-50 bg-gray-50/50 p-5">
                                        <div className="mb-2 flex items-center gap-3">
                                            {hasDb ? (
                                                <div className="text-green-500">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                                        <path d="m9 12 2 2 4-4" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <line
                                                            x1="12"
                                                            y1="8"
                                                            x2="12"
                                                            y2="12"
                                                        />
                                                        <line
                                                            x1="12"
                                                            y1="16"
                                                            x2="12.01"
                                                            y2="16"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            <h4 className="text-lg font-bold text-gray-800">
                                                {g.title}
                                            </h4>
                                        </div>

                                        <p className="mb-3 text-sm text-gray-500">
                                            {g.subtitle}
                                        </p>

                                        <div className="flex items-center justify-between rounded border border-gray-100 bg-white p-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">
                                                    Local Scan:
                                                </span>{" "}
                                                <span className="font-bold text-indigo-600">
                                                    {st.samples.length}/3
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">
                                                    Database:
                                                </span>{" "}
                                                <span
                                                    className={`font-bold ${hasDb ? "text-emerald-600" : "text-gray-400"}`}
                                                >
                                                    {hasDb
                                                        ? `${dbCount}/3 Terdaftar`
                                                        : "Kosong"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Konten Utama Scan */}
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="mb-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 p-4">
                                            <div className="grid grid-cols-3 gap-3">
                                                {[0, 1, 2].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex aspect-square items-center justify-center overflow-hidden rounded-lg border ${
                                                            st.images[i]
                                                                ? "border-white bg-white shadow"
                                                                : "border-gray-200 bg-white"
                                                        }`}
                                                    >
                                                        {st.images[i] ? (
                                                            <img
                                                                src={
                                                                    st.images[i]
                                                                }
                                                                alt={`Scan ${i + 1}`}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        ) : (
                                                            <span className="text-xs font-bold text-gray-300">
                                                                #{i + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <p
                                                className={`mt-4 px-2 text-center text-sm font-medium ${
                                                    st.status.includes(
                                                        "Gagal",
                                                    ) ||
                                                    st.status.includes("Error")
                                                        ? "text-red-500"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {st.status}
                                            </p>
                                        </div>

                                        {/* Aksi / Tombol Kontrol */}
                                        <div className="mt-auto space-y-3">
                                            <button
                                                onClick={() =>
                                                    startNextCapture(g.id)
                                                }
                                                disabled={
                                                    activeGroup !== null ||
                                                    hasDb ||
                                                    done
                                                }
                                                className="shadow- sm flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {activeGroup === g.id && (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                )}
                                                {hasDb
                                                    ? "Terkunci (Sudah Terdaftar)"
                                                    : done
                                                      ? "Selesai (Siap Simpan)"
                                                      : activeGroup === g.id
                                                        ? "Scanning..."
                                                        : `Mulai Scan (${st.samples.length + 1}/3)`}
                                            </button>

                                            <button
                                                onClick={() => resetLocal(g.id)}
                                                disabled={
                                                    activeGroup !== null ||
                                                    st.samples.length === 0
                                                }
                                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Ulangi Scan
                                            </button>

                                            {done && !hasDb && (
                                                <form
                                                    onSubmit={(e) =>
                                                        submitGroup(e, g.id)
                                                    }
                                                >
                                                    <button
                                                        type="submit"
                                                        disabled={isProcessing}
                                                        className="mt-2 w-full rounded-lg bg-emerald-600 py-2.5 font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                                                    >
                                                        {isProcessing
                                                            ? "Menyimpan ke Users..."
                                                            : "Simpan Admin ID"}
                                                    </button>
                                                </form>
                                            )}

                                            {hasDb && (
                                                <div className="border-t border-gray-100 pt-2">
                                                    <button
                                                        onClick={() =>
                                                            resetDbGroup(g.id)
                                                        }
                                                        disabled={
                                                            isProcessing ||
                                                            activeGroup !== null
                                                        }
                                                        className="w-full rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {isProcessing
                                                            ? "Mereset..."
                                                            : "Hapus & Daftar Ulang"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
                        <h5 className="mb-1 font-bold text-blue-800">
                            Catatan Keamanan
                        </h5>
                        <p className="text-sm text-blue-700">
                            Data sidik jari ini digunakan sebagai kunci akses
                            "Admin Gate" di halaman depan. Pastikan mendaftarkan
                            minimal 1 grup (Utama) agar bisa mengakses Dashboard
                            tanpa login password manual.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
