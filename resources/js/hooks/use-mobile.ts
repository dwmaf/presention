/**
 * ============================================================================
 * Hook        : useIsMobile
 * Layer       : Hook
 *
 * Description:
 * Custom hook untuk mendeteksi apakah tampilan jendela browser berada pada
 * breakpoint mobile (< 768px) menggunakan MediaQueryList listener.
 * ============================================================================
 */

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Mendeteksi apakah ukuran layar pengguna saat ini termasuk dalam breakpoint mobile (< 768px).
 * Memanfaatkan event listener `matchMedia` yang otomatis diperbarui saat ukuran jendela berubah.
 *
 * @returns `true` jika layar pengguna berada pada ukuran mobile, sebaliknya `false`.
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
            .matches;
    });

    useEffect(() => {
        const mql = window.matchMedia(
            `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
        );
        const onChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };

        mql.addEventListener("change", onChange);
        setIsMobile(mql.matches);

        return () => mql.removeEventListener("change", onChange);
    }, []);

    return isMobile;
}
