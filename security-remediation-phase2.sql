-- ARTAINMENT SECURITY REMEDIATION - PHASE 2 (ACCESS CONTROL)
-- Execute these changes after Phase 1 to implement proper access controls
-- 
-- IMPORTANT: Run Phase 1 first, then test, then run Phase 2

-- =============================================================================
-- HELPER FUNCTIONS FOR ACCESS CONTROL
-- =============================================================================

-- Function to check if current user is admin (needed for policies)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM users WHERE id = auth.uid()::integer),
    false
  );
$$;

-- Function to get current user ID safely
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(auth.uid()::integer, -1);
$$;

-- =============================================================================
-- PHASE 2A: PUBLIC CONTENT TABLES (READ-ONLY ACCESS)
-- =============================================================================

-- Enable RLS for public content tables
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;

-- Public read access to published content
CREATE POLICY "public_read_films" ON films
FOR SELECT TO public
USING (status = 'completed');

CREATE POLICY "public_read_series" ON series  
FOR SELECT TO public
USING (true); -- All series are public

CREATE POLICY "public_read_seasons" ON seasons
FOR SELECT TO public  
USING (true);

CREATE POLICY "public_read_episodes" ON episodes
FOR SELECT TO public
USING (true);

CREATE POLICY "public_read_services" ON services
FOR SELECT TO public
USING (active = true);

CREATE POLICY "public_read_talent" ON talent
FOR SELECT TO public  
USING (active = true);

CREATE POLICY "public_read_productions" ON productions
FOR SELECT TO public
USING (true);

CREATE POLICY "public_read_testimonials" ON testimonials
FOR SELECT TO public
USING (active = true);

CREATE POLICY "public_read_gallery" ON gallery_images
FOR SELECT TO public
USING (true);

CREATE POLICY "public_read_podcasts" ON podcasts  
FOR SELECT TO public
USING (active = true);

CREATE POLICY "public_read_podcast_episodes" ON podcast_episodes
FOR SELECT TO public
USING (true);

-- Admin can manage all content
CREATE POLICY "admin_manage_films" ON films
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_series" ON series
FOR ALL TO authenticated  
USING (is_admin_user());

CREATE POLICY "admin_manage_seasons" ON seasons
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_episodes" ON episodes
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_services" ON services
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_talent" ON talent
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_productions" ON productions
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_testimonials" ON testimonials
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_gallery" ON gallery_images
FOR ALL TO authenticated  
USING (is_admin_user());

CREATE POLICY "admin_manage_podcasts" ON podcasts
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_podcast_episodes" ON podcast_episodes
FOR ALL TO authenticated
USING (is_admin_user());

-- =============================================================================
-- PHASE 2B: USER-GENERATED CONTENT
-- =============================================================================

-- Enable RLS for user-generated content
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Reviews: Public can submit, admins can manage, public can read approved
CREATE POLICY "public_submit_reviews" ON reviews
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "public_read_approved_reviews" ON reviews  
FOR SELECT TO public
USING (is_approved = true);

CREATE POLICY "admin_manage_reviews" ON reviews
FOR ALL TO authenticated
USING (is_admin_user());

-- Contacts: Anyone can submit, admins can read/manage
CREATE POLICY "public_submit_contacts" ON contacts
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "admin_manage_contacts" ON contacts
FOR ALL TO authenticated  
USING (is_admin_user());

-- Subscribers: Anyone can subscribe, admins can manage
CREATE POLICY "public_subscribe" ON subscribers
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "admin_manage_subscribers" ON subscribers
FOR ALL TO authenticated
USING (is_admin_user());

-- =============================================================================  
-- PHASE 2C: USER-OWNED PRIVATE DATA
-- =============================================================================

-- Enable RLS for user-owned data
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions and payments
CREATE POLICY "users_own_subscriptions" ON subscriptions
FOR SELECT TO authenticated
USING (user_id = current_user_id());

CREATE POLICY "users_own_payments" ON payments  
FOR SELECT TO authenticated
USING (user_id = current_user_id());

-- Admins can see all subscriptions and payments
CREATE POLICY "admin_manage_subscriptions" ON subscriptions
FOR ALL TO authenticated
USING (is_admin_user());

CREATE POLICY "admin_manage_payments" ON payments
FOR ALL TO authenticated
USING (is_admin_user());

-- =============================================================================
-- PHASE 2D: SUBSCRIPTION PLANS (PUBLIC READ, ADMIN WRITE)
-- =============================================================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_subscription_plans" ON subscription_plans
FOR SELECT TO public  
USING (is_active = true);

CREATE POLICY "admin_manage_subscription_plans" ON subscription_plans
FOR ALL TO authenticated
USING (is_admin_user());

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,  
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count policies created
SELECT 
    COUNT(*) as total_policies,
    COUNT(DISTINCT tablename) as tables_with_policies
FROM pg_policies
WHERE schemaname = 'public';

-- List all policies by table  
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'  
GROUP BY tablename
ORDER BY tablename;