/**
 * ============================================================================
 * Component   : Login
 * Layer       : Feature (Page)
 *
 * Description:
 * Halaman autentikasi administrator UPA PKK menggunakan layout grid split-screen
 * modern, terintegrasi dengan Inertia.js dan komponen Shadcn.
 * ============================================================================
 */

import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import InputError from "@/components/InputError";
import { EyeIcon } from "@/components/icons/eye";
import { useAnimatableIcon } from "@/hooks/useAnimatableIcons";
import { EyeOffIcon } from "@/components/ui/eye-off";

/**
 * Properti untuk halaman Login admin.
 */
export interface LoginProps {
    /** Pesan status sesi (misal: setelah reset password). */
    status?: string;
    /** Menandakan apakah fitur reset password diizinkan. */
    canResetPassword?: boolean;
}

/**
 * Halaman login admin UPA PKK.
 *
 * @param props Properti halaman Login.
 * @returns Tampilan halaman login admin.
 */
export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const eyeIcon = useAnimatableIcon();
    const eyeOffIcon = useAnimatableIcon();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        // * Trigger animasi pada ikon yang akan aktif setelah toggle
        if (!showPassword) {
            // * Menjadi tampil (EyeIcon aktif)
            eyeIcon.start();
        } else {
            // * Menjadi sembunyi (EyeOffIcon aktif)
            eyeOffIcon.start();
        }
    };

    // * Handler untuk hover di input password
    const handleInputMouseEnter = () => {
        if (showPassword) {
            eyeIcon.start();
        } else {
            eyeOffIcon.start();
        }
    };

    const handleInputMouseLeave = () => {
        if (showPassword) {
            eyeIcon.stop();
        } else {
            eyeOffIcon.stop();
        }
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="bg-background text-foreground grid min-h-svh font-sans lg:grid-cols-2">
            <Head title="Log in" />

            {/* ── Sisi Kiri: Form Autentikasi ── */}
            <div className="flex flex-col justify-between gap-4 p-6 md:p-10">
                {/* Header Logo */}
                <div className="flex items-center justify-center gap-3 md:justify-start">
                    <img
                        src="/foto/upa-pkk-logo.jpg.jpeg"
                        alt="Logo UPA PKK"
                        className="size-12 rounded-full object-cover"
                    />
                    <h1 className="text-lg font-bold tracking-tighter md:text-xl">
                        Unit Penunjang Akademik <br /> Pengembangan Karir dan
                        Kewirausahaan
                    </h1>
                </div>

                {/* Form Wrapper */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm space-y-8">
                        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Selamat Datang!
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Masuk menggunakan akun admin untuk mengelola
                                data presensi UPA PKK.
                            </p>
                        </div>

                        {status && (
                            <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Input Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="email@upapkk.com"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="w-full focus-visible:ring-0"
                                />
                                {errors.email && (
                                    <InputError message={errors.email} />
                                )}
                            </div>

                            {/* Input Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        placeholder="••••••••"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        onMouseEnter={handleInputMouseEnter}
                                        onMouseLeave={handleInputMouseLeave}
                                        className="w-full pr-10 focus-visible:ring-0"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        aria-label={
                                            showPassword
                                                ? "Sembunyikan password"
                                                : "Tampilkan password"
                                        }
                                        className="text-muted-foreground hover:text-foreground items- center absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer justify-center"
                                    >
                                        <EyeIcon
                                            ref={eyeIcon.ref}
                                            size={18}
                                            className={
                                                showPassword
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        />
                                        <EyeOffIcon
                                            ref={eyeOffIcon.ref}
                                            size={18}
                                            className={
                                                showPassword
                                                    ? "hidden"
                                                    : "block"
                                            }
                                        />
                                    </button>
                                </div>
                                {errors.password && (
                                    <InputError message={errors.password} />
                                )}
                            </div>

                            {/* Ingat Saya Checkbox */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) =>
                                        setData("remember", !!checked)
                                    }
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-muted-foreground cursor-pointer text-sm leading-none font-medium select-none"
                                >
                                    Ingat Saya
                                </Label>
                            </div>

                            {/* Tombol Masuk */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="text-muted-foreground text-center text-sm md:text-left">
                    &copy; {new Date().getFullYear()} UPA PKK. Semua Hak
                    Dilindungi.
                </div>
            </div>

            {/* ── Sisi Kanan: Visual Banner ── */}
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/login-image.png"
                    alt="Kantor UPA PKK"
                    loading="eager"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6]"
                />
                {/* Overlay Gradasi Estetis */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Teks Promosi pada Banner */}
                <div className="absolute right-10 bottom-10 left-10 z-10 space-y-2 text-white">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Presention | Sistem Presensi UPA PKK
                    </h2>

                    <p className="text-sm text-gray-200">
                        Kelola data kehadiran, kegiatan magang, dan administrasi
                        praktis dalam satu platform terpadu.
                    </p>
                </div>
            </div>
        </div>
    );
}
