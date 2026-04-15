/**
 * * TextInput Component
 * * ----------------------------------------
 * * Wrapper untuk elemen <input> dengan dukungan ref forwarding
 * * dan auto-focus handling.
 *
 * ? Kenapa pakai forwardRef?
 * ? - Agar parent component bisa mengakses method (focus)
 * ? - Berguna untuk UX (auto focus setelah modal/form muncul)
 *
 * ? Kenapa pakai useImperativeHandle?
 * ? - Untuk expose method tertentu saja (focus)
 * ? - Tidak expose seluruh DOM element (lebih aman & terkontrol)
 *
 * ! Responsibility:
 * - Render input dengan styling konsisten
 * - Handle auto focus via prop isFocused
 * - Expose method focus ke parent component
 *
 * @param {string} [type="text"]
 * - Tipe input (text, number, email, dll)
 *
 * @param {string} [className=""]
 * - Tambahan class styling dari parent
 *
 * @param {boolean} [isFocused=false]
 * - Jika true, input akan otomatis focus saat mount / update
 *
 * @param {object} props
 * - Props tambahan (value, onChange, placeholder, dll)
 *
 * @param {React.Ref} ref
 * - Ref dari parent untuk akses method (focus)
 *
 * ? Atau auto focus:
 * <TextInput isFocused />
 *
 * ? Catatan penting:
 * - Menggunakan optional chaining (?.) untuk mencegah error null
 * - localRef digunakan sebagai referensi internal DOM
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export default forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, Edit, ...props },
    ref,
) {
    /**
     * * localRef
     * * Menyimpan referensi ke DOM input
     * * Tidak langsung expose ke parent
     */
    const localRef = useRef(null);

    /**
     * * useImperativeHandle
     * * ----------------------------------------
     * * Membatasi apa yang bisa diakses parent lewat ref
     * * Di sini hanya expose method focus()
     */
    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    /**
     * * Auto Focus Logic
     * * ----------------------------------------
     * * Jika isFocused = true, maka input akan langsung focus
     * * Berguna untuk form / modal yang baru muncul
     */
    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                "rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 " +
                className
            }
            ref={localRef} // hubungkan ke DOM input
        />
    );
});
