<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\Division;
use Illuminate\Http\Request;

class SearchController extends Controller
{
  /**
   * Cari karyawan dan divisi.
   *
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function index(Request $request)
  {
    $query = $request->input('q');

    if (!$query) {
      return response()->json(['interns' => [], 'divisions' => []]);
    }

    $interns = Intern::where('name', 'like', "%{$query}%")
      ->orWhere('nim', 'like', "%{$query}%") // Sesuaikan field pencarian
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
