-- Add UPDATE policy for post-images storage bucket to prevent users from overwriting other users' files
CREATE POLICY "Users can update own post images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
