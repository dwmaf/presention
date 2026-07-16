/**
 * ============================================================================
 * Type        : Intern Types
 * Layer       : Feature (Type)
 *
 * Description:
 * Definisi tipe data dan antarmuka (interface) entitas Karyawan (Intern).
 * ============================================================================
 */

/**
 * Representasi data divisi.
 */
export interface Division {
    id: number;
    nama_divisi: string;
}

/**
 * Status absensi kehadiran.
 */
export type AttendanceStatus = "hadir" | "alpha" | "izin" | "sakit";

/**
 * Riwayat absensi harian karyawan.
 */
export interface Attendance {
    id: number;
    tanggal: string;
    status: AttendanceStatus;
    check_in?: string | null;
    check_out?: string | null;
    terlambat?: number | null;
}

/**
 * Profil lengkap karyawan magang (intern).
 */
export interface InternData {
    id: number;
    name: string;
    division_id: number;
    poin: number;
    foto?: string | null;
    fingerprint_data?: any;
    senin: boolean;
    selasa: boolean;
    rabu: boolean;
    kamis: boolean;
    jumat: boolean;
    division?: Division;
    total_kehadiran?: number;
    total_jam?: number;
    avg_jam_masuk?: string | null;
    avg_jam_pulang?: string | null;
    total_izin?: number;
    total_alpha?: number;
    attendances?: Attendance[];
}

/**
 * Ringkasan absensi karyawan untuk dashboard.
 */
export interface InternAttendanceSummary {
    id: number;
    name: string;
    foto?: string | null;
    division?: Division;
    jumlah_hadir: number;
    jumlah_izin: number;
    jumlah_alpha: number;
    total_jam: number;
}
