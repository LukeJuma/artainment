<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Fix Mic Mtaani events status enum values to match frontend expectations.
     * 
     * Changes status from: ['pending', 'approved', 'rejected'] 
     * To: ['Live', 'Upcoming', 'Sold Out', 'Cancelled']
     * 
     * Note: After running this migration, update RLS policies using:
     * backend/database/update_mic_mtaani_event_policies.sql
     */
    public function up(): void
    {
        // First, update existing data to map old values to new ones
        // Handle Laravel enum values
        DB::table('mic_mtaani_events')
            ->where('status', 'approved')
            ->update(['status' => 'Upcoming']);
            
        DB::table('mic_mtaani_events')
            ->where('status', 'pending')
            ->update(['status' => 'Upcoming']);
            
        DB::table('mic_mtaani_events')
            ->where('status', 'rejected')
            ->update(['status' => 'Cancelled']);

        // Handle sample/SQL data status values that might exist
        DB::table('mic_mtaani_events')
            ->where('status', 'active')
            ->update(['status' => 'Live']);
            
        DB::table('mic_mtaani_events')
            ->where('status', 'upcoming')
            ->update(['status' => 'Upcoming']);
            
        DB::table('mic_mtaani_events')
            ->where('status', 'cancelled')
            ->update(['status' => 'Cancelled']);

        // Change column to string temporarily, then back to enum with new values
        Schema::table('mic_mtaani_events', function (Blueprint $table) {
            $table->string('status_temp')->nullable();
        });

        // Copy current status values to temp column
        DB::statement("UPDATE mic_mtaani_events SET status_temp = status");

        // Drop old status column and recreate with new enum values
        Schema::table('mic_mtaani_events', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('mic_mtaani_events', function (Blueprint $table) {
            $table->enum('status', ['Live', 'Upcoming', 'Sold Out', 'Cancelled'])->default('Upcoming');
        });

        // Copy values back and drop temp column
        DB::statement("UPDATE mic_mtaani_events SET status = status_temp");
        
        Schema::table('mic_mtaani_events', function (Blueprint $table) {
            $table->dropColumn('status_temp');
        });
    }

    public function down(): void
    {
        // Reverse the process
        Schema::table('mic_mtaani_events', function (Blueprint $table) {
            $table->string('status_temp')->nullable();
        });

        // Map new values back to old ones before copying
        DB::table('mic_mtaani_events')
            ->where('status', 'Live')
            ->update(['status' => 'approved']);
            
        DB::table('mic_mtaani_events')
            ->where('status', 'Upcoming')
            ->update(['status' => 'approved']);
            
        DB::table('mic_mtaani_events')
            ->whereIn('status', ['Sold Out', 'Cancelled'])
            ->update(['status' => 'rejected']);

        // Copy to temp column
        DB::statement("UPDATE mic_mtaani_events SET status_temp = status");

        // Recreate original enum
        Schema::table('mic_mtaani_events', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('mic_mtaani_events', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
        });

        // Copy back and cleanup
        DB::statement("UPDATE mic_mtaani_events SET status = status_temp");
        
        Schema::table('mic_mtaani_events', function (Blueprint $table) {
            $table->dropColumn('status_temp');
        });
    }
};