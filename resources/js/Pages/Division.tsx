/**
 * ============================================================================
 * Component   : Division (Manajemen Divisi)
 * Layer       : Feature (Page)
 *
 * Description:
 * Halaman utama manajemen divisi. Mengatur tata letak halaman dan
 * mengintegrasikan UI component dengan hook controller useDivision.
 * ============================================================================
 */

import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Button } from "@/components/ui/button";

import DivisionCard from "@/features/divisions/components/DivisionCard";
import DivisionFormModal from "@/features/divisions/components/DivisionFormModal";
import DivisionDetailModal from "@/features/divisions/components/DivisionDetailModal";
import DivisionDeleteModal from "@/features/divisions/components/DivisionDeleteModal";
import { useDivision } from "@/features/divisions/hooks/useDivision";
import type { DivisionProps } from "@/features/divisions/types/division";
import { PuzzleSmall } from "@/components/PuzzleIcons";
import { useEffect } from "react";

/**
 * Komponen utama halaman Divisi.
 *
 * @param props Properti dari Laravel Inertia Controller.
 * @returns Halaman daftar divisi.
 */
export default function Division({
    divisions,
    allInterns = [],
}: DivisionProps) {
    const {
        modal,
        isEditMode,
        selectedDivision,
        memberSearch,
        setMemberSearch,
        showAddMember,
        setShowAddMember,
        form,
        deleteForm,
        memberSuggestions,
        openFormModal,
        closeFormModal,
        openDeleteModal,
        closeDeleteModal,
        openDetailModal,
        closeDetailModal,
        submit,
        deleteDivision,
        assignIntern,
        removeIntern,
        isRemovingIntern,
    } = useDivision({ divisions, allInterns });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const showId = params.get("show");

        if (showId && divisions.length > 0) {
            const foundDivision = divisions.find(
                (d) => d.id === Number(showId),
            );
            if (foundDivision) {
                openDetailModal(foundDivision);
                // Bersihkan URL
                window.history.replaceState({}, "", route("divisions.index"));
            }
        }
    }, [divisions]);

    return (
        <AuthenticatedLayout>
            <Head title="Divisi" />

            <div className="space-y-6">
                {/* Header baris */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-3xl font-bold tracking-tight">
                            Manajemen Divisi
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Daftar divisi yang berperan dalam mendukung
                            operasional dan pengembangan UPA PKK UNTAN.
                        </p>
                    </div>

                    <Button
                        onClick={() => openFormModal(null)}
                        size="lg"
                        className=""
                    >
                        <PuzzleSmall className="size-5 text-white" />
                        Tambah Divisi Baru
                    </Button>
                </div>

                {/* Grid Kartu Divisi */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {divisions.map((division) => (
                        <DivisionCard
                            key={division.id}
                            division={division}
                            onDetail={() => openDetailModal(division)}
                            onEdit={() => openFormModal(division)}
                            onDelete={() => openDeleteModal(division)}
                        />
                    ))}

                    {divisions.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">
                            Belum ada divisi. Klik "Tambah Divisi" untuk
                            menambahkan.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah / Edit Divisi */}
            <DivisionFormModal
                show={modal.form}
                onClose={closeFormModal}
                onSubmit={submit}
                data={form.data}
                setData={form.setData}
                processing={form.processing}
                errors={form.errors}
                isEditMode={isEditMode}
            />

            {/* Modal Detail & Management Anggota Divisi */}
            <DivisionDetailModal
                show={!!modal.detail}
                onClose={closeDetailModal}
                division={modal.detail}
                memberSearch={memberSearch}
                setMemberSearch={setMemberSearch}
                showAddMember={showAddMember}
                setShowAddMember={setShowAddMember}
                memberSuggestions={memberSuggestions}
                onAssign={assignIntern}
                onRemove={removeIntern}
                processing={isRemovingIntern}
            />

            {/* Modal Konfirmasi Hapus Divisi */}
            <DivisionDeleteModal
                show={modal.delete}
                onClose={closeDeleteModal}
                onDelete={deleteDivision}
                processing={deleteForm.processing}
                division={selectedDivision}
            />
        </AuthenticatedLayout>
    );
}
