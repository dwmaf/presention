/**
 * * InternCard Component
 * * ----------------------------------------
 * * Komponen card untuk menampilkan informasi ringkas intern (peserta magang)
 * * Digunakan di:
 * * - Halaman Intern (daftar karyawan)
 * * - Halaman Attendance (absensi kehadiran)
 *
 * ! Komponen ini bersifat reusable dengan 2 mode:
 * ! 1. Default Mode → menampilkan divisi & fingerprint
 * ! 2. Attendance Mode → menampilkan status kehadiran
 *
 * ? Kenapa tidak dipisah jadi 2 komponen?
 * ? Karena struktur UI sama, hanya berbeda pada bagian badge/status
 * ? → Mengurangi duplikasi layout
 *
 * @param {Object} intern
 * * Data utama intern
 * * - name → nama lengkap
 * * - division → data divisi (opsional)
 * * - poin → jumlah poin (default: 0)
 * * - foto → path foto profil
 * * - fingerprint_data → status fingerprint
 *
 * @param {Function} onClick
 * * Handler saat card diklik
 * * Biasanya untuk membuka modal detail (InternDetail.jsx)
 *
 * @param {Object|undefined} attendance
 * * Data kehadiran (opsional)
 * * Jika ada → komponen masuk ke "attendance mode"
 *
 * * Struktur attendance:
 * * - status → "hadir" | "alpha" | "izin" | "sakit"
 * * - terlambat → jumlah menit keterlambatan
 * * - check_out → status sudah pulang
 *
 * ! Behavior Rendering:
 * ! - attendance undefined → tampilkan divisi + fingerprint
 * ! - attendance null → "Tidak Hadir"
 * ! - attendance.status !== "hadir" → tampilkan status (alpha/izin/sakit)
 * ! - attendance.status === "hadir" → tampilkan:
 * !    - Hadir
 * !    - Telat / Tepat Waktu
 * !    - Pulang (jika check_out)
 *
 * * UI Logic:
 * * - Poin < 3 → merah (peringatan)
 * * - Poin >= 3 → biru (normal)
 * * - Fingerprint ada → hijau (valid)
 * * - Fingerprint tidak ada → merah (invalid)
 *
 * TODO Improvement ideas:
 * TODO - Pisahkan AttendanceBadge menjadi komponen sendiri
 * TODO - Tambahkan fallback image (bukan "No Img")
 * TODO - Pisahkan FingerprintBadge agar reusable
 * TODO - Buat reusable <Badge /> component untuk semua status
 */

/**
 * * Status label (dipisah agar scalable & tidak dibuat ulang setiap render)
 */
const STATUS_LABELS = {
    alpha: { label: "Tidak Hadir", color: "bg-red-100 text-red-600" },
    izin: { label: "Izin", color: "bg-amber-100 text-amber-600" },
    sakit: { label: "Sakit", color: "bg-blue-100 text-blue-600" },
};

/**
 * * Reusable Badge Component
 * ? Kenapa dibuat?
 * ? → Menghindari repetisi class Tailwind
 */
function Badge({ children, className = "" }) {
    return (
        <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full w-fit ${className}`}
        >
            {children}
        </span>
    );
}

/**
 * * Attendance Badge (dipisah dari komponen utama)
 * ! Fokus hanya ke render status
 */
function AttendanceBadge({ attendance }) {
    if (attendance === undefined) return null;

    if (!attendance) {
        return <Badge className="bg-red-100 text-red-600">Tidak Hadir</Badge>;
    }

    if (attendance.status !== "hadir") {
        const config = STATUS_LABELS[attendance.status] || {
            label: attendance.status,
            color: "bg-gray-100 text-gray-600",
        };

        return <Badge className={config.color}>{config.label}</Badge>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            <Badge className="bg-green-100 text-green-700">Hadir</Badge>

            {attendance.terlambat ? (
                <Badge className="bg-amber-100 text-amber-700">
                    Telat {attendance.terlambat}m
                </Badge>
            ) : (
                <Badge className="bg-blue-100 text-blue-700">Tepat Waktu</Badge>
            )}

            {attendance.check_out && (
                <Badge className="bg-blue-100 text-blue-700">Pulang</Badge>
            )}
        </div>
    );
}

export default function InternCard({ intern, onClick, attendance }) {
    /**
     * * Derived state (lebih jelas & aman)
     */
    const rawPoin = intern.poin ?? 0;
    const poin = rawPoin < 0 ? 0 : rawPoin;
    const hasFingerprint = !!intern.fingerprint_data;

    /**
     * * Styling logic dipisah agar readable
     */
    const poinStyle =
        poin < 3 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";

    const fingerprintStyle = hasFingerprint
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

    const divisionName = intern.division?.nama_divisi ?? "-";

    return (
        <div
            onClick={onClick}
            className="bg-white w-fit space-y-2 rounded-lg shadow-lg pb-4 cursor-pointer hover:scale-[1.02] transition flex flex-col"
        >
            {/* Image */}
            {intern.foto ? (
                <img
                    className="w-41 h-41 object-cover aspect-square rounded-t-lg object-top"
                    src={`/storage/${intern.foto}`}
                    alt={intern.name}
                />
            ) : (
                <div className="w-41 h-41 flex items-center justify-center bg-gray-100 text-gray-400 rounded-t-lg">
                    No Image
                </div>
            )}

            <div className="px-4 flex flex-col justify-center flex-1">
                {/* Name */}
                <p className="font-semibold text-lg flex items-center flex-1">
                    {intern.name}
                </p>

                {/* Attendance / Division */}
                {attendance !== undefined ? (
                    <div className="mb-2">
                        <AttendanceBadge attendance={attendance} />
                    </div>
                ) : (
                    <p className="font-medium mb-2 text-sm">{divisionName}</p>
                )}

                {/* Footer */}
                <div className="flex gap-2">
                    <Badge className={poinStyle}>{poin} Poin</Badge>

                    {attendance === undefined && (
                        <div
                            className={`rounded-full flex items-center px-0.5 ${fingerprintStyle}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14px"
                                height="14px"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M1.265 4.185A6.022 6.022 0 0 1 9.512.547a.625.625 0 0 1-.522 1.135a4.772 4.772 0 0 0-6.534 2.883a.625.625 0 1 1-1.191-.38M11.95 2.593a.625.625 0 0 0-1.028.712c.534.77.847 1.705.847 2.714v1.962A4.77 4.77 0 0 1 7 12.75A.625.625 0 1 0 7 14a6.02 6.02 0 0 0 6.02-6.02V6.019a6 6 0 0 0-1.07-3.426M2.23 6.76a.625.625 0 1 0-1.25 0v1.22a6.02 6.02 0 0 0 3.303 5.374a.625.625 0 1 0 .565-1.115A4.77 4.77 0 0 1 2.23 7.981zm2.584-1.513a.625.625 0 1 0-1.179-.417a3.6 3.6 0 0 0-.203 1.19v1.96a3.568 3.568 0 0 0 5.947 2.66a.625.625 0 0 0-.834-.932A2.318 2.318 0 0 1 4.682 7.98V6.02c0-.272.047-.532.132-.772m1.458-2.721a3.568 3.568 0 0 1 4.296 3.493v1.47a.625.625 0 1 1-1.25 0V6.02a2.318 2.318 0 0 0-2.792-2.27a.625.625 0 1 1-.254-1.223M7.625 6.02a.625.625 0 1 0-1.25 0v1.962a.625.625 0 1 0 1.25 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
