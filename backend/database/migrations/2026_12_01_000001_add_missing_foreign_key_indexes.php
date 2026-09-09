<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add indexes on foreign key columns that are missing them
        // Critical for performance, especially with SQLite and large datasets
        
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('plan_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('subscription_id');
        });

        Schema::table('podcast_episodes', function (Blueprint $table) {
            $table->index('podcast_id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index('film_id');
            $table->index('user_id');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->index('event_id');
            $table->index('user_id');
        });

        Schema::table('episodes', function (Blueprint $table) {
            $table->index('season_id');
        });

        Schema::table('seasons', function (Blueprint $table) {
            $table->index('series_id');
        });

        Schema::table('mic_mtaani_comments', function (Blueprint $table) {
            $table->index('article_id');
            $table->index('user_id');
        });

        Schema::table('mic_mtaani_submissions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('category_id');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['plan_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['subscription_id']);
        });

        Schema::table('podcast_episodes', function (Blueprint $table) {
            $table->dropIndex(['podcast_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['film_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['event_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('episodes', function (Blueprint $table) {
            $table->dropIndex(['season_id']);
        });

        Schema::table('seasons', function (Blueprint $table) {
            $table->dropIndex(['series_id']);
        });

        Schema::table('mic_mtaani_comments', function (Blueprint $table) {
            $table->dropIndex(['article_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('mic_mtaani_submissions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['category_id']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};