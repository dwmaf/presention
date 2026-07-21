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
import { Loader2Icon, TrashIcon } from "lucide-react";

interface DivisionDeleteModalProps {
    show: boolean;
    onClose: () => void;
    onDelete: () => void;
    processing: boolean;
    division: DivisionData | null;
}

/**
 * Dialog konfirmasi hapus divisi.
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
                    <AlertDialogTitle className="text-xl font-bold tracking-tight">
                        Hapus Divisi
                    </AlertDialogTitle>

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
                        variant="destructive"
                    >
                        {processing ? (
                            <>
                                <Loader2Icon className="size-4 animate-spin" />
                                Menghapus...
                            </>
                        ) : (
                            <>
                                <TrashIcon className="size-4" />
                                Ya, Hapus
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
