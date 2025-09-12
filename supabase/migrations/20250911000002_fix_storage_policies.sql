-- Fix Storage RLS Policies for merchant-logos and product-images buckets
-- This makes the storage policies more permissive for file uploads

-- First, drop existing policies
DO $$
BEGIN
  -- Drop merchant-logo policies
  DROP POLICY IF EXISTS "Merchants can upload logos to their own folder" ON storage.objects;
  DROP POLICY IF EXISTS "Merchants can update their own logos" ON storage.objects;
  DROP POLICY IF EXISTS "Merchants can delete their own logos" ON storage.objects;
  DROP POLICY IF EXISTS "Public read access to merchant logos" ON storage.objects;
  
  -- Drop product-images policies
  DROP POLICY IF EXISTS "Merchants can upload product images to their own folder" ON storage.objects;
  DROP POLICY IF EXISTS "Merchants can update their own product images" ON storage.objects;
  DROP POLICY IF EXISTS "Merchants can delete their own product images" ON storage.objects;
  DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;
END $$;

-- Create new, more permissive policies for merchant-logos
CREATE POLICY "Allow authenticated users to upload to merchant-logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'merchant-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to update their own files in merchant-logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'merchant-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to delete their own files in merchant-logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'merchant-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create new, more permissive policies for product-images
CREATE POLICY "Allow authenticated users to upload to product-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to update their own files in product-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to delete their own files in product-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access policies (unchanged)
CREATE POLICY "Public read access to merchant logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'merchant-logos');

CREATE POLICY "Public read access to product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Grant necessary permissions on storage schema
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO anon, authenticated, service_role;
