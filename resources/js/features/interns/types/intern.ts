export interface Division {
    id: number;
    nama_divisi: string;
}

export type AttendanceStatus = "hadir" | "alpha" | "izin" | "sakit";

export interface Attendance {
    id: number;
    tanggal: string;
    status: AttendanceStatus;
    check_in?: string | null;
    check_out?: string | null;
    terlambat?: number | null;
}

/**
 * Entitas domain utama karyawan magang (intern) yang menggabungkan profil identitas,
 * relasi divisi, poin performa, data biometrik sidik jari, jadwal kerja mingguan,
 * serta batas toleransi jam keterlambatan per hari.
 */
export interface InternData {
    id: number;
    name: string;
    division_id: number;
    poin: number;
    foto?: string | null;
    fingerprint_data?: unknown;

    senin: boolean;
    selasa: boolean;
    rabu: boolean;
    kamis: boolean;
    jumat: boolean;

    toleransi_senin?: boolean;
    toleransi_senin_time?: string | null;
    toleransi_selasa?: boolean;
    toleransi_selasa_time?: string | null;
    toleransi_rabu?: boolean;
    toleransi_rabu_time?: string | null;
    toleransi_kamis?: boolean;
    toleransi_kamis_time?: string | null;
    toleransi_jumat?: boolean;
    toleransi_jumat_time?: string | null;

    division?: Division;
    total_kehadiran?: number;
    total_jam?: number;
    avg_jam_masuk?: string | null;
    avg_jam_pulang?: string | null;
    total_izin?: number;
    total_sakit?: number;
    total_alpha?: number;
    attendances?: Attendance[];
    is_active?: boolean;
}

export interface InternAttendanceSummary {
    id: number;
    name: string;
    foto?: string | null;
    division?: Division;
    jumlah_hadir: number;
    jumlah_izin: number;
    jumlah_sakit: number;
    jumlah_alpha: number;
    total_jam: number;
}
