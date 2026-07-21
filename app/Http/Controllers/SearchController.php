<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\Division;
use Illuminate\Http\Request;

class SearchController extends Controller
{
  /**
   * Mencari data karyawan magang dan divisi secara global.
   *
   * Digunakan untuk fitur pencarian instan pada antarmuka pengguna.
   *
   * @param \Illuminate\Http\Request $request Permintaan yang berisi parameter kueri 'q'.
   * @return \Illuminate\Http\JsonResponse Data hasil pencarian maksimal 5 entri per kategori.
   */
  public function index(Request $request)
  {
    $query = $request->input('q');

    if (!$query) {
      return response()->json(['interns' => [], 'divisions' => []]);
    }

    $interns = Intern::where('is_active', '!=', false)
      ->where('name', 'like', "%{$query}%")
      ->limit(5)
      ->get(['id', 'name', 'foto']);

    $divisions = Division::where('nama_divisi', 'like', "%{$query}%")
      ->limit(5)
      ->get(['id', 'nama_divisi as name']);

    return response()->json([
      'interns' => $interns,
      'divisions' => $divisions
    ]);
  }
}
