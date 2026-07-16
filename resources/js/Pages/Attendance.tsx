/**
 * ============================================================================
 * Component   : Attendance
 * Layer       : Page
 *
 * Description:
 * Halaman utama absensi harian karyawan magang menggunakan verifikasi
 * sidik jari dan penyaring tanggal tunggal (Single Date Picker).
 * ============================================================================
 */

import { Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import InternCard from "@/features/interns/components/InternCard";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DatePickerInput } from "@/components/DatePicker.tsx";
import { Loader2, Fingerprint, Search } from "lucide-react";
import { useFingerprintScan } from "@/features/interns/hooks/useFingerprintScan";
import type { InternData } from "@/features/interns/types/intern";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import AdminGate from "@/components/AdminGate";

declare function route(
    name: string,
    params?: Record<string, string | number | boolean>,
    absolute?: boolean,
): string;

interface FingerprintUser {
    id: number;
    fmd?: string | null;
    second_fmd?: string | null;
    fmd_3?: string | null;
    fmd_4?: string | null;
    fmd_5?: string | null;
    fmd_6?: string | null;
    [key: string]: string | number | null | undefined;
}

export interface AttendanceProps {
    interns?: InternData[];
    selectedDate?: string;
    hariIni?: string;
    fingerprintDatabase?: FingerprintUser[];
    adminFingerprints?: FingerprintUser[];
}

export default function Attendance({
    interns = [],
    selectedDate,
    hariIni = "",
    fingerprintDatabase = [],
    adminFingerprints = [],
}: AttendanceProps) {
    const activeDate = selectedDate || new Date().toISOString().split("T")[0];
    const [searchTerm, setSearchTerm] = useState<string>("");

    // ? Menggunakan hook pemindaian sidik jari terpisah
    const { scanStep, feedback, statusText, isScanning, startScan, resetScan } =
        useFingerprintScan({
            fingerprintDatabase,
            onSuccess: () => router.reload({ only: ["interns"] }),
        });

    const modalOpen = scanStep !== "idle";

    // ? Filter dan konversi sidik jari admin untuk menjamin tipe data fmd string non-nullable
    const mappedAdminFingerprints = useMemo(() => {
        return (adminFingerprints || [])
            .filter((user) => typeof user.fmd === "string")
            .map((user) => ({
                id: user.id,
                fmd: user.fmd as string,
            }));
    }, [adminFingerprints]);

    const filteredInterns = useMemo(() => {
        return interns
            .filter((intern) =>
                intern.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .sort((a, b) => {
                const aHadir = a?.attendances?.[0]?.check_in ? 1 : 0;
                const bHadir = b?.attendances?.[0]?.check_in ? 1 : 0;
                return aHadir - bHadir;
            });
    }, [interns, searchTerm]);

    const handleDateChange = (formatted: string) => {
        router.get(
            route("attendance.index"),
            { date: formatted },
            { preserveState: true, replace: true },
        );
    };

    const renderInternList = () => {
        if (filteredInterns.length === 0) {
            const isNoSchedule = interns.length === 0;

            return (
                <div className="col-span-full flex flex-col items-center justify-center gap-4 py-16 text-center">
                    {/* Tampilkan ilustrasi yang sesuai berdasarkan penyebab kosong */}
                    <img
                        src={
                            isNoSchedule
                                ? "/calendar-not-found-illustration.svg"
                                : "/search-not-found-illustration.svg"
                        }
                        alt={isNoSchedule ? "Jadwal kosong" : "Tidak ditemukan"}
                        className="size-72 object-contain opacity-80"
                    />

                    {isNoSchedule ? (
                        <p className="text-muted-foreground text-base font-medium">
                            Tidak ada karyawan terjadwal pada hari{" "}
                            <span className="font-bold capitalize">
                                {hariIni}
                            </span>
                            .
                        </p>
                    ) : (
                        <p className="text-muted-foreground text-lg font-medium">
                            Karyawan tidak ditemukan.
                        </p>
                    )}
                </div>
            );
        }

        return filteredInterns.map((intern) => {
            const rawAttendance = intern.attendances?.[0];
            const mappedAttendance = rawAttendance
                ? {
                      status: rawAttendance.status,
                      terlambat: rawAttendance.terlambat ?? undefined,
                      check_out: !!rawAttendance.check_out,
                  }
                : null;

            return (
                <InternCard
                    key={intern.id}
                    intern={intern}
                    onClick={() => {}}
                    attendance={mappedAttendance}
                />
            );
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <Head title="Absensi Harian" />

            {/* Navbar (Header) */}
            <div className="bg-background sticky top-0 z-20 border-b">
                <div className="mx-auto flex items-center justify-between px-10 py-4 sm:px-14 lg:px-20">
                    <AdminGate
                        adminFingerprints={mappedAdminFingerprints}
                        title="Presention"
                        subtitle="Sistem Presensi UPA PKK"
                    />

                    {/* Search Bar dengan styling admin panel (AuthenticatedLayout) */}
                    <div className="relative hidden w-full max-w-xs md:block">
                        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                        <Input
                            type="search"
                            placeholder="Cari karyawan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="focus-visible:border-primary border-border bg-muted/20 h-9 w-full border pl-9 shadow-none focus-visible:ring-0"
                        />
                    </div>
                </div>
            </div>

            <div className="mx-auto space-y-6 px-10 py-8 sm:px-14 lg:px-20">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-foreground hidden text-3xl font-bold tracking-tighter md:block">
                            Absensi Harian
                        </h1>

                        <p className="text-muted-foreground text-base">
                            Pindai sidik jari untuk presensi masuk/pulang
                            karyawan magang.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex gap-2">
                            <DatePickerInput
                                value={new Date(activeDate)}
                                onChange={(d) => {
                                    if (!d) return;
                                    const formatted = format(d, "yyyy-MM-dd");
                                    handleDateChange(formatted);
                                }}
                                placeholder="June 01, 2025"
                            />
                        </div>
                        <Button
                            onClick={startScan}
                            disabled={isScanning}
                            variant="default"
                            size="lg"
                            className="flex items-center gap-2 rounded-xl px-5 font-semibold transition hover:scale-[1.02] active:scale-95"
                        >
                            {isScanning ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <Fingerprint className="size-5" />
                            )}
                            {isScanning
                                ? "Memindai..."
                                : "Klik untuk Scan & Presensi"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {renderInternList()}
                </div>
            </div>

            <Dialog
                open={modalOpen}
                onOpenChange={(isOpen) => {
                    if (!isOpen) resetScan();
                }}
            >
                <DialogContent
                    showCloseButton={!isScanning}
                    className="flex flex-col items-center justify-center p-8 sm:max-w-md"
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>Status Pemindaian Sidik Jari</DialogTitle>
                    </DialogHeader>

                    {isScanning && (
                        <div className="text-primary flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin" />
                            <p className="text-base font-semibold">
                                {statusText}
                            </p>
                        </div>
                    )}

                    {!isScanning && feedback?.type === "error" && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-destructive/10 text-destructive flex aspect-square w-16 items-center justify-center rounded-full">
                                <Fingerprint className="h-10 w-10" />
                            </div>
                            <p className="text-destructive max-w-[25ch] text-center text-base font-semibold">
                                {feedback.message}
                            </p>
                        </div>
                    )}

                    {!isScanning && feedback?.type === "success" && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex aspect-square w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <Fingerprint className="h-10 w-10" />
                            </div>
                            <p className="text-center text-base font-semibold text-emerald-700 dark:text-emerald-400">
                                {feedback.message}
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
