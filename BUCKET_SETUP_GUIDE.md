# Supabase Storage Bucket Setup Guide

## Quick Setup (Choose ONE method)

### Method 1: Using Supabase Dashboard UI (Easiest)

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** or **"Create bucket"**
4. Configure the bucket:
   - **Name**: `resumes`
   - **Public bucket**: ✅ Check this (make it public)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
5. Click **"Create bucket"**
6. Go to **Storage** > **Policies** tab
7. Run the SQL from `database/setup-storage-bucket.sql` in the **SQL Editor** to set up policies

### Method 2: Using SQL Editor (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file `database/setup-storage-bucket.sql`
4. Copy the entire SQL script
5. Paste it into the SQL Editor
6. Click **"Run"** to execute

## Verify Bucket Setup

After creating the bucket, you can verify it by:

1. **Check in Dashboard**: Go to Storage and see if "resumes" bucket appears
2. **Use API endpoint**: Visit `/api/check-bucket` in your app (while logged in)
3. **Try uploading**: Attempt to upload a resume and check the error message

## Troubleshooting

### Error: "Bucket not found"

**Solution**: The bucket hasn't been created yet. Follow Method 1 or Method 2 above.

### Error: "new row violates row-level security policy"

**Solution**: The policies haven't been set up. Run the SQL script from `database/setup-storage-bucket.sql` in the SQL Editor.

### Error: "Permission denied"

**Solution**: 
1. Make sure the bucket is set to **Public**
2. Make sure you've run the policy SQL script
3. Check that you're authenticated (logged in)

## File Structure

Files are stored as: `{user-id}/{timestamp}.pdf`

Example: `abc123-def456-ghi789/1234567890.pdf`

This ensures each user can only access their own files.

