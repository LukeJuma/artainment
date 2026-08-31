-- SECURITY REMEDIATION PHASE 3 - ADMIN AND COMMUNITY PLATFORM SECURITY
-- Securing remaining tables for admin-only access and community features

DO $$
BEGIN
    -- Settings table (admin-only)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings' AND table_schema = 'public') THEN
        ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "restrict_settings_access" ON settings FOR ALL TO public USING (false);
    END IF;

    -- Notifications table (admin-only)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "restrict_notifications_access" ON notifications FOR ALL TO public USING (false);
    END IF;

    -- Tickets table (public read active, admin manage)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tickets' AND table_schema = 'public') THEN
        ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_active_tickets" ON tickets FOR SELECT TO public USING (status = 'active');
    END IF;

    -- Subscribers table (public insert for newsletter signup)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers' AND table_schema = 'public') THEN
        ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_subscribe_newsletter" ON subscribers FOR INSERT TO public WITH CHECK (true);
    END IF;

    -- MIC MTAANI COMMUNITY PLATFORM TABLES
    
    -- Mic Mtaani Categories
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mic_mtaani_categories' AND table_schema = 'public') THEN
        ALTER TABLE mic_mtaani_categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_active_mm_categories" ON mic_mtaani_categories FOR SELECT TO public USING (is_active = true);
    END IF;

    -- Mic Mtaani Articles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mic_mtaani_articles' AND table_schema = 'public') THEN
        ALTER TABLE mic_mtaani_articles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_published_mm_articles" ON mic_mtaani_articles FOR SELECT TO public USING (status = 'published' AND published_at IS NOT NULL);
    END IF;

    -- Mic Mtaani Journalists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mic_mtaani_journalists' AND table_schema = 'public') THEN
        ALTER TABLE mic_mtaani_journalists ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_active_mm_journalists" ON mic_mtaani_journalists FOR SELECT TO public USING (is_active = true);
    END IF;

    -- Mic Mtaani Comments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mic_mtaani_comments' AND table_schema = 'public') THEN
        ALTER TABLE mic_mtaani_comments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_approved_mm_comments" ON mic_mtaani_comments FOR SELECT TO public USING (is_approved = true);
        CREATE POLICY "public_submit_mm_comments" ON mic_mtaani_comments FOR INSERT TO public WITH CHECK (true);
    END IF;

    -- Mic Mtaani Submissions (public can submit)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mic_mtaani_submissions' AND table_schema = 'public') THEN
        ALTER TABLE mic_mtaani_submissions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_submit_mm_content" ON mic_mtaani_submissions FOR INSERT TO public WITH CHECK (true);
    END IF;

    -- Mic Mtaani Events
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mic_mtaani_events' AND table_schema = 'public') THEN
        ALTER TABLE mic_mtaani_events ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_featured_mm_events" ON mic_mtaani_events FOR SELECT TO public USING (is_featured = true AND status IN ('active', 'upcoming'));
    END IF;

    -- Mic Mtaani Businesses
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mic_mtaani_businesses' AND table_schema = 'public') THEN
        ALTER TABLE mic_mtaani_businesses ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_featured_mm_businesses" ON mic_mtaani_businesses FOR SELECT TO public USING (is_featured = true);
    END IF;

    -- Mic Mtaani Newsletter Subscribers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mic_mtaani_newsletter_subscribers' AND table_schema = 'public') THEN
        ALTER TABLE mic_mtaani_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_mm_newsletter_signup" ON mic_mtaani_newsletter_subscribers FOR INSERT TO public WITH CHECK (true);
    END IF;

    -- Additional tables that might exist
    
    -- Seasons and Episodes (if they exist)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seasons' AND table_schema = 'public') THEN
        ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_seasons" ON seasons FOR SELECT TO public USING (true);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'episodes' AND table_schema = 'public') THEN
        ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_episodes" ON episodes FOR SELECT TO public USING (true);
    END IF;

    -- Talent table (if exists - might be named differently)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'talent' AND table_schema = 'public') THEN
        ALTER TABLE talent ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_active_talent" ON talent FOR SELECT TO public USING (active = true);
    END IF;

END $$;