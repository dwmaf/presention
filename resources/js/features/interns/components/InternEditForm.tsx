/**
 * ============================================================================
 * Component   : InternForm
 * Layer       : UI (Component)
 *
 * Description:
 * Form pengisian/pengeditan data profil karyawan magang. Dibuat generik
 * agar kompatibel dengan state formulir Inertia di parent component.
 * ============================================================================
 */

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import InputError from "@/components/InputError";
import type { Division } from "@/features/interns/types/intern";
import { Loader2Icon, SaveIcon } from "lucide-react";

const DAYS = [
    { key: "senin", label: "Senin" },
    { key: "selasa", label: "Selasa" },
    { key: "rabu", label: "Rabu" },
    { key: "kamis", label: "Kamis" },
    { key: "jumat", label: "Jumat" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

/**
 * Struktur data dasar yang dibutuhkan oleh formulir pengeditan profil karyawan.
 */
export interface BaseInternFormData {
    name: string;
    division_id: string;
    poin: number;
    senin: boolean;
    selasa: boolean;
    rabu: boolean;
    kamis: boolean;
    jumat: boolean;
    [key: string]: unknown;
}

/**
 * Kontrak properti generik untuk komponen InternEditForm.
 */
export interface InternFormProps<T extends BaseInternFormData> {
    show: boolean;
    setShow: (show: boolean) => void;
    data: T;
    setData: (key: keyof T | T | ((data: T) => T), value?: unknown) => void;
    errors: Record<string, string>;
    divisions: Division[];
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    processing?: boolean;
}

/**
 * Form detail input informasi profil karyawan.
 */
export default function InternEditForm<T extends BaseInternFormData>({
    show,
    data,
    setData,
    errors,
    divisions,
    onSubmit,
    onCancel,
    processing = false,
}: InternFormProps<T>) {
    if (!show) return null;

    const isAllDaysChecked = (): boolean => {
        return DAYS.every((day) => !!data[day.key as DayKey]);
    };

    const handleToggleAllDays = (checked: boolean): void => {
        const updated = {} as Record<DayKey, boolean>;
        DAYS.forEach((day) => {
            updated[day.key] = checked;
        });

        setData({
            ...data,
            ...updated,
        });
    };

    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
                <Label htmlFor="name">Nama</Label>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="w-full focus-visible:ring-0"
                />
                {errors.name && <InputError message={errors.name} />}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="division">Divisi</Label>
                <Select
                    value={String(data.division_id)}
                    onValueChange={(value: string | null) => {
                        if (value !== null) {
                            setData("division_id", value);
                        }
                    }}
                >
                    <SelectTrigger id="division" className="w-full bg-white">
                        <SelectValue placeholder="Pilih Divisi">
                            {(value: unknown) => {
                                const selected = divisions.find(
                                    (div) => String(div.id) === String(value),
                                );
                                return selected
                                    ? selected.nama_divisi
                                    : "Pilih Divisi";
                            }}
                        </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                        {divisions.map((div) => (
                            <SelectItem key={div.id} value={String(div.id)}>
                                {div.nama_divisi}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.division_id} />
            </div>

            <div className="space-y-2">
                <Label>Jadwal (Pilih hari masuk)</Label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50/50">
                        <Checkbox
                            id="all-days"
                            checked={isAllDaysChecked()}
                            onCheckedChange={(checked) =>
                                handleToggleAllDays(checked === true)
                            }
                        />
                        <Label
                            htmlFor="all-days"
                            className="w-full cursor-pointer text-sm font-normal text-gray-700"
                        >
                            Setiap Hari
                        </Label>
                    </div>

                    {DAYS.map((day) => (
                        <div
                            key={day.key}
                            className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50/50"
                        >
                            <Checkbox
                                id={day.key}
                                checked={!!data[day.key as DayKey]}
                                onCheckedChange={(checked) =>
                                    setData(
                                        day.key as keyof T,
                                        checked === true,
                                    )
                                }
                            />
                            <Label
                                htmlFor={day.key}
                                className="w-full cursor-pointer text-sm font-normal text-gray-700"
                            >
                                {day.label}
                            </Label>
                        </div>
                    ))}
                </div>

                {(errors.senin ||
                    errors.selasa ||
                    errors.rabu ||
                    errors.kamis ||
                    errors.jumat) && (
                    <InputError
                        message={
                            errors.senin ||
                            errors.selasa ||
                            errors.rabu ||
                            errors.kamis ||
                            errors.jumat
                        }
                    />
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="poin">Poin</Label>
                <Input
                    id="poin"
                    type="number"
                    min="0"
                    value={data.poin}
                    onChange={(e) => setData("poin", Number(e.target.value))}
                    placeholder="0"
                    className="focus-visible:ring-0"
                />
                <InputError message={errors.poin} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={processing}
                    className="flex-1 border-gray-200 bg-white"
                >
                    Batal
                </Button>

                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? (
                        <>
                            <Loader2Icon className="size-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="size-4" />
                            Simpan
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
