-- Check existing constraints and table structure
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    cc.check_clause,
    tc.table_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name LIKE '%mic_mtaani%' 
    AND tc.constraint_type = 'CHECK';

-- Also check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'mic_mtaani_events'
ORDER BY ordinal_position;