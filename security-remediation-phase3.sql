-- ARTAINMENT SECURITY REMEDIATION - PHASE 3 (ADMIN-ONLY CONTENT)
-- Execute these changes after Phase 1 & 2 to secure admin functionality

-- =============================================================================
-- PHASE 3A: ADMIN-ONLY CONTENT MANAGEMENT
-- =============================================================================

-- Enable RLS for admin-only content
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- News articles: Public read published, admins manage all
CREATE POLICY "public_read_published_news" ON news_articles
FOR SELECT TO public
USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "admin_manage_news" ON news_articles
FOR ALL TO authenticated
USING (is_admin_user());

-- Notifications: Admin-only
CREATE POLICY "admin_only_notifications" ON notifications
FOR ALL TO authenticated
USING (is_admin_user());

-- Settings: Admin-only  
CREATE POLICY "admin_only_settings" ON settings
FOR ALL TO authenticated
USING (is_admin_user());

-- Tickets: Public can view active tickets, admins manage all
CREATE POLICY "public_read_active_tickets" ON tickets
FOR SELECT TO public
USING (status = 'active');

CREATE POLICY "admin_manage_tickets" ON tickets
FOR ALL TO authenticated
USING (is_admin_user());

-- =============================================================================
-- PHASE 3B: MIC MTAANI COMMUNITY PLATFORM
-- =============================================================================

-- Enable RLS for Mic Mtaani tables
ALTER TABLE mic_mtaani_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_journalists ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Categories: Public read active, admin manage
CREATE POLICY "public_read_mm_categories" ON mic_mtaani_categories
FOR SELECT TO public
USING (is_active = true);

CREATE POLICY "admin_manage_mm_categories" ON mic_mtaani_categories
FOR ALL TO authenticated
USING (is_admin_user());

-- Articles: Public read published, admin manage
CREATE POLICY "public_read_published_mm_articles" ON mic_mtaani_articles
FOR SELECT TO public  
USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "admin_manage_mm_articles" ON mic_mtaani_articles
FOR ALL TO authenticated
USING (is_admin_user());

-- Journalists: Public read active, admin manage
CREATE POLICY "public_read_active_journalists" ON mic_mtaani_journalists
FOR SELECT TO public
USING (is_active = true);

CREATE POLICY "admin_manage_journalists" ON mic_mtaani_journalists  
FOR ALL TO authenticated
USING (is_admin_user());

-- Comments: Public read approved, public submit, admin manage
CREATE POLICY "public_read_approved_mm_comments" ON mic_mtaani_comments
FOR SELECT TO public
USING (is_approved = true);

CREATE POLICY "public_submit_mm_comments" ON mic_mtaani_comments
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "admin_manage_mm_comments" ON mic_mtaani_comments
FOR ALL TO authenticated
USING (is_admin_user());

-- Submissions: Public submit, admin manage
CREATE POLICY "public_submit_mm_content" ON mic_mtaani_submissions
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "admin_manage_mm_submissions" ON mic_mtaani_submissions
FOR ALL TO authenticated  
USING (is_admin_user());

-- Events: Public read active/upcoming, admin manage
CREATE POLICY "public_read_mm_events" ON mic_mtaani_events
FOR SELECT TO public
USING (status IN ('active', 'upcoming') AND is_featured = true);

CREATE POLICY "admin_manage_mm_events" ON mic_mtaani_events
FOR ALL TO authenticated
USING (is_admin_user());

-- Businesses: Public read featured, admin manage  
CREATE POLICY "public_read_featured_businesses" ON mic_mtaani_businesses
FOR SELECT TO public
USING (is_featured = true);

CREATE POLICY "admin_manage_mm_businesses" ON mic_mtaani_businesses
FOR ALL TO authenticated
USING (is_admin_user());

-- Newsletter: Public subscribe, admin manage
CREATE POLICY "public_mm_newsletter_subscribe" ON mic_mtaani_newsletter_subscribers
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "admin_manage_mm_newsletter" ON mic_mtaani_newsletter_subscribers
FOR ALL TO authenticated
USING (is_admin_user());

-- =============================================================================
-- VERIFICATION QUERIES  
-- =============================================================================

-- Final security audit - check all tables have RLS enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'SECURED'
        ELSE 'UNSECURED'  
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY 
    CASE WHEN rowsecurity THEN 1 ELSE 0 END,
    tablename;

-- Count total policies
SELECT 
    'Total RLS Policies Created' as metric,
    COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public';

-- Summary by table type
WITH table_categories AS (
  SELECT 
    tablename,
    CASE 
      WHEN tablename IN ('users', 'password_reset_tokens', 'sessions', 'migrations', 'cache', 'cache_locks', 'jobs', 'job_batches', 'personal_access_tokens') 
        THEN 'Laravel System'
      WHEN tablename IN ('films', 'series', 'services', 'talent', 'productions', 'testimonials', 'gallery_images', 'podcasts', 'podcast_episodes')
        THEN 'Public Content'  
      WHEN tablename IN ('subscriptions', 'payments')
        THEN 'User Private Data'
      WHEN tablename IN ('news_articles', 'notifications', 'settings', 'tickets')
        THEN 'Admin Content'
      WHEN tablename LIKE 'mic_mtaani_%'
        THEN 'Community Platform'
      ELSE 'Other'
    END as category
  FROM pg_tables 
  WHERE schemaname = 'public'
)
SELECT 
  category,
  COUNT(*) as table_count,
  COUNT(CASE WHEN rowsecurity THEN 1 END) as secured_count
FROM table_categories tc
JOIN pg_tables pt ON tc.tablename = pt.tablename AND pt.schemaname = 'public'
GROUP BY category
ORDER BY category;