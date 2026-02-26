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
            $table->text('fingerprint_data_3')->nullable()->after('second_fingerprint_data');
            $table->text('fingerprint_data_4')->nullable()->after('fingerprint_data_3');
            $table->text('fingerprint_data_5')->nullable()->after('fingerprint_data_4');
            $table->text('fingerprint_data_6')->nullable()->after('fingerprint_data_5');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            //
        });
    }
};
