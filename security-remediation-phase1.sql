-- ARTAINMENT SECURITY REMEDIATION - PHASE 1 (CRITICAL FIXES)
-- Execute these changes to address CRITICAL security findings
-- 
-- IMPORTANT: These changes preserve Laravel backend functionality
-- while securing the database from unauthorized access via Supabase API

-- =============================================================================
-- PHASE 1: SECURE LARAVEL SYSTEM TABLES (CRITICAL)
-- =============================================================================

-- 1.1 Enable RLS on Laravel system tables
-- These tables should NEVER be accessible via public API
ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_access_tokens ENABLE ROW LEVEL SECURITY;

-- Check if failed_jobs table exists before enabling RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'failed_jobs' AND table_schema = 'public') THEN
        ALTER TABLE failed_jobs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 1.2 Create restrictive policies for Laravel system tables
-- These policies block ALL access via Supabase API (service_role bypasses RLS)

-- Block access to migrations table
CREATE POLICY "migrations_no_access" ON migrations
FOR ALL TO public
USING (false);

-- Block access to users table  
CREATE POLICY "users_no_access" ON users
FOR ALL TO public  
USING (false);

-- Block access to password reset tokens
CREATE POLICY "password_reset_tokens_no_access" ON password_reset_tokens
FOR ALL TO public
USING (false);

-- Block access to sessions
CREATE POLICY "sessions_no_access" ON sessions  
FOR ALL TO public
USING (false);

-- Block access to cache tables
CREATE POLICY "cache_no_access" ON cache
FOR ALL TO public
USING (false);

CREATE POLICY "cache_locks_no_access" ON cache_locks
FOR ALL TO public  
USING (false);

-- Block access to job system tables  
CREATE POLICY "jobs_no_access" ON jobs
FOR ALL TO public
USING (false);

CREATE POLICY "job_batches_no_access" ON job_batches
FOR ALL TO public
USING (false);

-- Block access to personal access tokens
CREATE POLICY "personal_access_tokens_no_access" ON personal_access_tokens
FOR ALL TO public
USING (false);

-- Block access to failed_jobs if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'failed_jobs' AND table_schema = 'public') THEN
        EXECUTE 'CREATE POLICY "failed_jobs_no_access" ON failed_jobs FOR ALL TO public USING (false)';
    END IF;
END $$;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify RLS is enabled on critical tables
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'migrations', 'users', 'password_reset_tokens', 'sessions',
        'cache', 'cache_locks', 'jobs', 'job_batches', 'personal_access_tokens'
    )
ORDER BY tablename;

-- Verify policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'migrations', 'users', 'password_reset_tokens', 'sessions',
        'cache', 'cache_locks', 'jobs', 'job_batches', 'personal_access_tokens'  
    )
ORDER BY tablename, policyname;

-- =============================================================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- =============================================================================
-- UNCOMMENT ONLY IF YOU NEED TO ROLLBACK THESE CHANGES
-- WARNING: This will re-expose sensitive tables

/*
-- Drop all the restrictive policies
DROP POLICY IF EXISTS "migrations_no_access" ON migrations;
DROP POLICY IF EXISTS "users_no_access" ON users;
DROP POLICY IF EXISTS "password_reset_tokens_no_access" ON password_reset_tokens;
DROP POLICY IF EXISTS "sessions_no_access" ON sessions;
DROP POLICY IF EXISTS "cache_no_access" ON cache;
DROP POLICY IF EXISTS "cache_locks_no_access" ON cache_locks;
DROP POLICY IF EXISTS "jobs_no_access" ON jobs;
DROP POLICY IF EXISTS "job_batches_no_access" ON job_batches;
DROP POLICY IF EXISTS "personal_access_tokens_no_access" ON personal_access_tokens;
DROP POLICY IF EXISTS "failed_jobs_no_access" ON failed_jobs;

-- Disable RLS (WARNING: This re-exposes the tables)
ALTER TABLE migrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE cache_locks DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE personal_access_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE failed_jobs DISABLE ROW LEVEL SECURITY;
*/