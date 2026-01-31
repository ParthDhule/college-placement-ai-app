/**
 * Setup script for Supabase Storage bucket
 * Run this once to create the 'resumes' bucket and set up policies
 * 
 * You can run this in two ways:
 * 1. Execute the SQL directly in Supabase Dashboard > SQL Editor
 * 2. Use the JavaScript function below in a one-time setup script
 */

// SQL to create the bucket and policies (run this in Supabase SQL Editor)
export const createBucketSQL = `
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
`;

// JavaScript function to create bucket programmatically
export async function createResumeBucket(supabase) {
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }

    const bucketExists = buckets.some(bucket => bucket.id === 'resumes')
    
    if (bucketExists) {
      console.log('Bucket "resumes" already exists')
      return { success: true, message: 'Bucket already exists' }
    }

    // Create the bucket
    // Note: This requires admin privileges or RPC function
    // For client-side, you'll need to use the SQL approach above
    // This is a placeholder showing the structure
    
    console.log('Bucket creation requires admin access.')
    console.log('Please run the SQL script in Supabase Dashboard > SQL Editor')
    
    return {
      success: false,
      message: 'Please use SQL script in Supabase Dashboard',
      sql: createBucketSQL
    }
  } catch (error) {
    console.error('Error creating bucket:', error)
    throw error
  }
}

