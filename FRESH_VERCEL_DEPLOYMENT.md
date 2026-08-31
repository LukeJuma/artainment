# FRESH VERCEL DEPLOYMENT GUIDE

## 🚀 STARTING FRESH WITH NEW VERCEL PROJECT

Since the current deployment has protection issues, let's create a completely new Vercel project from scratch.

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Delete Old Project (Optional)
1. Go to https://vercel.com/dashboard
2. Find the "artaiment" project
3. Go to Settings → Advanced → Delete Project
4. Confirm deletion

### Step 2: Create New Project
1. In Vercel Dashboard, click **"Add New Project"**
2. Choose **"Import Git Repository"**
3. Find and select: `LukeJuma/artainment`
4. Click **"Import"**

### Step 3: Configure Project Settings
**Project Name:** `the-artainment` (or any name you prefer)

**Framework:** Vite (should auto-detect)

**Root Directory:** `.` (leave as default)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Step 4: Set Environment Variables
In the deployment configuration, add these environment variables:

```
VITE_API_URL = https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api
VITE_APP_URL = https://[your-new-project-name].vercel.app
VITE_SUPABASE_URL = https://etjkivwwnqafyphqamgh.supabase.co
```

**Note:** Replace `[your-new-project-name]` with the actual project name Vercel assigns.

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete (usually 1-2 minutes)
3. Get your new URL: `https://[project-name].vercel.app`

## 🔧 POST-DEPLOYMENT CONFIGURATION

### Update Frontend API Configuration
Once you have the new URL, update the API configuration:

1. **Update .env.production:**
```bash
VITE_APP_URL=https://[your-new-url].vercel.app
```

2. **Update vercel.json** (if needed):
```json
{
  "env": {
    "VITE_APP_URL": "https://[your-new-url].vercel.app"
  }
}
```

### Verify Deployment
Test these URLs:
- `https://[your-new-url].vercel.app` - Should show homepage
- `https://[your-new-url].vercel.app/films` - Should show films page
- `https://[your-new-url].vercel.app/api-test.html` - Should show API test page

## 🎯 EXPECTED RESULTS

After successful deployment, you should see:
- ✅ Homepage with film carousel
- ✅ Films page showing 6 movies
- ✅ Services page showing 6 services  
- ✅ Navigation working properly
- ✅ No login prompts or protection screens

## 📊 VERIFICATION CHECKLIST

- [ ] Homepage loads without errors
- [ ] Films data displays correctly
- [ ] Navigation menu works
- [ ] Console shows successful API calls
- [ ] Mobile responsiveness works
- [ ] Contact form submission works

## 🆘 ALTERNATIVE: CLI DEPLOYMENT

If dashboard deployment fails, use Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd c:\Users\HP\Downloads\artainment
vercel

# Follow prompts:
# - Set project name
# - Choose account/team
# - Set environment variables when prompted
```

## 🔄 UPDATING DOMAIN REFERENCE

Once you get the new URL, update the API configuration to point to it:

```typescript
// In src/lib/api.ts, update the domain check:
if (typeof window !== 'undefined' && window.location.hostname === '[new-domain].vercel.app') {
  return 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';
}
```

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:
1. **Homepage loads** with film content
2. **API calls work** (check browser console)
3. **Navigation functions** properly
4. **No authentication barriers** for public pages
5. **Content displays correctly** from Supabase

This fresh start approach will eliminate all configuration issues and give you a clean, working deployment!