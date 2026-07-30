/**
 * ============================================================================
 * Component   : TimePicker
 * Layer       : Shared Component (components)
 *
 * Description:
 * Komponen pemilih waktu (jam & menit) berbasis Popover dan scrollable list
 * dengan kelipatan 5 menit. Reusable untuk berbagai form.
 * ============================================================================
 */

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

/**
 * Pemilih waktu modular.
 *
 * @param props Properti TimePicker.
 * @returns Elemen dropdown pemilih waktu.
 */
export default function TimePicker({
    value,
    onChange,
    disabled = false,
    placeholder = "Pilih waktu (HH:MM)",
    className,
}: TimePickerProps) {
    const currentHour = value ? parseInt(value.split(":")[0], 10) : -1;
    const currentMinute = value ? parseInt(value.split(":")[1], 10) : -1;

    const handleHourSelect = (hour: number) => {
        const currentMin = value ? value.split(":")[1] || "00" : "00";
        const formattedHour = String(hour).padStart(2, "0");
        onChange(`${formattedHour}:${currentMin}`);
    };

    const handleMinuteSelect = (minute: number) => {
        const currentHourStr = value ? value.split(":")[0] || "12" : "12";
        const formattedMinute = String(minute).padStart(2, "0");
        onChange(`${currentHourStr}:${formattedMinute}`);
    };

    return (
        <div className={cn("relative h-9 w-full", className)}>
            <Popover>
                <PopoverTrigger
                    render={
                        <Button
                            variant="outline"
                            disabled={disabled}
                            className={cn(
                                "h-full w-full justify-start border-gray-300 bg-white text-left font-normal",
                                !value && "text-muted-foreground",
                            )}
                        >
                            <Clock className="mr-2 h-4 w-4 opacity-50" />
                            {value ? value : placeholder}
                        </Button>
                    }
                />
                <PopoverContent className="w-auto bg-white p-2" align="start">
                    <div className="flex h-[200px] divide-x divide-gray-100">
                        {/* Kolom Jam */}
                        <div className="scrollbar-none flex w-16 flex-col overflow-y-auto pr-1">
                            <span className="text-muted-foreground sticky top-0 block bg-white pb-1 text-center text-[10px] font-bold">
                                Jam
                            </span>
                            {Array.from({ length: 24 }, (_, i) => i).map(
                                (hour) => (
                                    <Button
                                        key={hour}
                                        size="sm"
                                        variant={
                                            currentHour === hour
                                                ? "default"
                                                : "ghost"
                                        }
                                        onClick={() => handleHourSelect(hour)}
                                        className="h-7 shrink-0 rounded text-xs"
                                    >
                                        {String(hour).padStart(2, "0")}
                                    </Button>
                                ),
                            )}
                        </div>
                        {/* Kolom Menit */}
                        <div className="scrollbar-none flex w-16 flex-col overflow-y-auto pl-1">
                            <span className="text-muted-foreground sticky top-0 block bg-white pb-1 text-center text-[10px] font-bold">
                                Menit
                            </span>
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(
                                (minute) => (
                                    <Button
                                        key={minute}
                                        size="sm"
                                        variant={
                                            currentMinute === minute
                                                ? "default"
                                                : "ghost"
                                        }
                                        onClick={() =>
                                            handleMinuteSelect(minute)
                                        }
                                        className="h-7 shrink-0 rounded text-xs"
                                    >
                                        {String(minute).padStart(2, "0")}
                                    </Button>
                                ),
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
