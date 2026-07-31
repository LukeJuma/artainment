<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mic_mtaani_submissions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['news_tip', 'event', 'announcement', 'photo', 'video', 'story']);
            $table->string('title');
            $table->longText('description')->nullable();
            $table->string('submitter_name');
            $table->string('submitter_email')->nullable();
            $table->string('submitter_phone')->nullable();
            $table->string('media_url')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mic_mtaani_submissions');
    }
};
