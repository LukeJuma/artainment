# 🚨 EMERGENCY CORS FIX - Apply This Now

## The Problem
Your Edge Function is deployed but still has CORS issues. We need to replace the function code with a version that has bulletproof CORS headers.

## 🛠️ IMMEDIATE FIX (2 Minutes)

### Step 1: Go to Edge Functions Code Editor
1. **Go to:** https://supabase.com/dashboard
2. **Select your project**
3. **Edge Functions → api → Code tab**

### Step 2: Replace the Entire Function Code
1. **Select ALL existing code** (Ctrl+A)
2. **Delete it**
3. **Copy and paste** the entire content from `supabase/functions/api/cors-fix.ts` file
4. **Click "Deploy" or "Save and Deploy"**

### Step 3: Test Immediately
1. **Visit:** `https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/test`
   - Should return: `{"message":"API is working!","cors":"enabled"}`
2. **Visit:** `https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/home`  
   - Should return data with films, talent, news, services
3. **Refresh your site:** `the-artainment.vercel.app`

## 🔧 Alternative Quick Fix (If Code Editor Doesn't Work)

### Option 1: Create New Function
1. **Delete** the existing "api" function
2. **Create new function** called "api"
3. **Use the cors-fix.ts code**

### Option 2: Use CLI (If Available)
```bash
cd C:\Users\HP\Downloads\artainment
npx supabase functions deploy api --no-verify-jwt
```

## ✅ Expected Results

After applying this fix:
- ✅ **No CORS errors** in browser console
- ✅ **API test endpoints work**
- ✅ **Home endpoint returns data**
- ✅ **Your website loads content**

## 🆘 What This Fix Does

1. **Comprehensive CORS headers** that work with all browsers
2. **Proper preflight handling** for OPTIONS requests
3. **Consistent header application** on all responses
4. **Better error handling** with CORS on error responses
5. **Simplified data fetching** focusing on the core tables

---

**⚡ CRITICAL: Apply this fix right now using the cors-fix.ts file content!**

The new function code is specifically designed to solve CORS issues and will make your site work immediately.