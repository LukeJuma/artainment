# 🗄️ Create Storage Bucket via Dashboard (SQL Error Fix)

## ❌ **SQL Error Explained**
The error "must be owner of table objects" means you can't create storage policies via SQL in the free tier. **Use the Dashboard instead!**

## ✅ **DASHBOARD METHOD (Works 100%)**

### **Step 1: Create Bucket**
1. **Go to**: https://supabase.com/dashboard/project/etjkivwwnqafyphqamgh/storage/buckets
2. **Click "New bucket"**
3. **Fill in**:
   - **Name**: `uploads`
   - **Public bucket**: ✅ **CHECK THIS BOX**
   - **File size limit**: `500` MB
   - **Allowed MIME types**: Leave empty
4. **Click "Create bucket"**

### **Step 2: Set Policies (Easy Way)**
1. **Click on your new "uploads" bucket**
2. **Go to "Policies" tab**
3. **Click "Add policy"**
4. **Choose "Get started quickly"**
5. **Select these templates**:
   - ✅ **"Allow public read access"**
   - ✅ **"Allow authenticated users to upload files"**
6. **Click "Use this template"** for each
7. **Click "Save policy"**

### **Step 3: Alternative Policies (If templates don't work)**
If templates aren't available, click **"For full customization"** and add these **one by one**:

**Policy 1 - Public Read:**
```sql
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
```

**Policy 2 - Authenticated Upload:**
```sql
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## 🧪 **TEST IT WORKS**

After creating the bucket and policies:

```bash
node verify-upload-fix.js
```

Should show: "🎉 SUCCESS! Upload is working perfectly!"

---

## 🔧 **If It Still Doesn't Work**

### **Check Bucket Settings:**
1. **Bucket must be PUBLIC** ✅
2. **Name must be "uploads"** ✅
3. **File size limit: 500MB** ✅

### **Check Policies:**
You should see at least 2 policies:
- One for **SELECT** (read access)
- One for **INSERT** (upload access)

### **Alternative: Use Different Bucket Name**
If "uploads" doesn't work, try:
1. Create bucket named **"files"**
2. The function will auto-detect and use it
3. Same settings (public, 500MB limit)

---

## 🎯 **RESULT**

After this:
- ✅ Storage bucket exists
- ✅ Public read access enabled  
- ✅ Authenticated upload access enabled
- ✅ 500MB file size limit
- ✅ Ready for file uploads

**Then proceed to Step 2 - Deploy the function!** 🚀