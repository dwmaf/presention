import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";

export default function FingerprintList({ interns }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredInterns = interns.filter((intern) =>
        intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Head title="Fingerprint Data Dev Tool" />

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            🛠️ Fingerprint Dev Tool
                        </h1>
                        <p className="text-gray-600">
                            Daftar data FMD sidik jari intern (Primary &
                            Secondary)
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Back to Dashboard
                        </Link>
                        <a
                            href={route("dev.fingerprints.export")}
                            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition transform hover:scale-105"
                        >
                            📥 Export CSV
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <input
                            type="text"
                            placeholder="Cari nama intern..."
                            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4 border-b">Nama</th>
                                    <th className="px-6 py-4 border-b w-1/3">
                                        Primary FMD (Base64)
                                    </th>
                                    <th className="px-6 py-4 border-b w-1/3">
                                        Secondary FMD (Base64)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredInterns.length > 0 ? (
                                    filteredInterns.map((intern) => (
                                        <tr
                                            key={intern.id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {intern.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {intern.fingerprint_data ? (
                                                    <div className="relative group">
                                                        <div className="bg-green-50 text-green-700 p-2 rounded text-[10px] font-mono break-all max-h-24 overflow-y-auto border border-green-100">
                                                            {
                                                                intern.fingerprint_data
                                                            }
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    intern.fingerprint_data,
                                                                );
                                                                alert(
                                                                    "Copied to clipboard!",
                                                                );
                                                            }}
                                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white shadow-sm border px-2 py-0.5 rounded text-[10px] hover:bg-gray-100 transition"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-sm">
                                                        Empty
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {intern.second_fingerprint_data ? (
                                                    <div className="relative group">
                                                        <div className="bg-blue-50 text-blue-700 p-2 rounded text-[10px] font-mono break-all max-h-24 overflow-y-auto border border-blue-100">
                                                            {
                                                                intern.second_fingerprint_data
                                                            }
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    intern.second_fingerprint_data,
                                                                );
                                                                alert(
                                                                    "Copied to clipboard!",
                                                                );
                                                            }}
                                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white shadow-sm border px-2 py-0.5 rounded text-[10px] hover:bg-gray-100 transition"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-sm">
                                                        Empty
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="px-6 py-12 text-center text-gray-500 italic"
                                        >
                                            Tidak ada data ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 bg-amber-50 border-l-4 border-amber-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0 text-amber-400">⚠️</div>
                        <div className="ml-3">
                            <p className="text-sm text-amber-700">
                                <strong>Developer Note:</strong> Gunakan data
                                Base64 FMD di atas jika Anda perlu melakukan
                                testing manual via Postman atau mengembalikan
                                data setelah{" "}
                                <code className="bg-amber-100 px-1 rounded">
                                    migrate:fresh
                                </code>
                                . Anda bisa menyalinnya langsung dengan tombol
                                Copy yang muncul saat mouse diarahkan ke kotak
                                data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
