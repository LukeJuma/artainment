-- Diagnostic queries to check foreign key constraints and RLS policies

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
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

-- Check if there are any orphaned records
SELECT 'mic_mtaani_articles with missing categories' as issue, COUNT(*) as count
FROM mic_mtaani_articles 
WHERE category_id IS NOT NULL 
    AND category_id NOT IN (SELECT id FROM mic_mtaani_categories);

SELECT 'mic_mtaani_articles with missing authors' as issue, COUNT(*) as count
FROM mic_mtaani_articles 
WHERE author_id IS NOT NULL 
    AND author_id NOT IN (SELECT id FROM users);

-- Check basic table row counts
SELECT 'films' as table_name, COUNT(*) as row_count FROM films
UNION ALL
SELECT 'services', COUNT(*) FROM services  
UNION ALL
SELECT 'talent', COUNT(*) FROM talent
UNION ALL
SELECT 'users', COUNT(*) FROM users
ORDER BY table_name;