# 🚀 Quick Bucket Setup - Fix "Bucket not found" Error

## ⚡ Fastest Method: Supabase Dashboard UI

### Step 1: Create the Bucket
1. Open your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **"Storage"** in the left sidebar (folder icon)
4. Click the **"New bucket"** button (top right)
5. Fill in the form:
   ```
   Name: resumes
   Public bucket: ✅ CHECK THIS BOX (very important!)
   File size limit: 5242880
   Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
   ```
6. Click **"Create bucket"**

### Step 2: Set Up Policies (Required for Security)
1. Still in Supabase Dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the ENTIRE SQL code from the file: `database/setup-storage-bucket.sql`
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify
1. Go back to **Storage**
2. You should see the "resumes" bucket listed
3. Try uploading a resume in your app - it should work now!

---

## 🔧 Alternative: SQL Only Method

If you prefer to do everything via SQL:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this complete SQL:

```sql
-- Create the resumes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  5242880,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public can read resumes" ON storage.objects;

-- Create policies
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (name ~ ('^' || auth.uid()::text || '/'))
);

CREATE POLICY "Users can read their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (name ~ ('^' || auth.uid()::text || '/'))
);

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (name ~ ('^' || auth.uid()::text || '/'))
);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (name ~ ('^' || auth.uid()::text || '/'))
);

CREATE POLICY "Public can read resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');
```

3. Click **"Run"**

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Bucket "resumes" appears in Storage section
- [ ] Bucket is marked as "Public"
- [ ] Policies are created (check Storage → Policies tab)
- [ ] Try uploading a resume - no more "bucket not found" error

---

## 🆘 Still Having Issues?

1. **Check bucket name**: Must be exactly `resumes` (lowercase, no spaces)
2. **Check if bucket is public**: Go to Storage → resumes → Settings → Make sure "Public bucket" is enabled
3. **Check policies**: Go to Storage → Policies → Should see 5 policies for "resumes" bucket
4. **Refresh your app**: After creating the bucket, refresh your browser

