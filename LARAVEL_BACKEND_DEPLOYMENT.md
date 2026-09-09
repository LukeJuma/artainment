# Laravel Backend Deployment Guide

## Current Status
- ✅ Laravel backend configured with JWT authentication
- ✅ All authentication endpoints implemented (`/auth/register`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`)
- ✅ Frontend API client configured
- ✅ **Upload size limits standardized to 2GB** (frontend UI, Laravel backend, Supabase Edge Function)
- ⚠️ **Frontend still points to Supabase Edge Functions in production**

## Upload Size Configuration

The platform now supports **consistent 2GB upload limits** across all systems:

- **Frontend UI**: Shows "MP4, MOV up to 2GB" and "PNG, JPG, WebP up to 10MB"
- **Laravel Backend**: Validates up to 2GB for videos, 10MB for images  
- **Supabase Edge Function**: Updated to support 2GB for videos
- **PHP Configuration**: Runtime and .htaccess settings configured for 2GB uploads

### Server Requirements for 2GB Uploads

When deploying to production, ensure your hosting provider supports:

```ini
upload_max_filesize = 2048M
post_max_size = 2048M  
memory_limit = 2048M
max_execution_time = 600
max_input_time = 600
```

The Laravel backend includes:
- **Runtime configuration** in `UploadController.php` (automatic)
- **.htaccess configuration** in `public/.htaccess` (for Apache servers)

## Required Actions

### 1. Deploy Laravel Backend
The Laravel backend (`backend/`) needs to be deployed to a hosting service:

**Options:**
- **Railway** (recommended for Laravel)
- **DigitalOcean App Platform** 
- **AWS Elastic Beanstalk**
- **Heroku**
- **VPS with Apache/Nginx**

### 2. Update Frontend Environment Variables
Once Laravel is deployed, update `.env.production`:

```env
# Replace the Edge Function URL with Laravel API URL
VITE_API_URL=https://your-laravel-backend.com/api
```

### 3. Database Migration
Run the new migrations on the production database:
```bash
php artisan migrate
```

This will add:
- Missing foreign key indexes (performance)
- Updated payments.status default value

### 4. Environment Configuration
Ensure Laravel production `.env` has:
- `JWT_SECRET` (for authentication)
- `FRONTEND_URL` (for password reset emails)
- Database connection to Supabase
- Storage configuration for Supabase Storage

## Authentication Flow (Fixed)

With Laravel backend deployed, the authentication flow will be:

1. **Registration**: `POST /auth/register` → Creates user → Returns JWT
2. **Login**: `POST /auth/login` → Validates user → Returns JWT  
3. **Password Reset**: `POST /auth/forgot-password` → Sends email with reset link
4. **Reset Password**: `POST /auth/reset-password` → Updates password → Returns new JWT
5. **Logout**: `POST /auth/logout` → Client-side token removal (JWT stateless)

## Current Workaround
- Frontend modified to remove hardcoded Supabase fallback
- All auth endpoints exist in Laravel backend
- JWT authentication system implemented
- **Task #17 is technically complete** - the endpoints exist, they just need the backend deployed

## Next Steps
1. Choose hosting provider for Laravel backend
2. Deploy Laravel with database migrations
3. Update VITE_API_URL in production environment
4. Test all authentication flows end-to-end