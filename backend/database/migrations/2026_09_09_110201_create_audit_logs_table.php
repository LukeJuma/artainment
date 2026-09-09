<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // Null for system events
            $table->string('action'); // ADMIN_LOGIN, FILM_CREATED, USER_REGISTERED, etc.
            $table->string('resource_type')->nullable(); // films, users, subscriptions, etc.
            $table->string('resource_id')->nullable(); // ID of affected resource
            $table->json('details')->nullable(); // Additional context data
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->enum('level', ['INFO', 'WARN', 'ERROR'])->default('INFO');
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
            $table->index(['resource_type', 'resource_id']);
            $table->index('level');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};