<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Intern;
use App\Models\Division;
use App\Models\Attendance;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@upa.com',
            'password' => bcrypt('password'),
        ]);

        // 2. Buat Data Division
        $divSoftwareDev = Division::create(['nama_divisi' => 'Software Development']);
        $divSocMed = Division::create(['nama_divisi' => 'Social Media Specialist']);
        $divDesign = Division::create(['nama_divisi' => 'Design and Video Editing']);
        $divDataManage = Division::create(['nama_divisi' => 'Data Management']);

        // 3. Buat Data Anak Magang dengan Jadwal
        $interns = [
            [
                'name' => 'Antonia Preselia Marsa Samat', 
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp001.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
            ],
            [
                'name' => 'Arif Khumeini', 
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp002.jpg',
                'senin' => true, 'selasa' => false, 'rabu' => true, 'kamis' => false, 'jumat' => true,
            ],
            [
                'name' => 'Berlian Auraly Kastyanos', 
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp003.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
            ],
            [
                'name' => 'Dawam Agung Fathoni', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp032.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
                'barcode' => '88888888'
            ],
            [
                'name' => 'Syariffullah', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp028.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
            ],
            [
                'name' => 'Abimanyu Ridho Ramadhani', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp030.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
            ],
            [
                'name' => 'Rayhan NuerJamman', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp034.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
            ],
        ];

        foreach ($interns as $data) {
            $intern = Intern::create($data);

            // 4. Buat Data Kehadiran (2 minggu terakhir)
            for ($i = 0; $i < 14; $i++) {
                $date = now()->subDays($i);
                
                // Lewati akhir pekan
                if ($date->isWeekend()) continue;

                // Tentukan status secara random (kebanyakan hadir)
                $rand = rand(1, 20);
                $status = 'hadir';
                if ($rand == 18) $status = 'izin';
                if ($rand == 19) $status = 'sakit';
                if ($rand == 20) $status = 'alpha';

                $checkIn = null;
                $checkOut = null;

                if ($status == 'hadir') {
                    // Jam masuk kebanyakan 07:30 - 08:45 (biar ada yang telat)
                    $hour = (rand(1, 5) == 1) ? 8 : 7; // 20% kemungkinan jam 8
                    $minute = ($hour == 8) ? rand(0, 45) : rand(30, 59);
                    $checkIn = sprintf('%02d:%02d:00', $hour, $minute);
                    // Jam pulang antara 16:30 - 16:59
                    $checkOut = sprintf('%02d:%02d:00', 16, rand(30, 59));
                }

                Attendance::create([
                    'intern_id' => $intern->id,
                    'date' => $date->format('Y-m-d'),
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'status' => $status,
                ]);
            }
        }
    }
}
