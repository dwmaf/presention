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
 *
 * @param props Properti form modal.
 * @returns Modal form divisi.
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
                <DialogHeader className="mb-4">
                    <div className="flex items-center gap-3">
                        <PuzzleSmall />
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            {isEditMode ? "Edit Divisi" : "Tambah Divisi"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-gray-500">
                        Isi data untuk menambahkan divisi baru.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label
                            htmlFor="nama_divisi"
                            className="mb-1 block text-sm font-semibold text-gray-700"
                        >
                            Nama Divisi
                        </Label>
                        <Input
                            id="nama_divisi"
                            type="text"
                            value={data.nama_divisi}
                            onChange={(e) =>
                                setData("nama_divisi", e.target.value)
                            }
                            placeholder="Contoh: IT, HRD, dll"
                            className="w-full focus:ring-2 focus:ring-indigo-400"
                        />
                        <InputError
                            message={errors.nama_divisi}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="deskripsi"
                            className="mb-1 block text-sm font-semibold text-gray-700"
                        >
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
                            className="w-full resize-none focus:ring-2 focus:ring-indigo-400"
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

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isEditMode ? "Update" : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
