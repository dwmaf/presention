<?php

namespace App\Http\Controllers\TesPresensi;

use App\Http\Controllers\Controller;
use App\Models\Intern;
use Illuminate\Http\Request;

class FingerprintGroupController extends Controller
{
    /**
     * Simpan 3 template sekaligus untuk group:
     * - primary -> fingerprint_data, second_fingerprint_data, fingerprint_data_3
     * - backup  -> fingerprint_data_4, fingerprint_data_5, fingerprint_data_6
     *
     * ✅ RULE: tidak boleh nimpa. Kalau sudah ada isi, user harus reset dulu.
     */
    public function storeGroup(Request $request, Intern $intern)
    {
        $data = $request->validate([
            'group' => ['required', 'in:primary,backup'],
            'samples' => ['required', 'array', 'size:3'],
            'samples.*' => ['required', 'string'],
        ]);

        $map = [
            'primary' => ['fingerprint_data', 'second_fingerprint_data', 'fingerprint_data_3'],
            'backup'  => ['fingerprint_data_4', 'fingerprint_data_5', 'fingerprint_data_6'],
        ];

        $cols = $map[$data['group']];

        // ✅ BLOCK overwrite: jangan nimpa kalau ada salah satu kolom sudah ada isinya
        $already = !empty($intern->{$cols[0]}) || !empty($intern->{$cols[1]}) || !empty($intern->{$cols[2]});
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
     * Reset / hapus fingerprint di DB untuk group tertentu.
     * ✅ Ini yang kamu minta: reset database tanpa nimpa.
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