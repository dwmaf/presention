import React, { useMemo, useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useToast } from "@/Components/ToastNotif";

export default function AdminFingerprintEnrollment({ auth, fingerStatus }) {
    const { addToast } = useToast();

    // Mapping 2 Group (Primary & Backup) sama seperti NambahSidikJari
    const groups = useMemo(
        () => [
            {
                id: "primary",
                title: "Jari Admin Utama",
                subtitle:
                    "Scan 3x untuk jari utama. Geser sedikit posisi jari setiap kali scan agar akurasi tinggi.",
                dbKeys: ["fingerprint_1", "fingerprint_2", "fingerprint_3"],
            },
            {
                id: "backup",
                title: "Jari Admin Cadangan",
                subtitle: (
                    <>
                        Scan 3x untuk jari cadangan (misal: jari tangan kiri). 
                        Berguna jika jari utama terluka atau sulit terbaca.
                    </>
                ),
                dbKeys: ["fingerprint_4", "fingerprint_5", "fingerprint_6"],
            },
        ],
        [],
    );

    // Helper cek status DB dari props fingerStatus
    const groupHasDb = (g) => g.dbKeys.some((k) => !!fingerStatus?.[k]);
    const groupDbCount = (g) =>
        g.dbKeys.reduce((acc, k) => (fingerStatus?.[k] ? acc + 1 : acc), 0);

    const [activeGroup, setActiveGroup] = useState(null); // "primary" | "backup" | null

    // State Lokal (capture images, status text)
    const [state, setState] = useState(() => {
        const init = {};
        for (const g of groups) {
            const count = groupDbCount(g);
            init[g.id] = {
                step: 0,
                samples: [],
                images: [],
                status:
                    count > 0 ? (
                        <>
                            Sudah tersimpan di database ({count}/3). Jika ingin
                            daftar ulang, klik <b>Reset Scan</b>.
                        </>
                    ) : (
                        "Belum terdaftar. Mulai scan 3x."
                    ),
            };
        }
        return init;
    });

    // Form Inertia per group
    const primaryForm = useForm({ group: "primary", samples: [] });
    const backupForm = useForm({ group: "backup", samples: [] });

    const forms = {
        primary: primaryForm,
        backup: backupForm,
    };

    const resetLocal = (groupId) => {
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                step: 0,
                samples: [],
                images: [],
                status: "Scan diulang. Silakan tempel jari 3x lagi.",
            },
        }));
        forms[groupId].setData("samples", []);
    };

    const startNextCapture = async (groupId) => {
        if (activeGroup) return;

        // Cek DB overwritten protection
        const g = groups.find((x) => x.id === groupId);
        if (g && groupHasDb(g)) {
            setState((prev) => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    status: "Database sudah terisi. Reset dulu jika ingin menimpa.",
                },
            }));
            return;
        }

        const current = state[groupId];
        if (current.samples.length >= 3) return; // Sudah full 3

        setActiveGroup(groupId);
        setState((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                status: `Menunggu jari... (Scan ${prev[groupId].samples.length + 1}/3). Tempel & Angkat jari.`,
            },
        }));

        try {
            // Panggil C# Service
            const response = await fetch("http://localhost:5000/enroll", {
                method: "POST", // POST mode (untuk dapetin image & fmd)
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();

            if (result.success) {
                setState((prev) => {
                    const cur = prev[groupId];
                    const nextSamples = [...cur.samples, result.fmd].slice(0, 3);
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
                                ? "✓ Scan 3/3 selesai. Klik Simpan untuk update Admin."
                                : `✓ Scan ${nextSamples.length}/3 OK. Geser sedikit jari untuk scan berikutnya.`,
                        },
                    };
                });
            } else {
                setState((prev) => ({
                    ...prev,
                    [groupId]: {
                        ...prev[groupId],
                        status: "Gagal: " + (result.message || "Timeout / Error"),
                    },
                }));
            }
        } catch (err) {
            console.error(err);
            setState((prev) => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    status: "Koneksi Error. Pastikan aplikasi Scanner (Port 5000) berjalan.",
                },
            }));
        } finally {
            setActiveGroup(null);
        }
    };

    const submitGroup = (e, groupId) => {
        e.preventDefault();

        const samples = state[groupId].samples;
        if (!samples || samples.length < 3) {
            addToast("Scan belum lengkap (harus 3x).", "error");
            return;
        }

        forms[groupId].transform((data) => ({
            ...data,
            samples: samples, // Masukkan data samples manual ke payload
        }));

        forms[groupId].post(route("profile.fingerprint.storeGroup"), {
            onSuccess: () => {
                setState((prev) => ({
                    ...prev,
                    [groupId]: {
                        ...prev[groupId],
                        status: "✓ Tersimpan di Database!",
                    },
                }));
                addToast("Sidik jari Admin berhasil disimpan!", "success");
            },
            onError: (errors) => {
                const msg = errors?.fingerprint || "Gagal menyimpan.";
                setState((prev) => ({
                    ...prev,
                    [groupId]: {
                        ...prev[groupId],
                        status: "Error: " + msg,
                    },
                }));
                addToast(msg, "error");
            },
        });
    };

    const resetDbGroup = (groupId) => {
        if (!confirm("Yakin ingin mereset data jari admin ini? Anda harus scan ulang.")) return;

        forms[groupId].delete(route("profile.fingerprint.resetGroup"), {
            data: { group: groupId }, // Kirim param group
            onSuccess: () => {
                resetLocal(groupId); // Reset UI lokal juga
                addToast("Database berhasil di-reset.", "success");
            },
            onError: (err) => {
                addToast("Gagal reset database.", "error");
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Admin Fingerprint Setup
                </h2>
            }
        >
            <Head title="Admin Fingerprint" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="font-semibold text-3xl mb-2 text-gray-800">
                                Setup Sidik Jari Admin
                            </h2>
                            <p className="text-gray-600">
                                Kelola akses login Admin menggunakan scan jari.
                            </p>
                            <p className="text-blue-600 font-medium text-sm mt-2 flex items-center gap-2">
                                <span className="animate-pulse">●</span> Pastikan FingerprintBridge.exe Aktif
                            </p>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="text-gray-500 hover:text-gray-700 underline"
                        >
                            Kembali
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {groups.map((g) => {
                            const st = state[g.id];
                            const done = st.samples.length === 3;
                            const hasDb = groupHasDb(g);
                            const dbCount = groupDbCount(g);

                            return (
                                <div
                                    key={g.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                                >
                                    {/* Header Card */}
                                    <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                                        <div className="flex items-center gap-3 mb-2">
                                            {hasDb ? (
                                                 <div className="text-green-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                                 </div>
                                            ) : (
                                                <div className="text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                </div>
                                            )}
                                            <h4 className="text-lg font-bold text-gray-800">
                                                {g.title}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">
                                            {g.subtitle}
                                        </p>

                                        <div className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-100">
                                            <div>
                                                <span className="text-gray-500">Local Scan:</span>{" "}
                                                <span className="font-bold text-indigo-600">
                                                    {st.samples.length}/3
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Database:</span>{" "}
                                                <span
                                                    className={`font-bold ${hasDb ? "text-emerald-600" : "text-gray-400"}`}
                                                >
                                                    {hasDb ? "Terdaftar" : "Kosong"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        {/* Preview Images */}
                                        <div className="border-2 border-dashed rounded-xl border-gray-200 p-4 mb-6 bg-gray-50/30">
                                            <div className="grid grid-cols-3 gap-3">
                                                {[0, 1, 2].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`rounded-lg overflow-hidden border aspect-square flex items-center justify-center ${
                                                            st.images[i]
                                                                ? "border-white shadow bg-white"
                                                                : "border-gray-200 bg-white"
                                                        }`}
                                                    >
                                                        {st.images[i] ? (
                                                            <img
                                                                src={st.images[i]}
                                                                alt={`Scan ${i + 1}`}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-gray-300 font-bold">
                                                                #{i + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <p
                                                className={`text-center mt-4 px-2 text-sm font-medium ${
                                                    typeof st.status === "string" && (st.status.includes("Gagal") || st.status.includes("Error"))
                                                        ? "text-red-500"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {st.status}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-auto space-y-3">
                                            {/* Tombol Scan */}
                                            <button
                                                onClick={() => startNextCapture(g.id)}
                                                disabled={activeGroup !== null || hasDb || done}
                                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                            >
                                                {activeGroup === g.id && <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>}
                                                {hasDb
                                                    ? "Terkunci (Sudah Terdaftar)"
                                                    : done
                                                    ? "Selesai (Siap Simpan)"
                                                    : activeGroup === g.id
                                                    ? "Scanning..."
                                                    : `Mulai Scan (${st.samples.length + 1}/3)`}
                                            </button>

                                            {/* Tombol Reset Local */}
                                            <button
                                                onClick={() => resetLocal(g.id)}
                                                disabled={activeGroup !== null || st.samples.length === 0}
                                                className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Ulangi Scan
                                            </button>

                                            {/* Tombol Simpan ke DB */}
                                            {done && !hasDb && (
                                                <form onSubmit={(e) => submitGroup(e, g.id)}>
                                                    <button
                                                        type="submit"
                                                        disabled={forms[g.id].processing}
                                                        className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm transition-colors mt-2"
                                                    >
                                                        {forms[g.id].processing ? "Menyimpan ke Users..." : "Simpan Admin ID"}
                                                    </button>
                                                </form>
                                            )}

                                            {/* Tombol Reset DB */}
                                            {hasDb && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => resetDbGroup(g.id)}
                                                        disabled={forms[g.id].processing || activeGroup !== null}
                                                        className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                                    >
                                                        {forms[g.id].processing ? "Mereset..." : "Hapus & Daftar Ulang"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
                       <h5 className="font-bold text-blue-800 mb-1">Catatan Keamanan</h5>
                       <p className="text-sm text-blue-700">
                           Data sidik jari ini digunakan sebagai kunci akses "Admin Gate" di halaman depan. 
                           Pastikan mendaftarkan minimal 1 grup (Utama) agar bisa mengakses Dashboard tanpa login password manual.
                       </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}