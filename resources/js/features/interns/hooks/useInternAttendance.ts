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
 *
 * @returns State dan fungsi kontrol modal kehadiran.
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

    // * Buka modal dan inisialisasi input dengan data baris terpilih
    const handleOpenEditModal = (attendance: Attendance) => {
        setEditingAttendance(attendance);
        setSelectedStatus(attendance.status);
        setCheckOutValue(
            attendance.check_out ? attendance.check_out.slice(0, 5) : "",
        );
        setShowEditModal(true);
    };

    // * Simpan pembaruan status dan jam pulang sekaligus secara berurutan menggunakan router Inertia
    const handleSaveAttendance = (status: string, checkOut: string | null) => {
        if (!editingAttendance) return;
        setIsSaving(true);

        // ? 1. Update status kehadiran
        router.put(
            `/attendances/${editingAttendance.id}/status`,
            { status },
            {
                onSuccess: () => {
                    // ? 2. Setelah status sukses, update jam pulang
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
                            onFinish: () => {
                                setIsSaving(false);
                            },
                        },
                    );
                },
                onError: () => {
                    toast.error("Gagal memperbarui status kehadiran.");
                    setIsSaving(false);
                },
            },
        );
    };

    // * Hapus catatan jam pulang
    const handleDeleteCheckOut = () => {
        if (editingAttendance) {
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
    };
}
