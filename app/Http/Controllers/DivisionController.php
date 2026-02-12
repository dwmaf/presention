<?php

namespace App\Http\Controllers;

use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    public function index()
    {
        $divisions = Division::all();
        return Inertia::render('Division', [
            'divisions' => $divisions
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_divisi' => 'required|string|max:255',
        ]);
        
        Division::create($validatedData);

        return redirect()->back()->with('success', 'Data Divisi saved successfully!');
    }

    public function update(Request $request, Division $division)
    {
        $validatedData = $request->validate([
            'nama_divisi' => 'required|string|max:255',
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
