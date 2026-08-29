# Deployment Guide: Supabase + Vercel (Free Tier)

## Prerequisites
- Supabase account (free tier: 500MB database, 1GB storage, 2 concurrent connections)
- Vercel account (free tier: 100GB bandwidth, unlimited static sites)
- GitHub account (for deployments)

## 1. Supabase Setup (Backend + Database)

### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose free tier
4. Note your project URL and API keys

### Step 1.2: Database Setup
```bash
# In your backend directory
cd backend
php artisan migrate --env=production
```

### Step 1.3: Enable Required Services
In Supabase Dashboard:
- **Database**: Already enabled (PostgreSQL)
- **Storage**: Create a public bucket named `media`
- **Authentication**: Enable (if needed for user management)

## 2. Backend Configuration for Supabase

### Environment Variables (Free Tier Optimized)
Update `backend/.env` with these values:

```env
# App Configuration
APP_NAME=TheArtainment
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-project.supabase.co/functions/v1/api

# Database (Supabase PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-db-password
DB_SSLMODE=require

# Storage (Supabase Storage - Free: 1GB)
FILESYSTEM_PUBLIC_DRIVER=s3
FILESYSTEM_PUBLIC_URL=https://your-project.supabase.co/storage/v1/object/public/media
SUPABASE_ACCESS_KEY=your-s3-access-key
SUPABASE_SECRET_KEY=your-s3-secret-key
SUPABASE_BUCKET=media
SUPABASE_ENDPOINT=https://your-project.supabase.co/storage/v1/s3
SUPABASE_REGION=us-east-1

# CORS (Your Vercel frontend URL)
FRONTEND_URL=https://your-app.vercel.app

# Cache/Session (Optimized for free tier)
CACHE_DRIVER=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database

# Mail (Use free service like Resend)
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=your-resend-api-key
MAIL_FROM_ADDRESS=no-reply@yourdomain.com
```

## 3. Vercel Setup (Frontend)

### Step 3.1: Frontend Environment Variables
Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1/api
VITE_APP_URL=https://your-app.vercel.app
```

### Step 3.2: Update API Configuration
Update your API service file to use the environment variable:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

## 4. Free Tier Optimizations

### Database Optimizations
- **Connection Pooling**: Use persistent connections
- **Query Optimization**: Add indexes for frequently queried fields  
- **Data Cleanup**: Regular cleanup of old data to stay under 500MB

### Storage Optimizations
- **Image Compression**: Compress images before upload
- **File Cleanup**: Delete unused files regularly
- **CDN**: Use Supabase's built-in CDN for static assets

### Performance Optimizations
- **Caching**: Aggressive caching for static data
- **Lazy Loading**: Load data on demand
- **Pagination**: Limit query results

## 5. Deployment Steps

### Backend to Supabase
1. Create Supabase Edge Function
2. Deploy Laravel code
3. Run migrations
4. Test endpoints

### Frontend to Vercel
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Configure build settings
4. Deploy

## 6. Free Tier Limits & Monitoring

### Supabase Limits
- **Database**: 500MB (monitor via dashboard)
- **Storage**: 1GB (compress images, clean old files)
- **Bandwidth**: 5GB (optimize API responses)
- **API Requests**: 50,000/month (implement caching)

### Vercel Limits  
- **Bandwidth**: 100GB (should be sufficient)
- **Build Time**: 32 concurrent builds (adequate for solo projects)
- **Serverless Functions**: 12 seconds timeout (not applicable for static)

## 7. Cost Management Tips

1. **Monitor Usage**: Check dashboards weekly
2. **Optimize Images**: Use WebP format, compress before upload
3. **Cache Aggressively**: Reduce API calls with smart caching
4. **Clean Data**: Regular cleanup of test data
5. **Efficient Queries**: Use indexes, limit results

## Next Steps
1. Set up Supabase project
2. Configure environment variables
3. Deploy backend to Supabase
4. Deploy frontend to Vercel
5. Test full stack integration

Ready to proceed with step 1?