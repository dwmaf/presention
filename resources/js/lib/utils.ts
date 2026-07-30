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

/**
 * Format total menit keterlambatan menjadi format jam dan menit.
 * Contoh: 75 -> "1j 15m", 30 -> "30m", 120 -> "2j"
 */
export function formatLateTime(minutes: number): string {
    if (!minutes || minutes <= 0) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`;
    }
    return `${mins}m`;
}
