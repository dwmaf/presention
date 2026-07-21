<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SidikJariController extends Controller
{
    /**
     * Menampilkan halaman pendaftaran sidik jari untuk karyawan magang.
     *
     * @param \App\Models\Intern $intern Model karyawan yang akan didaftarkan sidik jarinya.
     * @return \Inertia\Response Halaman UI pendaftaran.
     */
    public function index(Intern $intern)
    {
        return Inertia::render('FingerprintEnrollment', [
            'intern' => $intern
        ]);
    }

    /**
     * Menyimpan data template sidik jari ke dalam grup yang dipilih (Primary/Backup).
     *
     * Mencegah penimpaan data secara tidak sengaja jika grup sidik jari
     * sudah memiliki template terdaftar sebelumnya.
     *
     * @param \Illuminate\Http\Request $request Permintaan berisi identifier grup dan 3 sampel sidik jari.
     * @param \App\Models\Intern $intern Model karyawan yang datanya diperbarui.
     * @return \Illuminate\Http\RedirectResponse Redirect dengan pesan error atau sukses.
     */
    public function storeGroup(Request $request, Intern $intern)
    {
        $data = $request->validate([
            'group' => ['required', 'in:primary,backup'],
            'samples' => ['required', 'array', 'size:3'],
            'samples.*' => ['required', 'string'],
        ]);

        $map = [
            // ? Memisahkan kolom database berdasarkan grup untuk mempermudah pendaftaran multi-jari.
            'primary' => ['fingerprint_data', 'second_fingerprint_data', 'fingerprint_data_3'],
            'backup'  => ['fingerprint_data_4', 'fingerprint_data_5', 'fingerprint_data_6'],
        ];

        $cols = $map[$data['group']];

        // ! Mencegah overwrite data lama tanpa persetujuan eksplisit (reset).
        $already =
            !empty($intern->{$cols[0]}) ||
            !empty($intern->{$cols[1]}) ||
            !empty($intern->{$cols[2]});

        if ($already) {
            return back()->withErrors([
                'fingerprint' => 'Template sudah ada di database. Demi keamanan, sistem tidak menimpa. Silakan Reset DB dulu jika ingin daftar ulang.',
            ]);
        }

        $intern->update([
            $cols[0] => $data['samples'][0],
            $cols[1] => $data['samples'][1],
            $cols[2] => $data['samples'][2],
        ]);

        return back()->with('success', 'Fingerprint group berhasil disimpan (3 template).');
    }

    /**
     * Mengosongkan data sidik jari karyawan pada grup tertentu.
     *
     * Digunakan sebelum melakukan pendaftaran ulang (re-enroll) pada grup yang sama.
     *
     * @param \Illuminate\Http\Request $request Permintaan berisi identifier grup.
     * @param \App\Models\Intern $intern Model karyawan yang datanya akan direset.
     * @return \Illuminate\Http\RedirectResponse Redirect dengan pesan sukses.
     */
    public function resetGroup(Request $request, Intern $intern)
    {
        $data = $request->validate([
            'group' => ['required', 'in:primary,backup'],
        ]);

        $map = [
            'primary' => ['fingerprint_data', 'second_fingerprint_data', 'fingerprint_data_3'],
            'backup'  => ['fingerprint_data_4', 'fingerprint_data_5', 'fingerprint_data_6'],
        ];

        $cols = $map[$data['group']];

        $intern->update([
            $cols[0] => null,
            $cols[1] => null,
            $cols[2] => null,
        ]);

        return back()->with('success', 'Fingerprint group berhasil di-reset (kolom database dikosongkan).');
    }
}
