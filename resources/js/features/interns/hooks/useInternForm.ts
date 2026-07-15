/**
 * ============================================================================
 * Hook        : useInternForm
 * Layer       : Feature (Hook)
 *
 * Description:
 * Mengelola formulir perubahan data profil dasar karyawan magang.
 * ============================================================================
 */

import { useState } from "react";
import { router, useForm } from "@inertiajs/react";

interface InternData {
    id: number;
    name: string;
    division_id: number;
    poin: number;
    senin: boolean;
    selasa: boolean;
    rabu: boolean;
    kamis: boolean;
    jumat: boolean;
}

interface UseInternFormProps {
    intern: InternData;
}

/**
 * Hook kustom untuk kontrol form edit data karyawan.
 *
 * @param props Properti hook.
 * @returns Form Inertia state, error, dan handler submit/cancel.
 */
export function useInternForm({ intern }: UseInternFormProps) {
    const [showForm, setShowForm] = useState<boolean>(false);

    const { data, setData, errors, reset } = useForm({
        name: intern?.name || "",
        division_id: String(intern?.division_id || ""),
        senin: intern?.senin || false,
        selasa: intern?.selasa || false,
        rabu: intern?.rabu || false,
        kamis: intern?.kamis || false,
        jumat: intern?.jumat || false,
        poin: (intern?.poin ?? 5) < 0 ? 0 : (intern?.poin ?? 5),
    });

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        router.put(`/interns/${intern.id}`, data, {
            onSuccess: () => setShowForm(false),
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
    };
}
