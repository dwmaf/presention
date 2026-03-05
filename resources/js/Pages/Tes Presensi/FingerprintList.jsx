import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";

export default function FingerprintList({ interns }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredInterns = interns.filter((intern) =>
        intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Helper function untuk render cell FMD agar tidak duplikasi kodingan 6x
    const renderFmdCell = (fmdData) => {
        if (!fmdData) {
            return (
                <div className="flex justify-center items-center h-full">
                    <span className="text-gray-300 italic text-xs">- Empty -</span>
                </div>
            );
        }

        const length = fmdData.length;
        const isCorrupt = length <= 50; // Indikator data rusak penyebab error

        return (
            <div className="relative group min-w-[120px]">
                {/* Header Info: Panjang String */}
                <div className="flex justify-between items-center mb-1">
                    <span
                        className={`text-sm font-bold ${isCorrupt ? "text-red-600 animate-pulse" : "text-green-600"
                            }`}
                    >
                        Len: {length} {isCorrupt && "⚠️ BAD"}
                    </span>
                </div>

                {/* Kotak Data Base64 */}
                <div
                    className={`p-1.5 rounded text-[9px] font-mono break-all h-24 overflow-y-auto border scrollbar-thin ${isCorrupt
                            ? "bg-red-50 text-red-800 border-red-300 ring-1 ring-red-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                >
                    {fmdData}
                </div>

                {/* Copy Button */}
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(fmdData);
                        alert(`Copied (Length: ${length})!`);
                    }}
                    className="absolute top-6 right-1 opacity-0 group-hover:opacity-100 bg-white shadow-md border px-2 py-0.5 rounded text-[9px] font-medium hover:bg-gray-100 transition z-10"
                >
                    Copy
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Head title="Fingerprint Data Dev Tool" />

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            🛠️ Fingerprint Debugger
                        </h1>
                        <p className="text-gray-600">
                            Memeriksa integritas data FMD (Feature Set) untuk semua jari.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Back to Dashboard
                        </Link>

                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <div className="relative w-full max-w-sm">
                            <input
                                type="text"
                                placeholder="Cari nama intern..."
                                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-red-50 border border-red-300 block rounded-sm"></span>
                                <span className="text-gray-600">Bad Data (Len &le; 50)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-green-50 border border-green-200 block rounded-sm"></span>
                                <span className="text-gray-600">Valid Data</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 border-b sticky left-0 bg-gray-100 z-10 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        Nama Intern
                                    </th>
                                    <th className="px-4 py-3 border-b border-l text-center w-[14%]">FMD 1 (Primary)</th>
                                    <th className="px-4 py-3 border-b border-l text-center w-[14%]">FMD 2 (Secondary)</th>
                                    <th className="px-4 py-3 border-b border-l text-center w-[14%]">FMD 3</th>
                                    <th className="px-4 py-3 border-b border-l text-center w-[14%]">FMD 4</th>
                                    <th className="px-4 py-3 border-b border-l text-center w-[14%]">FMD 5</th>
                                    <th className="px-4 py-3 border-b border-l text-center w-[14%]">FMD 6</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredInterns.length > 0 ? (
                                    filteredInterns.map((intern) => (
                                        <tr
                                            key={intern.id}
                                            className="hover:bg-gray-50 transition group/row"
                                        >
                                            <td className="px-4 py-4 font-semibold text-gray-800 text-sm sticky left-0 bg-white group-hover/row:bg-gray-50 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                                                {intern.name}
                                                <div className="text-[10px] font-normal text-gray-400 mt-1">
                                                    ID: {intern.id}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 border-l align-top">
                                                {renderFmdCell(intern.fingerprint_data)}
                                            </td>
                                            <td className="px-2 py-3 border-l align-top">
                                                {renderFmdCell(intern.second_fingerprint_data)}
                                            </td>
                                            <td className="px-2 py-3 border-l align-top">
                                                {renderFmdCell(intern.fingerprint_data_3)}
                                            </td>
                                            <td className="px-2 py-3 border-l align-top">
                                                {renderFmdCell(intern.fingerprint_data_4)}
                                            </td>
                                            <td className="px-2 py-3 border-l align-top">
                                                {renderFmdCell(intern.fingerprint_data_5)}
                                            </td>
                                            <td className="px-2 py-3 border-l align-top">
                                                {renderFmdCell(intern.fingerprint_data_6)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
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
                                <strong>Cara Debugging:</strong> Jika terjadi error <i>"not enough data"</i> saat check-out, 
                                cari kolom berwarna <strong>MERAH</strong> di atas. Itu menandakan data string terlalu pendek (rusak).
                                Hapus data tersebut dari database atau lakukan enroll ulang untuk jari tersebut.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
