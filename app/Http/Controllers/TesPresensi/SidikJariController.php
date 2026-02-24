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
        // dd($request);
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
        // dd($request);
        $request->validate([
            'second_fingerprint_data' => 'required|string',
        ]);
        
        $intern->update([
            'second_fingerprint_data' => $request->second_fingerprint_data,
        ]);

        return redirect()->back()->with('success', 'Fingerprint for ' . $intern->name . ' saved successfully!');
    }
}
