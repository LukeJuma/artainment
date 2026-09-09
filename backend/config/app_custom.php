<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Frontend URL
    |--------------------------------------------------------------------------
    |
    | This value is used for password reset emails and other frontend redirects.
    | It should point to your React application URL.
    |
    */
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:8443'),

    /*
    |--------------------------------------------------------------------------
    | Seed Admin Password
    |--------------------------------------------------------------------------
    |
    | This value is used by the database seeder to create the admin user.
    | Only used during initial setup.
    |
    */
    'seed_admin_password' => env('SEED_ADMIN_PASSWORD'),

    /*
    |--------------------------------------------------------------------------
    | JWT Configuration
    |--------------------------------------------------------------------------
    |
    | JWT secret key and expiration settings for custom authentication.
    |
    */
    'jwt_secret' => env('JWT_SECRET', base64_encode('your-256-bit-secret-key-here-change-in-production')),
    'jwt_expiration' => env('JWT_EXPIRATION', 3600 * 24), // 24 hours in seconds
];