# Namecheap Shared Hosting Deployment Guide

## Prerequisites
- ✅ Namecheap shared hosting account with cPanel access
- ✅ Domain pointed to Namecheap nameservers
- ✅ PHP 8.1+ enabled in cPanel
- ✅ PostgreSQL database (or MySQL as fallback)
- ✅ SSL certificate enabled

## Deployment Architecture

### Frontend (React/Vite)
- **Location**: `public_html/` (root domain) or `public_html/subdomain/`
- **Type**: Static build files
- **CDN**: Namecheap's built-in CDN (if available)

### Backend (Laravel API)
- **Location**: `public_html/api/` or subdomain `api.yourdomain.com`
- **Type**: PHP Laravel application
- **Database**: PostgreSQL on Supabase (external) or Namecheap MySQL

---

## Step 1: Frontend Deployment (React Build)

### 1.1 Build Frontend for Production
```bash
# On your local machine
npm run build
```

### 1.2 Upload to Namecheap
1. **Via cPanel File Manager**:
   - Go to File Manager in cPanel
   - Navigate to `public_html/`
   - Upload the contents of `dist/` folder to root OR
   - Create subdirectory (e.g., `app/`) and upload there

2. **Via FTP/SFTP** (Alternative):
   ```bash
   # Upload dist/ contents to public_html/
   # Use FileZilla, WinSCP, or cPanel File Manager
   ```

### 1.3 Configure Frontend Environment
Update `.env.production`:
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_URL=https://yourdomain.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Step 2: Backend Deployment (Laravel API)

### 2.1 Prepare Laravel for Shared Hosting

#### Option A: API Subdirectory (Recommended)
Create this structure in `public_html/`:
```
public_html/
├── index.html              # Frontend (React build)
├── assets/                 # Frontend assets
├── api/                    # Laravel API
│   ├── index.php          # Laravel entry point
│   ├── .htaccess          # URL rewriting
│   └── ...                # Laravel files
└── artainment-backend/     # Laravel application (outside web root)
    ├── app/
    ├── bootstrap/
    ├── config/
    └── ...
```

#### Option B: API Subdomain
- Create subdomain `api.yourdomain.com` in cPanel
- Point it to a separate folder with Laravel installation

### 2.2 Laravel Files Structure

**Step 1**: Upload Laravel files
- Upload entire `backend/` folder as `artainment-backend/` (outside public_html)
- Copy `backend/public/*` contents to `public_html/api/`

**Step 2**: Update paths in `public_html/api/index.php`:
```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Updated paths for shared hosting
require __DIR__.'/../../artainment-backend/vendor/autoload.php';

$app = require_once __DIR__.'/../../artainment-backend/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
```

### 2.3 Configure .htaccess for Laravel

Create `public_html/api/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# PHP Configuration
<IfModule mod_php.c>
    php_value upload_max_filesize 2048M
    php_value post_max_size 2048M
    php_value memory_limit 512M
    php_value max_execution_time 600
    php_value max_input_time 600
</IfModule>

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

---

## Step 3: Database Configuration

### Option A: Continue with Supabase (Recommended)
Keep your existing Supabase PostgreSQL database:

**artainment-backend/.env**:
```env
APP_NAME="The Artainment"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Frontend URL  
FRONTEND_URL=https://yourdomain.com

# Supabase Database (Keep existing)
DB_CONNECTION=pgsql
DB_HOST=aws-0-eu-west-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.your-project-ref
DB_PASSWORD=your-supabase-db-password
DB_SSLMODE=require

# Storage (Keep Supabase Storage)
FILESYSTEM_DISK=public
FILESYSTEM_PUBLIC_DRIVER=s3
AWS_ACCESS_KEY_ID=your-supabase-storage-key
AWS_SECRET_ACCESS_KEY=your-supabase-storage-secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=media
AWS_ENDPOINT=https://your-project.supabase.co/storage/v1/s3
AWS_USE_PATH_STYLE_ENDPOINT=true

# JWT Configuration
JWT_SECRET=your-256-bit-jwt-secret
JWT_EXPIRATION=86400

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="The Artainment"

# Cache & Session (File-based for shared hosting)
CACHE_STORE=file
SESSION_DRIVER=file
```

### Option B: Namecheap MySQL Database
If you prefer local database:

1. **Create MySQL Database in cPanel**:
   - Go to MySQL Databases
   - Create database: `username_artainment`
   - Create user and assign to database
   - Note the credentials

2. **Update .env**:
```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=username_artainment
DB_USERNAME=username_dbuser
DB_PASSWORD=your-db-password
```

3. **Run Migrations** (via terminal or script):
```bash
php artisan migrate --force
```

---

## Step 4: Laravel Optimization for Shared Hosting

### 4.1 Optimize Laravel
```bash
# Run these commands via SSH or create a script
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```

### 4.2 Create Deployment Script

**deploy.php** (upload to artainment-backend/):
```php
<?php
// Simple deployment script for shared hosting
echo "Starting deployment...\n";

// Clear caches
exec('php artisan config:clear');
exec('php artisan route:clear');  
exec('php artisan view:clear');

// Install/update dependencies
exec('composer install --optimize-autoloader --no-dev');

// Cache for production
exec('php artisan config:cache');
exec('php artisan route:cache');
exec('php artisan view:cache');

// Run migrations
exec('php artisan migrate --force');

echo "Deployment complete!\n";
?>
```

---

## Step 5: Namecheap-Specific Configurations

### 5.1 PHP Version
- Go to cPanel → Select PHP Version
- Choose PHP 8.1 or higher
- Enable required extensions:
  - ✅ pdo_pgsql (for PostgreSQL)
  - ✅ pdo_mysql (for MySQL fallback)
  - ✅ curl
  - ✅ gd
  - ✅ mbstring
  - ✅ openssl
  - ✅ zip

### 5.2 Cron Jobs (Optional)
Set up Laravel scheduler:
```bash
# Add to cPanel Cron Jobs
*/5 * * * * cd /home/username/public_html/artainment-backend && php artisan schedule:run
```

### 5.3 SSL Certificate
- Enable Let's Encrypt SSL in cPanel
- Force HTTPS redirects

---

## Step 6: Frontend Configuration Updates

### 6.1 Update API URLs
Since your backend will be at `/api/`, update the frontend:

**src/lib/api.ts** (if not already configured):
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://yourdomain.com/api'
```

### 6.2 Build and Deploy Frontend
```bash
# Build with production environment
npm run build

# Upload dist/ contents to public_html/
# Your React app will be at https://yourdomain.com
# API will be at https://yourdomain.com/api
```

---

## Step 7: Testing & Verification

### 7.1 Test API Endpoints
```bash
# Test basic API connectivity
curl https://yourdomain.com/api/health

# Test authentication
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 7.2 Test Frontend
1. Visit `https://yourdomain.com`
2. Check browser console for API connection
3. Test user registration/login flow
4. Verify video streaming works

---

## Troubleshooting

### Common Issues

**1. 500 Internal Server Error**
- Check `.htaccess` syntax
- Verify file permissions (755 for folders, 644 for files)
- Check PHP error logs in cPanel

**2. API Routes Not Working**
- Ensure mod_rewrite is enabled
- Check `.htaccess` in `/api/` folder
- Verify Laravel paths in `index.php`

**3. Database Connection Issues**
- Verify Supabase credentials
- Check SSL requirements
- Test connection with simple PHP script

**4. Upload Issues**
- Check PHP upload limits in `.htaccess`
- Verify directory permissions
- Test with smaller files first

### Support Resources
- **Namecheap Support**: Submit ticket for server-specific issues
- **Laravel Docs**: https://laravel.com/docs/deployment
- **cPanel Docs**: Available in your cPanel dashboard

---

## Security Checklist

- ✅ SSL certificate enabled and forced
- ✅ `.env` files protected via `.htaccess`
- ✅ Database credentials secured
- ✅ JWT secrets rotated
- ✅ File upload validation active
- ✅ Security headers configured
- ✅ Directory browsing disabled

---

**Your Artainment platform is now ready for Namecheap shared hosting deployment!** 🚀

**Next Steps**: Follow the steps above to deploy both frontend and backend to your Namecheap account.