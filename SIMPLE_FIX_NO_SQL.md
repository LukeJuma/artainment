# 🔧 SIMPLE FIX - No SQL Required!

## ❌ **The SQL Error**
`ERROR: 42501: must be owner of table objects` means Supabase free tier doesn't allow storage policy creation via SQL.

## ✅ **SOLUTION: Use Dashboard Instead**

### **🗄️ STEP 1: Create Storage Bucket (2 minutes)**

1. **Open**: https://supabase.com/dashboard/project/etjkivwwnqafyphqamgh/storage/buckets
2. **Click "New bucket"**
3. **Configure**:
   - Name: `uploads`
   - ✅ **Public bucket** (IMPORTANT!)
   - File size limit: `500` MB
   - MIME types: Leave empty
4. **Click "Create bucket"**

### **📋 STEP 2: Set Policies (1 minute)**

1. **Click on "uploads" bucket** you just created
2. **Go to "Policies" tab**  
3. **Click "Add policy" → "Get started quickly"**
4. **Add these templates**:
   - ✅ "Allow public read access"
   - ✅ "Allow authenticated users to upload files"
5. **Apply both templates**

### **🚀 STEP 3: Deploy Function (2 minutes)**

1. **Open**: https://supabase.com/dashboard/project/etjkivwwnqafyphqamgh/functions/api
2. **Click "Edit Function"**
3. **Delete all code** (Ctrl+A, Delete)
4. **Copy entire contents** of `supabase/functions/api/index.ts`
5. **Paste and click "Deploy"**

### **✅ STEP 4: Test (30 seconds)**

```bash
node verify-upload-fix.js
```

**Expected result**: "🎉 SUCCESS! Upload is working perfectly!"

---

## 🎯 **WHAT YOU'LL GET:**

✅ **Images**: Up to 10MB (posters, photos)
✅ **Videos**: Up to 500MB (trailers, full films)  
✅ **Audio**: Up to 100MB (podcasts)
✅ **Professional error messages**
✅ **Reliable file storage**

---

## 🔧 **If Bucket Creation Fails:**

Try creating with a different name:
- Use **"files"** instead of "uploads"  
- Same settings (public, 500MB limit)
- Function will auto-detect the correct bucket

---

## ⚡ **TOTAL TIME: 5 minutes**

Just follow the 4 steps above in order. No SQL required!

**Your upload issues will be completely fixed!** 🚀