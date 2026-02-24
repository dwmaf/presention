<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    public function index()
    {
        $divisions = Division::withCount('interns')->with('interns')->get();
        $allInterns = Intern::select('id', 'name', 'foto', 'division_id')->orderBy('name')->get();
        return Inertia::render('Division', [
            'divisions'  => $divisions,
            'allInterns' => $allInterns,
        ]);
    }

    public function assignIntern(Division $division, Request $request)
    {
        $request->validate(['intern_id' => 'required|exists:interns,id']);
        Intern::where('id', $request->intern_id)->update(['division_id' => $division->id]);
        return redirect()->back()->with('success', 'Anggota berhasil ditambahkan.');
    }

    public function removeIntern(Division $division, Intern $intern)
    {
        if ($intern->division_id === $division->id) {
            $intern->update(['division_id' => null]);
        }
        return redirect()->back()->with('success', 'Anggota berhasil dihapus.');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_divisi' => 'required|string|max:255',
            'deskripsi'   => 'nullable|string',
        ]);
        
        Division::create($validatedData);

        return redirect()->back()->with('success', 'Data Divisi saved successfully!');
    }

    public function update(Request $request, Division $division)
    {
        $validatedData = $request->validate([
            'nama_divisi' => 'required|string|max:255',
            'deskripsi'   => 'nullable|string',
        ]);

        $division->update($validatedData);

        return redirect()->back()->with('success', 'Data Divisi updated successfully!');
    }

    public function destroy(Division $division)
    {
        if ($division->interns()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete division because there are interns associated with it.');
        }

        $division->delete();

        return redirect()->back()->with('success', 'Data Divisi deleted successfully!');
    }
}
