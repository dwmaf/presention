<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Intern;
use App\Models\Division;
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
            'password' => bcrypt('1234'),
        ]);

        // 2. Buat Data Division
        $divSoftwareDev = Division::create(['nama_divisi' => 'Software Development']);
        $divSocMed = Division::create(['nama_divisi' => 'Social Media Specialist']);
        $divDesign = Division::create(['nama_divisi' => 'Design and Video Editing']);
        $divDataManage = Division::create(['nama_divisi' => 'Data Management']);

        // 3. Buat Data Anak Magang
        Intern::create([
            'name' => 'Antonia Preselia Marsa Samat', 
            'division_id' => $divDataManage->id,
            'barcode' => 'EMP001',
            'foto' => 'foto/emp001.jpg'
        ]);
        Intern::create([
            'name' => 'Arif Khumeini', 
            'division_id' => $divDesign->id,
            'barcode' => 'EMP002',
            'foto' => 'foto/emp002.jpg'  
        ]);
        Intern::create([
            'name' => 'Berlian Auraly Kastyanos', 
            'division_id' => $divDataManage->id,
            'barcode' => 'EMP003',
            'foto' => 'foto/emp003.jpg',
        ]);
        Intern::create([
            'name' => 'Dawam Agung Fathoni', 
            'division_id' => $divSoftwareDev->id,
            'barcode' => 'EMP032',
            'foto' => 'foto/emp032.jpg',
        ]);
        Intern::create([
            'name' => 'Syariffullah', 
            'division_id' => $divSoftwareDev->id,
            'barcode' => 'EMP028',
            'foto' => 'foto/emp028.jpg',
        ]);
        Intern::create([
            'name' => 'Abimanyu Ridho Ramadhani', 
            'division_id' => $divSoftwareDev->id,
            'barcode' => 'EMP030',
            'foto' => 'foto/emp030.jpg',
        ]);
        Intern::create([
            'name' => 'Rayhan NuerJamman', 
            'division_id' => $divSoftwareDev->id,
            'barcode' => 'EMP034',
            'foto' => 'foto/emp034.jpg',
        ]);
    }
}
