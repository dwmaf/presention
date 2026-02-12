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
        Schema::create('fingerprints', function (Blueprint $table) {
            $table->id();
            // Assuming we might attach this to a user later, but for now just storing the data
            $table->foreignId('intern_id')->constrained()->cascadeOnDelete();
            $table->string('user_name')->nullable(); // For demo purposes
            $table->text('fingerprint_data'); // This will store the Feature Set (base64)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fingerprints');
    }
};
