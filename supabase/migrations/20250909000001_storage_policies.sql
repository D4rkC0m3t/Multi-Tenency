-- Storage RLS Policies for merchant-logos bucket
-- Run this after creating the bucket with the previous migration

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow merchants to upload logos to their own folder
CREATE POLICY "Merchants can upload logos to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'merchant-logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT m.id::text 
    FROM merchants m 
    JOIN profiles p ON p.merchant_id = m.id 
    WHERE p.id = auth.uid()
  )
);

-- Policy 2: Allow merchants to update their own logos
CREATE POLICY "Merchants can update their own logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'merchant-logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT m.id::text 
    FROM merchants m 
    JOIN profiles p ON p.merchant_id = m.id 
    WHERE p.id = auth.uid()
  )
);

-- Policy 3: Allow merchants to delete their own logos
CREATE POLICY "Merchants can delete their own logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'merchant-logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT m.id::text 
    FROM merchants m 
    JOIN profiles p ON p.merchant_id = m.id 
    WHERE p.id = auth.uid()
  )
);

-- Policy 4: Allow public read access to all merchant logos (for invoices, reports)
CREATE POLICY "Public read access to merchant logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'merchant-logos');
