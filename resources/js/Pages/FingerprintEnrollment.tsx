/**
 * ============================================================================
 * Component   : FingerprintEnrollment
 * Layer       : Pages
 *
 * Description:
 * Komponen utama halaman pendaftaran sidik jari anak magang. Menangani
 * render rich text untuk status dan deskripsi grup.
 * ============================================================================
 */

import { Head, Link } from "@inertiajs/react";
import { useFingerprintEnrollment } from "@/hooks/useFingerPrintEnrollment";
import type { Intern } from "@/hooks/useFingerPrintEnrollment";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";

/**
 * Properti untuk halaman pendaftaran sidik jari.
 */
export interface FingerprintEnrollmentProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            [key: string]: unknown;
        };
    };
    intern: Intern;
}

/**
 * Halaman utama pendaftaran sidik jari magang.
 *
 * @param props Properti komponen.
 * @returns Elemen halaman pendaftaran sidik jari.
 */
export default function FingerprintEnrollment({
    auth,
    intern,
}: FingerprintEnrollmentProps) {
    const {
        groups,
        activeGroup,
        state,
        forms,
        startNextCapture,
        submitGroup,
        resetDbGroup,
        resetLocal,
        groupHasDb,
        groupDbCount,
    } = useFingerprintEnrollment(intern);

    return (
        <AuthenticatedLayout>
            <Head title={`Fingerprint - ${intern.name}`} />

            <div>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h2 className="mb-2 text-3xl font-semibold text-gray-800">
                                Pendaftaran Sidik Jari
                            </h2>
                            <p className="mb-2 text-lg font-bold text-indigo-600">
                                {intern.name}
                            </p>
                            <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                                <span className="animate-pulse">●</span>{" "}
                                Pastikan FingerprintBridge.exe berjalan sebelum
                                memulai scan
                            </p>
                        </div>
                        <Link
                            href={route("interns.index")}
                            className="flex items-center gap-2 font-semibold text-blue-700 hover:underline"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                style={{ transform: "rotate(-90deg)" }}
                            >
                                <path
                                    fill="none"
                                    stroke="oklch(48.8% 0.243 264.376)"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 5v14m6-8l-6-6m-6 6l6-6"
                                />
                            </svg>
                            Kembali
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {groups.map((g) => {
                            const st = state[g.id];
                            const done = st.samples.length === 3;
                            const hasDb = groupHasDb(g);
                            const dbCount = groupDbCount(g);

                            // ? Dapatkan data form yang terisolasi secara statis sesuai dengan kelompok aktif
                            const currentForm =
                                g.id === "primary"
                                    ? forms.primary
                                    : forms.backup;
                            const isProcessing = currentForm.processing;

                            return (
                                <Card
                                    key={g.id}
                                    className="flex flex-col border border-gray-100 bg-white p-0 shadow-sm"
                                >
                                    <CardHeader className="border-b border-gray-50 bg-gray-50/50 p-5">
                                        <CardTitle className="text-lg font-bold text-gray-800">
                                            {g.title}
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-sm text-gray-500">
                                            {g.id === "backup" ? (
                                                <>
                                                    Scan 3x untuk cadangan
                                                    (boleh jari berbeda). Jika
                                                    ingin mendaftar ulang, klik{" "}
                                                    <b>Reset Scan</b> terlebih
                                                    dahulu.
                                                </>
                                            ) : (
                                                g.subtitle
                                            )}
                                        </CardDescription>

                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <div>
                                                <span className="font-semibold text-gray-700">
                                                    Progress Scan:
                                                </span>{" "}
                                                <span className="font-bold text-indigo-600">
                                                    {st.samples.length}/3
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">
                                                    Data Tersimpan :
                                                </span>{" "}
                                                <span
                                                    className={`font-bold ${
                                                        hasDb
                                                            ? "text-emerald-600"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {hasDb
                                                        ? `${dbCount}/3 tersimpan`
                                                        : "kosong"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex flex-1 flex-col p-6">
                                        <div className="mb-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 p-4">
                                            <div className="grid grid-cols-3 gap-3">
                                                {[0, 1, 2].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`overflow-hidden rounded-lg border ${
                                                            st.images[i]
                                                                ? "border-white bg-white shadow"
                                                                : "border-gray-200 bg-white"
                                                        }`}
                                                    >
                                                        {st.images[i] ? (
                                                            <img
                                                                src={
                                                                    st.images[i]
                                                                }
                                                                alt={`${g.title} scan ${i + 1}`}
                                                                className="h-24 w-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="flex h-24 items-center justify-center text-xs text-gray-400">
                                                                Scan {i + 1}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div
                                                className={`mt-4 px-2 text-center text-sm font-medium ${
                                                    st.status.includes(
                                                        "Gagal",
                                                    ) ||
                                                    st.status.includes("Error")
                                                        ? "text-red-500"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {st.status.includes(
                                                    "Reset Scan",
                                                )
                                                    ? st.status
                                                          .split("Reset Scan")
                                                          .reduce(
                                                              (
                                                                  acc,
                                                                  part,
                                                                  index,
                                                              ) => {
                                                                  if (
                                                                      index ===
                                                                      0
                                                                  )
                                                                      return [
                                                                          part,
                                                                      ] as any;
                                                                  return [
                                                                      ...acc,
                                                                      <b
                                                                          key={
                                                                              index
                                                                          }
                                                                      >
                                                                          Reset
                                                                          Scan
                                                                      </b>,
                                                                      part,
                                                                  ];
                                                              },
                                                              [] as any,
                                                          )
                                                    : st.status}
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-3">
                                            <Button
                                                onClick={() =>
                                                    startNextCapture(g.id)
                                                }
                                                disabled={
                                                    activeGroup !== null ||
                                                    hasDb ||
                                                    done
                                                }
                                                className="w-full font-bold shadow-sm"
                                            >
                                                {hasDb
                                                    ? "Scan dikunci (DB sudah ada)"
                                                    : done
                                                      ? "Scan Selesai (3/3)"
                                                      : activeGroup === g.id
                                                        ? "Scanning..."
                                                        : `Mulai Scan (${st.samples.length + 1}/3)`}
                                            </Button>

                                            <Button
                                                onClick={() => resetLocal(g.id)}
                                                disabled={activeGroup !== null}
                                                variant="outline"
                                                className="w-full bg-white font-semibold shadow-sm"
                                            >
                                                Reset Scan
                                            </Button>

                                            {done && !hasDb && (
                                                <form
                                                    onSubmit={(e) =>
                                                        submitGroup(e, g.id)
                                                    }
                                                >
                                                    <Button
                                                        type="submit"
                                                        disabled={isProcessing}
                                                        className="w-full bg-emerald-600 font-bold text-white shadow-sm hover:bg-emerald-700"
                                                    >
                                                        {isProcessing
                                                            ? "Menyimpan..."
                                                            : "Simpan (3 Template)"}
                                                    </Button>
                                                </form>
                                            )}

                                            {hasDb && (
                                                <div className="space-y-2">
                                                    <Button
                                                        onClick={() =>
                                                            resetDbGroup(g.id)
                                                        }
                                                        disabled={
                                                            isProcessing ||
                                                            activeGroup !== null
                                                        }
                                                        variant="destructive"
                                                        className="w-full font-bold shadow-sm"
                                                    >
                                                        {isProcessing
                                                            ? "Mereset Database..."
                                                            : "Reset Scan (Hapus Template Lama)"}
                                                    </Button>
                                                    <p className="text-center text-xs text-red-600">
                                                        Data sidik jari sudah
                                                        tersimpan di database.
                                                        <br />
                                                        Sistem tidak akan
                                                        menimpa data lama.
                                                        <br />
                                                        Silakan klik{" "}
                                                        <b>Reset Scan</b> jika
                                                        ingin mendaftar ulang
                                                        sidik jari.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-10 rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
                        <h3 className="mb-2 font-bold text-gray-800">
                            Tips biar capture tidak sering “bad quality”
                        </h3>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>
                                Pastikan jari tidak terlalu kering / terlalu
                                basah.
                            </li>
                            <li>
                                Tempelkan dengan tekanan wajar (jangan terlalu
                                keras).
                            </li>
                            <li>
                                Saat scan 2 dan 3, geser sedikit posisi jari
                                (kiri/kanan/atas/bawah) untuk menutup area.
                            </li>
                            <li>Jika sering error, coba bersihkan sensor.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
