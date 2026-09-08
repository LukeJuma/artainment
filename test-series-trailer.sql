-- Test if video_url column exists in series table
-- Run this in Supabase SQL Editor to check column existence

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'series' 
  AND column_name = 'video_url';

-- If the above returns no results, run:
-- ALTER TABLE series ADD COLUMN video_url TEXT;

-- Test adding a trailer URL to Mboka series
-- UPDATE series SET video_url = 'https://www.youtube.com/watch?v=SAMPLE_TRAILER_ID' WHERE title = 'Mboka';