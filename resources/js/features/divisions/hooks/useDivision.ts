/**
 * ============================================================================
 * Hook        : useDivision
 * Layer       : Feature (Hook)
 *
 * Description:
 * Hook kustom untuk memisahkan logika bisnis (state, server request, filter)
 * dari komponen UI utama manajemen divisi.
 * ============================================================================
 */

import { useState, useMemo } from "react";
import { useForm, router } from "@inertiajs/react";
import { toast } from "sonner";
import type {
    DivisionData,
    DivisionMember,
    DivisionFormState,
} from "../types/division";

interface UseDivisionProps {
    divisions: DivisionData[];
    allInterns: DivisionMember[];
}

/**
 * Hook pengelola state dan aksi divisi.
 */
export function useDivision({ divisions, allInterns }: UseDivisionProps) {
    // * State untuk mengontrol visibilitas dialog & detail aktif
    const [modal, setModal] = useState<{
        form: boolean;
        delete: boolean;
        detailId: number | null;
    }>({
        form: false,
        delete: false,
        detailId: null,
    });

    const [selectedDivision, setSelectedDivision] =
        useState<DivisionData | null>(null);

    const isEditMode = !!selectedDivision;

    const activeDetail = useMemo(
        () => divisions.find((d) => d.id === modal.detailId) || null,
        [divisions, modal.detailId],
    );

    const exportedModal = {
        form: modal.form,
        delete: modal.delete,
        detail: activeDetail,
    };

    // * State pencarian dan panel tambah anggota divisi
    const [memberSearch, setMemberSearch] = useState<string>("");
    const [showAddMember, setShowAddMember] = useState<boolean>(false);

    // * Form handler untuk operasi Simpan & Edit Divisi
    const form = useForm<DivisionFormState>({
        nama_divisi: "",
        deskripsi: "",
    });

    // * Form handler kosong untuk operasi Hapus Divisi
    const deleteForm = useForm({});

    // ? Menyarankan intern yang belum bergabung ke divisi terpilih
    const memberSuggestions = useMemo(() => {
        if (!activeDetail) return [];
        const memberIds = new Set(activeDetail.interns?.map((i) => i.id) ?? []);

        return allInterns.filter(
            (i) =>
                i.is_active !== false &&
                !memberIds.has(i.id) &&
                i.name.toLowerCase().includes(memberSearch.toLowerCase()),
        );
    }, [allInterns, activeDetail, memberSearch]);

    const openFormModal = (division: DivisionData | null = null) => {
        setSelectedDivision(division);
        form.setData({
            nama_divisi: division?.nama_divisi ?? "",
            deskripsi: division?.deskripsi ?? "",
        });
        form.clearErrors();
        setModal((prev) => ({ ...prev, form: true }));
    };

    const closeFormModal = () => {
        setModal((prev) => ({ ...prev, form: false }));
        setSelectedDivision(null);
        form.reset();
    };

    const openDeleteModal = (division: DivisionData) => {
        setSelectedDivision(division);
        setModal((prev) => ({ ...prev, delete: true }));
    };

    const closeDeleteModal = () => {
        setModal((prev) => ({ ...prev, delete: false }));
        setSelectedDivision(null);
    };

    const openDetailModal = (division: DivisionData) => {
        setModal((prev) => ({ ...prev, detailId: division.id }));
    };

    const closeDetailModal = () => {
        setModal((prev) => ({ ...prev, detailId: null }));
        setShowAddMember(false);
        setMemberSearch("");
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                closeFormModal();
                toast.success(
                    isEditMode
                        ? "Data divisi berhasil diperbarui."
                        : "Divisi baru berhasil ditambahkan.",
                );
            },
            onError: () => {
                toast.error(
                    isEditMode
                        ? "Gagal memperbarui data divisi."
                        : "Gagal menambahkan divisi baru.",
                );
            },
        };

        if (isEditMode && selectedDivision) {
            form.put(route("divisions.update", selectedDivision.id), options);
        } else {
            form.post(route("divisions.store"), options);
        }
    };

    const deleteDivision = () => {
        if (!selectedDivision) return;
        deleteForm.delete(route("divisions.destroy", selectedDivision.id), {
            onSuccess: (page) => {
                closeDeleteModal();
                const props = page.props as unknown as {
                    flash?: {
                        error?: string;
                        success?: string;
                    };
                };
                if (props.flash?.error) {
                    toast.error(props.flash.error);
                } else {
                    toast.success(
                        props.flash?.success ||
                            `Divisi ${selectedDivision.nama_divisi} berhasil dihapus!`,
                    );
                }
            },
            onError: () => {
                toast.error(
                    `Gagal menghapus divisi ${selectedDivision.nama_divisi}.`,
                );
            },
        });
    };

    const assignIntern = (intern: DivisionMember) => {
        if (!activeDetail) return;
        router.post(
            route("divisions.assignIntern", activeDetail.id),
            { intern_id: intern.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setMemberSearch("");
                    setShowAddMember(false);
                    toast.success(
                        `${intern.name} berhasil ditambahkan ke divisi ${activeDetail.nama_divisi}.`,
                    );
                },
            },
        );
    };

    const [isRemovingIntern, setIsRemovingIntern] = useState<boolean>(false);

    const removeIntern = (intern: DivisionMember) => {
        if (!activeDetail) return;

        setIsRemovingIntern(true);

        router.delete(
            route("divisions.removeIntern", [activeDetail.id, intern.id]),
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `${intern.name} berhasil dihapus dari divisi ${activeDetail.nama_divisi}.`,
                    );
                },
                onFinish: () => setIsRemovingIntern(false),
            },
        );
    };

    return {
        modal: exportedModal,
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
    };
}
