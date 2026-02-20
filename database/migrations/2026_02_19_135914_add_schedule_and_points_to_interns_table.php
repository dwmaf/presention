<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->boolean('senin')->default(false)->after('fingerprint_data');
            $table->boolean('selasa')->default(false)->after('senin');
            $table->boolean('rabu')->default(false)->after('selasa');
            $table->boolean('kamis')->default(false)->after('rabu');
            $table->boolean('jumat')->default(false)->after('kamis');

            $table->integer('poin')->default(0)->after('jumat');
        });
    }

    public function down(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->dropColumn(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'poin']);
        });
    }
};
