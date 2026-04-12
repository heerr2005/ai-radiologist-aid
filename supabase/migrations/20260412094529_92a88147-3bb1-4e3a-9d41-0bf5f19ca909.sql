-- Make the scan-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'scan-images';

-- Drop the overly-permissive SELECT policy
DROP POLICY IF EXISTS "Users can view scan images" ON storage.objects;

-- Create ownership-scoped SELECT policy
CREATE POLICY "Users can view their own scan images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'scan-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);