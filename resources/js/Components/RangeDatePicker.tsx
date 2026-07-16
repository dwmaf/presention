/**
 * ============================================================================
 * Component   : DatePickerWithRange
 * Layer       : UI (Component)
 *
 * Description:
 * Komponen pemilih rentang tanggal (date range picker) berbasis Shadcn Popover
 * dan Calendar.
 * ============================================================================
 */

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Properti untuk komponen DatePickerWithRange.
 */
export interface DatePickerWithRangeProps {
    /** Nilai rentang tanggal terpilih */
    value?: DateRange;
    /** Callback ketika rentang tanggal berubah */
    onChange?: (date: DateRange | undefined) => void;
    /** Teks placeholder jika tidak ada tanggal terpilih */
    placeholder?: string;
    /** Class CSS tambahan */
    className?: string;
}

/**
 * Komponen Pemilih Rentang Tanggal.
 *
 * @param props Properti komponen.
 * @returns Komponen date range picker.
 */
export default function DatePickerWithRange({
    value,
    onChange,
    placeholder = "Pilih rentang tanggal",
    className,
}: DatePickerWithRangeProps) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant="outline"
                        className={cn(
                            "justify-start px-2.5 font-normal",
                            className,
                        )}
                    >
                        <CalendarIcon data-icon="inline-start" />
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, "dd MMM yyyy", {
                                        locale: id,
                                    })}{" "}
                                    -{" "}
                                    {format(value.to, "dd MMM yyyy", {
                                        locale: id,
                                    })}
                                </>
                            ) : (
                                format(value.from, "dd MMM yyyy", {
                                    locale: id,
                                })
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                }
            />
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={value?.from}
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    );
}
