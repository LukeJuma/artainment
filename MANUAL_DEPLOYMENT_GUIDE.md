# 🚀 Manual Deployment Guide - Final Steps

## Current Status
- ✅ Frontend: Deployed and working at `https://the-artainment.vercel.app`
- ✅ Authentication: Admin login working (`admin@theartainment.co.ke` / `Admin123!`)
- ✅ Public API: All content endpoints working
- ⏳ Admin API: **Needs deployment** (function ready)
- ⏳ Mic Mtaani DB: **Needs database setup**

## Step 1: Deploy Complete Edge Function

### Method: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/etjkivwwnqafyphqamgh
   - Navigate to: **Functions** → **api**

2. **Replace Function Code**
   - Click **Edit function**
   - Delete all existing code
   - Copy the ENTIRE contents of `supabase/functions/api/index.ts`
   - Paste into the editor
   - Click **Deploy**

3. **Verify Deployment**
   - Test endpoint: `https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/test`
   - Should show admin endpoints in available_endpoints array

## Step 2: Setup Mic Mtaani Database

### Method: Supabase SQL Editor

1. **Go to SQL Editor**
   - Navigate to: **SQL** → **New query**

2. **Execute Database Setup**
   - Copy the ENTIRE contents of `setup_mic_mtaani.sql`
   - Paste into SQL editor
   - Click **Run**
   - Should create 4 new tables with sample data

3. **Verify Tables Created**
   - Navigate to: **Database** → **Tables**
   - Should see: `mic_mtaani_categories`, `mic_mtaani_articles`, `mic_mtaani_events`, `mic_mtaani_businesses`

## Step 3: Test Complete System

### 3.1 Test Admin Login & Dashboard
```bash
# Test admin login
curl -X POST https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@theartainment.co.ke","password":"Admin123!"}'

# Test admin dashboard (use token from above)
curl -H "Authorization: Bearer admin-token-XXXXX" \
  https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/admin/dashboard/stats
```

### 3.2 Test Frontend Admin Access
1. Go to: `https://the-artainment.vercel.app/login`
2. Login with: `admin@theartainment.co.ke` / `Admin123!`
3. Should redirect to: `/admin/dashboard`
4. Dashboard should load with statistics

### 3.3 Test Mic Mtaani Platform
1. Go to: `https://the-artainment.vercel.app/micmtaani`
2. Should show articles, categories, events, businesses
3. Click on articles to test individual pages

## Expected Results After Deployment

### ✅ Working Endpoints (35+ total)
**Public Content:**
- Homepage, Films, Series, Actors, Podcasts, News, Services, etc.
- All individual item pages (by slug)
- Mic Mtaani platform with full content

**Admin Panel:**
- Dashboard with statistics
- Complete CRUD operations for all content types
- User management and settings

**Authentication:**
- Admin login/logout
- Token-based authentication
- Admin panel access control

## Troubleshooting

### If Admin Endpoints Return 404:
- Edge function deployment incomplete
- Check Supabase Functions logs
- Verify function code was properly saved

### If Mic Mtaani Pages Are Empty:
- Database tables not created
- Check SQL execution in Supabase logs
- Verify tables exist in Database → Tables

### If Admin Panel Won't Load:
- Check browser console for API errors
- Verify admin token is valid
- Check CORS headers in network tab

## Success Indicators

After successful deployment, you should see:

1. **Admin Dashboard Stats**: Content counts, user counts, etc.
2. **Mic Mtaani Content**: Articles, events, businesses showing
3. **Full Admin CRUD**: Able to create/edit content via admin panel
4. **Complete API**: 35+ endpoints responding correctly

## Files Ready for Deployment

- `supabase/functions/api/index.ts` - Complete Edge Function
- `setup_mic_mtaani.sql` - Database schema and sample data

**Status**: Ready for immediate deployment! 🚀