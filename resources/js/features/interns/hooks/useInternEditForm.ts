import { useState, type FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import type { InternData } from "../types/intern";

interface UseInternFormProps {
    intern: InternData;
}

/**
 * Hook kustom untuk kontrol form edit data karyawan.
 */
export function useInternEditForm({ intern }: UseInternFormProps) {
    const [showForm, setShowForm] = useState<boolean>(false);

    const { data, setData, errors, reset, put, processing } = useForm({
        name: intern?.name || "",
        division_id: String(intern?.division_id || ""),
        senin: intern?.senin || false,
        selasa: intern?.selasa || false,
        rabu: intern?.rabu || false,
        kamis: intern?.kamis || false,
        jumat: intern?.jumat || false,
        poin: (intern?.poin ?? 5) < 0 ? 0 : (intern?.poin ?? 5),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/interns/${intern.id}`, {
            onSuccess: () => {
                setShowForm(false);
                toast.success("Data karyawan berhasil diperbarui.");
            },
            onError: () => {
                toast.error("Gagal memperbarui data karyawan.");
            },
        });
    };

    const handleCloseForm = () => {
        reset();
        setShowForm(false);
    };

    return {
        showForm,
        setShowForm,
        data,
        setData,
        errors,
        handleSubmit,
        handleCloseForm,
        processing,
    };
}
