/**
 * ============================================================================
 * Component   : InternAddModal
 * Layer       : UI (Component)
 *
 * Description:
 * Modal form untuk menambah atau mengubah data profil karyawan (intern),
 * terintegrasi dengan upload foto preview dan checkbox jadwal mingguan.
 * ============================================================================
 */

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import InputError from "@/components/InputError";
import { XIcon, UploadCloudIcon, Loader2Icon, SaveIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

import type { Division, InternData } from "@/features/interns/types/intern";

/**
 * Kontrak properti untuk komponen modal penambahan karyawan magang.
 */
interface InternFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    data: {
        name: string;
        division_id: string;
        foto: File | null;
        poin: number;
        senin: boolean;
        selasa: boolean;
        rabu: boolean;
        kamis: boolean;
        jumat: boolean;
    };
    setData: <K extends keyof InternFormModalProps["data"]>(
        key: K,
        value: InternFormModalProps["data"][K],
    ) => void;
    processing: boolean;
    errors: Record<string, string>;
    divisions: Division[];
    currentIntern: InternData | null;
}

const DAYS = ["senin", "selasa", "rabu", "kamis", "jumat"] as const;

/**
 * Komponen modal untuk mengelola penambahan atau perubahan data karyawan.
 * Menangani state lokal untuk preview foto dan logika checklist jadwal hari kerja.
 */
export default function InternAddModal({
    show,
    onClose,
    onSubmit,
    data,
    setData,
    processing,
    errors,
    divisions,
    currentIntern,
}: InternFormModalProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // ? Membersihkan preview foto ketika modal ditutup untuk mencegah data stale.
    useEffect(() => {
        if (!show) {
            setPhotoPreview(null);
        }
    }, [show]);

    const isAllDaysChecked = () => {
        return DAYS.every((day) => data[day]);
    };

    const handleToggleAllDays = (checked: boolean) => {
        DAYS.forEach((day) => {
            setData(day, checked);
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("foto", file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog
            open={show}
            onOpenChange={(open) => !open && !processing && onClose()}
        >
            <DialogContent className="custom-scrollbar max-h-[90vh] max-w-[95vw] overflow-y-auto md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        Tambah Karyawan
                    </DialogTitle>

                    <DialogDescription>
                        Silahkan isi informasi profil dan jadwal kerja untuk
                        karyawan baru.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="flex flex-col gap-6 md:flex-row">
                        <div className="flex flex-col items-center gap-2">
                            <Label className="cursor-pointer">
                                {photoPreview || currentIntern?.foto ? (
                                    <div className="group relative h-60 w-40 overflow-hidden rounded-xl border">
                                        <img
                                            src={
                                                photoPreview
                                                    ? photoPreview
                                                    : `/storage/${currentIntern?.foto}`
                                            }
                                            className="h-full w-full object-cover object-top"
                                            alt="Preview Foto Karyawan"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 hover:opacity-100">
                                            <span className="text-xs font-semibold text-white">
                                                Ubah Foto
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setPhotoPreview(null);
                                                setData("foto", null);
                                            }}
                                            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full"
                                        >
                                            <XIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 flex h-60 w-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors">
                                        <UploadCloudIcon className="text-muted-foreground h-10 w-10" />
                                        <p className="text-muted-foreground text-xs font-medium">
                                            {data.foto
                                                ? data.foto.name
                                                : "Unggah Foto Karyawan"}
                                        </p>
                                        <input
                                            id="foto"
                                            type="file"
                                            name="foto"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </Label>
                            <InputError message={errors.foto} />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Karyawan</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Masukkan nama lengkap"
                                    autoFocus
                                    className="w-full bg-white focus-visible:ring-0"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="division_id">Divisi</Label>
                                <Select
                                    value={
                                        data.division_id
                                            ? String(data.division_id)
                                            : undefined
                                    }
                                    onValueChange={(val) =>
                                        setData("division_id", val || "")
                                    }
                                >
                                    <SelectTrigger
                                        id="division_id"
                                        className="w-full bg-white"
                                    >
                                        <SelectValue placeholder="Pilih Divisi">
                                            {(value: unknown) => {
                                                const selected = divisions.find(
                                                    (div) =>
                                                        String(div.id) ===
                                                        String(value),
                                                );
                                                return selected
                                                    ? selected.nama_divisi
                                                    : "Pilih Divisi";
                                            }}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {divisions.map((div) => (
                                            <SelectItem
                                                key={div.id}
                                                value={String(div.id)}
                                            >
                                                {div.nama_divisi}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.division_id} />
                            </div>

                            <div className="space-y-2">
                                <Label>Jadwal Kerja Karyawan</Label>
                                <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
                                    <div className="border-border bg-card hover:bg-muted/30 flex items-center space-x-2 rounded-lg border p-2.5 transition-colors">
                                        <Checkbox
                                            id="everyday"
                                            checked={isAllDaysChecked()}
                                            onCheckedChange={(checked) =>
                                                handleToggleAllDays(!!checked)
                                            }
                                        />
                                        <Label
                                            htmlFor="everyday"
                                            className="cursor-pointer text-sm select-none"
                                        >
                                            Setiap Hari
                                        </Label>
                                    </div>

                                    {DAYS.map((day) => (
                                        <div
                                            key={day}
                                            className="border-border bg-card hover:bg-muted/30 transition- colors flex items-center space-x-2 rounded-lg border p-2.5"
                                        >
                                            <Checkbox
                                                id={day}
                                                checked={data[day]}
                                                onCheckedChange={(checked) =>
                                                    setData(day, !!checked)
                                                }
                                            />
                                            <Label
                                                htmlFor={day}
                                                className="cursor-pointer text-sm capitalize select-none"
                                            >
                                                {day}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Batal
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="size-4" />
                                    Simpan Karyawan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
