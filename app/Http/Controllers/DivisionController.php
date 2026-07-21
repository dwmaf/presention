<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Intern;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    /**
     * Menampilkan halaman manajemen divisi.
     *
     * Menyediakan data semua divisi beserta anggotanya, serta daftar
     * seluruh karyawan magang untuk fitur penugasan ke dalam divisi.
     *
     * @return \Inertia\Response Halaman manajemen divisi.
     */
    public function index()
    {
        // * Melakukan eager loading untuk mendapatkan total anggota dan detail anggota per divisi.
        $divisions = Division::withCount('interns')->with('interns')->get();

        // * Mengambil semua data intern aktif dan tidak aktif untuk opsi dropdown penugasan.
        $allInterns = Intern::select('id', 'name', 'foto', 'division_id', 'is_active')
            ->orderBy('name')
            ->get();

        return Inertia::render('Division', [
            'divisions'  => $divisions,
            'allInterns' => $allInterns,
        ]);
    }

    /**
     * Memasukkan karyawan magang ke dalam divisi tertentu.
     *
     * @param \App\Models\Division $division Model divisi tujuan.
     * @param \Illuminate\Http\Request $request Permintaan berisi ID karyawan.
     * @return \Illuminate\Http\RedirectResponse Redirect dengan pesan sukses.
     */
    public function assignIntern(Division $division, Request $request)
    {
        $request->validate(['intern_id' => 'required|exists:interns,id']);
        Intern::where('id', $request->intern_id)->update(['division_id' => $division->id]);
        return redirect()->back()->with('success', 'Anggota berhasil ditambahkan.');
    }

    /**
     * Mengeluarkan karyawan magang dari sebuah divisi.
     *
     * @param \App\Models\Division $division Model divisi saat ini.
     * @param \App\Models\Intern $intern Model karyawan yang akan dikeluarkan.
     * @return \Illuminate\Http\RedirectResponse Redirect dengan pesan sukses.
     */
    public function removeIntern(Division $division, Intern $intern)
    {
        if ($intern->division_id === $division->id) {
            // ? Hanya menghapus relasi divisi tanpa menghapus data karyawan secara keseluruhan.
            $intern->update(['division_id' => null]);
        }
        return redirect()->back()->with('success', 'Anggota berhasil dihapus.');
    }

    /**
     * Membuat data divisi baru.
     *
     * @param \Illuminate\Http\Request $request Permintaan form pembuatan divisi.
     * @param \App\Models\Division $division Instansiasi model divisi (injeksi rute).
     * @return \Illuminate\Http\RedirectResponse Redirect dengan pesan sukses.
     */
    public function store(Request $request, Division $division)
    {
        $validatedData = $request->validate([
            'nama_divisi' => 'required|string|max:255',
            'deskripsi'   => 'nullable|string',
        ]);

        Division::create($validatedData);

        return redirect()->back()->with('success', "Data Divisi {$division->nama_divisi} berhasil ditambahkan!");
    }

    /**
     * Memperbarui data divisi yang ada.
     *
     * @param \Illuminate\Http\Request $request Permintaan form pembaruan divisi.
     * @param \App\Models\Division $division Model divisi yang akan diperbarui.
     * @return \Illuminate\Http\RedirectResponse Redirect dengan pesan sukses.
     */
    public function update(Request $request, Division $division)
    {
        $validatedData = $request->validate([
            'nama_divisi' => 'required|string|max:255',
            'deskripsi'   => 'nullable|string',
        ]);

        $division->update($validatedData);

        return redirect()->back()->with('success', "Data Divisi {$division->nama_divisi} berhasil diperbarui!");
    }

    /**
     * Menghapus divisi dari sistem.
     *
     * @param \App\Models\Division $division Model divisi yang akan dihapus.
     * @return \Illuminate\Http\RedirectResponse Redirect dengan pesan error atau sukses.
     */
    public function destroy(Division $division)
    {
        if ($division->interns()->exists()) {
            // ! Mencegah penghapusan divisi yang masih aktif digunakan agar tidak merusak data relasi karyawan.
            return redirect()->back()->with('error', 'Divisi tidak dapat dihapus karena masih ada karyawan yang terdaftar di dalamnya.');
        }

        $division->delete();

        return redirect()->back()->with('success', "Divisi {$division->nama_divisi} berhasil dihapus!");
    }
}
