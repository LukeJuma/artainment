-- Remove only obvious test/dummy data (conservative approach)
-- This keeps potentially real content and only removes clearly fake data

-- Remove obvious test contacts
DELETE FROM contacts 
WHERE name IN ('Test User', 'John Doe', 'Jane Doe')
   OR email LIKE '%test.com%'
   OR email LIKE '%example.com%'
   OR message LIKE 'This is a test%'
   OR message = 'Test message';

-- Remove test films (be careful - only remove obvious test entries)
DELETE FROM films 
WHERE title IN ('Test Film', 'Updated Test Film', 'Sample Movie', 'Dummy Film')
   OR title LIKE 'Test %'
   OR synopsis LIKE 'This is a test%';

-- Remove obvious test news
DELETE FROM news_articles 
WHERE title LIKE 'Test %'
   OR title IN ('Sample Article', 'Dummy News')
   OR body LIKE 'This is a test%';

-- Remove obvious sample Mic Mtaani businesses (keep real-sounding ones)
DELETE FROM mic_mtaani_businesses 
WHERE name IN ('Test Business', 'Sample Shop', 'Dummy Store')
   OR name LIKE 'Test %'
   OR description LIKE 'This is a test%';

-- Remove obvious test Mic Mtaani articles
DELETE FROM mic_mtaani_articles 
WHERE headline LIKE 'Test %'
   OR headline IN ('Sample Article', 'Test News', 'Dummy Article')
   OR body LIKE 'This is a test%';

-- Remove obvious test events
DELETE FROM mic_mtaani_events 
WHERE title LIKE 'Test %'
   OR title IN ('Test Event', 'Sample Meeting', 'Dummy Workshop');

-- Remove obvious test categories
DELETE FROM mic_mtaani_categories 
WHERE name LIKE 'Test %'
   OR name IN ('Test Category', 'Sample Category', 'Dummy Section');

-- Remove test users (but keep admin and real users)
DELETE FROM users 
WHERE email != 'admin@theartainment.co.ke'
  AND (name LIKE 'Test %'
       OR email LIKE '%test.com%'
       OR email LIKE '%example.com%');

-- Success message
SELECT 'Obvious test/dummy data has been removed!' as cleanup_status,
       'Real-looking content has been preserved' as note;