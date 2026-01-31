-- ============================================
-- Supabase Storage Bucket Setup for Resumes
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL script
-- 4. Click "Run" to execute
--
-- This will create the 'resumes' bucket and set up all necessary policies
-- ============================================

-- Create the resumes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public can read resumes" ON storage.objects;

-- Policy: Allow authenticated users to upload their own resumes
-- Files are stored as: {user-id}/{filename}
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (name ~ ('^' || auth.uid()::text || '/'))
);

-- Policy: Allow users to read their own resumes
CREATE POLICY "Users can read their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (name ~ ('^' || auth.uid()::text || '/'))
);

-- Policy: Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (name ~ ('^' || auth.uid()::text || '/'))
);

-- Policy: Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (name ~ ('^' || auth.uid()::text || '/'))
);

-- Policy: Allow public read access (if you want resumes to be publicly accessible)
CREATE POLICY "Public can read resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

