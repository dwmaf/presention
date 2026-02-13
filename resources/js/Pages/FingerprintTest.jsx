import React, { useEffect, useState, useRef } from "react";
import { Head } from "@inertiajs/react";

export default function FingerprintTest({ fingerprintDatabase }) {
    const [status, setStatus] = useState("Initializing SDK...");
    const [sdkReady, setSdkReady] = useState(false);
    const [readers, setReaders] = useState([]);
    const [selectedReader, setSelectedReader] = useState("");
    const [matchResult, setMatchResult] = useState(null);
    const sdkRef = useRef(null);

    // Load Scripts (Copy dari file sebelumnya)
    const loadScripts = async () => {
        const scripts = [
            "/vendor/es6-shim.js",
            "/vendor/websdk.client.bundle.min.js",
            "/vendor/fingerprint.sdk.min.js",
        ];
        for (const src of scripts) {
            await new Promise((resolve) => {
                if (document.querySelector(`script[src="${src}"]`)) resolve();
                else {
                    const script = document.createElement("script");
                    script.src = src;
                    script.onload = resolve;
                    document.body.appendChild(script);
                }
            });
        }
    };

    useEffect(() => {
        // Init state untuk Local Service mode
        setSdkReady(true);
        setStatus("Siap. Klik tombol di bawah untuk scan.");
    }, []);

    const refreshReaders = () => {
        sdkRef.current.enumerateDevices().then((devices) => {
            setReaders(devices);
            if (devices.length > 0 && !selectedReader)
                setSelectedReader(devices[0]);
        });
    };

    const onSamplesAcquired = async (s) => {
        try {
            const samples = JSON.parse(s.samples);
            if (samples.length > 0) {
                const sampleData = samples[0];
                let currentFmd = "";

                // Extract FMD Candidate
                if (
                    s.sampleFormat ===
                    window.Fingerprint.SampleFormat.Intermediate
                ) {
                    if (sampleData.Data)
                        currentFmd = window.Fingerprint.b64UrlTo64(
                            sampleData.Data,
                        );
                    else currentFmd = window.Fingerprint.b64UrlTo64(sampleData);
                }

                if (currentFmd) {
                    setStatus(
                        "Fingerprint captured. Matching with local server...",
                    );
                    await matchWithServer(currentFmd);
                }
            }
        } catch (error) {
            console.error(error);
            setStatus("Error processing sample.");
        }
    };

    const startScanAndVerify = async () => {
        setMatchResult(null);
        setStatus(
            "Menghubungkan ke Local Service (Port 5000)... Silakan tempelkan jari saat lampu menyala.",
        );

        try {
            // Kirim database ke Service Local untuk dicocokkan disana
            const payload = {
                database: fingerprintDatabase.map((u) => ({
                    id: String(u.id),
                    fmd: u.fmd,
                })), // Kirim data FMD yang ada di database
            };

            const response = await fetch("http://localhost:5000/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.match) {
                // User ID dikembalikan oleh C# service
                const user = fingerprintDatabase.find(
                    (u) => String(u.id) === String(result.user_id),
                );

                if (user) {
                    setMatchResult({ success: true, user: user });
                    setStatus("MATCH FOUND! User: " + user.name);
                } else {
                    setStatus(
                        "Match found but User ID not in current list (ID: " +
                            result.user_id +
                            ")",
                    );
                }
            } else {
                setMatchResult({ success: false });
                setStatus("Tidak ada kecocokan. (" + result.message + ")");
            }
        } catch (err) {
            console.error(err);
            setStatus(
                "Error: Gagal menghubungi Local Service. Pastikan aplikasi C# berjalan.",
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Head title="Fingerprint Test" />
            <div className="bg-white p-8 rounded shadow-lg max-w-lg w-full text-center">
                <h1 className="text-2xl font-bold mb-4">
                    Tes Kecocokan Fingerprint
                </h1>

                <div className="mb-4 text-sm text-gray-500">
                    Database Size: {fingerprintDatabase.length} Template(s)
                    loaded.
                </div>

                <div
                    className={`mb-6 p-4 rounded-md border ${
                        status.includes("MATCH")
                            ? "bg-green-100 border-green-200 text-green-700 font-bold"
                            : status.includes("No match")
                              ? "bg-red-100 border-red-200 text-red-700"
                              : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}
                >
                    {status}
                </div>

                <div className="mb-6">
                    <p className="mb-4 text-gray-600">
                        Pastikan aplikasi C# <b>FingerprintService</b> berjalan
                        di port 5000.
                        <br />
                        Aplikasi ini akan mengambil kendali scanner, menangkap
                        sidik jari, dan mencocokannya dengan database.
                    </p>

                    <button
                        onClick={startScanAndVerify}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 w-full shadow-lg transform transition hover:scale-105 font-bold"
                    >
                        MULAI SCAN & VERIFIKASI (Local Service)
                    </button>
                </div>

                {matchResult && matchResult.success && (
                    <div className="mt-8 p-6 bg-green-500 text-white rounded-lg animate-bounce">
                        <h2 className="text-3xl font-bold">✅ IDENTIFIED</h2>
                        <p className="text-xl mt-2">{matchResult.user.name}</p>
                    </div>
                )}

                {matchResult && !matchResult.success && (
                    <div className="mt-8 p-6 bg-red-500 text-white rounded-lg">
                        <h2 className="text-3xl font-bold">❌ UNKNOWN</h2>
                        <p className="text-xl mt-2">
                            Sidik jari tidak dikenali
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
