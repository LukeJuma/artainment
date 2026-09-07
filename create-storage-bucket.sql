-- Create storage bucket and set up policies for file uploads
-- Run this in Supabase SQL Editor

-- Create the uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads', 'uploads', true, 524288000, NULL)  -- 500MB limit, all file types allowed
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 524288000,
  allowed_mime_types = NULL;

-- Enable Row Level Security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access" ON storage.objects;

-- Create policy for public read access
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'uploads');

-- Create policy for authenticated uploads
CREATE POLICY "Authenticated upload access" ON storage.objects 
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'uploads');

-- Create policy for authenticated updates
CREATE POLICY "Authenticated update access" ON storage.objects 
FOR UPDATE USING (auth.role() = 'authenticated' AND bucket_id = 'uploads');

-- Create policy for authenticated deletes
CREATE POLICY "Authenticated delete access" ON storage.objects 
FOR DELETE USING (auth.role() = 'authenticated' AND bucket_id = 'uploads');

-- Verify the bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id = 'uploads';

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%access';

SELECT 'Storage bucket "uploads" created successfully with proper policies!' as status;