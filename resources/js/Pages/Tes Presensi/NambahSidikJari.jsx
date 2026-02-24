import React, { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function NambahSidikJari({ auth, intern }) {
    // State global halaman
    const [activeScan, setActiveScan] = useState(null); // 'primary' atau 'secondary'

    // Form Utama
    const primaryForm = useForm({ fingerprint_data: "" });
    const [primaryStatus, setPrimaryStatus] = useState(
        intern.fingerprint_data
            ? "Sidik Jari Utama sudah terdaftar."
            : "Sidik Jari Utama belum terdaftar.",
    );
    const [primaryImage, setPrimaryImage] = useState(null);

    // Form Cadangan
    const secondaryForm = useForm({ second_fingerprint_data: "" });
    const [secondaryStatus, setSecondaryStatus] = useState(
        intern.second_fingerprint_data
            ? "Sidik Jari Cadangan sudah terdaftar."
            : "Sidik Jari Cadangan belum terdaftar.",
    );
    const [secondaryImage, setSecondaryImage] = useState(null);

    // Fungsi Scan Umum
    const startCapture = async (type) => {
        setActiveScan(type);

        const setStatus =
            type === "primary" ? setPrimaryStatus : setSecondaryStatus;
        const setForm =
            type === "primary" ? primaryForm.setData : secondaryForm.setData;
        const setImage =
            type === "primary" ? setPrimaryImage : setSecondaryImage;
        const dataKey =
            type === "primary" ? "fingerprint_data" : "second_fingerprint_data";

        setStatus("Menunggu sidik jari... Letakkan jari pada scanner.");

        try {
            const response = await fetch("http://localhost:5000/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();

            if (result.success) {
                setForm(dataKey, result.fmd);
                if (result.image) setImage(result.image);
                setStatus(
                    "✓ Sidik jari berhasil ditangkap! Silakan klik Simpan.",
                );
            } else {
                setStatus("Gagal: " + result.message);
            }
        } catch (err) {
            console.error(err);
            setStatus(
                "Error: Tidak dapat menghubungi aplikasi Service C# (Port 5000).",
            );
        } finally {
            setActiveScan(null);
        }
    };

    const stopCapture = () => {
        setActiveScan(null);
        setPrimaryStatus((prev) =>
            prev.includes("Menunggu") ? "Scan dibatalkan." : prev,
        );
        setSecondaryStatus((prev) =>
            prev.includes("Menunggu") ? "Scan dibatalkan." : prev,
        );
    };

    // Fungsi Submit Utama
    const submitPrimary = (e) => {
        e.preventDefault();
        primaryForm.post(route("interns.fingerprint.store", intern.id), {
            onSuccess: () => {
                setPrimaryStatus(
                    "✓ Sidik Jari Utama berhasil disimpan ke database!",
                );
                primaryForm.reset();
            },
        });
    };

    // Fungsi Submit Cadangan
    const submitSecondary = (e) => {
        e.preventDefault();
        secondaryForm.post(
            route("interns.fingerprint.storeSecond", intern.id),
            {
                // Sesuaikan nama route-nya!
                onSuccess: () => {
                    setSecondaryStatus(
                        "✓ Sidik Jari Cadangan berhasil disimpan ke database!",
                    );
                    secondaryForm.reset();
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Kelola Sidik Jari: {intern.name}
                </h2>
            }
        >
            <Head title={`Fingerprint - ${intern.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header Info */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6 text-center">
                        <h3 className="text-xl font-bold text-gray-900">
                            Pendaftaran Sidik Jari Magang
                        </h3>
                        <p className="text-gray-500 mt-2">
                            Nama: <b>{intern.name}</b>
                        </p>
                        <p className="text-sm text-red-500 mt-2 italic">
                            * Pastikan FingerprintBridge.exe berjalan sebelum
                            memulai scan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* KOTAK 1: SIDIK JARI UTAMA */}
                        <div
                            className={`p-6 bg-white sm:rounded-lg shadow-sm border-t-4 ${intern.fingerprint_data ? "border-green-500" : "border-indigo-500"}`}
                        >
                            <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                Sidik Jari Utama
                            </h4>

                            <div
                                className={`mb-4 p-3 rounded text-sm font-medium text-center ${intern.fingerprint_data ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                            >
                                {primaryStatus}
                            </div>

                            {primaryImage && (
                                <div className="mb-4 flex justify-center">
                                    <img
                                        src={primaryImage}
                                        alt="Fingerprint Primary"
                                        className="h-32 border rounded shadow-sm"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col space-y-3">
                                {activeScan === "primary" ? (
                                    <button
                                        onClick={stopCapture}
                                        className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold shadow-sm"
                                    >
                                        Batal Scan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => startCapture("primary")}
                                        disabled={activeScan !== null}
                                        className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold shadow-sm disabled:opacity-50"
                                    >
                                        Mulai Scan Sidik Jari Utama
                                    </button>
                                )}

                                {primaryForm.data.fingerprint_data && (
                                    <form onSubmit={submitPrimary}>
                                        <button
                                            type="submit"
                                            disabled={primaryForm.processing}
                                            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold shadow-sm mt-3 border-t pt-3"
                                        >
                                            {primaryForm.processing
                                                ? "Menyimpan..."
                                                : "Simpan Sidik Jari Utama"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* KOTAK 2: SIDIK JARI CADANGAN */}
                        <div
                            className={`p-6 bg-white sm:rounded-lg shadow-sm border-t-4 ${intern.second_fingerprint_data ? "border-green-500" : "border-blue-500"}`}
                        >
                            <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                Sidik Jari Cadangan 
                            </h4>

                            <div
                                className={`mb-4 p-3 rounded text-sm font-medium text-center ${intern.second_fingerprint_data ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                            >
                                {secondaryStatus}
                            </div>

                            {secondaryImage && (
                                <div className="mb-4 flex justify-center">
                                    <img
                                        src={secondaryImage}
                                        alt="Fingerprint Secondary"
                                        className="h-32 border rounded shadow-sm"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col space-y-3">
                                {activeScan === "secondary" ? (
                                    <button
                                        onClick={stopCapture}
                                        className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold shadow-sm"
                                    >
                                        Batal Scan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            startCapture("secondary")
                                        }
                                        disabled={activeScan !== null}
                                        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-sm disabled:opacity-50"
                                    >
                                        Mulai Scan Sidik Jari Cadangan
                                    </button>
                                )}

                                {secondaryForm.data.second_fingerprint_data && (
                                    <form onSubmit={submitSecondary}>
                                        <button
                                            type="submit"
                                            disabled={secondaryForm.processing}
                                            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold shadow-sm mt-3 border-t pt-3"
                                        >
                                            {secondaryForm.processing
                                                ? "Menyimpan..."
                                                : "Simpan Sidik Jari Cadangan"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <Link
                            href={route("interns.index")}
                            className="text-gray-500 hover:underline"
                        >
                            &larr; Kembali ke Daftar Anak Magang
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
