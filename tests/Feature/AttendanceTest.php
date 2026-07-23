<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Intern;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
  use RefreshDatabase;

  /**
   * Uji presensi intern di luar jadwal kerja.
   */
  public function test_intern_cannot_check_in_outside_schedule()
  {
    $division = Division::create(['nama_divisi' => 'IT']);

    // * Buat data intern tanpa hari kerja (semua false)
    $intern = Intern::create([
      'name'        => 'Intern Tanpa Jadwal',
      'division_id' => $division->id,
      'is_active'   => true,
      'senin'       => false,
      'selasa'      => false,
      'rabu'        => false,
      'kamis'       => false,
      'jumat'       => false,
      'poin'        => 5,
    ]);

    $response = $this->postJson('/attendance', ['intern_id' => $intern->id]);

    $response->assertStatus(400)
      ->assertJson([
        'success' => false,
      ]);
  }

  /**
   * Uji cooldown 30 menit setelah check-in.
   */
  public function test_intern_cooldown_before_checkout()
  {
    $hariMap = ['monday' => 'senin', 'tuesday' => 'selasa', 'wednesday' => 'rabu', 'thursday' => 'kamis', 'friday' => 'jumat'];
    $kolom = $hariMap[strtolower(now()->format('l'))] ?? 'kamis';

    $division = Division::create(['nama_divisi' => 'IT']);

    $intern = Intern::create([
      'name'        => 'Intern Cooldown',
      'division_id' => $division->id,
      'is_active'   => true,
      $kolom        => true,
      'poin'        => 5,
    ]);

    // * 1. Check-In pertama
    $this->postJson('/attendance', ['intern_id' => $intern->id]);

    // * 2. Check-In kedua langsung (masuk cooldown)
    $response = $this->postJson('/attendance', ['intern_id' => $intern->id]);

    $response->assertStatus(400)
      ->assertJson([
        'success' => false,
      ]);
  }
}
