/**
 * ============================================================================
 * Component   : DivisionDetailModal
 * Layer       : UI (Component)
 *
 * Description:
 * Modal detail divisi untuk mengelola (melihat, menambah, menghapus) anggota divisi.
 * ============================================================================
 */

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SearchIcon, TrashIcon, UserPlusIcon } from "lucide-react";
import type { DivisionData, DivisionMember } from "../types/division";
import { PuzzleSmall } from "@/components/PuzzleIcons";

interface DivisionDetailModalProps {
    show: boolean;
    onClose: () => void;
    division: DivisionData | null;
    memberSearch: string;
    setMemberSearch: (value: string) => void;
    showAddMember: boolean;
    setShowAddMember: (show: boolean | ((v: boolean) => boolean)) => void;
    memberSuggestions: DivisionMember[];
    onAssign: (intern: DivisionMember) => void;
    onRemove: (intern: DivisionMember) => void;
}

/**
 * Dialog rincian divisi dan manajemen anggota.
 *
 * @param props Properti modal detail divisi.
 * @returns Modal detail divisi.
 */
export default function DivisionDetailModal({
    show,
    onClose,
    division,
    memberSearch,
    setMemberSearch,
    showAddMember,
    setShowAddMember,
    memberSuggestions,
    onAssign,
    onRemove,
}: DivisionDetailModalProps) {
    if (!division) return null;

    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex h-[500px] w-[560px] max-w-[95vw] flex-col p-6">
                {/* Header */}
                <DialogHeader className="mb-1 flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <PuzzleSmall />
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                {division.nama_divisi}
                            </DialogTitle>
                        </div>
                        {division.deskripsi && (
                            <DialogDescription className="line-clamp-2 text-sm text-gray-500">
                                {division.deskripsi}
                            </DialogDescription>
                        )}
                    </div>
                    <Badge
                        variant="secondary"
                        className="self-start rounded-full px-3 py-1 font-semibold text-gray-600 sm:self-auto"
                    >
                        {division.interns?.length ?? 0} Anggota
                    </Badge>
                </DialogHeader>

                {/* Sub-header daftar anggota */}
                <div className="relative mt-3 mb-4 flex shrink-0 items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                        Daftar Anggota
                    </p>
                    <Button
                        variant="link"
                        onClick={() => {
                            setShowAddMember((v) => !v);
                            setMemberSearch("");
                        }}
                        className="flex h-auto items-center p-0 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                        <UserPlusIcon className="mr-1 h-3.5 w-3.5" />
                        Tambah Anggota
                    </Button>

                    {/* Dropdown panel search */}
                    {showAddMember && (
                        <div className="shadow- lg absolute top-full right-0 z-30 mt-1 flex w-56 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2">
                                <SearchIcon className="h-3.5 w-3.5 text-gray-400" />
                                <Input
                                    autoFocus
                                    type="text"
                                    value={memberSearch}
                                    onChange={(e) =>
                                        setMemberSearch(e.target.value)
                                    }
                                    placeholder="Cari nama intern..."
                                    className="h-7 border-0 bg-transparent p-0 text-xs placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                            <ul className="custom-scrollbar max-h-40 divide-y divide-gray-50 overflow-y-auto">
                                {memberSuggestions.length > 0 ? (
                                    memberSuggestions.map((intern) => (
                                        <li key={intern.id}>
                                            <button
                                                onClick={() => onAssign(intern)}
                                                className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-blue-50"
                                            >
                                                <Avatar className="h-6 w-6">
                                                    {intern.foto ? (
                                                        <AvatarImage
                                                            src={`/storage/${intern.foto}`}
                                                            alt={intern.name}
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-gray-200 text-[10px]">
                                                        {intern.name
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="truncate text-xs text-gray-800">
                                                    {intern.name}
                                                </span>
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-3 py-4 text-center text-xs text-gray-400">
                                        {memberSearch
                                            ? "Intern tidak ditemukan."
                                            : "Semua intern sudah bergabung."}
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Tabel daftar anggota (scrollable) */}
                <div className="custom-scrollbar relative mb-4 min-h-0 flex-1 overflow-y-auto rounded-lg border border-gray-100">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-gray-50">
                            <TableRow>
                                <TableHead className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                                    Profil
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                                    Nama
                                </TableHead>
                                <TableHead className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100">
                            {division.interns && division.interns.length > 0 ? (
                                division.interns.map((intern) => (
                                    <TableRow key={intern.id}>
                                        <TableCell className="px-4 py-2">
                                            <Avatar className="h-8 w-8">
                                                {intern.foto ? (
                                                    <AvatarImage
                                                        src={`/storage/${intern.foto}`}
                                                        alt={intern.name}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="bg-gray-200 text-xs">
                                                    {intern.name
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate px-4 py-2 font-medium text-gray-800">
                                            {intern.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onRemove(intern)}
                                                className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="px-4 py-6 text-center text-gray-400"
                                    >
                                        Belum ada anggota.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex shrink-0 justify-end pt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="font-semibold text-gray-700"
                    >
                        Tutup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
