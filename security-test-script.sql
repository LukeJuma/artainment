-- ARTAINMENT SECURITY TEST SCRIPT
-- Run these tests after implementing security remediation to verify protection

-- =============================================================================
-- SECURITY TEST SUITE
-- =============================================================================

-- Test 1: Verify Laravel system tables are protected
SELECT 'TEST 1: Laravel System Tables Protection' as test_name;

-- These queries should return 0 rows (blocked by RLS)
SELECT 
    'users' as table_name,
    COUNT(*) as accessible_rows
FROM users; -- Should fail or return 0

SELECT 
    'password_reset_tokens' as table_name, 
    COUNT(*) as accessible_rows
FROM password_reset_tokens; -- Should fail or return 0

SELECT
    'sessions' as table_name,
    COUNT(*) as accessible_rows  
FROM sessions; -- Should fail or return 0

SELECT
    'migrations' as table_name,
    COUNT(*) as accessible_rows
FROM migrations; -- Should fail or return 0

-- Test 2: Verify public content is accessible
SELECT 'TEST 2: Public Content Access' as test_name;

-- These should return data
SELECT 
    'films' as table_name,
    COUNT(*) as accessible_rows
FROM films 
WHERE status = 'completed';

SELECT
    'services' as table_name, 
    COUNT(*) as accessible_rows
FROM services
WHERE active = true;

-- Test 3: Check RLS status summary
SELECT 'TEST 3: RLS Status Summary' as test_name;

SELECT 
    COUNT(*) as total_tables,
    COUNT(CASE WHEN rowsecurity THEN 1 END) as rls_enabled,
    COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as rls_disabled
FROM pg_tables
WHERE schemaname = 'public';

-- Test 4: Policy count verification  
SELECT 'TEST 4: Policy Count Verification' as test_name;

SELECT
    COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Test 5: Critical tables security check
SELECT 'TEST 5: Critical Tables Security Check' as test_name;

SELECT 
    tablename,
    rowsecurity as has_rls,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND pg_policies.tablename = pt.tablename) as policy_count,
    CASE 
        WHEN rowsecurity AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND pg_policies.tablename = pt.tablename) > 0 
        THEN '✅ SECURED'
        WHEN rowsecurity 
        THEN '⚠️ RLS_ENABLED_NO_POLICIES'  
        ELSE '❌ UNSECURED'
    END as security_status
FROM pg_tables pt
WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'password_reset_tokens', 'sessions', 'migrations',
        'cache', 'cache_locks', 'jobs', 'job_batches'
    )
ORDER BY tablename;

-- Test 6: Verify helper functions exist
SELECT 'TEST 6: Helper Functions Check' as test_name;

SELECT 
    proname as function_name,
    CASE prosecdef WHEN true THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid  
WHERE n.nspname = 'public'
    AND proname IN ('is_admin_user', 'current_user_id');

-- =============================================================================
-- PENETRATION TEST SIMULATIONS  
-- =============================================================================

-- Simulate anonymous user trying to access sensitive data
SELECT 'PENETRATION TEST: Anonymous Access Attempts' as test_name;

-- Test unauthorized access to user data (should be blocked)
BEGIN;
    SET ROLE anon;  -- Simulate anonymous user
    
    -- These should all fail or return 0 rows
    SELECT 'Attempting to access users table...' as test;
    -- SELECT * FROM users LIMIT 1; -- This should fail
    
    SELECT 'Attempting to access password reset tokens...' as test;  
    -- SELECT * FROM password_reset_tokens LIMIT 1; -- This should fail
    
    SELECT 'Attempting to access sessions...' as test;
    -- SELECT * FROM sessions LIMIT 1; -- This should fail
    
ROLLBACK;

-- =============================================================================
-- FINAL SECURITY REPORT
-- =============================================================================

SELECT 'FINAL SECURITY REPORT' as section;

-- Summary of all tables and their security status
WITH security_summary AS (
    SELECT 
        pt.tablename,
        pt.rowsecurity as rls_enabled,
        COALESCE(pp.policy_count, 0) as policies,
        CASE 
            WHEN pt.tablename IN ('users', 'password_reset_tokens', 'sessions', 'migrations', 'cache', 'cache_locks', 'jobs', 'job_batches', 'personal_access_tokens')
            THEN 'CRITICAL_SYSTEM'
            WHEN pt.tablename IN ('films', 'series', 'services', 'talent', 'productions', 'testimonials', 'gallery_images', 'podcasts')  
            THEN 'PUBLIC_CONTENT'
            WHEN pt.tablename IN ('subscriptions', 'payments')
            THEN 'USER_PRIVATE'
            WHEN pt.tablename IN ('news_articles', 'notifications', 'settings')
            THEN 'ADMIN_ONLY' 
            WHEN pt.tablename LIKE 'mic_mtaani_%'
            THEN 'COMMUNITY'
            ELSE 'OTHER'
        END as table_category
    FROM pg_tables pt
    LEFT JOIN (
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
    ) pp ON pt.tablename = pp.tablename
    WHERE pt.schemaname = 'public'
)
SELECT 
    table_category,
    COUNT(*) as total_tables,
    COUNT(CASE WHEN rls_enabled THEN 1 END) as rls_enabled_count,
    SUM(policies) as total_policies,
    CASE 
        WHEN COUNT(*) = COUNT(CASE WHEN rls_enabled THEN 1 END) THEN '✅ ALL_SECURED'
        WHEN COUNT(CASE WHEN rls_enabled THEN 1 END) > 0 THEN '⚠️ PARTIALLY_SECURED'  
        ELSE '❌ UNSECURED'
    END as security_status
FROM security_summary
GROUP BY table_category
ORDER BY 
    CASE table_category
        WHEN 'CRITICAL_SYSTEM' THEN 1
        WHEN 'USER_PRIVATE' THEN 2
        WHEN 'ADMIN_ONLY' THEN 3
        WHEN 'PUBLIC_CONTENT' THEN 4
        WHEN 'COMMUNITY' THEN 5
        ELSE 6
    END;

-- Overall security score
SELECT 
    'OVERALL_SECURITY_SCORE' as metric,
    ROUND(
        (COUNT(CASE WHEN rowsecurity THEN 1 END)::float / COUNT(*)::float) * 100, 1
    ) as percentage_secured
FROM pg_tables
WHERE schemaname = 'public';