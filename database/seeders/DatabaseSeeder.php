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
        $divSoftwareDev = Division::create([
            'nama_divisi' => 'Software Development',
            'deskripsi'   => 'Mengembangkan dan memelihara sistem teknologi informasi serta infrastruktur digital dengan teknologi terkini.',
        ]);
        $divSocMed = Division::create([
            'nama_divisi' => 'Social Media Specialist',
            'deskripsi'   => 'Merancang strategi konten media sosial untuk meningkatkan brand awareness, engagement, dan pertumbuhan audiens secara digital.',
        ]);
        $divDesign = Division::create([
            'nama_divisi' => 'Design and Video Editing',
            'deskripsi'   => 'Merancang materi visual dan mengolah konten video secara kreatif untuk menyampaikan pesan secara menarik, konsisten, dan efektif di platform digital.',
        ]);
        $divDataManage = Division::create([
            'nama_divisi' => 'Data Management',
            'deskripsi'   => 'Mengelola, menganalisis, dan mengoptimalkan data secara terstruktur untuk memastikan informasi akurat dan mendukung pengambilan keputusan bisnis.',
        ]);

        // 3. Buat Data Anak Magang dengan Jadwal
        $interns = [
            [
                'name' => 'Antonia Preselia Marsa Samat', 
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp001.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Arif Khumeini', 
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp002.jpg',
                'senin' => true, 'selasa' => false, 'rabu' => true, 'kamis' => false, 'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Berlian Auraly Kastyanos', 
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp003.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Dhimas Fauzan Al Asri',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp004.jpg',
                'senin' => false,
                'selasa' => false,
                'rabu' => true,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Fandri Gea',
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp005.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Hafizuddin',
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp006.jpg',
                'senin' => false,
                'selasa' => false,
                'rabu' => true,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Ihsan Azhar Rhamadan',
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp007.jpg',
                'senin' => true,
                'selasa' => false,
                'rabu' => true,
                'kamis' => false,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Kayla Maudy Ananda',
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp008.jpg',
                'senin' => false,
                'selasa' => false,
                'rabu' => false,
                'kamis' => false,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Lesmana Dwi Prayudha',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp009.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Lusia Odiliana Menge',
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp010.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Maria Goreti',
                'division_id' => $divSocMed->id,
                'foto' => 'foto/emp011.jpg',
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Mecava Sheba Mitsymara',
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp012.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Melisa Vikayana',
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp013.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Muhammad Fayadh Hanif Musyafa',
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp014.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Muhammad Za\'im Shidqi',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp015.jpg',
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Nadila Maulidya',
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp016.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Naisha Fitria',
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp017.jpg',
                'senin' => true,
                'selasa' => false,
                'rabu' => false,
                'kamis' => false,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Refa Suryana',
                'division_id' => $divSocMed->id,
                'foto' => 'foto/emp018.jpg',
                'senin' => true,
                'selasa' => false,
                'rabu' => false,
                'kamis' => false,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Resti Fitriani',
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp019.jpg',
                'senin' => false,
                'selasa' => false,
                'rabu' => false,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Muhammad Farhan Hanif',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp020.jpg',
                'senin' => true,
                'selasa' => false,
                'rabu' => true,
                'kamis' => false,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Indra Juan Saputra',
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp021.jpg',
                'senin' => true,
                'selasa' => false,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Indira Mariska Dwi Aulia',
                'division_id' => $divSocMed->id,
                'foto' => 'foto/emp022.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Alyssa Putri Setyawan',
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp023.jpg',
                'senin' => true,
                'selasa' => false,
                'rabu' => true,
                'kamis' => false,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Tasya Lindri Destami',
                'division_id' => $divSocMed->id,
                'foto' => 'foto/emp024.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Yosi Ferdian Nugroho',
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp025.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Putra Ibrahimovic',
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp026.jpg',
                'senin' => false,
                'selasa' => false,
                'rabu' => true,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Jimi Alviandi Mahendra',
                'division_id' => $divSocMed->id,
                'foto' => 'foto/emp027.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Syariffullah',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp028.jpg',
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Tarisa Nur Safitri',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp029.jpg',
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Abimanyu Ridho Ramadhani',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp030.jpg',
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Muhammad Nazwan Fadhilah',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp031.jpg',
                'senin' => false,
                'selasa' => false,
                'rabu' => true,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Dawam Agung Fathoni', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp032.jpg',
                'senin' => true, 'selasa' => true, 'rabu' => false, 'kamis' => true, 'jumat' => false,
                'barcode' => '88888888'
            ],
            [
                'name' => 'Hansent Theja', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp033.jpg',
                'senin' => false, 'selasa' => true, 'rabu' => false, 'kamis' => true, 'jumat' => false,
            ],
            [
                'name' => 'Rayhan NuerJamman', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp034.jpg',
                'senin' => false, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => false,
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
                    $checkIn = sprintf('%02d:%02d', $hour, $minute);
                    // Jam pulang antara 16:30 - 16:59
                    $checkOut = sprintf('%02d:%02d', 16, rand(30, 59));
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
