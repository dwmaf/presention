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
import { Loader2Icon, TrashIcon } from "lucide-react";

/**
 * Kontrak properti untuk modal konfirmasi penghapusan karyawan.
 */
export interface InternDeleteModalProps {
    show: boolean;
    onClose: () => void;
    onDelete: () => void;
    processing: boolean;
    internName?: string;
}

/**
 * Modal konfirmasi untuk memverifikasi tindakan penghapusan data karyawan.
 */
export default function InternDeleteModal({
    show,
    onClose,
    onDelete,
    processing,
    internName,
}: InternDeleteModalProps) {
    return (
        <AlertDialog
            open={show}
            onOpenChange={(open) => {
                if (!open && !processing) onClose();
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold">
                        Hapus Data Karyawan
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm">
                        Apakah Anda yakin ingin menghapus data{" "}
                        <span className="text-foreground font-semibold">
                            {internName || "karyawan ini"}
                        </span>
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
