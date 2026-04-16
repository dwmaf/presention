<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SidikJariController extends Controller
{
    public function index(Intern $intern)
    {
        return Inertia::render('NambahSidikJari', [
            'intern' => $intern
        ]);
    }

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

        // ✅ BLOCK overwrite: jangan nimpa kalau salah satu kolom group sudah ada isi
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