# 🚀 Deploy Updated Edge Function

## Option 1: Redeploy via Dashboard (RECOMMENDED)
1. Go to https://supabase.com/dashboard
2. Select your project 
3. Go to "Edge Functions"
4. Find "api" function
5. Click "Deploy" or "Redeploy"
6. Wait for completion

## Option 2: Deploy via CLI (if needed)
If you have Supabase CLI installed:

```bash
# Navigate to project root
cd C:\Users\HP\Downloads\artainment

# Login to Supabase (if not already)
npx supabase login

# Link project (if not already linked)
npx supabase link --project-ref etjkivwwnqafyphqamgh

# Deploy the Edge Function
npx supabase functions deploy api
```

## Option 3: Manual Function Creation
If redeployment doesn't work:

1. Go to Edge Functions in Supabase Dashboard
2. **Delete** the existing "api" function
3. **Create New Function** called "api"
4. **Copy the entire content** from `supabase/functions/api/index.ts`
5. **Paste and Deploy**

## ✅ Verification
After deployment:
1. **Refresh your site:** the-artainment.vercel.app
2. **Check console:** Should show no CORS errors
3. **Content loads:** Films, talent, news should all appear

The CORS headers have been updated in the Edge Function to properly support your Vercel domain.