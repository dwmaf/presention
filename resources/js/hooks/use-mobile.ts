import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Mendeteksi apakah ukuran layar pengguna saat ini termasuk dalam breakpoint mobile (< 768px).
 * Memanfaatkan event listener `matchMedia` yang otomatis diperbarui saat ukuran jendela berubah.
 *
 * @returns `true` jika layar pengguna berada pada ukuran mobile, sebaliknya `false`.
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
        undefined,
    );

    React.useEffect(() => {
        const mql = window.matchMedia(
            `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
        );
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        mql.addEventListener("change", onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return !!isMobile;
}
