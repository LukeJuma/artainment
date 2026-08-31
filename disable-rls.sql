-- Disable RLS on main content tables for API access
-- This allows the Edge Functions to read/write data using the service role

-- Core content tables
ALTER TABLE films DISABLE ROW LEVEL SECURITY;
ALTER TABLE series DISABLE ROW LEVEL SECURITY;
ALTER TABLE seasons DISABLE ROW LEVEL SECURITY;
ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE talent DISABLE ROW LEVEL SECURITY;
ALTER TABLE productions DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Podcast tables
ALTER TABLE podcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes DISABLE ROW LEVEL SECURITY;

-- Mic Mtaani tables
ALTER TABLE mic_mtaani_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_journalists DISABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_newsletter_subscribers DISABLE ROW LEVEL SECURITY;

-- Subscription and payment tables
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Settings and notifications
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- Utility tables
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;

-- Keep RLS ENABLED on sensitive tables for security:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;  -- Keep users protected
-- ALTER TABLE personal_access_tokens ENABLE ROW LEVEL SECURITY;  -- Keep tokens protected

-- Verify which tables have RLS disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;