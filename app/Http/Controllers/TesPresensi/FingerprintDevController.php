<?php

namespace App\Http\Controllers\TesPresensi;

use App\Http\Controllers\Controller;
use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FingerprintDevController extends Controller
{
    public function index()
    {
        $interns = Intern::select('id', 'name', 'fingerprint_data', 'second_fingerprint_data')->get();
        
        return Inertia::render('Tes Presensi/FingerprintList', [
            'interns' => $interns
        ]);
    }

    public function exportCsv()
    {
        $interns = Intern::select('name', 'fingerprint_data', 'second_fingerprint_data')->get();

        $response = new StreamedResponse(function () use ($interns) {
            $handle = fopen('php://output', 'w');
            
            // Header
            fputcsv($handle, ['Name', 'Primary Fingerprint (FMD)', 'Secondary Fingerprint (FMD)']);

            foreach ($interns as $intern) {
                fputcsv($handle, [
                    $intern->name,
                    $intern->fingerprint_data ?? 'NULL',
                    $intern->second_fingerprint_data ?? 'NULL',
                ]);
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="fingerprint_data_export_' . now()->format('Y-m-d_H-i-s') . '.csv"');

        return $response;
    }
}
