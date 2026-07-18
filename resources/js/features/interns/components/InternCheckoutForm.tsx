/**
 * ============================================================================
 * Component   : CheckoutForm
 * Layer       : Feature (interns/components)
 *
 * Description:
 * Dropdown form kustom untuk mengubah atau menghapus catatan jam pulang
 * (check-out) harian karyawan magang. Menutup secara otomatis jika diklik di luar.
 * ============================================================================
 */

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CheckoutFormProps {
    show: boolean;
    position?: "top" | "bottom";
    value: string;
    setValue: (val: string) => void;
    onSave: (val: string) => void;
    onDelete: () => void;
    onCancel: () => void;
    date?: string; // * Menambahkan prop tanggal opsional
    processing?: boolean;
}

/**
 * Dropdown form untuk edit / hapus jam pulang karyawan.
 *
 * @param props Properti komponen CheckoutForm.
 * @returns Elemen form edit jam pulang atau null jika tidak ditampilkan.
 */
export default function CheckoutForm({
    show,
    position = "bottom",
    value,
    setValue,
    onSave,
    onDelete,
    onCancel,
    date,
    processing = false,
}: CheckoutFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    // ? Menutup dropdown secara otomatis ketika klik dilakukan di luar area form
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                formRef.current &&
                !formRef.current.contains(event.target as Node)
            ) {
                onCancel();
            }
        }

        if (show) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [show, onCancel]);

    if (!show) return null;

    // ? Memformat string tanggal ke format penuh Indonesia (contoh: "18 Juli 2026")
    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        try {
            const parsedDate = new Date(dateString);
            return parsedDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long", // * Bulan lengkap (e.g., Agustus)
                year: "numeric", // * Tahun lengkap (e.g., 2026)
            });
        } catch {
            return dateString;
        }
    };

    // ? Menentukan posisi elemen dropdown (di atas atau bawah tombol pemicu)
    const positionClass =
        position === "top" ? "bottom-10 right-0" : "top-10 right-0";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(value);
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className={`absolute z-10 w-64 rounded-lg border border-gray-100 bg-white p-4 shadow-lg ${positionClass}`}
        >
            <div className="mb-2.5 flex items-center justify-between">
                <p className="text-foreground text-sm font-semibold">
                    Edit Jam Pulang {date ? `(${formatDate(date)})` : ""}
                </p>
            </div>

            <Input
                type="time"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="00:00"
                max="23:59"
                step="60"
                disabled={processing}
                className="w-full cursor-pointer bg-white text-sm"
            />

            <div className="mt-3 flex gap-2">
                <Button
                    type="submit"
                    size="sm"
                    disabled={processing}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 text-xs font-semibold"
                >
                    {processing ? "Menyimpan..." : "Simpan"}
                </Button>

                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    disabled={processing}
                    className="flex-1 text-xs font-semibold"
                >
                    Hapus
                </Button>
            </div>
        </form>
    );
}
