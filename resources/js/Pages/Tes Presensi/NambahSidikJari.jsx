import React, { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function NambahSidikJari({ auth, intern }) {
    // State global halaman
    const [activeScan, setActiveScan] = useState(null); // 'primary' atau 'secondary'

    // Form Utama
    const primaryForm = useForm({ fingerprint_data: "" });
    const [primaryStatus, setPrimaryStatus] = useState(
        intern.fingerprint_data ? "Sudah terdaftar." : "Belum terdaftar.",
    );
    const [primaryImage, setPrimaryImage] = useState(null);

    // Form Cadangan
    const secondaryForm = useForm({ second_fingerprint_data: "" });
    const [secondaryStatus, setSecondaryStatus] = useState(
        intern.second_fingerprint_data
            ? "Sudah terdaftar."
            : "Belum terdaftar.",
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
                    Pendaftaran Sidik Jari
                </h2>
            }
        >
            <Head title={`Fingerprint - ${intern.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between">
                        <div>
                            <h2 className="font-semibold text-2xl mb-2">
                                Pendaftaran Sidik Jari
                            </h2>
                            <p className="text-gray-500 font-semibold mb-2">
                                {intern.name}
                            </p>
                            <p className="text-red-700 font-semibold mb-8">
                                * Pastikan FingerprintBridge.exe berjalan
                                sebelum memulai scan
                            </p>
                        </div>
                        <div className="text-center mt-6">
                            <Link
                                href={route("interns.index")}
                                className="text-blue-700 font-semibold hover:underline flex gap-2 items-center"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="none"
                                        stroke="oklch(44.6% 0.03 256.802)"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 5v14m6-8l-6-6m-6 6l6-6"
                                    />
                                </svg>
                                Kembali
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-6 justify-center">
                        {/* KOTAK 1: SIDIK JARI UTAMA */}
                        <div className="w-80 p-6 bg-white rounded-lg shadow-sm">
                            <h4 className="text-lg font-bold mb-4 pb-2">
                                Sidik Jari Utama
                            </h4>

                            <div className="flex flex-col justify-center items-center gap-4 border-2 border-dashed rounded-lg border-gray-400 py-6 mb-8">
                                {primaryImage ? (
                                    <div className="mb-4 flex justify-center">
                                        <img
                                            src={primaryImage}
                                            alt="Fingerprint Primary"
                                            className="h-32 border rounded shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fill="oklch(44.6% 0.03 256.802)"
                                            d="M8 7a3 3 0 0 1 3 3c0 1.244.444 2.28 1.345 3.138a.5.5 0 0 1-.69.724C10.556 12.816 10 11.518 10 10a2 2 0 1 0-4 0c0 .593.215 1.414.572 2.218c.357.803.823 1.513 1.263 1.91a.5.5 0 1 1-.67.743c-.584-.528-1.12-1.377-1.506-2.247S5 10.787 5 10a3 3 0 0 1 3-3m.08 2.26a.5.5 0 0 1 .415.572c-.083.534.111 1.38.5 2.257c.382.865.9 1.642 1.34 2.04a.5.5 0 0 1-.67.742c-.584-.527-1.173-1.443-1.586-2.378c-.408-.923-.7-1.989-.571-2.815a.5.5 0 0 1 .571-.417M8 5c1.734 0 3.262.883 4.158 2.222a.5.5 0 0 1-.83.556A4 4 0 0 0 4 10c-.001 1.173.234 1.98.456 2.48c.111.25.22.426.296.536c.052.074.11.142.167.213a.5.5 0 0 1-.698.687a1.6 1.6 0 0 1-.287-.327a4 4 0 0 1-.392-.704C3.265 12.256 3 11.312 3 10a5 5 0 0 1 5-5M6.385 3.188a.5.5 0 0 1 .23.973q-.234.056-.462.129a6.004 6.004 0 0 0-3.993 7.096a.5.5 0 1 1-.973.23a7.004 7.004 0 0 1 5.197-8.428M12.464 9a.5.5 0 0 1 .509.491c.003.198.05.536.18.86c.131.326.322.577.57.702a.5.5 0 0 1-.447.894c-.55-.275-.87-.775-1.05-1.223a3.6 3.6 0 0 1-.253-1.215a.5.5 0 0 1 .49-.509M8.538 3.02c3.435.262 6.2 3.004 6.461 6.443a.5.5 0 0 1-.998.075c-.224-2.943-2.592-5.295-5.54-5.52a.501.501 0 0 1 .077-.997m-6.379.196a.5.5 0 1 1 .683.73a6 6 0 0 0-.76.85a.5.5 0 0 1-.805-.593q.393-.53.882-.987M8.001 1c1.784 0 3.437.511 4.772 1.38a.5.5 0 1 1-.546.839C11.058 2.457 9.595 2 8.002 2a7.9 7.9 0 0 0-3.292.704a.5.5 0 0 1-.417-.91A8.9 8.9 0 0 1 8.001 1"
                                        />
                                    </svg>
                                )}
                                <p className="font-medium text-gray-500">
                                    {primaryStatus}
                                </p>
                            </div>

                            <div className="flex flex-col space-y-3">
                                {activeScan === "primary" ? (
                                    <button
                                        onClick={stopCapture}
                                        className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold shadow-sm"
                                    >
                                        Batal Scan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => startCapture("primary")}
                                        disabled={activeScan !== null}
                                        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow-sm disabled:opacity-50"
                                    >
                                        Mulai Scan
                                    </button>
                                )}

                                {primaryForm.data.fingerprint_data && (
                                    <form onSubmit={submitPrimary}>
                                        <button
                                            type="submit"
                                            disabled={primaryForm.processing}
                                            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold shadow-sm mt-3 border-t pt-3"
                                        >
                                            {primaryForm.processing
                                                ? "Menyimpan..."
                                                : "Simpan"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* KOTAK 2: SIDIK JARI CADANGAN */}
                        <div className="w-80 p-6 bg-white rounded-lg shadow-sm">
                            <h4 className="text-lg font-bold mb-4 pb-2">
                                Sidik Jari Cadangan
                            </h4>

                            <div className="flex flex-col justify-center items-center gap-4 border-2 border-dashed rounded-lg border-gray-400 py-6 mb-8">
                                {secondaryImage ? (
                                    <div className="mb-4 flex justify-center">
                                        <img
                                            src={secondaryImage}
                                            alt="Fingerprint Primary"
                                            className="h-32 border rounded shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fill="oklch(44.6% 0.03 256.802)"
                                            d="M8 7a3 3 0 0 1 3 3c0 1.244.444 2.28 1.345 3.138a.5.5 0 0 1-.69.724C10.556 12.816 10 11.518 10 10a2 2 0 1 0-4 0c0 .593.215 1.414.572 2.218c.357.803.823 1.513 1.263 1.91a.5.5 0 1 1-.67.743c-.584-.528-1.12-1.377-1.506-2.247S5 10.787 5 10a3 3 0 0 1 3-3m.08 2.26a.5.5 0 0 1 .415.572c-.083.534.111 1.38.5 2.257c.382.865.9 1.642 1.34 2.04a.5.5 0 0 1-.67.742c-.584-.527-1.173-1.443-1.586-2.378c-.408-.923-.7-1.989-.571-2.815a.5.5 0 0 1 .571-.417M8 5c1.734 0 3.262.883 4.158 2.222a.5.5 0 0 1-.83.556A4 4 0 0 0 4 10c-.001 1.173.234 1.98.456 2.48c.111.25.22.426.296.536c.052.074.11.142.167.213a.5.5 0 0 1-.698.687a1.6 1.6 0 0 1-.287-.327a4 4 0 0 1-.392-.704C3.265 12.256 3 11.312 3 10a5 5 0 0 1 5-5M6.385 3.188a.5.5 0 0 1 .23.973q-.234.056-.462.129a6.004 6.004 0 0 0-3.993 7.096a.5.5 0 1 1-.973.23a7.004 7.004 0 0 1 5.197-8.428M12.464 9a.5.5 0 0 1 .509.491c.003.198.05.536.18.86c.131.326.322.577.57.702a.5.5 0 0 1-.447.894c-.55-.275-.87-.775-1.05-1.223a3.6 3.6 0 0 1-.253-1.215a.5.5 0 0 1 .49-.509M8.538 3.02c3.435.262 6.2 3.004 6.461 6.443a.5.5 0 0 1-.998.075c-.224-2.943-2.592-5.295-5.54-5.52a.501.501 0 0 1 .077-.997m-6.379.196a.5.5 0 1 1 .683.73a6 6 0 0 0-.76.85a.5.5 0 0 1-.805-.593q.393-.53.882-.987M8.001 1c1.784 0 3.437.511 4.772 1.38a.5.5 0 1 1-.546.839C11.058 2.457 9.595 2 8.002 2a7.9 7.9 0 0 0-3.292.704a.5.5 0 0 1-.417-.91A8.9 8.9 0 0 1 8.001 1"
                                        />
                                    </svg>
                                )}
                                <p className="font-medium text-gray-500">
                                    {secondaryStatus}
                                </p>
                            </div>

                            <div className="flex flex-col space-y-3">
                                {activeScan === "secondary" ? (
                                    <button
                                        onClick={stopCapture}
                                        className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold shadow-sm"
                                    >
                                        Batal Scan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            startCapture("secondary")
                                        }
                                        disabled={activeScan !== null}
                                        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow-sm disabled:opacity-50"
                                    >
                                        Mulai Scan
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
                                                : "Simpan"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
