import React, { useEffect, useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react'; // Pastikan import Link
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function FingerprintEnrollment({ auth, intern }) {
    const [sdkReady, setSdkReady] = useState(false);
    const [readers, setReaders] = useState([]);
    const [selectedReader, setSelectedReader] = useState('');
    const [status, setStatus] = useState('Initializing...');
    const [fingerprintImage, setFingerprintImage] = useState(null);
    const [acquisitionStarted, setAcquisitionStarted] = useState(false);
    const sdkRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        fingerprint_data: '',
    });

    // Helper to load scripts sequentially
    const loadScripts = async () => {
        const scripts = [
            '/vendor/es6-shim.js',
            '/vendor/websdk.client.bundle.min.js',
            '/vendor/fingerprint.sdk.min.js'
        ];

        for (const src of scripts) {
            await new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }
    };

    useEffect(() => {
        loadScripts().then(() => {
            if (window.Fingerprint && window.Fingerprint.WebApi) {
                initializeSdk();
            } else {
                setStatus('Failed to load SDK scripts.');
            }
        }).catch(err => {
            console.error(err);
            setStatus('Error loading SDK scripts.');
        });
        
        return () => {
            if (sdkRef.current) {
                sdkRef.current.stopAcquisition().catch(() => {});
            }
        };
    }, []);

    const initializeSdk = () => {
        const sdk = new window.Fingerprint.WebApi();
        sdkRef.current = sdk;

        sdk.onDeviceConnected = (e) => {
            setStatus('Device Connected');
            refreshReaders();
        };
        sdk.onDeviceDisconnected = (e) => {
            setStatus('Device Disconnected');
            refreshReaders();
        };
        sdk.onCommunicationFailed = (e) => {
            setStatus('Communication Failed');
        };
        sdk.onSamplesAcquired = (s) => {
            console.log('Sample acquired', s);
            try {
                const samples = JSON.parse(s.samples);
                console.log('Samples parsed:', samples);
                
                if (samples && samples.length > 0) {
                    const sampleData = samples[0];
                    console.log('Sample[0] type:', typeof sampleData);
                    console.log('Sample[0] content:', sampleData); // Debug log tambahan

                    // Determine format
                    // 2 is Intermediate (Feature Set)
                    if (s.sampleFormat === window.Fingerprint.SampleFormat.Intermediate) {
                       let featureSetString = '';

                       if (typeof sampleData === 'string') {
                           // Kasus 1: SDK mengembalikan string base64url langsung
                           featureSetString = window.Fingerprint.b64UrlTo64(sampleData);
                       } else if (typeof sampleData === 'object') {
                           // Kasus 2: SDK mengembalikan objek (seperti yang terjadi sekarang)
                           // Biasanya data mentah ada di properti 'Data' atau kita perlu stringify objeknya
                           // Jika sampleData adalah objek Feature Set murni, kita bisa menyimpannya sebagai JSON string
                           // atau mengambil properti tertentu.
                           
                           // Coba cari properti Data jika ada, jika tidak, simpan seluruh objek sebagai string
                           if (sampleData.Data) {
                               featureSetString = window.Fingerprint.b64UrlTo64(sampleData.Data);
                           } else {
                               // Fallback: Serealize objek menjadi string JSON untuk disimpan
                               // Perhatian: Ini mungkin bukan format standar feature set mentah,
                               // tapi cukup untuk disimpan dan dikirim kembali nanti jika strukturnya konsisten.
                               featureSetString = JSON.stringify(sampleData);
                           }
                       }

                       if (featureSetString) {
                           setData('fingerprint_data', featureSetString);
                           setStatus('Fingerprint captured (Feature Set). Ready to save.');
                       } else {
                           setStatus('Error: Could not extract feature set data.');
                       }

                    } else if (s.sampleFormat === window.Fingerprint.SampleFormat.PngImage) {
                       // ...existing code...
                       if (typeof sampleData === 'string') {
                           const src = "data:image/png;base64," + window.Fingerprint.b64UrlTo64(sampleData);
                           setFingerprintImage(src);
                       }
                    }
                }
            } catch (e) {
                console.error('Error processing sample:', e);
                setStatus('Error processing sample data.');
            }
        };
        sdk.onQualityReported = (e) => {
             setStatus(`Quality reported: ${e.quality}`);
        };

        setSdkReady(true);
        refreshReaders();
        setStatus('SDK Ready');
    };

    const refreshReaders = () => {
        if (!sdkRef.current) return;
        sdkRef.current.enumerateDevices().then(devices => {
            setReaders(devices);
            if (devices.length > 0 && !selectedReader) {
                setSelectedReader(devices[0]);
            }
        }).catch(err => {
             setStatus('Error enumerating devices: ' + err.message);
        });
    };

    const startCapture = () => {
        if (!sdkRef.current || !selectedReader) return;

        // format: 2 for Intermediate (Feature Set), 5 for PNG
        // We want Feature Set for saving to DB as requested, but maybe PNG for display?
        // The SDK might not support simultaneous formats easily in one call without advanced config.
        // The provided app.js uses `currentFormat` global.
        // Let's stick to the requested "Feature Set".
        
        const format = window.Fingerprint.SampleFormat.Intermediate; 

        sdkRef.current.startAcquisition(format, selectedReader).then(() => {
            setAcquisitionStarted(true);
            setStatus('Place finger on reader...');
        }).catch(err => {
            setStatus('Error starting acquisition: ' + err.message);
        });
    };

    const stopCapture = () => {
        if (!sdkRef.current) return;
        sdkRef.current.stopAcquisition().then(() => {
            setAcquisitionStarted(false);
            setStatus('Acquisition stopped.');
        }).catch(err => {
            setStatus('Error stopping acquisition: ' + err.message);
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('interns.fingerprint.store', intern.id), {
            onSuccess: () => {
                setStatus('Fingerprint saved!');
                reset();
                // Optionally stop capture or keep going
            }
        });
    };

    return (
        // <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        //     <Head title="Fingerprint Enrollment" />
            
        //     <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        //         <div className="px-6 py-8">
        //             <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        //                 Fingerprint Enrollment
        //             </h2>

        //             <div className="mb-6">
        //                 <label className="block text-sm font-medium text-gray-700 mb-2">
        //                     Status
        //                 </label>
        //                 <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
        //                     {status}
        //                 </div>
        //             </div>

        //             <div className="mb-6">
        //                 <label className="block text-sm font-medium text-gray-700 mb-2">
        //                     Select Reader
        //                 </label>
        //                 <select
        //                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        //                     value={selectedReader}
        //                     onChange={(e) => setSelectedReader(e.target.value)}
        //                     disabled={!sdkReady || readers.length === 0}
        //                 >
        //                     {readers.length === 0 ? (
        //                         <option>No readers found</option>
        //                     ) : (
        //                         readers.map(r => <option key={r} value={r}>{r}</option>)
        //                     )}
        //                 </select>
        //             </div>

        //             <div className="flex justify-between space-x-4 mb-8">
                        
                        
        //                 {!acquisitionStarted ? (
        //                     <button
        //                         type="button"
        //                         onClick={startCapture}
        //                         disabled={!selectedReader}
        //                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        //                     >
        //                         Start Capture
        //                     </button>
        //                 ) : (
        //                     <button
        //                         type="button"
        //                         onClick={stopCapture}
        //                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        //                     >
        //                         Stop Capture
        //                     </button>
        //                 )}
        //             </div>

        //             {data.fingerprint_data && (
        //                 <div className="mb-6">
        //                     <div className="p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200 mb-4">
        //                         Fingerprint data captured successfully.
        //                     </div>
                            
        //                     <form onSubmit={submit}>
        //                         <button
        //                             type="submit"
        //                             disabled={processing}
        //                             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        //                         >
        //                             {processing ? 'Saving...' : 'Save Fingerprint Template'}
        //                         </button>
        //                     </form>
        //                 </div>
        //             )}
        //         </div>
        //     </div>
        // </div>

        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Enrollment: {intern.name}</h2>}
        >
            <Head title={`Enrollment - ${intern.name}`} />
            
            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="text-center mb-8">
                            <h3 className="text-lg font-medium text-gray-900">Pendaftaran Sidik Jari</h3>
                            <p className="text-gray-500">Intern: <b>{intern.name}</b> ({intern.barcode})</p>
                        </div>

                        {/* Status Box */}
                        <div className={`mb-6 p-4 rounded-md border ${data.fingerprint_data ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                            <p className="text-center font-medium">{status}</p>
                        </div>

                        {/* Reader Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Scanner Device</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={selectedReader}
                                onChange={(e) => setSelectedReader(e.target.value)}
                                disabled={!sdkReady || readers.length === 0}
                            >
                                {readers.length === 0 ? <option>Mencari device...</option> : readers.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center space-x-4 mb-8">
                            <button
                            type="button"
                            onClick={refreshReaders}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Refresh Readers
                        </button>
                            {!acquisitionStarted ? (
                                <button
                                    type="button"
                                    onClick={startCapture}
                                    disabled={!selectedReader}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Mulai Scan
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={stopCapture}
                                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Stop Scan
                                </button>
                            )}
                        </div>

                        {/* Save Button */}
                        {data.fingerprint_data && (
                            <form onSubmit={submit} className="border-t pt-6 mt-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-600 font-bold">✓ Data sidik jari berhasil diambil</span>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-md transform hover:scale-105 transition-all"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan ke Database'}
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        <div className="mt-4 text-center">
                            <Link href={route('interns.index')} className="text-gray-500 text-sm hover:underline">
                                Kembali ke daftar anak magang
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
