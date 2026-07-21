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
import { Loader2Icon, SearchIcon, TrashIcon, UserPlusIcon } from "lucide-react";
import type { DivisionData, DivisionMember } from "../types/division";
import { PuzzleSmall } from "@/components/PuzzleIcons";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    processing?: boolean;
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
    processing = false,
}: DivisionDetailModalProps) {
    if (!division) return null;

    const activeCount = division.interns
        ? division.interns.filter((i) => i.is_active !== false).length
        : 0;

    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex max-h-[600px] min-w-2xl flex-col p-6">
                {/* Header */}
                <DialogHeader className="mt-6 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <PuzzleSmall className="text-primary size-6" />

                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                {division.nama_divisi}
                            </DialogTitle>
                        </div>

                        <DialogDescription className="line-clamp-3 text-sm text-gray-500">
                            {division.deskripsi || (
                                <span className="text-gray-400 italic">
                                    Belum ada deskripsi.
                                </span>
                            )}
                        </DialogDescription>
                    </div>

                    <Badge
                        variant="secondary"
                        className="self-start rounded-full px-3 py-1 font-semibold text-gray-600 sm:self-auto"
                    >
                        {activeCount} Anggota Aktif
                    </Badge>
                </DialogHeader>

                {/* Sub-header daftar anggota */}
                <div className="relative flex shrink-0 items-center justify-between">
                    <p className="text-base font-semibold text-gray-700">
                        Daftar Anggota
                    </p>

                    <Button
                        variant="link"
                        onClick={() => {
                            setShowAddMember((v) => !v);
                            setMemberSearch("");
                        }}
                        className="text-primary flex h-auto items-center py-2 text-sm font-semibold hover:underline focus-visible:ring-0"
                    >
                        <UserPlusIcon className="size-4" />
                        Tambah Anggota
                    </Button>

                    {/* Dropdown panel search */}
                    {showAddMember && (
                        <div className="absolute top-full right-0 z-30 mt-1 flex min-w-xs flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2">
                                <SearchIcon className="h-3.5 w-3.5 text-gray-400" />
                                <Input
                                    autoFocus
                                    type="text"
                                    value={memberSearch}
                                    onChange={(e) =>
                                        setMemberSearch(e.target.value)
                                    }
                                    placeholder="Cari karyawan..."
                                    className="h-7 border-0 bg-transparent p-0 text-xs placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>

                            <ul className="scrollbar-thin max-h-72 divide-y divide-gray-50 overflow-y-auto">
                                {memberSuggestions.length > 0 ? (
                                    memberSuggestions.map((intern) => (
                                        <li key={intern.id}>
                                            <button
                                                onClick={() => onAssign(intern)}
                                                className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-gray-50"
                                            >
                                                <Avatar className="size-8">
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

                                                <span className="truncate text-sm">
                                                    {intern.name}
                                                </span>
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-3 py-4 text-center text-sm text-gray-400">
                                        {memberSearch
                                            ? "Karyawan tidak ditemukan."
                                            : "Semua karyawan sudah bergabung."}
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Tabel daftar anggota (scrollable) */}
                <div className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto rounded-lg border border-gray-100">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-gray-50">
                            <TableRow>
                                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-500">
                                    Profil
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left text-sm font-semibold text-gray-500">
                                    Nama
                                </TableHead>
                                <TableHead className="px-4 py-2 text-center text-sm font-semibold text-gray-500">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100">
                            {division.interns && division.interns.length > 0 ? (
                                // 1. Clone array dan urutkan: aktif di atas, nonaktif di bawah
                                [...division.interns]
                                    .sort((a, b) => {
                                        const activeA =
                                            a.is_active !== false ? 1 : 0;
                                        const activeB =
                                            b.is_active !== false ? 1 : 0;
                                        return activeB - activeA;
                                    })
                                    .map((intern) => {
                                        const isInactive =
                                            intern.is_active === false;

                                        return (
                                            // 2. Beri efek abu-abu jika tidak aktif
                                            <TableRow
                                                key={intern.id}
                                                className={
                                                    isInactive
                                                        ? "bg-gray-50/50 opacity-60"
                                                        : ""
                                                }
                                            >
                                                <TableCell className="px-4 py-2">
                                                    <Avatar
                                                        className={`size-8 ${isInactive ? "grayscale" : ""}`}
                                                    >
                                                        {intern.foto ? (
                                                            <AvatarImage
                                                                src={`/storage/${intern.foto}`}
                                                                alt={
                                                                    intern.name
                                                                }
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
                                                    {isInactive && (
                                                        <span className="ml-2 rounded-md bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="px-4 py-2 text-center">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            render={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8 text-red-400 hover:bg-red-50 hover:text-red-600"
                                                                >
                                                                    <TrashIcon className="size-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-xl font-bold tracking-tight">
                                                                    Hapus
                                                                    Anggota?
                                                                </AlertDialogTitle>

                                                                <AlertDialogDescription>
                                                                    Apakah kamu
                                                                    yakin ingin
                                                                    menghapus{" "}
                                                                    <strong className="text-black">
                                                                        {
                                                                            intern.name
                                                                        }
                                                                    </strong>{" "}
                                                                    dari{" "}
                                                                    {
                                                                        division.nama_divisi
                                                                    }
                                                                    ?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>

                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    Batal
                                                                </AlertDialogCancel>

                                                                <AlertDialogAction
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        onRemove(
                                                                            intern,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    {processing ? (
                                                                        <>
                                                                            <Loader2Icon className="size-4 animate-spin" />
                                                                            Menghapus...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <TrashIcon className="size-4" />
                                                                            Ya,
                                                                            Hapus
                                                                        </>
                                                                    )}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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
