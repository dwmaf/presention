/**
 * ============================================================================
 * Component   : DivisionCard
 * Layer       : UI (Component)
 *
 * Description:
 * Menampilkan ringkasan informasi divisi, jumlah anggota, dan tombol aksi.
 * ============================================================================
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EditIcon, TrashIcon } from "lucide-react";
import type { DivisionData } from "../types/division";
import { PuzzleBig } from "@/components/PuzzleIcons";

interface DivisionCardProps {
    division: DivisionData;
    onDetail: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

/**
 * Komponen kartu presentasi divisi.
 *
 * @param props Properti kartu divisi.
 * @returns Komponen visual kartu divisi.
 */
export default function DivisionCard({
    division,
    onDetail,
    onEdit,
    onDelete,
}: DivisionCardProps) {
    return (
        <Card className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {/* Row atas: ikon dan jumlah anggota */}
            <div className="flex items-start justify-between">
                <PuzzleBig />
                <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1 font-semibold text-gray-600"
                >
                    {division.interns_count ?? 0} Anggota
                </Badge>
            </div>

            {/* Nama Divisi */}
            <CardHeader className="p-0">
                <CardTitle className="text-xl leading-snug font-bold text-gray-900">
                    {division.nama_divisi}
                </CardTitle>
            </CardHeader>

            {/* Deskripsi */}
            <CardContent className="flex-1 p-0">
                <p className="line-clamp-3 text-xs text-gray-500">
                    {division.deskripsi || (
                        <span className="text-gray-300 italic">
                            Belum ada deskripsi.
                        </span>
                    )}
                </p>
            </CardContent>

            {/* Aksi tombol */}
            <CardFooter className="mt-2 flex gap-3 p-0">
                <Button
                    variant="outline"
                    onClick={onDetail}
                    className="flex-1 border-blue-600 font-semibold text-blue-600 hover:bg-blue-50"
                >
                    Lihat Detail
                </Button>

                <Button
                    variant="destructive"
                    onClick={onDelete}
                    className="px-3"
                >
                    <TrashIcon className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    onClick={onEdit}
                    className="border-gray-200 bg-yellow-100/50 px-3 hover:bg-yellow-50 hover:text-yellow-600"
                >
                    <EditIcon className="h-4 w-4 text-yellow-700" />
                </Button>
            </CardFooter>
        </Card>
    );
}
