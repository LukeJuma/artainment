# Step-by-Step Deployment Guide

## Phase 1: Supabase Setup (Backend + Database)

### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `artainment-backend`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users (e.g., East US)
5. Click "Create new project" (takes ~2 minutes)
6. Save your project credentials:
   - Project URL: `https://[project-ref].supabase.co`
   - API Key: Found in Settings > API
   - Database Password: The one you just created

### Step 1.2: Configure Database Connection
1. In your Supabase project, go to **Settings > Database**
2. Note the connection details:
   - Host: `db.[project-ref].supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: Your database password

### Step 1.3: Setup Storage Bucket
1. Go to **Storage** in your Supabase dashboard
2. Click "New bucket"
3. Bucket details:
   - **Name**: `media`
   - **Public bucket**: ✅ Yes (for public file access)
4. Click "Create bucket"
5. Go to **Settings > Storage** to get S3 credentials:
   - Access Key ID
   - Secret Access Key
   - Endpoint: `https://[project-ref].supabase.co/storage/v1/s3`

### Step 1.4: Configure Backend Environment
1. Copy the environment template:
   ```bash
   cp deployment-configs/supabase-env.example backend/.env
   ```

2. Update `backend/.env` with your actual values:
   ```env
   # Replace with your actual values
   DB_HOST=db.your-project-ref.supabase.co
   DB_PASSWORD=your-actual-db-password
   SUPABASE_ACCESS_KEY=your-s3-access-key
   SUPABASE_SECRET_KEY=your-s3-secret-key
   FILESYSTEM_PUBLIC_URL=https://your-project-ref.supabase.co/storage/v1/object/public/media
   ```

### Step 1.5: Deploy Database Schema
```bash
cd backend

# Install dependencies
composer install --optimize-autoloader

# Generate app key
php artisan key:generate

# Run migrations (make sure your .env is configured)
php artisan migrate --force

# Seed initial data (optional)
php artisan db:seed
```

## Phase 2: Vercel Setup (Frontend)

### Step 2.1: Prepare Frontend Configuration
1. Create production environment file:
   ```bash
   cp deployment-configs/frontend-env.example .env.production
   ```

2. Update `.env.production` with your Supabase URL:
   ```env
   VITE_API_BASE_URL=https://your-project-ref.supabase.co/functions/v1/api
   VITE_APP_URL=https://your-app-name.vercel.app
   ```

### Step 2.2: Setup GitHub Repository (if not done)
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment setup"

# Add remote (replace with your GitHub repo)
git remote add origin https://github.com/yourusername/artainment.git

# Push to GitHub
git push -u origin main
```

### Step 2.3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables in Vercel:
   - Click "Environment Variables"
   - Add each variable from your `.env.production`:
     ```
     VITE_API_BASE_URL = https://your-project-ref.supabase.co/functions/v1/api
     VITE_APP_URL = https://your-app-name.vercel.app
     ```

6. Click "Deploy"
7. Wait for deployment (usually 1-2 minutes)
8. Note your Vercel URL: `https://your-app-name.vercel.app`

## Phase 3: Backend API Deployment

### Option A: Supabase Edge Functions (Recommended for Free Tier)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Deploy the API function:
   ```bash
   supabase functions deploy api --no-verify-jwt
   ```

### Option B: Alternative Free Hosting (Railway, Render, etc.)

If you prefer to host the Laravel backend elsewhere:

1. **Railway** (500 hours/month free):
   - Connect GitHub repo
   - Set environment variables
   - Deploy backend folder

2. **Render** (750 hours/month free):
   - Create web service
   - Connect GitHub repo
   - Set build/start commands

## Phase 4: Configuration Updates

### Step 4.1: Update Backend CORS
Update your backend `.env` with the actual Vercel URL:
```env
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-actual-vercel-url.vercel.app
```

### Step 4.2: Update Frontend API URL
If your backend URL changed, update your frontend:
```env
VITE_API_BASE_URL=https://your-actual-backend-url.com/api
```

### Step 4.3: Redeploy Both Services
1. **Backend**: Push changes and redeploy
2. **Frontend**: Push changes to trigger Vercel redeploy

## Phase 5: Testing & Verification

### Step 5.1: Test Database Connection
```bash
cd backend
php artisan tinker

# Test database
>>> User::count()
>>> DB::connection()->getPdo()
```

### Step 5.2: Test Storage
```bash
# Test file upload
>>> Storage::disk('s3')->put('test.txt', 'Hello World');
>>> Storage::disk('s3')->exists('test.txt');
>>> Storage::disk('s3')->url('test.txt');
```

### Step 5.3: Test API Endpoints
```bash
# Test basic endpoint
curl https://your-backend-url.com/api/films

# Test with authentication
curl -H "Authorization: Bearer your-token" https://your-backend-url.com/api/user
```

### Step 5.4: Test Frontend
1. Visit your Vercel URL
2. Check browser console for errors
3. Test API calls in Network tab
4. Verify file uploads work
5. Test user authentication flow

## Phase 6: Production Optimizations

### Step 6.1: Enable Production Caching
```bash
cd backend

# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views  
php artisan view:cache
```

### Step 6.2: Setup Monitoring
1. **Supabase**: Bookmark usage dashboard
2. **Vercel**: Setup usage alerts
3. **Application**: Add error logging

### Step 6.3: Performance Testing
```bash
# Test API performance
curl -w "@curl-format.txt" -o /dev/null -s https://your-api-url.com/api/films

# Frontend performance
# Use Lighthouse or PageSpeed Insights
```

## Troubleshooting Common Issues

### Database Connection Issues
```bash
# Test connection
php artisan migrate:status

# If migrations fail, check:
# 1. Database credentials in .env
# 2. SSL mode (should be 'require')
# 3. Host format (db.project-ref.supabase.co)
```

### Storage Issues
```bash
# Test storage configuration
php artisan tinker
>>> Storage::disk('s3')->put('test.txt', 'test content');

# If fails, check:
# 1. S3 credentials in .env
# 2. Bucket exists and is public
# 3. Endpoint URL format
```

### CORS Issues
```bash
# Check CORS configuration
# 1. FRONTEND_URL in backend .env
# 2. SANCTUM_STATEFUL_DOMAINS setting
# 3. Browser network tab for preflight requests
```

### Build Issues
```bash
# Vercel build fails
# 1. Check build logs in Vercel dashboard
# 2. Verify package.json scripts
# 3. Check environment variables
# 4. Test build locally: npm run build
```

## Success Checklist
- [ ] Supabase project created and configured
- [ ] Database migrations completed
- [ ] Storage bucket setup and accessible
- [ ] Backend deployed and responding
- [ ] Frontend deployed to Vercel
- [ ] API endpoints working
- [ ] File uploads functioning
- [ ] User authentication working
- [ ] CORS properly configured
- [ ] Performance optimized
- [ ] Monitoring setup

## Next Steps
- Monitor usage dashboards
- Setup automated backups
- Configure custom domain (if desired)
- Setup CI/CD pipeline
- Add error tracking (Sentry, etc.)

Congratulations! Your Artainment app is now live on Supabase + Vercel! 🎉