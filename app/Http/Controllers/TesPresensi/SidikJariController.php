<?php

namespace App\Http\Controllers\TesPresensi;

use App\Http\Controllers\Controller;
use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SidikJariController extends Controller
{
    public function index(Intern $intern)
    {
        return Inertia::render('Tes Presensi/NambahSidikJari', [
            'intern' => $intern
        ]);
    }

    /**
     * LEGACY (opsional): simpan 1 template ke fingerprint_data
     * Kamu boleh hapus kalau sudah pindah total ke storeGroup.
     */
    public function store(Request $request, Intern $intern)
    {
        $request->validate([
            'fingerprint_data' => 'required|string',
        ]);

        // Legacy: ini memang nimpa karena desain lama 1 kolom
        $intern->update([
            'fingerprint_data' => $request->fingerprint_data,
        ]);

        return redirect()->back()->with('success', 'Fingerprint for ' . $intern->name . ' saved successfully!');
    }

    /**
     * LEGACY (opsional): simpan 1 template ke second_fingerprint_data
     * Kamu boleh hapus kalau sudah pindah total ke storeGroup.
     */
    public function storeSecond(Request $request, Intern $intern)
    {
        $request->validate([
            'second_fingerprint_data' => 'required|string',
        ]);

        // Legacy: ini memang nimpa
        $intern->update([
            'second_fingerprint_data' => $request->second_fingerprint_data,
        ]);

        return redirect()->back()->with('success', 'Fingerprint for ' . $intern->name . ' saved successfully!');
    }

    /**
     * ✅ NEW: Simpan 3 template sekaligus untuk group (primary/backup).
     * RULE: TIDAK BOLEH NIMPA.
     * Kalau sudah ada isinya, user harus reset dulu.
     *
     * Payload dari React:
     * - group: "primary" | "backup"
     * - samples: [fmd1, fmd2, fmd3]
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

    /**
     * ✅ NEW: Reset DB untuk group (primary/backup)
     * Ini yang kamu minta: reset di database (hapus) bukan nimpa.
     *
     * Payload:
     * - group: "primary" | "backup"
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

    /**
     * LEGACY: Generic store method untuk slot 1-6 (masih dipakai React lama kamu).
     * RULE: kalau kamu mau "jangan nimpa", aktifkan block overwrite di sini juga.
     */
    public function storeSlot(Request $request, Intern $intern)
    {
        $request->validate([
            'slot' => 'required|integer|between:1,6',
            'fingerprint_data' => 'required|string',
        ]);

        $columnMap = [
            1 => 'fingerprint_data',
            2 => 'second_fingerprint_data',
            3 => 'fingerprint_data_3',
            4 => 'fingerprint_data_4',
            5 => 'fingerprint_data_5',
            6 => 'fingerprint_data_6',
        ];

        $column = $columnMap[$request->slot];

        // ✅ OPTIONAL: block overwrite untuk mode slot
        // kalau kamu mau "jangan nimpa" juga di mode slot, uncomment ini:
        /*
        if (!empty($intern->{$column})) {
            return back()->withErrors([
                'fingerprint' => "Slot #{$request->slot} sudah ada. Reset dulu jika ingin daftar ulang (fitur resetGroup untuk primary/backup).",
            ]);
        }
        */

        $intern->update([
            $column => $request->fingerprint_data,
        ]);

        return redirect()->back()->with('success', "Fingerprint slot #{$request->slot} for {$intern->name} saved successfully!");
    }
}