# 🚀 Complete cPanel Hosting Deployment Guide

## What You Have vs What You Need

**Your Current Setup:**
- ✅ Frontend: Working on Vercel (`https://the-artainment.vercel.app`)
- ✅ Database: Working on Supabase
- ❌ Backend API: Needs to be moved from Supabase to your new hosting

**Your New Hosting Setup:**
- **Domain**: `the-artainment.vercel.app` (you can change this)
- **Hosting**: cPanel with PHP, Node.js support
- **Primary Domain**: Shows as `the-artainment.vercel.app`

## 🎯 DEPLOYMENT OPTIONS

### **OPTION A: Keep Current Setup (RECOMMENDED)**
**Easiest - Just fix the admin backend issue**

**Why Recommended:**
- Your app is already 95% working
- Just need 1 simple fix in Supabase
- No need to move anything to new hosting yet

**What to do:**
1. Fix the admin backend in Supabase (5 minutes)
2. Your app will be 100% functional
3. Later, you can gradually move to your new hosting

### **OPTION B: Move Everything to New Hosting**
**More Complex - Full migration**

**Steps needed:**
1. Setup database on new hosting
2. Deploy backend API on new hosting
3. Deploy frontend on new hosting
4. Configure domain and SSL

---

## 🚀 OPTION A: QUICK FIX (RECOMMENDED)

### Step 1: Fix Supabase Backend (5 minutes)

**What you need to do in Supabase:**

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/projects
   - Click on your project: `etjkivwwnqafyphqamgh`

2. **Go to Functions:**
   - Left sidebar → **Edge Functions** → **api**

3. **Edit the Function:**
   - Click **"api"** function
   - Click **"Edit Function"**
   - You'll see code in the editor

4. **Replace ALL the Code:**
   - **DELETE everything** in the editor
   - **COPY** the entire contents of `supabase/functions/api/index.ts` from your computer
   - **PASTE** it into the Supabase editor
   - Click **"Deploy"**

**That's it! Your admin panel will work.**

### Step 2: Test Your App
- Go to: `https://the-artainment.vercel.app/login`
- Login: `admin@theartainment.co.ke` / `Admin123!`
- Should work perfectly now!

---

## 🏗️ OPTION B: FULL HOSTING MIGRATION

### **Phase 1: Setup Your Domain**

**Current Issue:** Your primary domain shows as `the-artainment.vercel.app` which is confusing.

**Fix this:**
1. In cPanel, go to **"Subdomains"** or **"Addon Domains"**
2. Add your actual domain (what did you register?)
3. Set it as primary domain

### **Phase 2: Prepare Your Hosting**

**Check what your hosting supports:**

1. **In cPanel, look for:**
   - **"Node.js App"** or **"Setup Node.js App"**
   - **"PHP Version"** (should be 7.4+)
   - **"MySQL Databases"** 
   - **"File Manager"**

2. **If you see Node.js App:**
   - ✅ You can run the full application
   - We'll deploy as Node.js app

3. **If you DON'T see Node.js:**
   - You can still host static files
   - Backend will need to stay on Supabase

### **Phase 3: Database Setup**

**Option 3A: Create MySQL Database**
1. cPanel → **"MySQL Databases"**
2. Create database: `theaptmr_artainment`
3. Create user with full privileges
4. We'll need to convert from PostgreSQL to MySQL

**Option 3B: Keep Supabase Database**
- Easier option
- No migration needed
- Just point your new backend to existing database

### **Phase 4: Deploy Backend**

**If your hosting has Node.js:**

1. **Upload Files:**
   - cPanel → **"File Manager"**
   - Upload your project zip
   - Extract in `public_html`

2. **Setup Node.js App:**
   - cPanel → **"Setup Node.js App"**
   - Create new app
   - Point to your uploaded files
   - Install dependencies

3. **Configure Environment:**
   - Set environment variables for database connection
   - Update API URLs in frontend

### **Phase 5: Deploy Frontend**

1. **Build Production Files:**
   ```bash
   npm run build
   ```

2. **Upload to public_html:**
   - Upload contents of `dist/` or `build/` folder
   - Set index.html as main file

3. **Configure Domain:**
   - Point domain to public_html
   - Setup SSL certificate

---

## 🎯 MY RECOMMENDATION

**Start with OPTION A** (the 5-minute fix) because:

1. **Your app is already 95% working**
2. **You'll see immediate results**
3. **Learn your hosting gradually**
4. **No risk of breaking what's working**

Once your app is 100% functional, then you can:
- Learn cPanel slowly
- Gradually move components
- Keep the working version as backup

---

## 🆘 NEED HELP WITH OPTION A?

**The 5-minute fix is just:**

1. Go to: https://supabase.com/dashboard/project/etjkivwwnqafyphqamgh/functions/api
2. Click "Edit Function"
3. Select all code → Delete
4. Copy from `supabase/functions/api/index.ts` → Paste
5. Click "Deploy"

**That's it!** Your admin will work perfectly.

---

## 📞 WHAT'S YOUR HOSTING PROVIDER?

From your cPanel I can see:
- **Provider**: Appears to be a shared hosting
- **Domain**: Currently showing Vercel domain (needs fixing)

**Questions to help you:**
1. What domain did you register? (your actual website name)
2. Do you see "Node.js App" in your cPanel?
3. What hosting provider did you choose?
4. Do you want to move everything now, or just fix the current setup?

**I recommend starting with the 5-minute fix first!** 🚀