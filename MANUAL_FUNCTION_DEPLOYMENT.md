# 🚀 Manual Supabase Function Deployment Guide

## 🎯 **THE PROBLEM**

The seasons API endpoints I added are not showing up because Supabase Edge Functions need **manual deployment**. Git push only updates the code repository but doesn't deploy the function to Supabase's edge network.

## ✅ **SOLUTION OPTIONS**

### **Option 1: Supabase CLI Deployment (Recommended)**

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Deploy the Function**:
   ```bash
   supabase functions deploy api --project-ref etjkivwwnqafyphqamgh
   ```

4. **Test**: Try adding a season again - should work immediately!

### **Option 2: Supabase Dashboard Deployment**

1. **Go to**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Navigate to**: Your Project → Edge Functions
3. **Click**: The `api` function
4. **Click**: "Deploy new version" or "Edit function"
5. **Upload**: The contents of `supabase/functions/api/index.ts`
6. **Deploy**: Click "Deploy"

### **Option 3: Copy-Paste Deployment**

1. **Go to**: [Supabase Dashboard](https://supabase.com/dashboard) → Functions → api
2. **Copy**: The entire contents of `supabase/functions/api/index.ts`
3. **Paste**: Replace the existing function code
4. **Deploy**: Save and deploy

---

## 🔧 **QUICK VERIFICATION**

After deployment, check if it worked:

**Test URL**: `https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/nonexistent-endpoint`

**Look for these in the available_endpoints list**:
- `GET|POST /admin/series/{id}/seasons`
- `PUT|DELETE /admin/seasons/{id}`
- `GET|POST /admin/seasons/{id}/episodes`

If you see these, the deployment worked! ✅

---

## 🎯 **WHAT HAPPENS AFTER DEPLOYMENT**

1. **Seasons creation will work** - No more "Request failed" errors
2. **Episodes management will work** - Full CRUD for episodes
3. **Debug endpoints available** - Can troubleshoot issues
4. **YouTube branding removal works** - Enhanced player with your branding

---

## 💡 **WHY THIS HAPPENS**

Supabase Edge Functions are deployed to Deno Deploy edge network, which is separate from your Git repository. The deployment process:

1. **Git push** → Updates source code ✅
2. **Manual deploy** → Pushes to Supabase edge network ❌ (Missing step)
3. **Function available** → Users can access new endpoints ✅

This is why the old endpoints work (they're deployed) but new ones don't (not deployed yet).

---

## 🚨 **IMMEDIATE WORKAROUND**

If you can't deploy right now, I can create a simplified seasons endpoint that works with the current deployment. Just let me know and I'll create a quick patch!

---

## 📞 **NEED HELP?**

If you have issues with any of these deployment methods:

1. **Share**: Screenshot of any error messages
2. **Check**: Supabase project permissions
3. **Verify**: Project reference ID is correct
4. **Alternative**: I can create a different solution approach

**Once deployed, your seasons will work perfectly! 🎬✨**