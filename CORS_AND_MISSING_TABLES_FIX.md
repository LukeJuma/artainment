# 🚨 URGENT: Fix CORS Errors and Missing Tables

## Current Issues
1. **CORS Errors** - Frontend cannot access Supabase Edge Function API
2. **Missing Database Tables** - `talent` and `news_articles` tables don't exist (404 errors)

## 🛠️ STEP 1: Add Missing Database Tables

### Option A: Via Supabase Dashboard (RECOMMENDED)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the sidebar
4. Create a **New Query**
5. Copy and paste the entire content from `apply-migration.sql` file (created in project root)
6. Click **Run** to execute the migration
7. **Verify:** Go to **Table Editor** and check that `talent` and `news_articles` tables now exist

### Option B: Via psql (if you have it installed)
```bash
psql "postgresql://postgres.etjkivwwnqafyphqamgh:Q_UChkn8n8yYj.k@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require" -f apply-migration.sql
```

## 🛠️ STEP 2: Fix CORS Issues

### Redeploy Edge Function
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** in the sidebar
4. Find the **"api"** function
5. Click **"Deploy"** or **"Redeploy"** button
6. Wait for deployment to complete (should take 1-2 minutes)

## 🧪 STEP 3: Test the Fix

### Quick API Test
1. Visit: `https://the-artainment.vercel.app/api-debug.html`
2. **Expected Result:** All 5 API tests should show ✅ SUCCESS
3. **If still failing:** Check browser console for specific error messages

### Manual API Test
Open these URLs in a new browser tab (should return JSON data):
- `https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/home`
- `https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/actors`
- `https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/news`

## ✅ VERIFICATION CHECKLIST

After completing both steps:
- [ ] **Database Tables:** `talent` and `news_articles` tables exist in Supabase
- [ ] **API Endpoints:** All endpoints return data (not 404 errors)
- [ ] **CORS Headers:** No CORS errors in browser console
- [ ] **Frontend Data:** Films, services, talent, and news load on the site
- [ ] **Test Page:** `/api-debug.html` shows all green checkmarks

## 📱 Expected Results

Once fixed, your site should show:
- **Home Page:** Featured films, services, talent profiles
- **Films Page:** List of completed films
- **Talent Page:** Actor/crew profiles with photos
- **News Page:** Published news articles
- **No Console Errors:** Clean browser console

## 🔄 If Still Not Working

### Check Supabase Project Status:
1. Go to **Supabase Dashboard > Project Settings**
2. Verify project is **Active** (not paused)
3. Check **Database** tab - ensure connection is healthy

### Alternative CORS Fix:
If redeployment doesn't work, try:
1. **Delete** the existing Edge Function
2. **Create new** Edge Function called "api"
3. **Deploy** the updated `supabase/functions/api/index.ts` file

## 🆘 Emergency Fallback

If Edge Functions continue to fail, we can temporarily switch to:
1. **Supabase REST API** (direct database access)
2. **Laravel Backend** (if you prefer to run PHP locally)

But the Edge Function approach is preferred for the free tier.

---

**⚡ PRIORITY:** Complete Step 1 (database tables) first, then Step 2 (CORS fix).

The site layout and functionality are perfect - we just need these two infrastructure fixes!