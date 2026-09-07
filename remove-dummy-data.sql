-- Remove all dummy/sample/test data from the database
-- This script will clean up the database by removing any test/sample content

-- =============================================================================
-- REMOVE TEST/DUMMY CONTACTS
-- =============================================================================
DELETE FROM contacts 
WHERE name ILIKE '%test%' 
   OR name ILIKE '%dummy%'
   OR name ILIKE '%sample%'
   OR email ILIKE '%test%'
   OR email ILIKE '%example.com%'
   OR message ILIKE '%test%'
   OR message ILIKE '%sample%'
   OR name IN ('James Kamau', 'Amina Hassan', 'Peter Otieno', 'Grace Wanjiku', 'Test User');

-- =============================================================================
-- REMOVE TEST/DUMMY FILMS
-- =============================================================================
DELETE FROM films 
WHERE title ILIKE '%test%' 
   OR title ILIKE '%dummy%'
   OR title ILIKE '%sample%'
   OR synopsis ILIKE '%test%'
   OR title = 'Updated Test Film';

-- =============================================================================
-- REMOVE TEST/DUMMY NEWS ARTICLES
-- =============================================================================
DELETE FROM news_articles 
WHERE title ILIKE '%test%' 
   OR title ILIKE '%dummy%'
   OR title ILIKE '%sample%'
   OR title ILIKE '%The Artainment Wins%'
   OR body ILIKE '%test%'
   OR body ILIKE '%sample%';

-- =============================================================================
-- REMOVE SAMPLE MIC MTAANI BUSINESSES
-- =============================================================================
DELETE FROM mic_mtaani_businesses 
WHERE name ILIKE '%mama njeri%'
   OR name ILIKE '%techhub nakuru%'
   OR name ILIKE '%test%'
   OR name ILIKE '%sample%'
   OR name ILIKE '%dummy%'
   OR description ILIKE '%sample%'
   OR location ILIKE '%test%';

-- =============================================================================
-- REMOVE SAMPLE MIC MTAANI ARTICLES
-- =============================================================================
DELETE FROM mic_mtaani_articles 
WHERE headline ILIKE '%test%'
   OR headline ILIKE '%sample%'
   OR headline ILIKE '%community center%'
   OR headline ILIKE '%nakuru%'
   OR body ILIKE '%test%'
   OR body ILIKE '%sample%'
   OR excerpt ILIKE '%test%';

-- =============================================================================
-- REMOVE SAMPLE MIC MTAANI EVENTS
-- =============================================================================
DELETE FROM mic_mtaani_events 
WHERE title ILIKE '%test%'
   OR title ILIKE '%sample%'
   OR title ILIKE '%nakuru cultural%'
   OR title ILIKE '%business workshop%'
   OR description ILIKE '%test%'
   OR description ILIKE '%sample%';

-- =============================================================================
-- CLEAN UP SAMPLE MIC MTAANI CATEGORIES (keep core categories, remove test ones)
-- =============================================================================
DELETE FROM mic_mtaani_categories 
WHERE name ILIKE '%test%'
   OR name ILIKE '%sample%'
   OR name ILIKE '%dummy%'
   OR description ILIKE '%test%'
   OR description ILIKE '%sample%';

-- =============================================================================
-- REMOVE ANY TEST TALENT/ACTORS
-- =============================================================================
DELETE FROM talent 
WHERE name ILIKE '%test%'
   OR name ILIKE '%sample%'
   OR name ILIKE '%dummy%'
   OR bio ILIKE '%test%'
   OR bio ILIKE '%sample%';

-- =============================================================================
-- REMOVE ANY TEST SERVICES
-- =============================================================================
DELETE FROM services 
WHERE title ILIKE '%test%'
   OR title ILIKE '%sample%'
   OR title ILIKE '%dummy%'
   OR description ILIKE '%test%'
   OR description ILIKE '%sample%';

-- =============================================================================
-- REMOVE ANY TEST TESTIMONIALS
-- =============================================================================
DELETE FROM testimonials 
WHERE name ILIKE '%test%'
   OR name ILIKE '%sample%'
   OR name ILIKE '%dummy%'
   OR quote ILIKE '%test%'
   OR quote ILIKE '%sample%'
   OR role ILIKE '%test%';

-- =============================================================================
-- REMOVE ANY TEST GALLERY IMAGES
-- =============================================================================
DELETE FROM gallery_images 
WHERE caption ILIKE '%test%'
   OR caption ILIKE '%sample%'
   OR caption ILIKE '%dummy%'
   OR image_url ILIKE '%test%'
   OR image_url ILIKE '%placeholder%';

-- =============================================================================
-- REMOVE ANY TEST PODCASTS
-- =============================================================================
DELETE FROM podcasts 
WHERE title ILIKE '%test%'
   OR title ILIKE '%sample%'
   OR title ILIKE '%dummy%'
   OR description ILIKE '%test%'
   OR description ILIKE '%sample%';

-- =============================================================================
-- REMOVE ANY TEST SERIES
-- =============================================================================
DELETE FROM series 
WHERE title ILIKE '%test%'
   OR title ILIKE '%sample%'
   OR title ILIKE '%dummy%'
   OR synopsis ILIKE '%test%'
   OR synopsis ILIKE '%sample%';

-- =============================================================================
-- REMOVE ANY TEST PRODUCTIONS
-- =============================================================================
DELETE FROM productions 
WHERE title ILIKE '%test%'
   OR title ILIKE '%sample%'
   OR title ILIKE '%dummy%'
   OR description ILIKE '%test%'
   OR description ILIKE '%sample%';

-- =============================================================================
-- CLEAN UP ANY TEST USERS (BUT KEEP ADMIN)
-- =============================================================================
DELETE FROM users 
WHERE email != 'admin@theartainment.co.ke'
  AND (name ILIKE '%test%'
       OR name ILIKE '%sample%'
       OR name ILIKE '%dummy%'
       OR email ILIKE '%test%'
       OR email ILIKE '%example.com%');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify the cleanup worked:

-- SELECT 'contacts' as table_name, COUNT(*) as remaining_count FROM contacts
-- UNION ALL
-- SELECT 'films', COUNT(*) FROM films
-- UNION ALL
-- SELECT 'news_articles', COUNT(*) FROM news_articles
-- UNION ALL
-- SELECT 'mic_mtaani_businesses', COUNT(*) FROM mic_mtaani_businesses
-- UNION ALL
-- SELECT 'mic_mtaani_articles', COUNT(*) FROM mic_mtaani_articles
-- UNION ALL
-- SELECT 'mic_mtaani_events', COUNT(*) FROM mic_mtaani_events
-- UNION ALL
-- SELECT 'mic_mtaani_categories', COUNT(*) FROM mic_mtaani_categories
-- UNION ALL
-- SELECT 'talent', COUNT(*) FROM talent
-- UNION ALL
-- SELECT 'services', COUNT(*) FROM services
-- UNION ALL
-- SELECT 'testimonials', COUNT(*) FROM testimonials
-- UNION ALL
-- SELECT 'gallery_images', COUNT(*) FROM gallery_images
-- UNION ALL
-- SELECT 'podcasts', COUNT(*) FROM podcasts
-- UNION ALL
-- SELECT 'series', COUNT(*) FROM series
-- UNION ALL
-- SELECT 'users', COUNT(*) FROM users;

-- Success message
SELECT 'All dummy/sample/test data has been removed successfully!' as cleanup_status;