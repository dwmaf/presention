import React, { useMemo, useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useToast } from "@/Components/ToastNotif";

export default function NambahSidikJari({ auth, intern }) {
    /**
     * ✅ CHANGED TOTAL:
     * - DARI 6 SLOT -> JADI 2 GRUP: primary & backup
     * - TIAP GRUP SCAN 3X (seperti HP, geser area jari tiap scan)
     * - SIMPAN SEKALI KIRIM 3 TEMPLATE (samples[])
     * - RESET DB (hapus kolom di DB) agar tidak nimpa
     */

    const groups = useMemo(
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
                subtitle: (
                    <>
                        Scan 3x untuk cadangan (boleh jari berbeda). Jika ingin
                        mendaftar ulang, klik <b>Reset Scan</b> terlebih dahulu.
                    </>
                ),
                dbKeys: [
                    "fingerprint_data_4",
                    "fingerprint_data_5",
                    "fingerprint_data_6",
                ],
            },
        ],
        [],
    );

    const groupHasDb = (g) => g.dbKeys.some((k) => !!intern?.[k]);
    const groupDbCount = (g) =>
        g.dbKeys.reduce((acc, k) => (intern?.[k] ? acc + 1 : acc), 0);

    const [activeGroup, setActiveGroup] = useState(null); // "primary" | "backup" | null

    // State per group: step + samples + images + status
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

    const { addToast } = useToast();

    // Form per group
    const primaryForm = useForm({
        group: "primary",
        samples: [],
    });
    const backupForm = useForm({
        group: "backup",
        samples: [],
    });

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
                status: "Local scan di-reset. Silakan scan 3x lagi.",
            },
        }));
        forms[groupId].setData("samples", []);
    };

    const startNextCapture = async (groupId) => {
        if (activeGroup) return;

        // jika DB sudah ada, arahkan reset dulu (biar gak nimpa)
        const g = groups.find((x) => x.id === groupId);
        if (g && groupHasDb(g)) {
            setState((prev) => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    status: (
                        <>
                            Sudah tersimpan di database. Jika ingin daftar
                            ulang, klik <b>Reset Scan</b>.
                        </>
                    ),
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
                    status: (
                        <>
                            Sudah 3/3. Klik Simpan atau Reset Scan untuk ulang
                            scan.
                        </>
                    ),
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

            const result = await response.json();

            if (result.success) {
                setState((prev) => {
                    const cur = prev[groupId];
                    const nextSamples = [...cur.samples, result.fmd].slice(
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

    const submitGroup = (e, groupId) => {
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
            addToast("Scan belum lengkap. Harus 3/3 sebelum simpan.", "error");
            return;
        }

        forms[groupId].setData("samples", samples);

        forms[groupId].post(
            route("interns.fingerprint.storeGroup", intern.id),
            {
                onSuccess: () => {
                    setState((prev) => ({
                        ...prev,
                        [groupId]: {
                            ...prev[groupId],
                            status: "✓ Berhasil disimpan ke database! (Tidak menimpa data lama).",
                        },
                    }));
                    addToast("Berhasil menyimpan sidik jari!", "success");
                    // opsional: reset local setelah simpan
                    // resetLocal(groupId);
                },
                onError: (errors) => {
                    // biasanya akan kena "fingerprint" kalau belum reset DB
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
                    addToast("Gagal menyimpan sidik jari: " + msg, "error");
                },
            },
        );
    };

    const resetDbGroup = (groupId) => {
        // delete request, kirim group via data (Inertia)
        forms[groupId].delete(
            route("interns.fingerprint.resetGroup", intern.id),
            {
                data: { group: groupId },
                onSuccess: () => {
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
                    addToast("Berhasil reset database sidik jari!", "success");
                },
                onError: (errors) => {
                    const msg =
                        errors?.group ||
                        errors?.fingerprint ||
                        "Gagal reset Database.";
                    setState((prev) => ({
                        ...prev,
                        [groupId]: {
                            ...prev[groupId],
                            status: "Error: " + msg,
                        },
                    }));
                    addToast("Gagal reset database: " + msg, "error");
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Pendaftaran Sidik Jari
                </h2>
            }
        >
            <Head title={`Fingerprint - ${intern.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="font-semibold text-3xl mb-2 text-gray-800">
                                Pendaftaran Sidik Jari
                            </h2>
                            <p className="text-indigo-600 font-bold text-lg mb-2">
                                {intern.name}
                            </p>
                            <p className="text-red-600 font-medium text-sm flex items-center gap-2">
                                <span className="animate-pulse">●</span>{" "}
                                Pastikan FingerprintBridge.exe berjalan sebelum
                                memulai scan
                            </p>
                        </div>
                        <Link
                            href={route("interns.index")}
                            className="text-blue-700 font-semibold hover:underline flex gap-2 items-center"
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
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 5v14m6-8l-6-6m-6 6l6-6"
                                />
                            </svg>
                            Kembali
                        </Link>
                    </div>

                    {/* ✅ CHANGED: 2 card saja */}
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
                                    <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                                        <h4 className="text-lg font-bold text-gray-800">
                                            {g.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {g.subtitle}
                                        </p>

                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <div>
                                                <span className="font-semibold text-gray-700">
                                                    Progress Scan:
                                                </span>{" "}
                                                <span className="font-bold text-indigo-600">
                                                    {st.samples.length}/3
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">
                                                    Data Tersimpan :
                                                </span>{" "}
                                                <span
                                                    className={`font-bold ${
                                                        hasDb
                                                            ? "text-emerald-600"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {hasDb
                                                        ? `${dbCount}/3 tersimpan`
                                                        : "kosong"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        {/* Preview 3 capture */}
                                        <div className="border-2 border-dashed rounded-xl border-gray-200 p-4 mb-6 bg-gray-50/30">
                                            <div className="grid grid-cols-3 gap-3">
                                                {[0, 1, 2].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`rounded-lg overflow-hidden border ${
                                                            st.images[i]
                                                                ? "border-white shadow bg-white"
                                                                : "border-gray-200 bg-white"
                                                        }`}
                                                    >
                                                        {st.images[i] ? (
                                                            <img
                                                                src={
                                                                    st.images[i]
                                                                }
                                                                alt={`${g.title} scan ${i + 1}`}
                                                                className="h-24 w-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="h-24 flex items-center justify-center text-xs text-gray-400">
                                                                Scan {i + 1}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <p
                                                className={`text-center mt-4 px-2 text-sm font-medium ${
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

                                        <div className="mt-auto space-y-3">
                                            {/* Scan */}
                                            <button
                                                onClick={() =>
                                                    startNextCapture(g.id)
                                                }
                                                disabled={
                                                    activeGroup !== null ||
                                                    hasDb ||
                                                    done
                                                }
                                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {hasDb
                                                    ? "Scan dikunci (DB sudah ada)"
                                                    : done
                                                      ? "Scan Selesai (3/3)"
                                                      : activeGroup === g.id
                                                        ? "Scanning..."
                                                        : `Mulai Scan (${st.samples.length + 1}/3)`}
                                            </button>

                                            {/* Reset local scan */}
                                            <button
                                                onClick={() => resetLocal(g.id)}
                                                disabled={activeGroup !== null}
                                                className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Reset Scan
                                            </button>

                                            {/* Save */}
                                            {done && !hasDb && (
                                                <form
                                                    onSubmit={(e) =>
                                                        submitGroup(e, g.id)
                                                    }
                                                >
                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            forms[g.id]
                                                                .processing
                                                        }
                                                        className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm transition-colors"
                                                    >
                                                        {forms[g.id].processing
                                                            ? "Menyimpan..."
                                                            : "Simpan (3 Template)"}
                                                    </button>
                                                </form>
                                            )}

                                            {/* Reset DB */}
                                            {hasDb && (
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() =>
                                                            resetDbGroup(g.id)
                                                        }
                                                        disabled={
                                                            forms[g.id]
                                                                .processing ||
                                                            activeGroup !== null
                                                        }
                                                        className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {forms[g.id].processing
                                                            ? "Mereset Database..."
                                                            : "Reset Scan (Hapus Template Lama)"}
                                                    </button>
                                                    <p className="text-xs text-red-600 text-center">
                                                        Data sidik jari sudah
                                                        tersimpan di database.
                                                        <br />
                                                        Sistem tidak akan
                                                        menimpa data lama.
                                                        <br />
                                                        Silakan klik{" "}
                                                        <b>Reset Scan</b> jika
                                                        ingin mendaftar ulang
                                                        sidik jari.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tips */}
                    <div className="mt-10 bg-white border border-gray-100 rounded-xl p-6 text-sm text-gray-600">
                        <h3 className="font-bold text-gray-800 mb-2">
                            Tips biar capture tidak sering “bad quality”
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                Pastikan jari tidak terlalu kering / terlalu
                                basah.
                            </li>
                            <li>
                                Tempelkan dengan tekanan wajar (jangan terlalu
                                keras).
                            </li>
                            <li>
                                Saat scan 2 dan 3, geser sedikit posisi jari
                                (kiri/kanan/atas/bawah) untuk menutup area.
                            </li>
                            <li>Jika sering error, coba bersihkan sensor.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
