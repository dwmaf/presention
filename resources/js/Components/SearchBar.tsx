/**
 * ============================================================================
 * Component   : SearchBar
 * Layer       : UI (Component)
 *
 * Description:
 * Komponen pencarian ter-debounce berbasis Shadcn InputGroup dan ikon Lucide.
 * ============================================================================
 */

import * as React from "react";
import { Search } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

// * Hook debounce sederhana untuk performa optimal
function useDebounce<T>(value: T, delay = 300): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export interface SearchBarProps {
    /** Nilai pencarian dikontrol dari luar */
    value?: string;
    /** Callback ketika nilai pencarian berubah setelah ter-debounce */
    onSearch?: (value: string) => void;
    /** Teks penunjuk (placeholder) */
    placeholder?: string;
    /** Class CSS tambahan */
    className?: string;
}

/**
 * Komponen Input Pencarian.
 *
 * @param props Properti komponen.
 * @returns Komponen SearchBar.
 */
export default function SearchBar({
    value: controlledValue,
    onSearch,
    placeholder = "Cari...",
    className,
}: SearchBarProps) {
    const [internalValue, setInternalValue] = React.useState<string>("");
    const value =
        controlledValue !== undefined ? controlledValue : internalValue;

    const debouncedValue = useDebounce(value, 300);

    React.useEffect(() => {
        if (onSearch) {
            onSearch(debouncedValue);
        }
    }, [debouncedValue, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (controlledValue === undefined) {
            setInternalValue(newValue);
        }
    };

    return (
        <InputGroup className={cn("h-10 bg-white shadow-xs", className)}>
            <InputGroupAddon align="inline-start">
                <Search className="text-muted-foreground h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
            />
        </InputGroup>
    );
}
