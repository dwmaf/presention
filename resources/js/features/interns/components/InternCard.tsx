/**
 * ============================================================================
 * Component   : InternCard
 * Layer       : UI (Component)
 *
 * Description:
 * Kartu komponen interaktif untuk menampilkan identitas karyawan magang,
 * status keaktifan, poin, divisi, dan riwayat presensi harian.
 * ============================================================================
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint } from "lucide-react";
import type { KeyboardEvent } from "react";

import type { InternData } from "@/features/interns/types/intern";

export interface AttendanceData {
    status: "hadir" | "alpha" | "izin" | "sakit";
    terlambat?: number;
    check_out?: boolean;
}

/**
 * Kontrak properti untuk komponen Kartu Karyawan.
 */
export interface InternCardProps {
    intern: InternData;
    onClick: () => void;
    variant?: "default" | "attendance";
    attendance?: AttendanceData | null;
}

const STATUS_LABELS = {
    alpha: {
        label: "Tidak Hadir",
        className: "bg-destructive/10 text-destructive",
    },
    izin: {
        label: "Izin",
        className: "bg-amber-100 text-amber-700",
    },
    sakit: {
        label: "Sakit",
        className: "bg-blue-100 text-blue-700",
    },
} as const;

function AttendanceBadge({
    attendance,
}: {
    attendance?: AttendanceData | null;
}) {
    if (attendance === undefined) return null;

    if (!attendance) {
        return (
            <Badge className="bg-destructive/10 text-destructive">
                Tidak Hadir
            </Badge>
        );
    }

    if (attendance.status !== "hadir") {
        const config = STATUS_LABELS[attendance.status];

        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        );
    }

    return (
        <div className="flex flex-wrap gap-1">
            <Badge
                variant="outline"
                className="bg-emerald-100 text-emerald-800"
            >
                Hadir
            </Badge>

            {attendance.terlambat ? (
                <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800"
                >
                    Telat {attendance.terlambat}m
                </Badge>
            ) : (
                <Badge variant="outline" className="bg-sky-100 text-sky-800">
                    Tepat Waktu
                </Badge>
            )}

            {attendance.check_out && (
                <Badge
                    variant="outline"
                    className="bg-indigo-100 text-indigo-800"
                >
                    Pulang
                </Badge>
            )}
        </div>
    );
}

/**
 * Komponen kartu profil karyawan interaktif.
 * Mendukung mode default (menampilkan divisi) dan mode presensi (menampilkan badge kehadiran).
 */
export default function InternCard({
    intern,
    onClick,
    variant = "default",
    attendance,
}: InternCardProps) {
    const rawPoin = intern.poin ?? 0;
    const poin = Math.max(0, rawPoin);
    const hasFingerprint = !!intern.fingerprint_data;

    const poinStyle =
        poin < 3
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary";

    const fingerprintStyle = hasFingerprint
        ? "text-emerald-700"
        : "text-destructive";

    const divisionName = intern.division?.nama_divisi ?? "-";

    // ? Fallback pengecekan attendance untuk menjaga kompatibilitas mundur jika prop variant tidak diberikan.
    const isAttendanceMode =
        variant === "attendance" || attendance !== undefined;

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <Card
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className={`bg-card focus-visible:ring-ring flex w-full cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:rotate-1 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none ${
                intern.foto ? "" : "pt-0 pb-[1.5rem]"
            }`}
        >
            {intern.foto ? (
                <img
                    className="aspect-square w-full object-cover object-top"
                    src={`/storage/${intern.foto}`}
                    alt={`Foto profil ${intern.name}`}
                />
            ) : (
                <div className="bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center text-sm font-medium">
                    Belum ada foto
                </div>
            )}

            <CardContent className="flex flex-1 flex-col justify-between gap-3">
                <p className="text-card-foreground h-10 text-lg leading-tight font-semibold tracking-tight">
                    {intern.name}
                </p>

                {isAttendanceMode ? (
                    <div>
                        <AttendanceBadge attendance={attendance} />
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm font-medium">
                        {divisionName}
                    </p>
                )}

                <div className="mt-auto flex items-center gap-2">
                    <Badge className={`font-medium ${poinStyle}`}>
                        {poin} Poin
                    </Badge>

                    {!isAttendanceMode && (
                        <Fingerprint className={`size-4 ${fingerprintStyle}`} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
