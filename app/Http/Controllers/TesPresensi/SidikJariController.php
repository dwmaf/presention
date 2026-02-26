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

    public function store(Request $request, Intern $intern)
    {
        $request->validate([
            'fingerprint_data' => 'required|string',
        ]);
        
        $intern->update([
            'fingerprint_data' => $request->fingerprint_data,
        ]);

        return redirect()->back()->with('success', 'Fingerprint for ' . $intern->name . ' saved successfully!');
    }

    public function storeSecond(Request $request, Intern $intern)
    {
        $request->validate([
            'second_fingerprint_data' => 'required|string',
        ]);
        
        $intern->update([
            'second_fingerprint_data' => $request->second_fingerprint_data,
        ]);

        return redirect()->back()->with('success', 'Fingerprint for ' . $intern->name . ' saved successfully!');
    }

    /**
     * Generic store method for any fingerprint slot (1-6)
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
        
        $intern->update([
            $column => $request->fingerprint_data,
        ]);

        return redirect()->back()->with('success', "Fingerprint slot #{$request->slot} for {$intern->name} saved successfully!");
    }
}
