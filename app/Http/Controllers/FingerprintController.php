<?php

namespace App\Http\Controllers;

use App\Models\Fingerprint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FingerprintController extends Controller
{
    public function index()
    {
        return Inertia::render('FingerprintEnrollment');
    }

    public function store(Request $request)
    {
        $request->validate([
            'fingerprint_data' => 'required|string',
        ]);

        // In a real app, you would associate this with a user
        // $user = auth()->user();
        
        Fingerprint::create([
            'user_name' => 'Demo User', // Or take from request
            'fingerprint_data' => $request->fingerprint_data,
        ]);

        return redirect()->back()->with('success', 'Fingerprint saved successfully!');
    }
}
