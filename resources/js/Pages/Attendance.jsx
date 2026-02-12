import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Attendance({ auth, interns }) {
    const { flash } = usePage().props;
    const inputRef = useRef(null);
    const { data, setData, post, processing, reset } = useForm({
        barcode: '',
    });

    // Auto focus ke input terus menerus agar siap di-scan
    useEffect(() => {
        if(inputRef.current) inputRef.current.focus();
        
        const interval = setInterval(() => {
             if(inputRef.current) inputRef.current.focus();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const handleScan = (e) => {
        e.preventDefault();
        post(route('attendance.store'), {
            onSuccess: () => {
                reset();
                // Audio feedback bisa ditambahkan disini
            },
            preserveScroll: true,
        });
    };

    return (
        <div>
            <Head title="Presensi Scanner" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Feedback Messages */}
                    {flash.success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded text-center text-xl font-bold">{flash.success}</div>}
                    {flash.error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded text-center text-xl font-bold">{flash.error}</div>}
                    {flash.info && <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded text-center text-xl font-bold">{flash.info}</div>}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">📷 Scan Barcode Disini</h3>
                        
                        <form onSubmit={handleScan}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={data.barcode}
                                onChange={e => setData('barcode', e.target.value)}
                                className="w-full max-w-lg p-4 text-center border-2 border-indigo-500 rounded-lg text-xl focus:ring-4 focus:ring-indigo-300"
                                placeholder="Klik disini lalu scan barcode..."
                                autoFocus
                                autoComplete="off"
                            />
                        </form>
                         <p className="text-sm text-gray-500 mt-2">Pastikan kursor kedip-kedip di dalam kotak input</p>
                    </div>

                    {/* Tabel Status */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left">Foto</th>
                                    <th className="px-6 py-3 text-left">Nama</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Masuk</th>
                                    <th className="px-6 py-3 text-center">Pulang</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {interns.map((intern) => {
                                    const att = intern.attendance;
                                    let statusClass = "bg-red-100 text-red-800";
                                    let statusText = "Tidak Hadir";

                                    if (att) {
                                        if (att.check_out) {
                                            statusClass = "bg-blue-100 text-blue-800";
                                            statusText = "Pulang";
                                        } else {
                                            statusClass = "bg-green-100 text-green-800";
                                            statusText = "Hadir";
                                        }
                                    }

                                    return (
                                        <tr key={intern.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                 {intern.foto ? (
                                                    <img src={`/storage/${intern.foto}`} alt={intern.name} className="h-12 w-12 rounded-full object-cover border" />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Foto</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                {intern.name} <br/>
                                                <span className="text-xs text-gray-500">{intern.barcode}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-700">
                                                {att ? att.check_in : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-700">
                                                {att && att.check_out ? att.check_out : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}