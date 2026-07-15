/**
 * ============================================================================
 * Hook        : useInternPhoto
 * Layer       : Feature (Hook)
 *
 * Description:
 * Mengelola upload dan pembaruan foto profil karyawan.
 * ============================================================================
 */

import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface UseInternPhotoProps {
    internId: number;
}

/**
 * Hook kustom untuk upload foto karyawan.
 *
 * @param props Properti hook.
 * @returns State upload dan fungsi handler input file.
 */
export function useInternPhoto({ internId }: UseInternPhotoProps) {
    const [uploading, setUploading] = useState<boolean>(false);

    const handlePhotoClick = () => {
        const fileInput = document.getElementById(
            "photo-upload",
        ) as HTMLInputElement;
        fileInput?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
            toast.error("Format file harus JPG, JPEG, atau PNG");
            return;
        }

        if (file.size > 2048000) {
            toast.error("Ukuran file maksimal 2MB");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("foto", file);
        formData.append("_method", "PUT");

        router.post(`/interns/${internId}/update-photo`, formData, {
            onSuccess: () => {
                setUploading(false);
                toast.success("Foto berhasil diubah!");
                router.reload();
            },
            onError: (err) => {
                setUploading(false);
                toast.error(
                    "Gagal mengubah foto: " + Object.values(err).join(", "),
                );
            },
        });
    };

    return {
        uploading,
        handlePhotoClick,
        handlePhotoChange,
    };
}
