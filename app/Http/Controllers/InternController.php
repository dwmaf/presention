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
        $interns = Intern::with('division')->get();
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
            'barcode' => 'required|string|unique:interns,barcode',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('intern-photos', 'public');
            $validatedData['foto'] = $path;
        }

        Intern::create($validatedData);

        return redirect()->back()->with('success', 'Data magang saved successfully!');
    }

    public function update(Request $request, Intern $intern)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
            'barcode' => 'required|string|unique:interns,barcode,' . $intern->id,
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            if ($intern->foto && Storage::disk('public')->exists($intern->foto)) {
                Storage::disk('public')->delete($intern->foto);
            }
            $path = $request->file('foto')->store('intern-photos', 'public');
            $validatedData['foto'] = $path;
        }

        $intern->update($validatedData);

        return redirect()->back()->with('success', 'Data magang updated successfully!');
    }

    public function destroy(Intern $intern)
    {
        if ($intern->foto && Storage::disk('public')->exists($intern->foto)) {
            Storage::disk('public')->delete($intern->foto);
        }
        
        $intern->delete();

        return redirect()->back()->with('success', 'Data magang deleted successfully!');
    }
}
