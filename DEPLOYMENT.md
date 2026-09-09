# Artainment Platform Deployment Guide

## Architecture Overview

**Current Setup (After Security Audit):**
- 🎯 **Laravel Backend** - Canonical API (JWT auth, protected streaming, admin endpoints)
- 🌐 **React Frontend** - Vite build deployed on Vercel
- 🗄️ **Supabase PostgreSQL** - Primary database with existing data
- 📁 **Supabase Storage** - Media files (videos, images)

## Production Deployment Steps

### 1. Laravel Backend Deployment

**Requirements:**
- PHP 8.1+
- PostgreSQL database access
- Composer
- Web server (Apache/Nginx)

**Recommended Platforms:**
- Railway.app (easy Laravel deployment)
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Heroku (with PostgreSQL add-on)

**Configuration:**
```bash
# 1. Set environment variables
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=pgsql
DB_HOST=your-supabase-db-host
DB_DATABASE=postgres
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

# 2. Install dependencies and optimize
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Run migrations
php artisan migrate
```

### 2. Frontend Configuration

Update `.env.production`:
```env
VITE_API_URL=https://your-laravel-backend.com/api
VITE_APP_URL=https://your-domain.com
```

Deploy to Vercel:
```bash
npm run build
# Deploy via Vercel CLI or GitHub integration
```

### 3. Security Checklist

- ✅ JWT authentication implemented
- ✅ XSS protection (DOMPurify)
- ✅ Protected video streaming
- ✅ Input validation and sanitization
- ✅ Audit logging system
- ✅ Draft content filtering
- ✅ Credentials rotated

## Database Schema

The production database should have these tables:
- `users` (with soft deletes)
- `films`, `series`, `podcasts` (with soft deletes)
- `payments`, `subscriptions` (with soft deletes)
- `talent` (singular), `news_articles` (as configured)
- `audit_logs` (for security monitoring)
- All foreign key indexes applied

## Video Streaming Setup

**Laravel Backend Handles:**
- Authentication verification
- Subscription entitlement checks
- HTTP Range requests (seeking support)
- Secure file serving with chunked streaming

**Frontend Integration:**
- Direct `<video src=...>` with JWT token
- No memory-intensive blob downloads
- Progressive loading support

## Monitoring & Maintenance

**Audit Logs:**
- Admin login tracking
- CRUD operation logging
- Security event monitoring

**Performance:**
- Database indexes on all foreign keys
- N+1 query elimination
- Chunked video streaming (8MB chunks)

**Security:**
- Regular credential rotation
- Token blacklist implementation (optional)
- Rate limiting on auth endpoints
- Input validation on all endpoints

## Legacy Components (Deprecated)

- ❌ **Supabase Edge Function** (`supabase/functions/api/index.ts`) - Can be removed after Laravel deployment
- ❌ **php-backend/** - Removed (dead code)
- ❌ Historical `.md` fix reports - Cleaned up

## Support

For deployment issues:
1. Check Laravel logs for backend errors
2. Verify database connectivity
3. Confirm Supabase Storage permissions
4. Test JWT token generation/validation
5. Validate video streaming with Range requests

**The platform is production-ready with enterprise-grade security!** 🚀