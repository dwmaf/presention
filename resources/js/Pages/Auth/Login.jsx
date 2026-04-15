import { useState } from "react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

/**
 * * Login Page Component
 * * ----------------------------------------
 * * Halaman autentikasi untuk admin menggunakan Inertia.js.
 *
 * ? Kenapa pakai Inertia useForm?
 * ? - Menggabungkan state + request + error handling dalam satu hook
 * ? - Mengurangi boilerplate (tidak perlu axios + state manual)
 * ? - Error dari backend langsung terintegrasi ke UI
 *
 * ! Responsibility:
 * - Mengelola state form login (email, password, remember)
 * - Mengirim request login ke server
 * - Menampilkan error validasi dari backend
 * - Menangani UI interaktif (toggle password visibility)
 *
 * ! Tidak bertanggung jawab:
 * - Validasi kredensial (backend)
 * - Redirect setelah login (ditangani server / middleware)
 *
 * @param {Object} props
 * @param {string|null} props.status
 *   → Pesan status dari server (misal: reset password berhasil)
 *
 * @param {boolean} props.canResetPassword
 *   → Menentukan apakah fitur reset password tersedia
 *   → (saat ini tidak digunakan karena UI di-comment)
 *
 * ? Behavior penting:
 * - Password otomatis di-reset setelah submit (security best practice)
 * - Toggle show/hide password tidak mempengaruhi value input
 * - Error akan muncul secara inline pada masing-masing field
 *
 * ? Struktur state (useForm):
 * {
 *   email: string,
 *   password: string,
 *   remember: boolean
 * }
 *
 * ? UX Notes:
 * - Placeholder digunakan sebagai label untuk desain minimal
 * - Icon mata digunakan untuk meningkatkan usability password input
 * - Checkbox "remember" untuk persistent login session
 */
export default function Login({ status, canResetPassword }) {
    /**
     * * Form state (Inertia)
     * * ----------------------------------------
     * * Kenapa useForm?
     * * - Built-in handling request + validation error
     * * - Lebih clean dibanding useState manual
     */
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    /**
     * * Handle submit login
     * * ----------------------------------------
     * * Reset password setelah submit (security)
     */
    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="relative flex justify-center">
                {/* Background SVG kiri */}
                <svg
                    width="50"
                    height="70"
                    viewBox="0 0 88 127"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-0"
                >
                    <path
                        d="M-5.31201 -58.9908C20.0604 -58.5784 43.7792 -46.5128 60.9617 -27.8396C78.4808 -8.80063 90.5259 16.2282 87.5514 41.9293C84.6932 66.6261 65.4318 84.8519 46.1092 100.496C27.8774 115.257 6.93629 126.04 -16.5213 126.189C-41.7166 126.349 -68.4277 120.436 -84.8493 101.327C-101.109 82.4057 -101.519 55.4383 -98.6139 30.6604C-95.8991 7.509 -86.2626 -13.809 -69.4544 -29.9596C-51.8621 -46.8635 -29.7062 -59.3874 -5.31201 -58.9908Z"
                        fill="#F2F2F7"
                    />
                </svg>

                <form
                    onSubmit={submit}
                    className="flex flex-col justify-between px-12 py-8"
                >
                    <div>
                        <div className="mb-8 flex items-center justify-center gap-4">
                            <img
                                src="/foto/upa-pkk-logo.jpg.jpeg"
                                alt="Logo UPA PKK"
                                className="aspect-square w-16"
                            />
                            <p className="text-5xl font-semibold">UPA PKK</p>
                        </div>

                        <p className="mb-2 text-2xl font-semibold">
                            Selamat Datang!
                        </p>
                        <p className="mb-8 text-sm font-medium text-gray-400">
                            Silahkan isi untuk masuk ke halaman admin
                        </p>

                        <div className="flex flex-col gap-4">
                            <div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={data.email}
                                    className="text-md mt-1 block w-full"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />

                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <label htmlFor="password" className="relative">
                                <div className="flex justify-center">
                                    <TextInput
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        placeholder="Password"
                                        value={data.password}
                                        className="text-md mt-1 flex w-full justify-center pr-10"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className={`absolute right-3 ${errors.password ? "top-1/3" : "top-1/2"} -translate-y-1/2 cursor-pointer`}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 32 32"
                                            >
                                                <path
                                                    fill="oklch(44.6% 0.03 256.802)"
                                                    d="m20.525 21.94l7.768 7.767a1 1 0 0 0 1.414-1.414l-26-26a1 1 0 1 0-1.414 1.414l5.19 5.19c-3.99 3.15-5.424 7.75-5.444 7.823c-.16.53.14 1.08.67 1.24s1.09-.14 1.25-.67c.073-.254 1.358-4.323 4.926-6.99l3.175 3.175a6 6 0 1 0 8.465 8.465m-4.972-9.924l6.43 6.431Q22 18.225 22 18a6 6 0 0 0-6.447-5.984M10.59 7.053L12.135 8.6a12.2 12.2 0 0 1 3.861-.6c9.105 0 11.915 8.903 12.038 9.29c.13.43.53.71.96.71v-.01a.993.993 0 0 0 .96-1.28C29.923 16.61 26.613 6 15.995 6c-2.07 0-3.862.403-5.406 1.053"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                            >
                                                <g
                                                    fill="none"
                                                    stroke="oklch(44.6% 0.03 256.802)"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="1.5"
                                                >
                                                    <path d="M3 13c3.6-8 14.4-8 18 0" />
                                                    <path
                                                        fill="oklch(44.6% 0.03 256.802)"
                                                        d="M12 17a3 3 0 1 1 0-6a3 3 0 0 1 0 6"
                                                    />
                                                </g>
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="mt-4 block">
                        <label className="flex cursor-pointer items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-400">
                                Ingat Saya
                            </span>
                        </label>
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                        {/* {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )} */}

                        <PrimaryButton
                            className="w-full justify-center"
                            disabled={processing}
                        >
                            Masuk
                        </PrimaryButton>
                    </div>
                </form>

                <div className="h-[32rem]">
                    <img
                        src="/foto/UPA PKK.jpeg"
                        alt="UPA PKK"
                        className="aspect-square h-full w-[28rem] object-cover"
                    />
                </div>

                <svg
                    width="100"
                    height="34"
                    viewBox="0 0 154 58"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute bottom-0 left-[21.4rem] -rotate-90"
                >
                    <path
                        d="M77.5623 0.00657775C98.3458 0.302787 117.775 8.96796 131.85 22.3786C146.2 36.0519 156.067 54.0269 153.63 72.4848C151.289 90.2214 135.511 103.311 119.683 114.546C104.749 125.147 87.5954 132.891 68.3804 132.998C47.742 133.113 25.862 128.866 12.4104 115.142C-0.908525 101.554 -1.24461 82.1865 1.13539 64.3917C3.35918 47.765 11.2528 32.455 25.021 20.8561C39.4315 8.7161 57.5802 -0.278211 77.5623 0.00657775Z"
                        fill="#F2F2F7"
                    />
                </svg>
            </div>
        </GuestLayout>
    );
}
