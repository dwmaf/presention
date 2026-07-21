import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan nama class CSS dengan dukungan resolusi konflik Tailwind CSS.
 *
 * ? Berguna untuk membuat komponen UI yang dinamis tanpa takut bentrok style (misal px-4 vs px-2).
 *
 * @param inputs Daftar nama class atau array class yang ingin digabung.
 * @returns String nama class yang sudah digabung dan dioptimasi.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
