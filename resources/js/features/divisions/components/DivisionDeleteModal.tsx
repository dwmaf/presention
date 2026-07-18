/**
 * ============================================================================
 * Component   : DivisionDeleteModal
 * Layer       : UI (Component)
 *
 * Description:
 * Modal konfirmasi penghapusan data divisi menggunakan AlertDialog Shadcn.
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
import type { DivisionData } from "../types/division";

interface DivisionDeleteModalProps {
    show: boolean;
    onClose: () => void;
    onDelete: () => void;
    processing: boolean;
    division: DivisionData | null;
}

/**
 * Dialog konfirmasi hapus divisi.
 *
 * @param props Properti modal konfirmasi.
 * @returns Dialog konfirmasi.
 */
export default function DivisionDeleteModal({
    show,
    onClose,
    onDelete,
    processing,
    division,
}: DivisionDeleteModalProps) {
    return (
        <AlertDialog open={show} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Divisi</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus divisi{" "}
                        <strong className="text-foreground">
                            {division?.nama_divisi}
                        </strong>
                        ? Tindakan ini bersifat permanen dan tidak dapat
                        dibatalkan.
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
