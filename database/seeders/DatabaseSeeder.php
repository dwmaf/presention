<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Intern;
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

        // 2. Buat Data Dummy Anak Magang
        Intern::create(['name' => 'Budi Santoso', 'division' => 'IT Support']);
        Intern::create(['name' => 'Siti Aminah', 'division' => 'Web Developer']);
        Intern::create(['name' => 'Rizky Febian', 'division' => 'UI/UX Design']);
        Intern::create(['name' => 'Dewi Persik', 'division' => 'Marketing']);
    }
}
