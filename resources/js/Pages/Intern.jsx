import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { Link } from '@inertiajs/react';

export default function Intern({ auth, interns, divisions }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentIntern, setCurrentIntern] = useState(null);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [internToDelete, setInternToDelete] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        division_id: divisions?.length ? String(divisions[0].id) : '',
        barcode: '',
        foto: null,

        // Jadwal (boolean)
        senin: false,
        selasa: false,
        rabu: false,
        kamis: false,
        jumat: false,

        // Poin
        poin: 0,

        _method: 'POST',
    });

    const deleteForm = useForm({});

    const openModal = (intern = null) => {
        setIsModalOpen(true);
        setIsEditMode(!!intern);
        setCurrentIntern(intern);

        setData({
            name: intern ? intern.name : '',
            division_id: intern
                    ? String(intern.division_id ?? '')
                    : (divisions.length > 0 ? String(divisions[0].id) : ''),

            barcode: intern ? intern.barcode : '',
            foto: null,

            // Prefill jadwal + poin saat edit
            senin: intern ? !!intern.senin : false,
            selasa: intern ? !!intern.selasa : false,
            rabu: intern ? !!intern.rabu : false,
            kamis: intern ? !!intern.kamis : false,
            jumat: intern ? !!intern.jumat : false,
            poin: intern ? (intern.poin ?? 0) : 0,

            _method: intern ? 'PUT' : 'POST',
        });

        clearErrors();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentIntern(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();

        if (isEditMode) {
            post(route('interns.update', currentIntern.id), {
                onSuccess: closeModal,
            });
        } else {
            post(route('interns.store'), {
                onSuccess: closeModal,
            });
        }
    };

    const confirmDeletion = (intern) => {
        setConfirmingDeletion(true);
        setInternToDelete(intern);
    };

    const closeDeletionModal = () => {
        setConfirmingDeletion(false);
        setInternToDelete(null);
    };

    const deleteIntern = () => {
        deleteForm.delete(route('interns.destroy', internToDelete.id), {
            onSuccess: closeDeletionModal,
        });
    };

    const renderJadwal = (intern) => {
        const hari = [
            ['Sen', 'senin'],
            ['Sel', 'selasa'],
            ['Rab', 'rabu'],
            ['Kam', 'kamis'],
            ['Jum', 'jumat'],
        ];

        const aktif = hari
            .filter(([, key]) => !!intern?.[key])
            .map(([label]) => label);

        return aktif.length ? aktif.join(', ') : '-';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Anak Magang</h2>}
        >
            <Head title="Anak Magang" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{flash.success}</span>
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{flash.error}</span>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-end mb-4">
                            <PrimaryButton onClick={() => openModal()}>Tambah Anak Magang</PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadwal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Fingerprint</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {interns.map((intern) => (
                                        <tr key={intern.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {intern.foto ? (
                                                    <img src={`/storage/${intern.foto}`} alt={intern.name} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                        No Img
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{intern.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {intern.division ? intern.division.nama_divisi : '-'}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700">
                                                    {renderJadwal(intern)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                                                    {intern.poin ?? 0}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {intern.fingerprint_data ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Ada
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Belum Ada
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('interns.fingerprint', intern.id)}
                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                >
                                                    Atur Fingerprint
                                                </Link>

                                                <button
                                                    onClick={() => openModal(intern)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => confirmDeletion(intern)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {interns.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                                Tidak ada data anak magang.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6" encType="multipart/form-data">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEditMode ? 'Edit Anak Magang' : 'Tambah Anak Magang'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="Nama" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Nama Anak Magang"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="division_id" value="Divisi" />
                        <select
                            id="division_id"
                            name="division_id"
                            value={data.division_id}
                            onChange={(e) => setData('division_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        >
                            <option value="">Pilih Divisi</option>
                            {divisions.map((div) => (
                            <option key={div.id} value={String(div.id)}>
                                {div.nama_divisi}
                            </option>
                            ))}

                        </select>
                        <InputError message={errors.division_id} className="mt-2" />
                    </div>

                    {/* Jadwal */}
                    <div className="mt-4">
                        <InputLabel value="Jadwal (Pilih hari masuk)" />
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
                            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={data.senin}
                                    onChange={(e) => setData('senin', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">Senin</span>
                            </label>

                            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={data.selasa}
                                    onChange={(e) => setData('selasa', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">Selasa</span>
                            </label>

                            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={data.rabu}
                                    onChange={(e) => setData('rabu', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">Rabu</span>
                            </label>

                            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={data.kamis}
                                    onChange={(e) => setData('kamis', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">Kamis</span>
                            </label>

                            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={data.jumat}
                                    onChange={(e) => setData('jumat', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">Jumat</span>
                            </label>
                        </div>

                        {/* kalau backend validasi per field, ini nampilin error pertama yang ketemu */}
                        {(errors.senin || errors.selasa || errors.rabu || errors.kamis || errors.jumat) && (
                            <InputError
                                message={
                                    errors.senin ||
                                    errors.selasa ||
                                    errors.rabu ||
                                    errors.kamis ||
                                    errors.jumat
                                }
                                className="mt-2"
                            />
                        )}
                    </div>

                    {/* Poin */}
                    <div className="mt-4">
                        <InputLabel htmlFor="poin" value="Poin" />
                        <TextInput
                            id="poin"
                            type="number"
                            min="0"
                            name="poin"
                            value={data.poin}
                            onChange={(e) => setData('poin', Number(e.target.value))}
                            className="mt-1 block w-full"
                            placeholder="0"
                        />
                        <InputError message={errors.poin} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="foto" value="Foto" />
                        {currentIntern && currentIntern.foto && (
                            <div className="mb-2">
                                <p className="text-sm text-gray-500">Foto saat ini:</p>
                                <img src={`/storage/${currentIntern.foto}`} alt="Current" className="h-16 w-16 object-cover rounded mt-1" />
                            </div>
                        )}
                        <input
                            id="foto"
                            type="file"
                            name="foto"
                            accept="image/*"
                            onChange={(e) => setData('foto', e.target.files[0])}
                            className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                        />
                        <InputError message={errors.foto} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            {isEditMode ? 'Update' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={confirmingDeletion} onClose={closeDeletionModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Apakah anda yakin ingin menghapus data ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeDeletionModal}>Batal</SecondaryButton>
                        <DangerButton className="ml-3" onClick={deleteIntern} disabled={deleteForm.processing}>
                            Hapus
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
