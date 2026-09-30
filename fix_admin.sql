-- Environment-based admin user setup (no hardcoding!)
-- This uses the same salt that's configured in the Edge Function environment

-- First, let's see what we have
SELECT email, is_admin, password FROM users WHERE email = 'admin@theartainment.co.ke';

-- Delete existing admin if it exists (to start fresh)
DELETE FROM users WHERE email = 'admin@theartainment.co.ke';

-- Insert admin user with ENVIRONMENT-BASED password hash
-- This matches the PASSWORD_SALT environment variable in Supabase
INSERT INTO users (email, password, name, is_admin) 
VALUES (
    'admin@theartainment.co.ke',
    encode(sha256('SecureAdmin2024!#$artainment-secure-salt-2024'::bytea), 'hex'),
    'System Administrator',
    TRUE
);

-- Verify the admin user was created with correct hash length (64 chars for SHA256)
SELECT 
    id,
    email, 
    name,
    is_admin,
    LENGTH(password) as password_length,
    password
FROM users 
WHERE email = 'admin@theartainment.co.ke';