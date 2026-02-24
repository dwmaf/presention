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
                'senin' => true,
                'selasa' => true, 
                'rabu' => true,
                'kamis' => true,
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Arif Khumeini', 
                'division_id' => $divDesign->id,
                'foto' => 'foto/emp002.jpg',
                'senin' => true,
                'selasa' => true,
                'rabu' => true, 
                'kamis' => true, 
                'jumat' => true,
                'poin' => 5,
            ],
            [
                'name' => 'Berlian Auraly Kastyanos', 
                'division_id' => $divDataManage->id,
                'foto' => 'foto/emp003.jpg',
                'senin' => true, 
                'selasa' => true, 
                'rabu' => true, 
                'kamis' => true, 
                'jumat' => true,
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
                'senin' => false,
                'selasa' => true,
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
                'fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEQHEBUoFjQG0Bl4dhQJcBa4xfQRYAdEleQPMBHURcQE4Aom9bQJcAg2dYgJoBlI9UQS0Ax5lTgScBOY9TQNIAW6lSgO0BYThSQFQBFX1SgJwAq2xRQUEAsUNRQVABGDpRgMIAmFpQgQkBcYFPQPoBo3NOgMIA9WdNgJoA6QVNQQQAhKBMQHwBNIVMQQsBl35LgNQBpjpKQNsAHlZKQK4BBnhJQVcAnJhIgPgBcXlIQKsAjqpIQO0AsUpHQPMBmXZHgGIBXSVHgIsBKiBGgRMBm35GQWQBEJVFgOUBzmxDgSgBlIdDgH4BKnxBQSMBfY1AQJcA9XhAgNsBRY1AQLkB6a8/QMUBlJo/QL4Bxzg/QM0BqDw+gR4BgIk9QDgBG3g9gEIAmA07gL4BiJM7QGABoIc5QK4AmgM5gNkBeDE5QLEAGrA2gWwAi0E2QNIBI5k2QOMB1mI2ANIBkTY0AMUBHXk0AS0Bty00AXAA4DwzAR4Bh4kzAIgB55MxAMwBL4IwAXEAxz0vALMB7z8vADcBBBkvAXEArp0uAAA=',
                'second_fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEQRMBc4VkQTsBBEFiQNQBVYVfQNsBcS1YQH4Ap3NXgKwA+BdUgJoBm5JUQQEB9HVTQIABOYJSQVAAiUZRQTcBkolRQP8BIo9QgMwBMn9QgVcBPo1OgO0Br3FOgUEBwoJNgJMBcYdNgRgAiaJMgSgBQ4xLgOgBj3VLQMcBxw9LgHQAqxdKQO0AM7BKQUoAbUpKgL4Atg1KQJ8Bei1JgFkBE4JIQHQBaYNHgOkBRYlGgL0Be5NGQMoBBghGgQwBsn9GgQcAgatFQWcBU5FEQMcA/AhDQGwBJyBDgPoAQlxCQOMBgnhCQNEBQYVCgUgAe55BgIQBqo5BgP8A8J5AQPMARl8+gNIB5Q8+gFQBNn8+gOkBhHs+QLsBvQk+QPABvXM+QMMB4gQ+QPMAI1k8QQIBtSg8QVcBxy05QLYB1aA5gNIA9wQ4gNwBB504QNEB8UY4QX0Ax5s2QNkBNos2gU0AKVE1gLMBnp41AQsB1XUzAJ0B3UIzAXAARpYyAPUAMq4yAJAATBEyALUBx64yAXYAJJAxAMoBmz0xAAA=',
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
                'fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEQPgAiURhQGIA8AJcgH4BO2BZQH4AzWBYgOgAYERUQIQAtqdUQO0BQ5hTQGgAS2NTQJwAnFZRQJoAQa5QQSAAnEFLgFQAyghLgI4Ak6ZJQMcA1plJgTIAdzlIQOkAd5xHQIYA/1xGQIsBYUJGgD8AUw1FQSoAkpJDQWYAoX9CQMUA4UZBgJABuBlAQOkAbJ1AQGwBqqRAQU8Awj0+QL4A4KA+gG0BIqc+QHkB51Q+QJUBjzk9gOkByYY9QM0BXZE9gDUBZh88gIYB32A8QPgBkZQ8gG8BoDE8QKYAN187QUUAezs7QUgAvjc7QDoBmTE7QF0AyAQ6gEYAUQs6gCYBSnw5gHcBlzo5gLEBl4s5QGwB7LI5gX0AKTM4QTcAY5g4QSIAbT84QTEA+EM4gOMBuH84QGIB2J04QIgByU83gLUAW1Q3gWYAl4E2QHEBOWs2gJwBtxc2gG8B0QA2QG0Bh402QOgBoYw2gEkBuDI2QOMBmzc1AL0AK0w0AXAATIc0AWYAsyg0AG0BL2o0ALEBvWg0APUASZo0AAA=',
                'second_fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEgIMA4SBbgTsAk09bgKwBpoVZgP8AMrBYQSMA+JlXQPABSoJWQR4AuKJWQJUAuXlWgJUAqxtUgWcAn55SgQsBh3ZRgOkAgXBPQGIAgHxPgJcB5S5OgM0AohROgFEAoiFNQKwAWXFMgJ0BfShMQFQAmiBLQIQBC3xLgOEBEw9LQJcASxdKQGUAcXVJQUYA7UZJgFgBaSdHQPgBZIJHQPIAXWRGQLsByYxGQPgBkiBFQJUBq4NFQHwBm4tFgLEAYnFEQLsAYA1EgP8BpiFDQREBOzpDQJUBt4VCQOsAkm5BgKQAwhlBQUEBPotBQQwBnnhAgHkBvSg/gNQBYoU+QIMB2og+QUoAH1Y9QQIBayw9gUgA9UY9QTIBfX89gEIBAXg8gRgBB148QIsBXCQ8QIgBeis8gQQBTYM8QQkBsng7QMMB0JI7QL4As3Q7QPUBqB47gIQBuig6QXUAWUc6QEEBPHs6gP8BxxM6gPUBeCI5gUABLzs5gO0BkS84gVAAI1g3QIsARHE3QD0AzR43gPMB0AY3QX0AiEQ3AAA=',
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
                'fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEQTYBlIVkgMIA92JkgK4Avl5kgEcA93VjQUYBxn5hgNwBJ15gQKcBXIJeQSIAp0pdQPIAdEtcQFgAk2hbgI0As2RaQRoAYkdYQH4A2W5YQSgA2Z5XQMUBVYNVQNQA3FVUQIYAVlpTQJ8AkGJTgGIBjIVTQJ8BS31TQMMBxp1TgKIAW1JSQREAMk1SQFQBGHpSQY0BQ5xRQRsB7F5QQHwAF1JQQEsA7nFQgYgBgpRQQIAAnwVPQMMAOk9NgNwBRXFNQXEBS5RMQPMBiihMQV8Bv4NMgRoBj3pLQFQAi2dKQGIBLxlKgMUBzptKgIYBBnFJgFkBOx1JgG8BDA9IgSgBwnRHgHcB4o9HgVcBvzFGQEsBbCBGQO0AGkhFQNwAHKNFQG8BU39FgYABwotFQPMAK0ZEQMcBO3dEgOsBbIJEQOMBhy1DgHYBwpJDgNYBlDFCQRMA7UpCQOEA+FVCgREBmXFCQO0B2gVCQOEBeoZAgJoAOl9AQPIBGFRAgMcA3lw/QPwBoCA/QTYBNEE+gJ8Avas+gOkBEKI9AAA=',
                'second_fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEgTIB5YBkQIgAyG5jQTsAKWlfQOMApw9fgSIAp19cgG8BHRlbQWEAkKVagSMANQ1ZQNEB2nxZQV8AWVhZgL0A2Q9ZQVAAMgRXQXAAn09XQXgAbKtWgWwAx6JVQMoBuH1VgEYBPHhUgEcBAXBUgNQBRQhSQS0BHaJSQNYBgK5SQKwBkRlSgScAjq9RQUAA96VRgNsBEwlRQREBWJ9QQKYBaRRQQI4B9nhQQX8ANaRQgJMAPRdQgRgBx4lQgGAArhRPQX8AtqNPgKQA83ZPgGUB5SdPgVABzIdOQJoBDBlNQMIAiBFLQD8BOXVLQGgB3SNJQTcBdZNHQGUBkR5GgF0BmyBGgOsBVaVFgVUAU65EgWEBl5JEgQcA865EQQcBKqVEQSAAewJCQaoAVEFAgREAbWZAgRAAn65AQPABo4tAgNsBlIw/QFQB8Sk+gNYAGg8+QNQBqII+QQQB9349gK4B5348QJwA/3M8gOMBh5g7QBkAwGk6QNIB9Ck6QQEA4QA5gHcALRw4QTcBaZg4gOUB3yk4QNEByXw4AAA=',
                'poin' => 5,
            ],
            [
                'name' => 'Hansent Theja', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp033.jpg',
                'senin' => false, 'selasa' => true, 'rabu' => false, 'kamis' => true, 'jumat' => false,
                'fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEQQQAtkFkQFYBQXpZgGUBvY5ZQOgB2otYQHQAyghVQLsA4JhVgEsBTR1UgIQBeoFUQOUAtkJSgK4BnoFOgHYBYoFNQLUAnKNLQP8BYo1LgI0BBKRKQQIBO5BKQMcATKxIgH4BlChHgIsBwnpHgL4B54NHQIYBqyhGQF4B1o5FQRAAYzxDQJABMpBDQI4BqIJDQGgB2jFDQHcB5xtDgNwATlhBQIMBYS0/gNYBlIs+QOUBBI8+QJ0Bxyg+QOEAl5s9gI0BtXc9QHYBLHo8QMwAxU07gJ0A5bA7QKcA5l87gIgBI5g7gLsBKow7QGwB5TU6gJABr4E5QQQAbTc5QI4BQTo4gNsARE83gQwASZQ3QKYBRpA1QLsBVYw1QJUBXDU1QJABbIM1gG8B7YU1AIgBTY00ATcAPY0zAPoAiEQyAXEARI0yAXUAS40xAPUAY6IxASAArpUxAPAAREgwANsBBD4wAREBDpQwAL0BSzMwATIARo8wAD8AhBUwAOEAokowAQEBFZIwAHkBwS8wAPIAPEkvAVIARIovAAA=',
                'second_fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEgOUBqiNjQQwBDFJfgPABl4FfQN4AiV9bgLsBzIxbQKQAmgtagNsAwlxZgTcA/0lZQFgBI3hZgOkAkgBXQPwA86VXgSIBgIxVQI4ArnBSQRABKp5SgKYB4IlSQLYBFhFRgT4BXY9RQJ8B94ZRQJUB5YBRgNQA9W5QQNsBhIVQgSgBUEFQQVIBVT5PQNIAyAROQNEBzi1OQKwBpoNNgJcAq3FNgUYBl4tNQHQBgHpMQRgBvYNLgN4Bty1KQGgBunhKQI0BQSFJgGwBsHhJgPMB33hHgF0BDBpGQEEBE3ZEgI4BG3xEQPAB1SdEQMcA13BDgPIBiodDQHwB3X1CgEEBHXVBQPwBe4tBQPAB93tBgNsBe4JAgOMBcYNAQKYBVSQ/QKcBgnw/gQQBej89gFgBiHo8QEkBLBk7QWcBFps6gEIBsnU6QRABxn44QJ8CAIY4QPACAHk4QK4BO383gD8BmXg2gNQB1TE2gPUB/Ho2QL4A7g01QKcBL341AKIBXCU1AO0BfYI1ANIBxy80AQkB1oEzAW4BQ5QyAAA=',
                'poin' => 5,
            ],
            [
                'name' => 'Rayhan NuerJamman', 
                'division_id' => $divSoftwareDev->id,
                'foto' => 'foto/emp034.jpg',
                'senin' => false, 'selasa' => true, 'rabu' => false, 'kamis' => true, 'jumat' => false,
                'fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEgGcBmYtkgOkAiExhgK4Al1pcQLMBNFRbgHcBYoVbQUYA/z1agQcAaEhYQQcAg55YgRYA4ZlWgNEBUkBUQTYBQzhUQJwBq5lUQFEBBBdSQDoBQX1SQJwBiJdRgLEApqdQgGgAZQdPgK4BB15PQIMAVABOQTIBJ5ROQR4BepROQJUBB6tOQHwB3ZROgJMAOlpNQIsBxptLgHYAYGdKgNYBLUFJQD0BNntIQNsBh4lHQFkBgihGgLUANaxEQGIBJw9EQLMBoDhEgP8A3phDgLEBbJJDgLYBmTVCgOgBzHVCQTEARkRCQQsBuolCQKwB7KFCQJUAobBBgOEBQT1BQOkBmYlBgGgBL31AQFgBWCI+QK4BU549gNkBj3o9gNYBsnw9gP8B0YM9QE8A+HY8gD8A+BM8QPABl4s7QLYB3QU7gP8BpjU6QIMB1Zg5QKIBzDg5QMUBej84gMIB0Uk4QGUBRh43gKcB3z42AMwBni01ALYBsD01AQEB6SszAKIB1Z4zAIQB4pgyAJAB0JgxACgBRXgxANEBgIExAAA=',
                'second_fingerprint_data' => 'Rk1SACAyMAABuAAz/v8AAAH0AiYBFAEUAQAAAFZEQLsAYApbQFYAvR1aQEEAk3lZQK4A6Q1ZQOMAaKlZgD8BDiBZgFEA5nxWgMUAiWlUgL0A13RUQMoAW19QgQsBc4dNQF4BJ4JMQDIBTYFJQK4BgChJgHkBv5BHgIMA7hxHgMIBEKdFQLsB0GJFgKwAqQZFgJ0BU39EgQsBeodEgL4A9QJEQKQBwjlEgMwBQ4xDgLMBWoNCQNEBj31CgPIBWodBgJUBlJhBgIQBzqBBgKQB9hNBgOUBsnxAgJcBoZk/QKYBm40+QPgAW6M+gKwBORk+QEcBr4I9QGcAjhk8gVcAvUE8gK4B72s8gJwAqxE7QSIBwoc7gJoB2jo7QQkB0YM6QOsBE005gSgBsos5gMwBvX85gOsBt4E4gKQAsA03gWEA6Zc2gOMBvSk2QDUBO3w1QPoBUzY1AMoBq381AKYBTYA0AKwBTSU0AJoBeyU0AO0BoCk0ASIBiDE0AQkByS0zARgBwS8zATsBuo8yAKwBjDEyAIMBsDEyAKIBQR0xAJoBZCIxAK4BmzMxAOgBpoUxAPABvSkxAAA=',
                'poin' => 5,
            ],
        ];

        foreach ($interns as $data) {
            $intern = Intern::create($data);

            // 4. Buat Data Kehadiran (2 minggu terakhir)
            for ($i = 1; $i < 14; $i++) {
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
