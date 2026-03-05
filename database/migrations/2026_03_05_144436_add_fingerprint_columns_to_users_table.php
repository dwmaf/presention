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
        Schema::table('users', function (Blueprint $table) {
            $table->text('fingerprint_1')->nullable();
            $table->text('fingerprint_2')->nullable();
            $table->text('fingerprint_3')->nullable();
            $table->text('fingerprint_4')->nullable();
            $table->text('fingerprint_5')->nullable();
            $table->text('fingerprint_6')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'fingerprint_1', 'fingerprint_2', 'fingerprint_3', 
                'fingerprint_4', 'fingerprint_5', 'fingerprint_6'
            ]);
        });
    }
};
