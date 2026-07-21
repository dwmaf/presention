/**
 * ============================================================================
 * Component   : InternToleranceModal
 * Layer       : Feature
 *
 * Description:
 * Merender modal interaktif untuk mengatur jadwal toleransi keterlambatan
 * karyawan magang per hari kerja.
 * ============================================================================
 */

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TimePicker from "../../../components/TimePicker";
import { Loader2Icon, SaveIcon } from "lucide-react";
import type { InternData } from "@/features/interns/types/intern";

const DAYS = ["senin", "selasa", "rabu", "kamis", "jumat"] as const;
type DayType = (typeof DAYS)[number];

// ? Menghasilkan kunci dinamis yang secara strict dipetakan ke InternData untuk menjamin keamanan tipe.
type ToleranceDayKey = `toleransi_${DayType}`;
type ToleranceTimeKey = `toleransi_${DayType}_time`;

/**
 * Menyimpan konfigurasi toleransi keterlambatan individu per hari,
 * memastikan batas waktu hanya diterapkan ketika hari tersebut diaktifkan.
 */
export interface InternToleranceConfig {
    checked: boolean;
    time: string;
}

/**
 * Memetakan setiap hari kerja (Senin-Jumat) ke konfigurasi toleransinya masing-masing
 * untuk dikirimkan secara kolektif ke backend.
 */
export type InternToleranceState = Record<DayType, InternToleranceConfig>;

/**
 * Menentukan data karyawan target dan fungsi callback untuk menangani
 * penyelesaian atau pembatalan konfigurasi toleransi.
 */
export interface InternToleranceModalProps {
    show: boolean;
    intern: InternData | null;
    onClose: () => void;
    onSave: (data: InternToleranceState) => void;
    processing?: boolean;
}

/**
 * Merender modal interaktif untuk mengatur jadwal toleransi keterlambatan karyawan magang.
 * Komponen ini memisahkan logika pengaturan waktu per hari dari form profil utama
 * untuk mengisolasi kompleksitas state dan mencegah re-render form utama.
 */
export default function InternToleranceModal({
    show,
    intern,
    onClose,
    onSave,
    processing = false,
}: InternToleranceModalProps) {
    const createInitialState = (): InternToleranceState => {
        const state = {} as InternToleranceState;

        DAYS.forEach((day) => {
            const boolKey = `toleransi_${day}` as ToleranceDayKey;
            const timeKey = `toleransi_${day}_time` as ToleranceTimeKey;

            state[day] = {
                checked: Boolean(intern?.[boolKey]),
                time:
                    (intern?.[timeKey] as string | undefined)?.slice(0, 5) ||
                    "08:30",
            };
        });

        return state;
    };

    const [toleransiDays, setToleransiDays] =
        useState<InternToleranceState>(createInitialState);

    useEffect(() => {
        setToleransiDays(createInitialState());
    }, [intern, show]);

    const toggleDay = (day: DayType): void => {
        setToleransiDays((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                checked: !prev[day].checked,
            },
        }));
    };

    const changeTime = (day: DayType, value: string): void => {
        setToleransiDays((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                time: value,
            },
        }));
    };

    const handleSubmit = (): void => {
        onSave(toleransiDays);
    };

    return (
        <Dialog
            open={show}
            onOpenChange={(open) => {
                if (!open && !processing) onClose();
            }}
        >
            <DialogContent className="no-scrollbar flex max-h-[90vh] max-w-[95vw] flex-col overflow-y-auto bg-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        Pilih Hari Toleransi Terlambat
                    </DialogTitle>

                    <DialogDescription className="text-sm">
                        Pilih hari di mana toleransi keterlambatan
                        diperbolehkan, beserta jam batas keterlambatan.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className="border-gray-250 flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-gray-50/20 px-3 py-2 hover:bg-gray-50/50"
                        >
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`checkbox-${day}`}
                                    checked={toleransiDays[day].checked}
                                    onCheckedChange={() => toggleDay(day)}
                                />
                                <Label
                                    htmlFor={`checkbox-${day}`}
                                    className="cursor-pointer text-sm font-medium text-gray-700 capitalize"
                                >
                                    {day}
                                </Label>
                            </div>

                            <TimePicker
                                value={toleransiDays[day].time}
                                onChange={(value) => changeTime(day, value)}
                                disabled={!toleransiDays[day].checked}
                                className="h-8 w-24"
                                placeholder="HH:MM"
                            />
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                        className="flex-1 border-gray-200 bg-white"
                    >
                        Batal
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="flex-1"
                    >
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
