/**
 * ============================================================================
 * Component   : DownloadBtn
 * Layer       : UI (Component)
 *
 * Description:
 * Komponen tombol unduh berbasis Shadcn Button dengan ikon Lucide.
 * Digunakan untuk memicu aksi ekspor data (misal ke CSV).
 * ============================================================================
 */

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Properti untuk komponen DownloadBtn.
 */
export interface DownloadBtnProps {
    /** Callback ketika tombol diklik */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Label teks pada tombol */
    label?: string;
    /** Class CSS tambahan untuk kustomisasi style */
    className?: string;
}

/**
 * Komponen Tombol Unduh.
 *
 * @param props Properti komponen.
 * @returns Komponen tombol unduh berbasis Shadcn.
 */
export default function DownloadBtn({
    onClick,
    label = "Download CSV",
    className,
}: DownloadBtnProps) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 border-green-200 text-sm font-medium text-green-700 transition hover:bg-green-100 hover:text-green-800",
                className,
            )}
        >
            <Download className="h-4 w-4 text-green-600" />
            {label}
        </Button>
    );
}
