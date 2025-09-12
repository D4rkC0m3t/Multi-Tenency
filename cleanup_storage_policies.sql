-- Clean up duplicate and conflicting storage policies for product-images bucket
-- This will resolve the storage upload issues

-- Drop all existing product-images policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to upload to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files in product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files in product-images" ON storage.objects;
DROP POLICY IF EXISTS "product-images-upload-policy" ON storage.objects;
DROP POLICY IF EXISTS "product-images-select-policy" ON storage.objects;
DROP POLICY IF EXISTS "product-images-update-policy" ON storage.objects;
DROP POLICY IF EXISTS "product-images-delete-policy" ON storage.objects;

-- Create simplified storage policies that allow authenticated users full access
-- This is appropriate for a business application where users should access all product images

-- Allow authenticated users to upload product images
CREATE POLICY "product_images_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Allow authenticated users to view product images  
CREATE POLICY "product_images_select" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Allow authenticated users to update product images
CREATE POLICY "product_images_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    ) WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Allow authenticated users to delete product images
CREATE POLICY "product_images_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Verify the cleanup worked
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' 
AND policyname LIKE '%product%image%';
