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

export default function Division({ auth, divisions }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentDivision, setCurrentDivision] = useState(null);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_divisi: '',
    });

    const deleteForm = useForm({});

    const openModal = (division = null) => {
        setIsModalOpen(true);
        setIsEditMode(!!division);
        setCurrentDivision(division);
        setData('nama_divisi', division ? division.nama_divisi : '');
        clearErrors();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentDivision(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('divisions.update', currentDivision.id), {
                onSuccess: closeModal,
            });
        } else {
            post(route('divisions.store'), {
                onSuccess: closeModal,
            });
        }
    };

    const confirmDeletion = (division) => {
        setConfirmingDeletion(true);
        setDivisionToDelete(division);
    };

    const closeDeletionModal = () => {
        setConfirmingDeletion(false);
        setDivisionToDelete(null);
    };

    const deleteDivision = () => {
        deleteForm.delete(route('divisions.destroy', divisionToDelete.id), {
            onSuccess: closeDeletionModal,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Divisi</h2>}
        >
            <Head title="Divisi" />

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
                            <PrimaryButton onClick={() => openModal()}>Tambah Divisi</PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Divisi</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {divisions.map((division) => (
                                        <tr key={division.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{division.nama_divisi}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(division)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDeletion(division)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {divisions.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                                                Tidak ada data divisi.
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
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEditMode ? 'Edit Divisi' : 'Tambah Divisi'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="nama_divisi" value="Nama Divisi" />
                        <TextInput
                            id="nama_divisi"
                            type="text"
                            name="nama_divisi"
                            value={data.nama_divisi}
                            onChange={(e) => setData('nama_divisi', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Contoh: IT, HRD, dll"
                        />
                        <InputError message={errors.nama_divisi} className="mt-2" />
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
                        Apakah anda yakin ingin menghapus divisi ini?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeDeletionModal}>Batal</SecondaryButton>
                        <DangerButton className="ml-3" onClick={deleteDivision} disabled={deleteForm.processing}>
                            Hapus
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
