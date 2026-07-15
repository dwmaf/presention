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
import { AlertTriangleIcon } from "lucide-react";

interface InternResetModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isFirstDate: boolean;
}

export default function InternResetModal({
    show,
    onClose,
    onConfirm,
    isFirstDate,
}: InternResetModalProps) {
    return (
        <AlertDialog open={show} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
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
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel onClick={onClose}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        Reset Semua Poin
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
