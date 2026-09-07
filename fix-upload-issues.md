# 🔧 Fix Upload Issues

## 🚨 **ISSUES IDENTIFIED:**

1. **"Failed to upload file to storage"** - Storage bucket doesn't exist or wrong permissions
2. **"File too large. Maximum size is 10MB"** - Too small for video trailers

## ✅ **SOLUTIONS IMPLEMENTED:**

### **1. Fixed File Size Limits**
- **Images**: 10MB (unchanged - appropriate for posters)
- **Videos**: **500MB** (perfect for trailers and full films)
- **Audio**: 100MB (for podcasts)

### **2. Enhanced Error Handling**
- Better error messages that explain the issue
- Helpful suggestions for fixing problems
- Automatic fallback to alternative bucket names

### **3. Storage Bucket Auto-Detection**
- Tries 'uploads' bucket first
- Falls back to 'files' bucket if needed
- Provides clear instructions if no bucket exists

---

## 🚀 **DEPLOY THE FIX**

### **Step 1: Update Supabase Function**
1. Go to: https://supabase.com/dashboard/project/etjkivwwnqafyphqamgh/functions/api
2. Click **"Edit Function"**
3. **Replace ALL code** with the updated version from `supabase/functions/api/index.ts`
4. Click **"Deploy"**

### **Step 2: Create Storage Bucket**
1. Go to: https://supabase.com/dashboard/project/etjkivwwnqafyphqamgh/storage/buckets
2. Click **"New bucket"**
3. **Bucket name**: `uploads`
4. **Public bucket**: ✅ **Enable** (so files are publicly accessible)
5. Click **"Create bucket"**

### **Step 3: Set Bucket Policies (Important!)**
1. **Go to bucket settings** (click on the uploads bucket)
2. **Go to Policies tab**
3. **Add this policy for uploads**:

```sql
-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated updates
CREATE POLICY "Allow authenticated updates" ON storage.objects 
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated deletes  
CREATE POLICY "Allow authenticated deletes" ON storage.objects 
FOR DELETE USING (auth.role() = 'authenticated');
```

OR use the **Policy Assistant**:
- **Operation**: INSERT, SELECT, UPDATE, DELETE
- **Policy name**: "Allow authenticated uploads and public access"
- **Allowed roles**: authenticated (for uploads), anon (for reads)

---

## 🎯 **WHAT'S FIXED:**

### **Before:**
- ❌ Upload fails: "Failed to upload file to storage"
- ❌ Videos rejected: "File too large. Maximum size is 10MB"
- ❌ Confusing error messages

### **After:**
- ✅ **Images up to 10MB**: Perfect for movie posters
- ✅ **Videos up to 500MB**: Great for trailers and full films  
- ✅ **Audio up to 100MB**: Perfect for podcasts
- ✅ **Clear error messages** with helpful suggestions
- ✅ **Automatic bucket detection** and fallbacks

---

## 📊 **NEW FILE SIZE LIMITS:**

| File Type | Old Limit | New Limit | Purpose |
|-----------|-----------|-----------|---------|
| Images (JPG, PNG, WebP) | 10MB | **10MB** | Movie posters, actor photos |
| Videos (MP4, MOV, AVI) | 10MB | **500MB** | Trailers, full films |
| Audio (MP3, WAV, AAC) | 10MB | **100MB** | Podcasts, audio content |

---

## 🧪 **TEST AFTER DEPLOYMENT:**

### **Test Image Upload:**
1. Go to admin → Movies → Add Movie
2. Try uploading a poster image (under 10MB)
3. Should work perfectly

### **Test Video Upload:**
1. Go to admin → Movies → Add Movie  
2. Try uploading a trailer (under 500MB)
3. Should upload successfully now

### **Test File Too Large:**
1. Try uploading a very large file (over 500MB)
2. Should get clear error: "File too large. Maximum size for video files is 500MB"

---

## 🔧 **TROUBLESHOOTING:**

### **If uploads still fail:**

1. **Check bucket exists:**
   - Go to Storage in Supabase Dashboard
   - Verify "uploads" bucket exists
   - Check it's marked as "Public"

2. **Check policies:**
   - Go to bucket → Policies tab
   - Ensure you have policies for INSERT and SELECT
   - Test with the SQL policies above

3. **Check function deployment:**
   - Verify the function updated successfully
   - Check function logs for any errors

### **Alternative: Use External Storage**
If Supabase Storage continues having issues, you can:
1. Use Cloudinary or AWS S3
2. Update the upload endpoint to use those services
3. Still get the same user experience

---

## 🎉 **RESULT:**

After this fix:
- ✅ **Image uploads work** (posters, photos)
- ✅ **Video uploads work** up to 500MB (trailers)
- ✅ **Clear, helpful error messages**
- ✅ **Professional file handling**
- ✅ **Admin can upload all content types**

**Deploy the fix and your upload issues will be resolved!** 🚀