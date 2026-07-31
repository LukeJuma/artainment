<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('films', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('synopsis')->nullable();
            $table->string('genre');
            $table->string('year');
            $table->string('duration')->nullable();
            $table->decimal('rating', 3, 1)->default(0);
            $table->string('poster_url')->nullable();
            $table->string('backdrop_url')->nullable();
            $table->string('video_url')->nullable();
            $table->string('tag')->nullable();
            $table->enum('status', ['upcoming', 'in_production', 'completed'])->default('completed');
            $table->boolean('featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('films');
    }
};
