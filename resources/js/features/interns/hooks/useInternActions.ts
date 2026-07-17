/**
 * ============================================================================
 * Hook        : useInternActions
 * Layer       : Feature (Hook)
 *
 * Description:
 * Mengelola tindakan umum karyawan magang seperti hapus data dan set toleransi.
 * ============================================================================
 */

import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface UseInternActionsProps {
    internId: number;
}

/**
 * Hook kustom untuk aksi toleransi keterlambatan dan penghapusan karyawan.
 *
 * @param props Properti hook.
 * @returns State modal aksi dan fungsi pengirim mutasi API.
 */
export function useInternActions({ internId }: UseInternActionsProps) {
    const [showToleransiModal, setShowToleransiModal] =
        useState<boolean>(false);
    const [confirmingDeletion, setConfirmingDeletion] =
        useState<boolean>(false);

    const handleSaveToleransi = (toleransiDays: any) => {
        router.put(`/interns/${internId}/update-toleransi`, toleransiDays, {
            onSuccess: () => {
                setShowToleransiModal(false);
                toast.success("Toleransi keterlambatan berhasil diubah!");
                router.reload();
            },
            onError: (err) => {
                toast.error(
                    "Gagal mengubah toleransi: " +
                        Object.values(err).join(", "),
                );
            },
        });
    };

    const handleDeleteIntern = () => {
        router.delete(route("interns.destroy", internId), {
            onSuccess: () => {
                toast.success("Data berhasil dihapus selamanya.");
                setConfirmingDeletion(false);
                window.location.reload();
            },
            onError: () => {
                toast.error("Gagal menghapus data.");
                setConfirmingDeletion(false);
            },
        });
    };

    const [confirmingToggleActive, setConfirmingToggleActive] =
        useState<boolean>(false);

    const handleToggleActive = () => {
        router.put(
            `/interns/${internId}/toggle-active`,
            {},
            {
                onSuccess: () => {
                    setConfirmingToggleActive(false);
                    toast.success("Status keaktifan berhasil diperbarui!");
                },
                onError: () => {
                    setConfirmingToggleActive(false);
                    toast.error("Gagal mengubah status keaktifan.");
                },
            },
        );
    };

    return {
        showToleransiModal,
        setShowToleransiModal,
        confirmingDeletion,
        setConfirmingDeletion,
        confirmingToggleActive,
        setConfirmingToggleActive,
        handleSaveToleransi,
        handleDeleteIntern,
        handleToggleActive,
    };
}
