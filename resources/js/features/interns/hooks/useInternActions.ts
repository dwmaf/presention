import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface UseInternActionsProps {
    internId: number;
}

/**
 * Menyusun struktur payload toleransi per hari yang siap dikirimkan ke endpoint backend.
 */
export type TolerancePayload = Record<
    string,
    { checked: boolean; time: string }
>;

/**
 * Hook kustom untuk aksi toleransi keterlambatan dan penghapusan karyawan.
 */
export function useInternActions({ internId }: UseInternActionsProps) {
    const [showToleranceModal, setShowToleranceModal] =
        useState<boolean>(false);
    const [confirmingDeletion, setConfirmingDeletion] =
        useState<boolean>(false);
    const [confirmingToggleActive, setConfirmingToggleActive] =
        useState<boolean>(false);

    const [isSavingTolerance, setIsSavingTolerance] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isTogglingActive, setIsTogglingActive] = useState<boolean>(false);

    const handleSaveTolerance = (toleransiDays: TolerancePayload) => {
        setIsSavingTolerance(true);
        router.put(`/interns/${internId}/update-toleransi`, toleransiDays, {
            onSuccess: () => {
                setShowToleranceModal(false);
                toast.success("Toleransi keterlambatan berhasil diubah!");
            },
            onError: (err) => {
                toast.error(
                    "Gagal mengubah toleransi: " +
                        Object.values(err).join(", "),
                );
            },
            onFinish: () => setIsSavingTolerance(false),
        });
    };

    const handleDeleteIntern = () => {
        setIsDeleting(true);
        router.delete(`/interns/${internId}`, {
            onSuccess: () => {
                toast.success("Data berhasil dihapus selamanya.");
                setConfirmingDeletion(false);
            },
            onError: () => {
                toast.error("Gagal menghapus data.");
                setConfirmingDeletion(false);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleToggleActive = () => {
        setIsTogglingActive(true);
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
                onFinish: () => setIsTogglingActive(false),
            },
        );
    };

    return {
        showToleranceModal,
        setShowToleranceModal,
        confirmingDeletion,
        setConfirmingDeletion,
        confirmingToggleActive,
        setConfirmingToggleActive,
        handleSaveTolerance,
        handleDeleteIntern,
        handleToggleActive,
        isSavingTolerance,
        isDeleting,
        isTogglingActive,
    };
}
