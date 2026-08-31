-- SECURITY REMEDIATION PHASE 1 - CRITICAL FIXES
-- Securing Laravel system tables from unauthorized access

-- Enable RLS on critical Laravel system tables
ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_access_tokens ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies - block all public access
-- (service_role bypasses RLS, so Laravel backend continues to work)

CREATE POLICY "migrations_no_public_access" ON migrations
FOR ALL TO public
USING (false);

CREATE POLICY "users_no_public_access" ON users
FOR ALL TO public  
USING (false);

CREATE POLICY "password_reset_tokens_no_public_access" ON password_reset_tokens
FOR ALL TO public
USING (false);

CREATE POLICY "sessions_no_public_access" ON sessions  
FOR ALL TO public
USING (false);

CREATE POLICY "cache_no_public_access" ON cache
FOR ALL TO public
USING (false);

CREATE POLICY "cache_locks_no_public_access" ON cache_locks
FOR ALL TO public  
USING (false);

CREATE POLICY "jobs_no_public_access" ON jobs
FOR ALL TO public
USING (false);

CREATE POLICY "job_batches_no_public_access" ON job_batches
FOR ALL TO public
USING (false);

CREATE POLICY "personal_access_tokens_no_public_access" ON personal_access_tokens
FOR ALL TO public
USING (false);