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
    activeCount: number;
    onDetail: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

/**
 * Komponen kartu presentasi divisi.
 */
export default function DivisionCard({
    division,
    activeCount,
    onDetail,
    onEdit,
    onDelete,
}: DivisionCardProps) {
    return (
        <Card className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:rotate-1">
            {/* Row atas: ikon dan jumlah anggota */}
            <div className="flex items-start justify-between">
                <PuzzleBig className="text-primary" />

                <Badge
                    variant="secondary"
                    className="rounded-full px-3 font-semibold text-gray-600"
                >
                    {activeCount} Anggota Aktif
                </Badge>
            </div>

            {/* Nama Divisi */}
            <CardHeader className="p-0">
                <CardTitle className="text-xl leading-snug font-bold">
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
                    className="hover:text-primary border-primary text-primary flex-1 font-semibold hover:bg-blue-50"
                >
                    Lihat Detail
                </Button>

                <Button
                    variant="destructive"
                    onClick={onDelete}
                    className="px-3"
                    aria-label="Hapus divisi"
                >
                    <TrashIcon className="size-4" />
                </Button>

                <Button
                    variant="outline"
                    onClick={onEdit}
                    className="border-gray-200 bg-yellow-100 px-3 shadow-none hover:bg-yellow-200 hover:text-yellow-600"
                    aria-label="Edit divisi"
                >
                    <EditIcon className="size-4 text-yellow-700" />
                </Button>
            </CardFooter>
        </Card>
    );
}
