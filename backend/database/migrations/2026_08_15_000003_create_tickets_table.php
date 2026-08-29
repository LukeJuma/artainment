<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->nullable()->constrained('mic_mtaani_events')->nullOnDelete();
            $table->string('type')->default('regular');
            $table->decimal('price', 10, 2)->default(0);
            $table->unsignedInteger('capacity')->default(0);
            $table->unsignedInteger('sold')->default(0);
            $table->enum('status', ['active', 'sold_out'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
