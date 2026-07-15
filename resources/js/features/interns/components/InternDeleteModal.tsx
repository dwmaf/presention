/**
 * ============================================================================
 * Component   : InternDeleteModal
 * Layer       : UI (Component)
 *
 * Description:
 * Modal konfirmasi menggunakan AlertDialog Shadcn untuk memverifikasi
 * tindakan penghapusan data karyawan (intern).
 * ============================================================================
 */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InternDeleteModalProps {
    show: boolean;
    onClose: () => void;
    onDelete: () => void;
    processing: boolean;
}

export default function InternDeleteModal({
    show,
    onClose,
    onDelete,
    processing,
}: InternDeleteModalProps) {
    return (
        <AlertDialog open={show} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Data Karyawan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus data ini? Tindakan ini
                        bersifat permanen dan tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={processing}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete();
                        }}
                        disabled={processing}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        {processing ? "Menghapus..." : "Hapus"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
