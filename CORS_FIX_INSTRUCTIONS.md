# 🚨 CORS FIX - IMMEDIATE SOLUTION

## PROBLEM IDENTIFIED
Your site is getting CORS errors when trying to fetch data from Supabase:
```
Access to fetch at 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/home' 
from origin 'https://the-artainment.vercel.app' has been blocked by CORS policy
```

## 🛠️ SOLUTION 1: REDEPLOY EDGE FUNCTION (RECOMMENDED)

### Via Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project 
3. Go to **Edge Functions** in the sidebar
4. Find the **"api"** function
5. Click **"Redeploy"** or **"Deploy"** button
6. Wait for deployment to complete

### Via CLI (if available):
```bash
supabase functions deploy api
```

## 🔧 SOLUTION 2: ALTERNATIVE API ENDPOINT

If redeployment doesn't work immediately, try using the direct Supabase REST API:

### Update Frontend Temporarily
In `src/lib/api.ts`, change the API URL to:
```typescript
const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/rest/v1';
```

But this would require authentication changes, so **Solution 1 is preferred**.

## 🧪 SOLUTION 3: TEST WITH DIFFERENT DOMAIN

The API works fine (we tested it), so it's specifically a CORS issue with the new domain.

### Quick Test:
Try accessing the API directly in a new browser tab:
`https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/home`

This should return JSON data with films, services, etc.

## ✅ VERIFICATION

After redeploying the Edge Function:
1. **Refresh your site**: `the-artainment.vercel.app`
2. **Check browser console**: Should show no CORS errors
3. **Verify data loads**: Films and services should appear
4. **Test API**: `/deployment-test.html` should show green checkmarks

## 📞 IMMEDIATE ACTION NEEDED

**Please go to Supabase Dashboard and redeploy the "api" Edge Function.**

This is a common issue when deploying to new domains - the Edge Function needs to be redeployed to pick up CORS changes properly.

The site layout is working perfectly - we just need to fix this CORS issue!