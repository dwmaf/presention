/**
 * ============================================================================
 * Component   : InternCard
 * Layer       : UI (Component)
 *
 * Description:
 * Menampilkan kartu profil ringkas untuk karyawan (intern), mendukung
 * mode presensi dan visualisasi sisa poin serta status sidik jari.
 * ============================================================================
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint } from "lucide-react";

import type { InternData } from "@/features/interns/types/intern";

interface AttendanceData {
    status: "hadir" | "alpha" | "izin" | "sakit";
    terlambat?: number;
    check_out?: boolean;
}

interface InternCardProps {
    intern: InternData;
    onClick: () => void;
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
};

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
        const config = STATUS_LABELS[attendance.status] || {
            label: attendance.status,
            className: "bg-muted text-muted-foreground",
        };

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
 * Komponen kartu karyawan.
 *
 * @param props Properti kartu.
 * @returns Komponen kartu profil karyawan.
 */
export default function InternCard({
    intern,
    onClick,
    attendance,
}: InternCardProps) {
    const rawPoin = intern.poin ?? 0;
    const poin = rawPoin < 0 ? 0 : rawPoin;
    const hasFingerprint = !!intern.fingerprint_data;

    const poinStyle =
        poin < 3
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary";

    const fingerprintStyle = hasFingerprint
        ? "text-emerald-700"
        : "text-destructive";

    const divisionName = intern.division?.nama_divisi ?? "-";

    return (
        <Card
            onClick={onClick}
            className={`bg-card flex w-full cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:rotate-1 hover:shadow-md ${
                intern.foto ? "" : "pt-0 pb-[1.5rem]"
            }`}
        >
            {/* Foto Karyawan */}
            {intern.foto ? (
                <img
                    className="aspect-square w-full object-cover object-top"
                    src={`/storage/${intern.foto}`}
                    alt={intern.name}
                />
            ) : (
                <div className="bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center text-sm font-medium">
                    Belum ada foto
                </div>
            )}

            <CardContent className="flex flex-1 flex-col justify-between gap-3">
                {/* Nama Karyawan */}
                <p className="text-card-foreground h-10 text-lg leading-tight font-semibold tracking-tight">
                    {intern.name}
                </p>

                {/* Info Divisi / Absensi */}
                {attendance !== undefined ? (
                    <div>
                        <AttendanceBadge attendance={attendance} />
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm font-medium">
                        {divisionName}
                    </p>
                )}

                {/* Footer Status */}
                <div className="mt-auto flex items-center gap-2">
                    <Badge className={`font-medium ${poinStyle}`}>
                        {poin} Poin
                    </Badge>

                    {attendance === undefined && (
                        <Fingerprint className={`size-4 ${fingerprintStyle}`} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
