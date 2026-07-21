<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AdminFingerprintController extends Controller
{
    // ? Pemetaan grup sidik jari ke kolom database di satu tempat
    private const FINGERPRINT_MAP = [
        'primary' => ['fingerprint_1', 'fingerprint_2', 'fingerprint_3'],
        'backup'  => ['fingerprint_4', 'fingerprint_5', 'fingerprint_6'],
    ];

    /**
     * Menampilkan halaman pendaftaran sidik jari admin.
     *
     * @return \Inertia\Response Halaman UI pendaftaran beserta status data sidik jari saat ini.
     */
    public function index()
    {
        $user = Auth::user();

        // * Memeriksa status keterdaftaran sidik jari admin
        $status = [
            'fingerprint_1' => !empty($user->fingerprint_1),
            'fingerprint_2' => !empty($user->fingerprint_2),
            'fingerprint_3' => !empty($user->fingerprint_3),
            'fingerprint_4' => !empty($user->fingerprint_4),
            'fingerprint_5' => !empty($user->fingerprint_5),
            'fingerprint_6' => !empty($user->fingerprint_6),
        ];

        return Inertia::render('Profile/AdminFingerprintEnrollment', [
            'fingerStatus' => $status,
            'userName' => $user->name
        ]);
    }

    /**
     * Menyimpan data template sidik jari baru ke dalam grup yang dipilih (Primary/Backup).
     *
     * Mencegah penimpaan data jika grup sidik jari sudah memiliki template sebelumnya.
     *
     * @param \Illuminate\Http\Request $request Permintaan berisi data grup dan 3 sampel sidik jari.
     * @return \Illuminate\Http\RedirectResponse Redirect kembali dengan pesan sukses atau error.
     */
    public function storeGroup(Request $request)
    {
        $data = $request->validate([
            'group' => ['required', 'in:primary,backup'],
            'samples' => ['required', 'array', 'size:3'],
            'samples.*' => ['required', 'string'],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $cols = self::FINGERPRINT_MAP[$data['group']];

        // * Cek duplikasi untuk mencegah overwrite tanpa reset
        $already =
            !empty($user->{$cols[0]}) ||
            !empty($user->{$cols[1]}) ||
            !empty($user->{$cols[2]});

        if ($already) {
            return back()->withErrors([
                'fingerprint' => 'Template sudah ada. Harap Reset Scan terlebih dahulu jika ingin mendaftar ulang.',
            ]);
        }

        $user->update([
            $cols[0] => $data['samples'][0],
            $cols[1] => $data['samples'][1],
            $cols[2] => $data['samples'][2],
        ]);

        return back()->with('success', 'Sidik jari Admin berhasil disimpan.');
    }

    /**
     * Mengosongkan data sidik jari pada grup yang dipilih.
     *
     * Digunakan sebelum melakukan pendaftaran ulang (re-enroll) pada grup tersebut.
     *
     * @param \Illuminate\Http\Request $request Permintaan berisi identifier grup (primary/backup).
     * @return \Illuminate\Http\RedirectResponse Redirect kembali dengan pesan sukses.
     */
    public function resetGroup(Request $request)
    {
        $data = $request->validate([
            'group' => ['required', 'in:primary,backup'],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $cols = self::FINGERPRINT_MAP[$data['group']];

        $user->update([
            $cols[0] => null,
            $cols[1] => null,
            $cols[2] => null,
        ]);

        return back()->with('success', 'Database sidik jari grup ini berhasil dikosongkan.');
    }
}
