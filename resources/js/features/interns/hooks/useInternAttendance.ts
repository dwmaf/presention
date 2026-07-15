/**
 * ============================================================================
 * Hook        : useInternAttendance
 * Layer       : Feature (Hook)
 *
 * Description:
 * Mengelola edit status absensi dan jam pulang karyawan.
 * ============================================================================
 */

import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

/**
 * Hook kustom untuk manajemen status absensi harian karyawan.
 *
 * @returns State edit absensi dan fungsi handler pembaruan data.
 */
export function useInternAttendance() {
    const [showStatusForm, setShowStatusForm] = useState<boolean>(false);
    const [currentAttendanceId, setCurrentAttendanceId] = useState<
        number | null
    >(null);
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    const [showCheckOutForm, setShowCheckOutForm] = useState<boolean>(false);
    const [editingCheckOutId, setEditingCheckOutId] = useState<number | null>(
        null,
    );
    const [checkOutValue, setCheckOutValue] = useState<string>("");

    const [confirmingCheckOutDeletion, setConfirmingCheckOutDeletion] =
        useState<boolean>(false);

    const handleToggleStatusForm = (
        attendanceId: number,
        currentStatus: string,
    ) => {
        if (showStatusForm && currentAttendanceId === attendanceId) {
            setShowStatusForm(false);
            setCurrentAttendanceId(null);
            setSelectedStatus("");
        } else {
            setShowStatusForm(true);
            setCurrentAttendanceId(attendanceId);
            setSelectedStatus(currentStatus);
        }
    };

    const handleSaveStatus = (status: string) => {
        if (currentAttendanceId) {
            router.put(
                `/attendances/${currentAttendanceId}/status`,
                { status },
                {
                    onSuccess: () => {
                        setShowStatusForm(false);
                        setSelectedStatus("");
                        setCurrentAttendanceId(null);
                        toast.success("Status kehadiran berhasil diubah!");
                    },
                    onError: (err) => {
                        toast.error(
                            "Gagal mengubah status: " +
                                Object.values(err).join(", "),
                        );
                    },
                },
            );
        }
    };

    const handleCancelStatusUpdate = () => {
        setShowStatusForm(false);
        setSelectedStatus("");
        setCurrentAttendanceId(null);
    };

    const handleToggleCheckOutForm = (
        attendanceId: number,
        currentCheckOut?: string | null,
    ) => {
        if (showCheckOutForm && editingCheckOutId === attendanceId) {
            setShowCheckOutForm(false);
            setEditingCheckOutId(null);
            setCheckOutValue("");
        } else {
            setShowCheckOutForm(true);
            setEditingCheckOutId(attendanceId);
            setCheckOutValue(
                currentCheckOut ? currentCheckOut.slice(0, 5) : "",
            );
        }
    };

    const handleSaveCheckOut = (value: string) => {
        if (editingCheckOutId) {
            router.put(
                `/attendances/${editingCheckOutId}/check-out`,
                { check_out: value },
                {
                    onSuccess: () => {
                        setShowCheckOutForm(false);
                        setEditingCheckOutId(null);
                        setCheckOutValue("");
                        toast.success("Jam pulang berhasil diubah!");
                    },
                    onError: (err) => {
                        toast.error(
                            "Gagal mengubah jam pulang: " +
                                Object.values(err).join(", "),
                        );
                    },
                },
            );
        }
    };

    const handleCancelCheckOutUpdate = () => {
        setShowCheckOutForm(false);
        setEditingCheckOutId(null);
        setCheckOutValue("");
    };

    const handleDeleteCheckOut = () => {
        if (editingCheckOutId) {
            router.put(
                `/attendances/${editingCheckOutId}/check-out`,
                { check_out: null },
                {
                    onSuccess: () => {
                        setShowCheckOutForm(false);
                        setEditingCheckOutId(null);
                        setCheckOutValue("");
                        setConfirmingCheckOutDeletion(false);
                        toast.success("Jam pulang berhasil dihapus!");
                    },
                    onError: (err) => {
                        toast.error(
                            "Gagal menghapus jam pulang: " +
                                Object.values(err).join(", "),
                        );
                        setShowCheckOutForm(false);
                        setEditingCheckOutId(null);
                        setCheckOutValue("");
                        setConfirmingCheckOutDeletion(false);
                    },
                },
            );
        }
    };

    return {
        showStatusForm,
        currentAttendanceId,
        selectedStatus,
        setSelectedStatus,
        showCheckOutForm,
        editingCheckOutId,
        checkOutValue,
        setCheckOutValue,
        confirmingCheckOutDeletion,
        setConfirmingCheckOutDeletion,
        handleToggleStatusForm,
        handleSaveStatus,
        handleCancelStatusUpdate,
        handleToggleCheckOutForm,
        handleSaveCheckOut,
        handleCancelCheckOutUpdate,
        handleDeleteCheckOut,
    };
}
