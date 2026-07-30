/**
 * ============================================================================
 * Component   : DatePickerInput
 * Layer       : UI (Component)
 *
 * Description:
 * Komponen pemilih tanggal tunggal (single date picker) berbasis Popover,
 * Calendar, dan InputGroup dari Shadcn.
 * ============================================================================
 */

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Properti untuk komponen DatePickerInput.
 */
export interface DatePickerInputProps {
    /** Tanggal terpilih */
    value?: Date;
    /** Callback ketika tanggal diubah */
    onChange?: (date: Date | undefined) => void;
    /** Label input */
    label?: string;
    /** Placeholder input */
    placeholder?: string;
    /** Class CSS tambahan */
    className?: string;
}

function formatDate(date: Date | undefined): string {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function isValidDate(date: Date | undefined): boolean {
    if (!date) return false;
    return !isNaN(date.getTime());
}

/**
 * Komponen input tanggal tunggal.
 *
 * @param props Properti komponen.
 * @returns Komponen date picker.
 */
export function DatePickerInput({
    value,
    onChange,
    label,
    placeholder,
    className,
}: DatePickerInputProps) {
    const [open, setOpen] = React.useState(false);

    // ? Sinkronisasi state lokal dengan prop value
    const [date, setDate] = React.useState<Date | undefined>(value);
    const [month, setMonth] = React.useState<Date | undefined>(value);
    const [inputValue, setInputValue] = React.useState(formatDate(value));

    React.useEffect(() => {
        setDate(value);
        setMonth(value);
        setInputValue(formatDate(value));
    }, [value]);

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setInputValue(formatDate(selectedDate));
        setOpen(false);
        if (onChange) {
            onChange(selectedDate);
        }
    };

    return (
        <Field className={cn("mx-auto w-48", className)}>
            <InputGroup className="h-10 bg-white has-[[data-slot=input-group-control]:focus-visible]:ring-0">
                <InputGroupInput
                    id="date-picker-field"
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={(e) => {
                        const parsedDate = new Date(e.target.value);
                        setInputValue(e.target.value);
                        if (isValidDate(parsedDate)) {
                            setDate(parsedDate);
                            setMonth(parsedDate);
                            if (onChange) {
                                onChange(parsedDate);
                            }
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setOpen(true);
                        }
                    }}
                />
                <InputGroupAddon align="inline-end">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger
                            render={
                                <InputGroupButton
                                    id="date-picker"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label="Select date"
                                >
                                    <CalendarIcon />
                                    <span className="sr-only">Select date</span>
                                </InputGroupButton>
                            }
                        />
                        <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="end"
                            alignOffset={-8}
                            sideOffset={10}
                        >
                            <Calendar
                                mode="single"
                                selected={date}
                                month={month}
                                onMonthChange={setMonth}
                                onSelect={handleSelect}
                            />
                        </PopoverContent>
                    </Popover>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    );
}
