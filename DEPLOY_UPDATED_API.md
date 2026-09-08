# Deploy Updated API Function - Manual Method

## Changes Made

✅ **Enhanced Video Player with custom YouTube branding removal**
✅ **Fixed series API to include seasons+episodes relations** 
✅ **Added "Mboka" to hero section in home endpoint**
✅ **Added seasons CRUD endpoints for admin panel**
✅ **Committed all enhanced player changes**

## Manual Deployment Steps

Since CLI deployment is having issues, use the Supabase Dashboard method (Option 2) that worked before:

### 1. Go to Supabase Dashboard
- Visit https://supabase.com/dashboard
- Navigate to your project: **artainment-backend**
- Go to **Edge Functions** section

### 2. Update the `api` function
- Click on the existing `api` function
- Replace the entire code with the updated version below
- Click **Deploy** to save changes

### 3. Test the deployment
- Test the home endpoint: `https://your-project-id.supabase.co/functions/v1/api/home`
- Test series endpoint: `https://your-project-id.supabase.co/functions/v1/api/series/the-nairobi-files`
- Test seasons endpoint: `https://your-project-id.supabase.co/functions/v1/api/admin/series/1/seasons` (with admin token)

## Key Updates

### 1. Home Endpoint Now Includes:
```typescript
// Fetches series data and Mboka specifically
{ data: series }, { data: mbokaSeriesData }

// Creates hero items with films + series + Mboka
const heroItems = []
if (featuredFilm) heroItems.push({ ...featuredFilm, type: 'film' })
if (mbokaSeriesData) heroItems.push({ ...mbokaSeriesData, type: 'series' })
```

### 2. Series Endpoint Fixed:
```typescript
// Now includes seasons and episodes relations
.select(`
  *,
  seasons:seasons(
    *,
    episodes:episodes(*)
  )
`)
```

### 3. Seasons CRUD Added:
- `GET|POST /admin/series/{id}/seasons` 
- `PUT|DELETE /admin/seasons/{id}`
- `GET|POST /admin/seasons/{id}/episodes`
- `PUT|DELETE /admin/episodes/{id}`

---

## Complete Updated API Function Code

Copy and paste this entire code into your Supabase Dashboard Edge Function editor:
