-- COMPLETE SECURITY AUDIT QUERIES FOR ARTAINMENT PRODUCTION DATABASE
-- DO NOT RUN THESE YET - AUDIT ONLY

-- 1. List all tables in public schema
SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Check RLS status for all tables
SELECT schemaname, tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 3. List all existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Check table grants for anon, authenticated, service_role
SELECT grantee, table_schema, table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated', 'service_role', 'postgres')
ORDER BY table_name, grantee;

-- 5. List all foreign key relationships
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 6. List all views
SELECT schemaname, viewname, definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- 7. List all functions/procedures
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    CASE p.prosecdef 
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    p.provolatile as volatility
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 8. Check function privileges
SELECT 
    r.routine_name,
    r.routine_type,
    p.grantee,
    p.privilege_type
FROM information_schema.routines r
LEFT JOIN information_schema.routine_privileges p ON r.routine_name = p.routine_name
WHERE r.routine_schema = 'public'
ORDER BY r.routine_name;

-- 9. List all triggers
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.trigger_schema,
    t.action_timing,
    t.action_statement
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table;

-- 10. Identify sensitive columns (potential PII/auth data)
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (
    column_name ILIKE '%password%' OR
    column_name ILIKE '%email%' OR
    column_name ILIKE '%phone%' OR
    column_name ILIKE '%token%' OR
    column_name ILIKE '%secret%' OR
    column_name ILIKE '%key%' OR
    column_name ILIKE '%hash%' OR
    column_name ILIKE '%salt%' OR
    column_name ILIKE '%session%' OR
    column_name ILIKE '%remember%' OR
    column_name ILIKE '%reset%' OR
    column_name ILIKE '%verification%'
)
ORDER BY table_name, column_name;

-- 11. Get table sizes and row counts
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- 12. Check for any exposed Supabase roles
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'service_role', 'supabase_auth_admin', 'supabase_admin')
ORDER BY rolname;