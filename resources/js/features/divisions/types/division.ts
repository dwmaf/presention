/**
 * ============================================================================
 * Type        : Division Types
 * Layer       : Feature (Type)
 *
 * Description:
 * Definisi kontrak data (interface) untuk fitur Manajemen Divisi.
 * ============================================================================
 */

/**
 * Representasi profil singkat karyawan magang (intern) dalam divisi.
 */
export interface DivisionMember {
    id: number;
    name: string;
    foto?: string | null;
    is_active?: boolean;
}

/**
 * Representasi data lengkap divisi beserta relasi anggotanya.
 */
export interface DivisionData {
    id: number;
    nama_divisi: string;
    deskripsi?: string | null;
    interns_count?: number;
    interns?: DivisionMember[];
}

/**
 * Representasi data user login.
 */
export interface AuthUser {
    id: number;
    name: string;
    email: string;
}

/**
 * Representasi prop autentikasi.
 */
export interface Auth {
    user: AuthUser;
}

/**
 * Properti untuk halaman utama Division.
 */
export interface DivisionProps {
    auth: Auth;
    divisions: DivisionData[];
    allInterns?: DivisionMember[];
}

/**
 * Struktur data form pembuatan/perubahan divisi.
 */
export interface DivisionFormState {
    nama_divisi: string;
    deskripsi: string;
}
