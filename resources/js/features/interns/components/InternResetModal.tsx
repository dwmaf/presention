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
import { AlertTriangleIcon, Loader2Icon, RotateCcwIcon } from "lucide-react";

/**
 * Kontrak properti untuk modal konfirmasi reset poin karyawan.
 */
export interface InternResetModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isFirstDate: boolean;
    processing?: boolean;
}

/**
 * Modal konfirmasi untuk mengeksekusi reset poin bulanan seluruh karyawan.
 */
export default function InternResetModal({
    show,
    onClose,
    onConfirm,
    isFirstDate,
    processing = false,
}: InternResetModalProps) {
    return (
        <AlertDialog
            open={show}
            onOpenChange={(open) => {
                if (!open && !processing) onClose();
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground flex items-center gap-2 text-xl font-bold">
                        <AlertTriangleIcon className="size-5 shrink-0 text-orange-500" />
                        Konfirmasi Reset Poin
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-muted-foreground pt-2 text-sm">
                        {isFirstDate ? (
                            "Apakah Anda yakin ingin mereset poin semua karyawan menjadi 5?"
                        ) : (
                            <span className="block space-y-2">
                                <span className="text-destructive bg-destructive/10 border-destructive/20 block rounded-lg border p-2.5 font-semibold">
                                    Peringatan: Hari ini BUKAN tanggal 1.
                                </span>
                                <span className="text-foreground/80 block">
                                    Apakah Anda yakin ingin tetap mereset poin
                                    semua karyawan saat ini meskipun bukan
                                    tanggal 1?
                                </span>
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={processing}>
                        Batal
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={processing}
                        variant="destructive"
                    >
                        {processing ? (
                            <>
                                <Loader2Icon className="size-4 animate-spin" />
                                Mereset...
                            </>
                        ) : (
                            <>
                                <RotateCcwIcon className="size-4" />
                                Ya, Reset Semua Poin
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
