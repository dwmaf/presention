<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InternController extends Controller
{
    public function index()
    {
        $interns = Intern::with(['division', 'attendances'])->get();
        $divisions = Division::all();

        return Inertia::render('Intern', [
            'interns' => $interns,
            'divisions' => $divisions
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
            'barcode' => 'nullable|string|unique:interns,barcode',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',

            // Jadwal + poin
            'senin' => 'nullable|boolean',
            'selasa' => 'nullable|boolean',
            'rabu' => 'nullable|boolean',
            'kamis' => 'nullable|boolean',
            'jumat' => 'nullable|boolean',
            'poin' => 'nullable|integer|min:0',
        ]);

        // Pastikan checkbox yang tidak dikirim jadi false
        $validatedData['senin']  = $request->boolean('senin');
        $validatedData['selasa'] = $request->boolean('selasa');
        $validatedData['rabu']   = $request->boolean('rabu');
        $validatedData['kamis']  = $request->boolean('kamis');
        $validatedData['jumat']  = $request->boolean('jumat');

        $validatedData['poin'] = (int) ($validatedData['poin'] ?? 0);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('foto', 'public');
            $validatedData['foto'] = $path;
        }

        Intern::create($validatedData);

        return redirect()->back()->with('success', 'Data magang saved successfully!');
    }

    public function update(Request $request, Intern $intern)
    {
        // dd($request);
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
            'barcode' => 'nullable|string|unique:interns,barcode,' . $intern->id,
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',

            // Jadwal + poin
            'senin' => 'nullable|boolean',
            'selasa' => 'nullable|boolean',
            'rabu' => 'nullable|boolean',
            'kamis' => 'nullable|boolean',
            'jumat' => 'nullable|boolean',
            'poin' => 'nullable|integer|min:0',
        ]);

        $validatedData['senin']  = $request->boolean('senin');
        $validatedData['selasa'] = $request->boolean('selasa');
        $validatedData['rabu']   = $request->boolean('rabu');
        $validatedData['kamis']  = $request->boolean('kamis');
        $validatedData['jumat']  = $request->boolean('jumat');

        // kalau tidak dikirim, pakai nilai lama (biar aman)
        $validatedData['poin'] = (int) ($validatedData['poin'] ?? ($intern->poin ?? 0));

        if ($request->hasFile('foto')) {
            if ($intern->foto && Storage::disk('public')->exists($intern->foto)) {
                Storage::disk('public')->delete($intern->foto);
            }

            $path = $request->file('foto')->store('foto', 'public');
            $validatedData['foto'] = $path;
        } else {
            // Jika tidak ada file baru yang diupload, jangan hapus data foto yang lama
            unset($validatedData['foto']);
        }

        $intern->update($validatedData);

        return redirect()->back()->with('success', 'Data magang updated successfully!');
    }

    public function updatePhoto(Request $request, Intern $intern)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($intern->foto && Storage::disk('public')->exists($intern->foto)) {
                Storage::disk('public')->delete($intern->foto);
            }

            // Simpan foto baru
            $path = $request->file('foto')->store('foto', 'public');
            $intern->update(['foto' => $path]);

            return redirect()->back()->with('success', 'Foto berhasil diperbarui.');
        }

        return redirect()->back()->with('error', 'Gagal mengunggah foto.');
    }

    public function exportAttendanceCsv(Intern $intern)
    {
        $filename = 'kehadiran_' . str_replace(' ', '_', strtolower($intern->name)) . '_' . now()->format('Ymd') . '.csv';

        // Ambil semua data yang dibutuhkan terlebih dahulu (bukan di dalam callback)
        $attendances = $intern->attendances()->orderBy('date', 'asc')->get();

        // Pre-compute summary agar tidak ada DB query di dalam stream
        $summary = [
            'total_kehadiran' => $intern->total_kehadiran,
            'total_izin'      => $intern->total_izin,
            'total_sakit'     => $intern->total_sakit,
            'total_alpha'     => $intern->total_alpha,
            'total_jam'       => $intern->total_jam,
            'avg_jam_masuk'   => $intern->avg_jam_masuk,
            'avg_jam_pulang'  => $intern->avg_jam_pulang,
        ];

        // Bangun CSV di memory
        $handle = fopen('php://memory', 'w+');

        fputcsv($handle, ['Tanggal', 'Hari', 'Status', 'Jam Masuk', 'Jam Pulang', 'Terlambat (menit)']);

        foreach ($attendances as $attendance) {
            fputcsv($handle, [
                $attendance->getRawOriginal('date') ?? '-',
                $attendance->hari,
                $attendance->status,
                $attendance->check_in ?? '-',
                $attendance->check_out ?? '-',
                $attendance->terlambat ?? 0,
            ]);
        }

        fputcsv($handle, []);
        fputcsv($handle, ['--- RINGKASAN ---']);
        fputcsv($handle, ['Total Hadir',          $summary['total_kehadiran'] . ' hari']);
        fputcsv($handle, ['Total Izin',           $summary['total_izin'] . ' hari']);
        fputcsv($handle, ['Total Sakit',          $summary['total_sakit'] . ' hari']);
        fputcsv($handle, ['Total Alpha',          $summary['total_alpha'] . ' hari']);
        fputcsv($handle, ['Total Jam',            $summary['total_jam'] . ' jam']);
        fputcsv($handle, ['Rata-rata Jam Masuk',  $summary['avg_jam_masuk']]);
        fputcsv($handle, ['Rata-rata Jam Pulang', $summary['avg_jam_pulang']]);

        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return response($csvContent, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function destroy(Intern $intern)
    {
        // Cegah penghapusan kalau sudah punya data kehadiran
        if ($intern->attendances()->exists()) {
            return redirect()->back()->with('error', 'Intern tidak bisa dihapus karena sudah memiliki data kehadiran.');
        }

        if ($intern->foto && Storage::disk('public')->exists($intern->foto)) {
            Storage::disk('public')->delete($intern->foto);
        }

        $intern->delete();

        return redirect()->back()->with('success', 'Data magang deleted successfully!');
    }
}
