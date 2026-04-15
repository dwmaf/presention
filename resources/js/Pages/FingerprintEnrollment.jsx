import React, { useEffect, useState, useRef } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

/**
 * * FingerprintEnrollment Page
 * * ----------------------------------------
 * * Halaman untuk proses pendaftaran (enrollment) sidik jari intern
 *
 * ! Menggunakan pendekatan Local Service (C#) sebagai sumber utama
 * ! Web SDK tetap tersedia sebagai fallback (opsional)
 *
 * ? Kenapa pakai Local Service?
 * ? - Lebih stabil dibanding Web SDK (tidak tergantung browser)
 * ? - Proses capture lebih cepat & minim error permission
 * ? - Kontrol penuh terhadap device fingerprint
 *
 * @param {Object} auth
 * * Data user yang sedang login
 *
 * @param {Object} intern
 * * Data intern yang akan didaftarkan sidik jarinya
 *
 * ! Flow utama:
 * ! 1. User klik "Mulai Scan"
 * ! 2. Request ke Local Service (localhost:5000)
 * ! 3. Service mengembalikan FMD (Fingerprint Minutiae Data)
 * ! 4. Data disimpan ke state & bisa dikirim ke backend
 *
 * ! State penting:
 * ! - fingerprint_data → hasil FMD untuk disimpan ke database
 * ! - fingerprintImage → preview visual sidik jari (optional)
 * ! - acquisitionStarted → kontrol UI saat scanning
 *
 * ? Kenapa tidak langsung simpan ke DB saat scan?
 * ? - Memberi kesempatan user untuk validasi hasil scan
 * ? - Menghindari data buruk langsung tersimpan
 *
 * TODO Improvement Ideas:
 * TODO - Tambahkan retry otomatis jika scan gagal
 * TODO - Tambahkan indikator kualitas fingerprint
 * TODO - Support multiple finger enrollment
 */

export default function FingerprintEnrollment({ auth, intern }) {
    const [sdkReady, setSdkReady] = useState(false);
    const [readers, setReaders] = useState([]);
    const [selectedReader, setSelectedReader] = useState("");
    const [status, setStatus] = useState("Initializing...");
    const [fingerprintImage, setFingerprintImage] = useState(null);
    const [acquisitionStarted, setAcquisitionStarted] = useState(false);

    const sdkRef = useRef(null);

    /**
     * * Form inertia untuk submit ke backend
     */
    const { data, setData, post, processing, errors, reset } = useForm({
        fingerprint_data: "",
    });

    /**
     * * Load external SDK scripts (fallback)
     *
     * ? Kenapa masih ada?
     * ? - Untuk compatibility jika Local Service tidak tersedia
     */
    const loadScripts = async () => {
        const scripts = [
            "/vendor/es6-shim.js",
            "/vendor/websdk.client.bundle.min.js",
            "/vendor/fingerprint.sdk.min.js",
        ];

        for (const src of scripts) {
            await new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }

                const script = document.createElement("script");
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }
    };

    useEffect(() => {
        /**
         * * Disini kita set status ready langsung untuk Local Service.
         * ? Kita menggunakan Local Service C#, jadi Web SDK tidak wajib diload.
         * ? Namun jika masih ingin fallback, biarkan. */
        setSdkReady(true);
        setStatus("Siap. Pastikan aplikasi C# berjalan.");

        // loadScripts().then... (Disabled for Local Service preference)

        return () => {
            // Cleanup
        };
    }, []);

    /**
     * * Inisialisasi Web SDK (fallback)
     *
     * ? Kapan dipakai?
     * ? - Jika Local Service gagal / tidak tersedia
     */
    const initializeSdk = () => {
        const sdk = new window.Fingerprint.WebApi();
        sdkRef.current = sdk;

        sdk.onDeviceConnected = () => {
            setStatus("Device Connected");
            refreshReaders();
        };

        sdk.onDeviceDisconnected = () => {
            setStatus("Device Disconnected");
            refreshReaders();
        };

        sdk.onCommunicationFailed = () => {
            setStatus("Communication Failed");
        };

        /**
         * * Handler saat fingerprint berhasil di-capture
         */
        sdk.onSamplesAcquired = (s) => {
            try {
                const samples = JSON.parse(s.samples);

                if (samples?.length > 0) {
                    const sampleData = samples[0];

                    /**
                     * * Handle format Feature Set (FMD)
                     *
                     * ? Kenapa pakai Feature Set?
                     * ? - Lebih ringan dari image
                     * ? - Bisa langsung digunakan untuk matching
                     */
                    if (
                        s.sampleFormat ===
                        window.Fingerprint.SampleFormat.Intermediate
                    ) {
                        let featureSetString = "";

                        if (typeof sampleData === "string") {
                            featureSetString =
                                window.Fingerprint.b64UrlTo64(sampleData);
                        } else if (typeof sampleData === "object") {
                            if (sampleData.Data) {
                                featureSetString =
                                    window.Fingerprint.b64UrlTo64(
                                        sampleData.Data,
                                    );
                            } else {
                                featureSetString = JSON.stringify(sampleData);
                            }
                        }

                        if (featureSetString) {
                            setData("fingerprint_data", featureSetString);
                            setStatus("Fingerprint captured. Ready to save.");
                        }
                    }

                    /**
                     * * Handle image preview (opsional)
                     */
                    if (
                        s.sampleFormat ===
                        window.Fingerprint.SampleFormat.PngImage
                    ) {
                        if (typeof sampleData === "string") {
                            const src =
                                "data:image/png;base64," +
                                window.Fingerprint.b64UrlTo64(sampleData);
                            setFingerprintImage(src);
                        }
                    }
                }
            } catch (e) {
                setStatus("Error processing sample data.");
            }
        };

        sdk.onQualityReported = (e) => {
            setStatus(`Quality: ${e.quality}`);
        };

        refreshReaders();
        setStatus("SDK Ready");
    };

    /**
     * * Ambil daftar device fingerprint
     *
     * ? Kenapa perlu?
     * ? - Untuk multi device support
     */
    const refreshReaders = () => {
        if (!sdkRef.current) return;

        sdkRef.current
            .enumerateDevices()
            .then((devices) => {
                setReaders(devices);
                if (devices.length > 0 && !selectedReader) {
                    setSelectedReader(devices[0]);
                }
            })
            .catch((err) => {
                setStatus("Error: " + err.message);
            });
    };

    /**
     * * Start capture via Local Service
     *
     * ? Kenapa async?
     * ? - Karena komunikasi HTTP ke service eksternal
     */
    const startCapture = async () => {
        setStatus("Connecting to Local Service (localhost:5000)...");
        setAcquisitionStarted(true);

        try {
            // Panggil API C# Local Service
            const response = await fetch("http://localhost:5000/enroll", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (result.success) {
                // Simpan FMD Base64 ke Inertia Form Data
                setData("fingerprint_data", result.fmd);

                // Tampilkan gambar jika ada
                if (result.image) {
                    setFingerprintImage(result.image);
                }

                setStatus("Sidik jari berhasil diambil (Local Service)!");
            } else {
                setStatus("Gagal mengambil sidik jari: " + result.message);
            }
        } catch (err) {
            console.error(err);
            setStatus(
                "Error: Tidak dapat menghubungi Local Service. Pastikan aplikasi C# berjalan di port 5000.",
            );
        } finally {
            setAcquisitionStarted(false);
        }
    };

    const stopCapture = () => {
        // Local service otomatis stop setelah capture 1x (atau timeout)
        setAcquisitionStarted(false);
        setStatus("Capture cancelled.");
    };

    const submit = (e) => {
        e.preventDefault();

        post(route("interns.fingerprint-enrollment.store", intern.id), {
            onSuccess: () => {
                setStatus("Fingerprint saved!");
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Enrollment: {intern.name}
                </h2>
            }
        >
            <Head title={`Enrollment - ${intern.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-8 text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Pendaftaran Sidik Jari
                            </h3>
                            <p className="text-gray-500">
                                Intern: <b>{intern.name}</b> ({intern.barcode})
                            </p>
                        </div>

                        {/* Status Box */}
                        <div
                            className={`mb-6 rounded-md border p-4 ${data.fingerprint_data ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-700"}`}
                        >
                            <p className="text-center font-medium">{status}</p>
                        </div>

                        {/* Reader Selection (Auto-handled by C# Service) */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Scanner Device
                            </label>
                            <input
                                type="text"
                                disabled
                                value="Auto (Managed by Local Service)"
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500"
                            />
                        </div>

                        {/* Preview Image */}
                        {fingerprintImage && (
                            <div className="mb-6 flex justify-center">
                                <img
                                    src={fingerprintImage}
                                    alt="Fingerprint"
                                    className="h-48 rounded border shadow-sm"
                                />
                            </div>
                        )}

                        {/* Controls */}
                        <div className="mb-8 flex justify-center space-x-4">
                            <button
                                type="button"
                                onClick={refreshReaders}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Refresh Readers
                            </button>
                            {!acquisitionStarted ? (
                                <button
                                    type="button"
                                    onClick={startCapture}
                                    disabled={acquisitionStarted}
                                    className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Mulai Scan (Local Service)
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={stopCapture}
                                    className="rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                                >
                                    Stop Scan
                                </button>
                            )}
                        </div>

                        {/* Submit Button */}
                        {data.fingerprint_data && (
                            <form
                                onSubmit={submit}
                                className="mt-6 border-t pt-6"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-green-600">
                                        ✓ Data sidik jari berhasil diambil
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="transform rounded-md bg-green-600 px-6 py-2 text-white shadow-md transition-all hover:scale-105 hover:bg-green-700"
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan ke Database"}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="mt-4 text-center">
                            <Link
                                href={route("interns.index")}
                                className="text-sm text-gray-500 hover:underline"
                            >
                                Kembali ke daftar anak magang
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
