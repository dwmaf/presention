/**
 * ============================================================================
 * Hook        : useAnimatableIcon
 * Layer       : Business Logic (Hook)
 *
 * Description:
 * Hook kustom generik untuk mengontrol komponen ikon yang memiliki fungsi
 * startAnimation dan stopAnimation melalui callback ref.
 * ============================================================================
 */

import { useRef } from "react";

interface AnimatableIcon {
    startAnimation: () => void;
    stopAnimation: () => void;
}

/**
 * Mengontrol komponen ikon yang dapat dianimasikan.
 *
 * @returns Object berisi callback ref untuk ikon dan fungsi pengontrol animasi (start, stop).
 */
export function useAnimatableIcon() {
    const iconRef = useRef<AnimatableIcon | null>(null);

    const handleRef = (node: unknown) => {
        if (
            node &&
            typeof node === "object" &&
            "startAnimation" in node &&
            "stopAnimation" in node
        ) {
            iconRef.current = node as AnimatableIcon;
        } else {
            iconRef.current = null;
        }
    };

    const start = () => {
        iconRef.current?.startAnimation();
    };

    const stop = () => {
        iconRef.current?.stopAnimation();
    };

    return {
        ref: handleRef,
        start,
        stop,
    };
}
