# Dokumentasi Frontend (React 18 + Inertia v2)

Dokumen ini menjelaskan arsitektur frontend, struktur halaman, komponen modular, custom hooks, layout, dan tipe data pada aplikasi Presention (Sistem Absensi UPA PKK).

---

## 1. Arsitektur & Technology Stack

- **Core Framework**: React 18 + Inertia.js v2 (`@inertiajs/react`).
- **Language**: TypeScript (Strict Mode, 0 `any`).
- **Styling**: TailwindCSS v4 + Shadcn UI primitives.
- **Iconography**: Lucide React (`lucide-react`).
- **Hardware Integration**: Local C# Fingerprint Daemon (`http://localhost:5000/enroll`).

---

## 2. Struktur Halaman (`resources/js/Pages/`)

### `Auth/Login.tsx`

- **Fungsi**: Halaman login autentikasi admin/user.
- **Komponen**: Form login Inertia `useForm`, banner branding dengan `fetchPriority="high"`, dan input password accessible (`aria-label`).
- **Props**: `LoginProps` (`canResetPassword`, `status`).

### `Intern.tsx`

- **Fungsi**: Halaman utama manajemen karyawan magang (CRUD, pencarian, filter status, reset poin).
- **Komponen**:
    - Filtering client-side yang dimemoisasi (`useMemo`) untuk memisahkan `activeInterns` & `inactiveInterns`.
    - Input pencarian real-time terikat pada state `search`.
    - Integrasi modal: `InternAddModal`, `InternDeleteModal`, `InternDetail`, `InternResetModal`, & `AlertDialog` toggle keaktifan.
    - Ekspor data kehadiran via Ziggy `route("interns.exportAttendance", id)`.
- **Props**: `InternProps` (`interns: InternData[]`, `divisions: Division[]`).

### `FingerprintEnrollment.tsx`

- **Fungsi**: Halaman enrollment 6 slot sidik jari karyawan magang.
- **Komponen**:
    - Pendaftaran 2 grup template (`primary` & `backup`).
    - Terintegrasi penuh dengan custom hook `useFingerprintEnrollment`.
    - Formatter status `renderStatusText` tanpa type assertions (`as any`).
    - Icon navigasi `ArrowLeftIcon` dari `lucide-react`.
- **Props**: `FingerprintEnrollmentProps` (`intern: Intern`).

---

## 3. Modular Feature Architecture (`resources/js/features/`)

### Feature: Sidebar (`resources/js/features/sidebar/`)

- `app-sidebar.tsx`: Sidebar navigasi utama dengan memoisasi menu `navMain` dan fallback `DEFAULT_USER`.
- `nav-main.tsx`: Render item navigasi Collapsible dinamis dengan key unik `item.url`.
- `nav-user.tsx`: Dropdown profil pengguna di footer sidebar dengan Avatar fallback initials dinamis (`getInitials`) dan posisi dropdown responsif (`isMobile`).

### Feature: Interns (`resources/js/features/interns/`)

- `components/InternCard.tsx`: Card visual ringkasan profil intern, poin, divisi, dan status aktif.
- `components/InternAddModal.tsx`: Modal dialog form tambah/edit intern, preview foto lokal (`FileReader`), dan checklist hari kerja.
- `components/InternDetail.tsx`: Dialog detail profil lengkap, jam kerja harian, dan riwayat presensi karyawan.

---

## 4. Custom Hooks (`resources/js/hooks/`)

### `useFingerPrintEnrollment.ts`

- **Fungsi**: Hook logika enrollment sidik jari ke local hardware daemon.
- **Alur Kerja**:
    1. Mengelola state 6 slot scan sidik jari per 3 sampel per grup (`primary` & `backup`).
    2. Melakukan HTTP `fetch` ke endpoint local daemon `http://localhost:5000/enroll`.
    3. Memproses gambar base64 / template bitmap dan mengevaluasi sisa kapasitas sampel secara fungsional.
    4. Menangani callback sukses/gagal simpan database.

### `use-mobile.ts`

- **Fungsi**: Hook deteksi breakpoint layar seluler (`< 768px`).
- **Fitur**: Inisialisasi state lazily menggunakan `window.matchMedia` untuk mencegah double render saat mount.

---

## 5. Layout App (`resources/js/layouts/`)

### `AuthenticatedLayout.tsx`

- **Fungsi**: Layout induk untuk seluruh halaman yang memerlukan autentikasi.
- **Fitur**: Menyediakan `SidebarProvider`, `AppSidebar`, `SidebarTrigger`, `GlobalSearch`, dan container konten utama.
- **Props**: `AuthenticatedLayoutProps` (`user?: User`, `header?: ReactNode`, `children: ReactNode`).
