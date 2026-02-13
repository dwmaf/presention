<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TesKomparasiSidikJariController extends Controller
{
    public function index()
    {
        // Ambil hanya intern yang memiliki data fingerprint
        $interns = Intern::whereNotNull('fingerprint_data')
                        ->where('fingerprint_data', '!=', '')
                        ->get(['id', 'name', 'fingerprint_data', 'barcode'])
                        ->map(function ($intern) {
                            return [
                                'id' => (string)$intern->id, // Convert ke string utk ID
                                'fmd' => $intern->fingerprint_data,
                                'name' => $intern->name
                            ];
                        });

        return Inertia::render('FingerprintTest', [
            'fingerprintDatabase' => $interns
        ]);
    }
}