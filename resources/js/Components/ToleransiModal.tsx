/**
 * ============================================================================
 * Component   : ToleransiModal
 * Layer       : UI (Component)
 *
 * Description:
 * Modal dialog untuk mengatur hari toleransi keterlambatan beserta batasan jam masuk.
 * Menggunakan sistem komponen visual terpadu shadcn (Dialog, Input, Checkbox, Button).
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const DAYS = ["senin", "selasa", "rabu", "kamis", "jumat"] as const;
type DayType = (typeof DAYS)[number];

export interface ToleransiDayConfig {
    checked: boolean;
    time: string;
}

export type ToleransiState = Record<DayType, ToleransiDayConfig>;

/**
 * Struktur model data intern yang dibutuhkan oleh ToleransiModal.
 */
export interface ToleransiIntern {
    toleransi_senin?: boolean | number | null;
    toleransi_selasa?: boolean | number | null;
    toleransi_rabu?: boolean | number | null;
    toleransi_kamis?: boolean | number | null;
    toleransi_jumat?: boolean | number | null;
    toleransi_senin_time?: string | null;
    toleransi_selasa_time?: string | null;
    toleransi_rabu_time?: string | null;
    toleransi_kamis_time?: string | null;
    toleransi_jumat_time?: string | null;
}

export interface ToleransiModalProps {
    show: boolean;
    intern: unknown;
    onClose: () => void;
    onSave: (data: ToleransiState) => void;
}

/**
 * Modal konfigurasi hari toleransi keterlambatan magang.
 *
 * @param props Properti komponen.
 * @returns Dialog modal toleransi.
 */
export default function ToleransiModal({
    show,
    intern,
    onClose,
    onSave,
}: ToleransiModalProps) {
    const createInitialState = (): ToleransiState => {
        const state = {} as ToleransiState;

        // ? Cast safely inside the hook to read dynamic keys from database
        const internData = intern as Record<string, unknown> | null;

        DAYS.forEach((day) => {
            state[day] = {
                checked: Boolean(internData?.[`toleransi_${day}`]),
                time:
                    (internData?.[`toleransi_${day}_time`] as string)?.slice(
                        0,
                        5,
                    ) || "08:30",
            };
        });

        return state;
    };

    const [toleransiDays, setToleransiDays] =
        useState<ToleransiState>(createInitialState);

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
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="no-scrollbar flex max-h-[90vh] max-w-[95vw] flex-col overflow-y-auto bg-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        Pilih Hari Toleransi Terlambat
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Pilih hari di mana toleransi keterlambatan
                        diperbolehkan, beserta jam batas keterlambatan.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className="border-gray-250 cursor- pointer flex items-center justify-between gap-3 rounded-lg border bg-gray-50/20 px-3 py-2 hover:bg-gray-50/50"
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

                            <Input
                                type="time"
                                min="07:00"
                                max="17:00"
                                step="60"
                                value={toleransiDays[day].time}
                                onChange={(e) =>
                                    changeTime(day, e.target.value)
                                }
                                disabled={!toleransiDays[day].checked}
                                className="h-8 w-24 bg-white px-2 text-sm"
                            />
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-gray-200 bg-white"
                    >
                        Batal
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1"
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
