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
            // Default jam 08:30:00 (Jam masuk normal)
            $table->time('toleransi_senin_time')->default('08:30:00')->after('toleransi_senin');
            $table->time('toleransi_selasa_time')->default('08:30:00')->after('toleransi_selasa');
            $table->time('toleransi_rabu_time')->default('08:30:00')->after('toleransi_rabu');
            $table->time('toleransi_kamis_time')->default('08:30:00')->after('toleransi_kamis');
            $table->time('toleransi_jumat_time')->default('08:30:00')->after('toleransi_jumat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->dropColumn([
                'toleransi_senin_time',
                'toleransi_selasa_time',
                'toleransi_rabu_time',
                'toleransi_kamis_time',
                'toleransi_jumat_time'
            ]);
        });
    }
};
