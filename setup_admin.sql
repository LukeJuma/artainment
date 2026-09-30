-- Simple setup script for existing database
-- Only adds missing admin functionality

-- Step 1: Add missing columns to users table (if they don't exist)
DO $$ 
BEGIN
    -- Add is_admin column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add password column if it doesn't exist (for JWT auth)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
        ALTER TABLE users ADD COLUMN password VARCHAR(255);
    END IF;
END $$;

-- Step 2: Create audit_logs table if it doesn't exist (for security logging)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_id BIGINT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Insert admin user (only if not exists)
INSERT INTO users (email, password, name, is_admin)
SELECT 'admin@theartainment.co.ke', '8b7df143d91c716ecfa5fc1730022f6b421b05cedee8fd52b1fc65a96030ad52', 'System Administrator', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@theartainment.co.ke');

-- Step 4: Enable RLS on key tables (safely)
DO $$
BEGIN
    -- Enable RLS on users
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- Enable RLS on other tables if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'films') THEN
        ALTER TABLE films ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'series') THEN
        ALTER TABLE series ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if RLS is already enabled
        NULL;
END $$;

-- Step 5: Drop existing policies if they exist (to avoid conflicts)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Service role bypass RLS on users" ON users;
    DROP POLICY IF EXISTS "Service role bypass RLS on films" ON films;
    DROP POLICY IF EXISTS "Service role bypass RLS on series" ON series;
    DROP POLICY IF EXISTS "Service role bypass RLS on episodes" ON episodes;
    DROP POLICY IF EXISTS "Service role bypass RLS on podcasts" ON podcasts;
    DROP POLICY IF EXISTS "Service role bypass RLS on audit_logs" ON audit_logs;
    DROP POLICY IF EXISTS "Public can read films" ON films;
    DROP POLICY IF EXISTS "Public can read series" ON series;
    DROP POLICY IF EXISTS "Public can read episodes" ON episodes;
    DROP POLICY IF EXISTS "Public can read podcasts" ON podcasts;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if policies don't exist
        NULL;
END $$;

-- Step 6: Create policies for service role (allows Edge Functions to work)
CREATE POLICY "Service role bypass RLS on users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass RLS on films" ON films
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass RLS on series" ON series
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass RLS on episodes" ON episodes
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass RLS on podcasts" ON podcasts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass RLS on audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Step 7: Create public read policies (allows frontend to fetch data)
CREATE POLICY "Public can read films" ON films
    FOR SELECT USING (true);

CREATE POLICY "Public can read series" ON series
    FOR SELECT USING (true);

CREATE POLICY "Public can read episodes" ON episodes
    FOR SELECT USING (true);

CREATE POLICY "Public can read podcasts" ON podcasts
    FOR SELECT USING (true);