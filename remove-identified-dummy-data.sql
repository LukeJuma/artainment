-- Remove the specific dummy data items identified in the scan
-- Based on the database scan results

-- Remove the specific test film
DELETE FROM films WHERE title = 'Updated Test Film';

-- Remove the specific test contacts  
DELETE FROM contacts 
WHERE name IN ('Test User', 'James Kamau', 'Amina Hassan', 'Peter Otieno', 'Grace Wanjiku')
   OR message LIKE 'Test message%';

-- Remove specific sample Mic Mtaani businesses
DELETE FROM mic_mtaani_businesses 
WHERE name IN ('Mama Njeri Catering Services', 'Mama Njeris Kitchen', 'TechHub Nakuru')
   OR name LIKE '%Mama Njeri%'
   OR name LIKE '%TechHub%';

-- Remove sample Mic Mtaani articles (based on content patterns)
DELETE FROM mic_mtaani_articles 
WHERE headline LIKE '%Community Center%'
   OR headline LIKE '%Nakuru%'
   OR body LIKE '%Nakuru West Community Center%'
   OR excerpt LIKE '%Nakuru West%';

-- Remove sample events
DELETE FROM mic_mtaani_events 
WHERE title IN ('Nakuru Cultural Festival', 'Small Business Workshop')
   OR description LIKE '%Nakuru County%'
   OR location LIKE '%Nakuru%';

-- Clean up the "Latest News" category if it's generic
DELETE FROM mic_mtaani_categories 
WHERE name = 'Latest News' AND description IS NULL;

-- Remove any other obvious test entries
DELETE FROM testimonials 
WHERE quote LIKE 'This is a test%'
   OR name LIKE 'Test %';

DELETE FROM services 
WHERE title LIKE 'Test %'
   OR description LIKE 'This is a test%';

DELETE FROM gallery_images 
WHERE caption LIKE 'Test %'
   OR image_url LIKE '%placeholder%';

-- Final verification
SELECT 
    'contacts' as table_name, 
    COUNT(*) as remaining_items,
    'Removed test contacts' as action
FROM contacts
UNION ALL
SELECT 'films', COUNT(*), 'Removed test films' FROM films
UNION ALL  
SELECT 'mic_mtaani_businesses', COUNT(*), 'Removed sample businesses' FROM mic_mtaani_businesses
UNION ALL
SELECT 'mic_mtaani_articles', COUNT(*), 'Removed sample articles' FROM mic_mtaani_articles
UNION ALL
SELECT 'mic_mtaani_events', COUNT(*), 'Removed sample events' FROM mic_mtaani_events;

SELECT 'Database cleanup completed successfully!' as status;