<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Intern;
use App\Models\Division;

class Batch2Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ambil ID Divisi yang sudah ada di database
        $divSoftwareDev = Division::where('nama_divisi', 'Software Development')->first();
        $divSocMed = Division::where('nama_divisi', 'Social Media Specialist')->first();
        $divDesign = Division::where('nama_divisi', 'Design and Video Editing')->first();
        $divDataManage = Division::where('nama_divisi', 'Data Management')->first();

        // 2. Data karyawan Batch 2 yang BENAR-BENAR BARU
        // Karyawan lama yang lanjut ke Batch 2 tidak di-insert lagi karena menggunakan data lama
        $newInterns = [
            [
                'name' => 'Agung Sulaiman Al Hajji',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Agung Sulaiman Al Hajji.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Arni Nazira',
                'division_id' => $divDesign->id,
                'foto' => 'batch2/Arni Nazira.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => false,
                'rabu' => false,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Aslam Fadholi Safkha',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'batch2/Aslam Fadholi Safkha.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Ava Novalina Zahrani',
                'division_id' => $divDesign->id,
                'foto' => 'batch2/Ava Novalina Zahrani.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Balin Niswah',
                'division_id' => $divDesign->id,
                'foto' => 'batch2/Balin Niswah.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => false,
                'rabu' => true,
                'kamis' => false,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Cindy Fatika Sari',
                'division_id' => $divDesign->id,
                'foto' => 'batch2/Cindy Fatika Sari.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => false,
                'kamis' => false,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Dewi Hasimah',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Dewi Hasimah.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Dodi Permana',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Dodi Permana.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Erlys Indriawati Br Tarigan',
                'division_id' => $divSocMed->id,
                'foto' => 'batch2/Erlys Indriawati Br Tarigan.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => false,
                'rabu' => true,
                'kamis' => false,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Fahrizsa Anggie Arifia',
                'division_id' => $divSocMed->id,
                'foto' => 'batch2/Fahrizsa Anggie Arifia.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => false,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Gian Aryanta Putra Lingga',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'batch2/Gian Aryanta Putra.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => false,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Ikbal Sawaludin',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'batch2/Ikbal Sawaludin.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => false,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Jackland Avanza Siringoringo',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Jackland Avanza Siringoringo.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Muhammad Darin Noah',
                'division_id' => $divDesign->id,
                'foto' => 'batch2/Muhammad Darin Noah.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => false,
                'rabu' => true,
                'kamis' => false,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Muhammad Zulkifli',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'batch2/Muhammad Zulkifli.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Mujahidah Mutiara Rabbani',
                'division_id' => $divSocMed->id,
                'foto' => 'batch2/Mujahidah Mutiara R.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Naaila Maysaqilah',
                'division_id' => $divDesign->id,
                'foto' => 'batch2/Naaila Maysaqilah.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => false,
                'rabu' => false,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Nabila Indaswari',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'batch2/Nabila Indaswari.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => false,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Nadya Aulia Putri Azzahra',
                'division_id' => $divDesign->id,
                'foto' => 'batch2/Nadya Aulia Putri Azzahra.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],

            [
                'name' => 'Rafli Pratama',
                'division_id' => $divSoftwareDev->id,
                'foto' => 'batch2/Rafli Pratama.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => false,
                'rabu' => true,
                'kamis' => false,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Rara Amiyani',
                'division_id' => $divSocMed->id,
                'foto' => 'batch2/Rara Amiyani.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => true,
                'rabu' => false,
                'kamis' => false,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Reisa Nayla',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Reisya Nayla.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Sandhika Julian Nugraha',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Sandhika Julian Nugraha.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Siti Aisyah Amaliah',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Siti Aisyah Amalia.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Siti Muamalah',
                'division_id' => $divSocMed->id,
                'foto' => 'batch2/Siti Muamalah.png',
                'is_active' => true,
                'senin' => false,
                'selasa' => false,
                'rabu' => true,
                'kamis' => true,
                'jumat' => false,
                'poin' => 5,
            ],
            [
                'name' => 'Tiara Aulia',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Tiara Aulia.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Titania Putri',
                'division_id' => $divDataManage->id,
                'foto' => 'batch2/Titania Putri.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Wanda Maulidy',
                'division_id' => $divSocMed->id,
                'foto' => 'batch2/Wanda Maulidya.png',
                'is_active' => true,
                'senin' => true,
                'selasa' => true,
                'rabu' => false,
                'kamis' => false,
                'jumat' => true,
                'poin' => 5,
            ],
        ];

        // 3. Update foto, jadwal, dan divisi untuk karyawan lama yang lanjut ke Batch 2
        $oldInterns = [
            [
                'name' => 'Abimanyu Ridho Ramadhani',
                'division_id' => $divSoftwareDev->id,
                'senin' => true, 'selasa' => false, 'rabu' => true, 'kamis' => false, 'jumat' => false,
            ],
            [
                'name' => 'Berlian Auraly Kastyanos',
                'division_id' => $divSocMed->id,
                'senin' => false, 'selasa' => false, 'rabu' => false, 'kamis' => false, 'jumat' => false,
            ],
            [
                'name' => 'Fandri Gea',
                'division_id' => $divDataManage->id,
                'senin' => true, 'selasa' => true, 'rabu' => true, 'kamis' => true, 'jumat' => true,
            ],
            [
                'name' => 'Lusia Odiliana Menge',
                'division_id' => $divSocMed->id,
                'senin' => false, 'selasa' => false, 'rabu' => false, 'kamis' => false, 'jumat' => false,
            ],
            [
                'name' => 'Melisa Vikayana',
                'division_id' => $divSocMed->id,
                'senin' => false, 'selasa' => false, 'rabu' => true, 'kamis' => false, 'jumat' => true,
            ],
            [
                'name' => 'Syariffullah',
                'division_id' => $divSoftwareDev->id,
                'senin' => false, 'selasa' => false, 'rabu' => true, 'kamis' => false, 'jumat' => true,
            ],
            [
                'name' => 'Rayhan NuerJamman',
                'division_id' => $divSoftwareDev->id,
                'senin' => true, 'selasa' => false, 'rabu' => true, 'kamis' => false, 'jumat' => false,
            ]
        ];

        foreach ($oldInterns as $data) {
            $name = $data['name'];
            unset($data['name']);
            
            // Masukkan data tambahan yang pasti diupdate
            $data['foto'] = 'batch2/' . $name . '.png';

            Intern::where('name', $name)->update($data);
        }

        foreach ($newInterns as $intern) {
            // Menggunakan firstOrCreate agar tidak duplikat jika seeder tidak sengaja dijalankan 2x
            Intern::firstOrCreate(
                ['name' => $intern['name']],
                $intern
            );
        }

        // 4. Nonaktifkan semua karyawan yang BUKAN anak baru dan BUKAN anak lama yang lanjut
        $activeNames = array_merge(
            array_column($newInterns, 'name'), 
            array_column($oldInterns, 'name')
        );

        Intern::whereNotIn('name', $activeNames)->update(['is_active' => false]);
    }
}
