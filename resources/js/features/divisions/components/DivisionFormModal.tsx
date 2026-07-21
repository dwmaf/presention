/**
 * ============================================================================
 * Component   : DivisionFormModal
 * Layer       : UI (Component)
 *
 * Description:
 * Modal form untuk menambah dan mengubah informasi divisi.
 * ============================================================================
 */

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import InputError from "@/components/InputError";
import type { DivisionFormState } from "../types/division";
import { PuzzleSmall } from "@/components/PuzzleIcons";
import { Loader2Icon, SaveIcon } from "lucide-react";

interface DivisionFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    data: DivisionFormState;
    setData: (key: keyof DivisionFormState, value: string) => void;
    processing: boolean;
    errors: Partial<Record<keyof DivisionFormState, string>>;
    isEditMode: boolean;
}

/**
 * Modal dialog penambahan dan pengubahan divisi.
 */
export default function DivisionFormModal({
    show,
    onClose,
    onSubmit,
    data,
    setData,
    processing,
    errors,
    isEditMode,
}: DivisionFormModalProps) {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[560px] p-6">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <PuzzleSmall className="text-primary size-6" />

                        <DialogTitle className="text-xl font-bold">
                            {isEditMode ? "Edit Divisi" : "Tambah Divisi"}
                        </DialogTitle>
                    </div>

                    <DialogDescription className="text-sm">
                        {isEditMode
                            ? "Perbarui informasi divisi dengan mengubah form di bawah."
                            : "Tambahkan divisi baru dengan mengisi form di bawah."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nama_divisi">Nama Divisi</Label>

                        <Input
                            id="nama_divisi"
                            type="text"
                            value={data.nama_divisi}
                            onChange={(e) =>
                                setData("nama_divisi", e.target.value)
                            }
                            placeholder="Contoh: IT, HRD, dll"
                            className="w-full focus-visible:ring-0"
                        />
                        <InputError
                            message={errors.nama_divisi}
                            className="mt-1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">
                            Deskripsi{" "}
                            <span className="font-normal text-gray-400">
                                (opsional)
                            </span>
                        </Label>

                        <Textarea
                            id="deskripsi"
                            value={data.deskripsi}
                            onChange={(e) =>
                                setData("deskripsi", e.target.value)
                            }
                            rows={3}
                            placeholder="Deskripsikan tugas dan tanggung jawab divisi ini..."
                            className="min-h-20 w-full focus-visible:ring-0"
                        />
                        <InputError
                            message={errors.deskripsi}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="font-semibold text-gray-700"
                        >
                            Batal
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin" />
                                    {isEditMode
                                        ? "Memperbarui..."
                                        : "Menyimpan..."}
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="size-4" />
                                    {isEditMode
                                        ? "Perbarui Divisi"
                                        : "Simpan Divisi"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
