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
        // Add deleted_at columns to critical models for soft deletes
        $tables = [
            'users',
            'films', 
            'series',
            'podcasts',
            'payments',
            'subscriptions',
            'mic_mtaani_articles',
            'talents'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->softDeletes();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove deleted_at columns
        $tables = [
            'users',
            'films', 
            'series',
            'podcasts',
            'payments',
            'subscriptions',
            'mic_mtaani_articles',
            'talents'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropSoftDeletes();
                });
            }
        }
    }
};
