/**
 * ============================================================================
 * Component   : InternResetModal
 * Layer       : UI (Component)
 *
 * Description:
 * Modal konfirmasi menggunakan AlertDialog Shadcn untuk memverifikasi
 * tindakan reset poin bulanan seluruh karyawan (intern), dilengkapi dengan
 * warning deteksi tanggal.
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
import { AlertTriangleIcon, Loader2Icon, RotateCcwIcon } from "lucide-react";

interface InternResetModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isFirstDate: boolean;
    processing?: boolean;
}

export default function InternResetModal({
    show,
    onClose,
    onConfirm,
    isFirstDate,
    processing = false,
}: InternResetModalProps) {
    return (
        <AlertDialog open={show} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground flex items-center gap-2 text-xl font-bold">
                        <AlertTriangleIcon className="h-5.5 w-5.5 shrink-0 text-orange-500" />
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
                    <AlertDialogCancel onClick={onClose}>
                        Batal
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
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
