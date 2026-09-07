# 🗄️ Create Supabase Storage Bucket

## 🎯 **WHY YOU NEED THIS**

The upload error "Failed to upload file to storage" happens because:
- ❌ No storage bucket exists in your Supabase project
- ❌ Bucket has wrong permissions  
- ❌ Bucket is private instead of public

## 🚀 **STEP-BY-STEP SOLUTION**

### **Step 1: Create Storage Bucket**
1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/etjkivwwnqafyphqamgh
2. **Go to Storage**: Left sidebar → "Storage" → "Buckets"
3. **Click "New bucket"**
4. **Configure bucket**:
   - **Name**: `uploads`
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - **File size limit**: 50MB (or leave default)
   - **Allowed MIME types**: Leave empty (allows all types)
5. **Click "Create bucket"**

### **Step 2: Set Bucket Policies**
After creating the bucket:

1. **Click on your "uploads" bucket**
2. **Go to "Policies" tab**  
3. **Click "Add policy"**
4. **Choose "For full customization"**
5. **Paste this policy**:

```sql
-- Allow everyone to read files
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated upload access" ON storage.objects 
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'uploads');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated update access" ON storage.objects 
FOR UPDATE USING (auth.role() = 'authenticated' AND bucket_id = 'uploads');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated delete access" ON storage.objects 
FOR DELETE USING (auth.role() = 'authenticated' AND bucket_id = 'uploads');
```

6. **Click "Review"** then **"Save policy"**

### **Step 3: Alternative - Use Policy Templates**
Instead of custom SQL, you can use Supabase templates:

1. **Click "New Policy"** 
2. **Select template**: "Allow public read access"
3. **Add another policy**
4. **Select template**: "Allow authenticated uploads"

---

## 🧪 **TEST IF IT WORKS**

### **Method 1: Test Script**
```bash
node test-storage-bucket.js
```

### **Method 2: Manual Test**
1. **Go to admin panel**: https://the-artainment.vercel.app/login
2. **Login** as admin
3. **Go to Movies → Add Movie**
4. **Try uploading** a poster image
5. **Should work now!**

---

## 🔧 **TROUBLESHOOTING**

### **If uploads still fail:**

#### **Problem: "Bucket not found"**
- ✅ Make sure bucket name is exactly `uploads`
- ✅ Check bucket exists in Storage dashboard

#### **Problem: "Access denied"**  
- ✅ Make sure bucket is marked as **Public**
- ✅ Check you added the storage policies above
- ✅ Verify policies are **enabled**

#### **Problem: "File too large"**
- ✅ This is normal - just use smaller files or wait for the fix deployment
- ✅ Images: under 10MB
- ✅ Videos: will be 500MB after fix deployment

### **Quick Fix Commands**
If policies aren't working, try this in Supabase SQL Editor:

```sql
-- Enable storage for your project
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS but allow public access
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Add basic policies
DROP POLICY IF EXISTS "Public read" ON storage.objects;
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Authenticated write" ON storage.objects;  
CREATE POLICY "Authenticated write" ON storage.objects FOR ALL USING (auth.role() = 'authenticated' AND bucket_id = 'uploads');
```

---

## ✅ **VERIFICATION**

After completing these steps, you should be able to:
- ✅ **Upload movie posters** (images up to 10MB)
- ✅ **Upload actor photos** 
- ✅ **Upload trailer videos** (after deploying the size fix)
- ✅ **See files in Storage dashboard**
- ✅ **Files are publicly accessible via URL**

---

## 🎯 **WHAT'S NEXT**

1. **First**: Create the storage bucket (above steps)
2. **Then**: Deploy the upload function fix (from `fix-upload-issues.md`)  
3. **Result**: Full upload functionality with proper file size limits

**This will completely resolve your upload issues!** 🚀