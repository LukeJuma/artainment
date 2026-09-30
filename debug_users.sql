-- Debug: Check what's in the users table
SELECT 
    id,
    email,
    name,
    is_admin,
    password IS NOT NULL as has_password,
    LENGTH(password) as password_length,
    created_at
FROM users 
WHERE email = 'admin@theartainment.co.ke';

-- Also check all users to see the structure
SELECT 
    id,
    email,
    name,
    is_admin,
    password IS NOT NULL as has_password
FROM users 
LIMIT 5;