<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->boolean('toleransi_senin')->default(false)->after('senin');
            $table->boolean('toleransi_selasa')->default(false)->after('selasa');
            $table->boolean('toleransi_rabu')->default(false)->after('rabu');
            $table->boolean('toleransi_kamis')->default(false)->after('kamis');
            $table->boolean('toleransi_jumat')->default(false)->after('jumat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->dropColumn(['toleransi_senin', 'toleransi_selasa', 'toleransi_rabu', 'toleransi_kamis', 'toleransi_jumat']);
        });
    }
};
