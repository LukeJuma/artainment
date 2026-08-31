-- SECURITY REMEDIATION PHASE 2 - ACCESS CONTROL POLICIES  
-- Implementing proper access controls for existing content tables

-- Helper functions for access control  
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  -- Since we're using Edge Functions with custom JWT, not Supabase Auth
  -- This function will be used in contexts where we have authenticated users
  SELECT false; -- For now, admin access via service_role only
$$;

-- PUBLIC CONTENT TABLES (Read access for published content)
-- Only enable RLS on tables that actually exist

DO $$
BEGIN
    -- Films table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'films' AND table_schema = 'public') THEN
        ALTER TABLE films ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_completed_films" ON films FOR SELECT TO public USING (status = 'completed');
    END IF;

    -- Services table  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services' AND table_schema = 'public') THEN
        ALTER TABLE services ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_active_services" ON services FOR SELECT TO public USING (active = true);
    END IF;

    -- Gallery images table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery_images' AND table_schema = 'public') THEN
        ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_gallery" ON gallery_images FOR SELECT TO public USING (true);
    END IF;

    -- Testimonials table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials' AND table_schema = 'public') THEN
        ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_active_testimonials" ON testimonials FOR SELECT TO public USING (active = true);
    END IF;

    -- Podcasts table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcasts' AND table_schema = 'public') THEN
        ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_active_podcasts" ON podcasts FOR SELECT TO public USING (active = true);
    END IF;

    -- Series table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'series' AND table_schema = 'public') THEN
        ALTER TABLE series ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_series" ON series FOR SELECT TO public USING (true);
    END IF;

    -- Podcast episodes table (if exists)  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcast_episodes' AND table_schema = 'public') THEN
        ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_podcast_episodes" ON podcast_episodes FOR SELECT TO public USING (true);
    END IF;

    -- Productions table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productions' AND table_schema = 'public') THEN
        ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_productions" ON productions FOR SELECT TO public USING (true);
    END IF;

    -- News articles table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'news_articles' AND table_schema = 'public') THEN
        ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_published_news" ON news_articles FOR SELECT TO public USING (status = 'published' AND published_at IS NOT NULL);
    END IF;

    -- Reviews table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_submit_reviews" ON reviews FOR INSERT TO public WITH CHECK (true);
        CREATE POLICY "public_read_approved_reviews" ON reviews FOR SELECT TO public USING (is_approved = true);
    END IF;

    -- Contacts table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts' AND table_schema = 'public') THEN
        ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_submit_contacts" ON contacts FOR INSERT TO public WITH CHECK (true);
    END IF;

    -- Subscriptions table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "restrict_subscriptions_access" ON subscriptions FOR ALL TO public USING (false);
    END IF;

    -- Payments table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "restrict_payments_access" ON payments FOR ALL TO public USING (false);
    END IF;

    -- Subscription plans table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans' AND table_schema = 'public') THEN
        ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_read_active_plans" ON subscription_plans FOR SELECT TO public USING (is_active = true);
    END IF;

END $$;