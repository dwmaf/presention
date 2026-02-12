<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FingerprintController extends Controller
{
    public function index(Intern $intern)
    {
        return Inertia::render('FingerprintEnrollment', [
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

        return redirect()->route('interns.index')->with('success', 'Fingerprint for ' . $intern->name . ' saved successfully!');
    }
}
