import React, { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function NambahSidikJari({ auth, intern }) {
    // State global halaman
    const [activeScan, setActiveScan] = useState(null); // index 1-6

    // Slots configuration
    const slots = [
        { id: 1, label: "Sidik Jari Utama pertama", key: "fingerprint_data" },
        { id: 2, label: "Sidik Jari Utama kedua", key: "second_fingerprint_data" },
        { id: 3, label: "Sidik Jari Utama ketiga", key: "fingerprint_data_3" },
        { id: 4, label: "Sidik Jari Cadangan pertama", key: "fingerprint_data_4" },
        { id: 5, label: "Sidik Jari Cadangan kedua", key: "fingerprint_data_5" },
        { id: 6, label: "Sidik Jari Cadangan ketiga", key: "fingerprint_data_6" },
    ];

    // Status & Image states for each slot
    const [statuses, setStatuses] = useState(
        slots.reduce((acc, slot) => {
            acc[slot.id] = intern[slot.key]
                ? "Sudah terdaftar."
                : "Belum terdaftar.";
            return acc;
        }, {}),
    );

    const [images, setImages] = useState(
        slots.reduce((acc, slot) => {
            acc[slot.id] = null;
            return acc;
        }, {}),
    );

    // Forms for each slot
    const forms = slots.reduce((acc, slot) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        acc[slot.id] = useForm({
            slot: slot.id,
            fingerprint_data: "",
        });
        return acc;
    }, {});

    // Fungsi Scan Umum
    const startCapture = async (slotId) => {
        setActiveScan(slotId);

        setStatuses((prev) => ({
            ...prev,
            [slotId]: "Menunggu sidik jari... Letakkan jari pada scanner.",
        }));

        try {
            const response = await fetch("http://localhost:5000/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();

            if (result.success) {
                forms[slotId].setData("fingerprint_data", result.fmd);
                if (result.image) {
                    setImages((prev) => ({ ...prev, [slotId]: result.image }));
                }
                setStatuses((prev) => ({
                    ...prev,
                    [slotId]:
                        "✓ Sidik jari berhasil ditangkap! Silakan klik Simpan.",
                }));
            } else {
                setStatuses((prev) => ({
                    ...prev,
                    [slotId]: "Gagal: " + result.message,
                }));
            }
        } catch (err) {
            console.error(err);
            setStatuses((prev) => ({
                ...prev,
                [slotId]:
                    "Error: Tidak dapat menghubungi aplikasi Service C# (Port 5000).",
            }));
        } finally {
            setActiveScan(null);
        }
    };

    const stopCapture = (slotId) => {
        setActiveScan(null);
        setStatuses((prev) => ({
            ...prev,
            [slotId]: prev[slotId].includes("Menunggu")
                ? "Scan dibatalkan."
                : prev[slotId],
        }));
    };

    const submitFingerprint = (e, slotId) => {
        e.preventDefault();
        forms[slotId].post(route("interns.fingerprint.storeSlot", intern.id), {
            onSuccess: () => {
                setStatuses((prev) => ({
                    ...prev,
                    [slotId]: `✓ Sidik Jari #${slotId} berhasil disimpan!`,
                }));
                forms[slotId].reset("fingerprint_data");
            },
        });
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
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            Kembali
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {slots.map((slot) => (
                            <div
                                key={slot.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                            >
                                <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                                    <h4 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                                            {slot.id}
                                        </span>
                                        {slot.label}
                                    </h4>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex flex-col justify-center items-center gap-4 border-2 border-dashed rounded-xl border-gray-200 py-8 mb-6 bg-gray-50/30 min-h-[180px]">
                                        {images[slot.id] ? (
                                            <img
                                                src={images[slot.id]}
                                                alt={`Fingerprint ${slot.id}`}
                                                className="h-32 w-auto border-2 border-white rounded-lg shadow-md"
                                            />
                                        ) : (
                                            <div
                                                className={`p-4 rounded-full ${intern[slot.key] ? "bg-green-50" : "bg-gray-100"}`}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="64"
                                                    height="64"
                                                    viewBox="0 0 16 16"
                                                    className={
                                                        intern[slot.key]
                                                            ? "text-green-500"
                                                            : "text-gray-300"
                                                    }
                                                >
                                                    <path
                                                        fill="currentColor"
                                                        d="M8 7a3 3 0 0 1 3 3c0 1.244.444 2.28 1.345 3.138a.5.5 0 0 1-.69.724C10.556 12.816 10 11.518 10 10a2 2 0 1 0-4 0c0 .593.215 1.414.572 2.218c.357.803.823 1.513 1.263 1.91a.5.5 0 1 1-.67.743c-.584-.528-1.12-1.377-1.506-2.247S5 10.787 5 10a3 3 0 0 1 3-3m.08 2.26a.5.5 0 0 1 .415.572c-.083.534.111 1.38.5 2.257c.382.865.9 1.642 1.34 2.04a.5.5 0 0 1-.67.742c-.584-.527-1.173-1.443-1.586-2.378c-.408-.923-.7-1.989-.571-2.815a.5.5 0 0 1 .571-.417M8 5c1.734 0 3.262.883 4.158 2.222a.5.5 0 0 1-.83.556A4 4 0 0 0 4 10c-.001 1.173.234 1.98.456 2.48c.111.25.22.426.296.536c.052.074.11.142.167.213a.5.5 0 0 1-.698.687a1.6 1.6 0 0 1-.287-.327a4 4 0 0 1-.392-.704C3.265 12.256 3 11.312 3 10a5 5 0 0 1 5-5M6.385 3.188a.5.5 0 0 1 .23.973q-.234.056-.462.129a6.004 6.004 0 0 0-3.993 7.096a.5.5 0 1 1-.973.23a7.004 7.004 0 0 1 5.197-8.428M12.464 9a.5.5 0 0 1 .509.491c.003.198.05.536.18.86c.131.326.322.577.57.702a.5.5 0 0 1-.447.894c-.55-.275-.87-.775-1.05-1.223a3.6 3.6 0 0 1-.253-1.215a.5.5 0 0 1 .49-.509M8.538 3.02c3.435.262 6.2 3.004 6.461 6.443a.5.5 0 0 1-.998.075c-.224-2.943-2.592-5.295-5.54-5.52a.501.501 0 0 1 .077-.997m-6.379.196a.5.5 0 1 1 .683.73a6 6 0 0 0-.76.85a.5.5 0 0 1-.805-.593q.393-.53.882-.987M8.001 1c1.784 0 3.437.511 4.772 1.38a.5.5 0 1 1-.546.839C11.058 2.457 9.595 2 8.002 2a7.9 7.9 0 0 0-3.292.704a.5.5 0 0 1-.417-.91A8.9 8.9 0 0 1 8.001 1"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        <p
                                            className={`text-center px-4 text-sm font-medium ${statuses[slot.id].includes("Gagal") || statuses[slot.id].includes("Error") ? "text-red-500" : "text-gray-500"}`}
                                        >
                                            {statuses[slot.id]}
                                        </p>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        {activeScan === slot.id ? (
                                            <button
                                                onClick={() =>
                                                    stopCapture(slot.id)
                                                }
                                                className="w-full py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-sm transition-colors"
                                            >
                                                Batal Scan
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    startCapture(slot.id)
                                                }
                                                disabled={activeScan !== null}
                                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Mulai Scan
                                            </button>
                                        )}

                                        {forms[slot.id].data
                                            .fingerprint_data && (
                                            <form
                                                onSubmit={(e) =>
                                                    submitFingerprint(
                                                        e,
                                                        slot.id,
                                                    )
                                                }
                                            >
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        forms[slot.id]
                                                            .processing
                                                    }
                                                    className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm transition-colors border-t border-emerald-500/20"
                                                >
                                                    {forms[slot.id].processing
                                                        ? "Menyimpan..."
                                                        : "Simpan Sidik Jari"}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
