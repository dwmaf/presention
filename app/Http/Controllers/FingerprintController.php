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
            'intern' => $intern,
        ]);
    }

    /**
     * Sistem fingerprint lama: simpan 1 template ke fingerprint_data
     * (masih kamu pakai untuk halaman FingerprintEnrollment)
     */
    public function store(Request $request, Intern $intern)
    {
        $data = $request->validate([
            'fingerprint_data' => 'required|string',
        ]);

        // NOTE: ini memang "nimpa" karena desain lama cuma 1 kolom.
        $intern->update([
            'fingerprint_data' => $data['fingerprint_data'],
        ]);

        return redirect()
            ->route('interns.index')
            ->with('success', 'Fingerprint for ' . $intern->name . ' saved successfully!');
    }
}