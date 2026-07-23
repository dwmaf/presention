/**
 * ============================================================================
 * Hook        : useInternAttendance
 * Layer       : Feature (Hook)
 *
 * Description:
 * Mengelola state dan aksi perubahan kehadiran (status dan jam pulang)
 * karyawan magang secara bersamaan.
 * ============================================================================
 */

import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import type { Attendance } from "../types/intern";

/**
 * Hook pengelola status presensi harian karyawan.
 */
export function useInternAttendance() {
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingAttendance, setEditingAttendance] =
        useState<Attendance | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>("hadir");
    const [checkOutValue, setCheckOutValue] = useState<string>("");
    const [confirmingCheckOutDeletion, setConfirmingCheckOutDeletion] =
        useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDeletingCheckOut, setIsDeletingCheckOut] =
        useState<boolean>(false);

    const handleOpenEditModal = (attendance: Attendance) => {
        setEditingAttendance(attendance);
        setSelectedStatus(attendance.status);
        setCheckOutValue(
            attendance.check_out ? attendance.check_out.slice(0, 5) : "",
        );
        setShowEditModal(true);
    };

    /**
     * Memperbarui status dan jam pulang presensi karyawan.
     *
     * @param status Status presensi baru.
     * @param checkOut Jam pulang baru (opsional).
     */
    const handleSaveAttendance = (status: string, checkOut: string | null) => {
        if (!editingAttendance) return;
        setIsSaving(true);

        router.put(
            `/attendances/${editingAttendance.id}/status`,
            { status },
            {
                onSuccess: () => {
                    router.put(
                        `/attendances/${editingAttendance.id}/check-out`,
                        { check_out: checkOut || null },
                        {
                            onSuccess: () => {
                                toast.success("Kehadiran berhasil diperbarui!");
                                setShowEditModal(false);
                                setEditingAttendance(null);
                            },
                            onError: () => {
                                toast.error("Gagal memperbarui jam pulang.");
                            },
                            onFinish: () => setIsSaving(false),
                        },
                    );
                },
                onError: () => {
                    toast.error("Gagal memperbarui status.");
                    setIsSaving(false);
                },
            },
        );
    };

    const handleDeleteCheckOut = () => {
        if (editingAttendance) {
            setIsDeletingCheckOut(true);
            router.put(
                `/attendances/${editingAttendance.id}/check-out`,
                { check_out: null },
                {
                    onSuccess: () => {
                        setConfirmingCheckOutDeletion(false);
                        setEditingAttendance(null);
                        toast.success("Jam pulang berhasil dihapus!");
                    },
                    onError: () => {
                        toast.error("Gagal menghapus jam pulang.");
                    },
                    onFinish: () => {
                        setIsDeletingCheckOut(false);
                    },
                },
            );
        }
    };

    return {
        showEditModal,
        setShowEditModal,
        editingAttendance,
        setEditingAttendance,
        selectedStatus,
        setSelectedStatus,
        checkOutValue,
        setCheckOutValue,
        confirmingCheckOutDeletion,
        setConfirmingCheckOutDeletion,
        handleOpenEditModal,
        handleSaveAttendance,
        handleDeleteCheckOut,
        isSaving,
        isDeletingCheckOut,
    };
}
