-- Add trailer support to series table

-- Add video_url column for trailer links
ALTER TABLE series ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN series.video_url IS 'URL for series trailer video (YouTube, Vimeo, etc.)';

-- Update existing series status values to include 'active'
-- First check current status values
SELECT DISTINCT status FROM series;

-- If needed, update any 'completed' series to 'active' for better consistency
-- UPDATE series SET status = 'active' WHERE status = 'completed';

-- Sample data: Add trailer URLs to existing series (update as needed)
-- UPDATE series SET video_url = 'https://www.youtube.com/watch?v=TRAILER_ID' WHERE slug = 'your-series-slug';

-- Example for Mboka series (replace with actual trailer URL when available)
-- UPDATE series SET video_url = 'https://www.youtube.com/watch?v=MBOKA_TRAILER_ID' WHERE title = 'Mboka';