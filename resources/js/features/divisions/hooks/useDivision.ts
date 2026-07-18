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

import { useState, useMemo, useEffect } from "react";
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
 *
 * @param props Properti pembantu inisialisasi hook.
 * @returns State, handler modal, submit form, dan assign/remove intern.
 */
export function useDivision({ divisions, allInterns }: UseDivisionProps) {
    // * State untuk mengontrol visibilitas dialog & detail aktif
    const [modal, setModal] = useState<{
        form: boolean;
        delete: boolean;
        detail: DivisionData | null;
    }>({
        form: false,
        delete: false,
        detail: null,
    });

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [selectedDivision, setSelectedDivision] =
        useState<DivisionData | null>(null);

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

    // ? Menjaga detail divisi tetap sinkron saat props dari server berubah (reactive)
    useEffect(() => {
        if (!modal.detail) return;
        const updated = divisions.find((d) => d.id === modal.detail?.id);
        if (updated) {
            setModal((prev) => ({ ...prev, detail: updated }));
        }
    }, [divisions, modal.detail]);

    // ? Menyarankan intern yang belum bergabung ke divisi terpilih
    const memberSuggestions = useMemo(() => {
        if (!modal.detail) return [];
        const memberIds = new Set(modal.detail.interns?.map((i) => i.id) ?? []);
        return allInterns.filter(
            (i) =>
                !memberIds.has(i.id) &&
                i.name.toLowerCase().includes(memberSearch.toLowerCase()),
        );
    }, [allInterns, modal.detail, memberSearch]);

    const openFormModal = (division: DivisionData | null = null) => {
        setIsEditMode(!!division);
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
        setModal((prev) => ({ ...prev, detail: division }));
    };

    const closeDetailModal = () => {
        setModal((prev) => ({ ...prev, detail: null }));
        setShowAddMember(false);
        setMemberSearch("");
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                closeFormModal();
                toast.success("Berhasil!");
            },
            onError: () => {
                toast.error("Terjadi kesalahan.");
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
                    toast.success("Divisi dihapus!");
                }
            },
            onError: () => {
                toast.error("Gagal menghapus.");
            },
        });
    };

    const assignIntern = (intern: DivisionMember) => {
        if (!modal.detail) return;
        router.post(
            route("divisions.assignIntern", modal.detail.id),
            { intern_id: intern.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setMemberSearch("");
                    setShowAddMember(false);
                    toast.success("Anggota ditambahkan!");
                },
            },
        );
    };

    const removeIntern = (intern: DivisionMember) => {
        if (!modal.detail) return;
        router.delete(
            route("divisions.removeIntern", [modal.detail.id, intern.id]),
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Anggota dihapus!");
                },
            },
        );
    };

    return {
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
    };
}
