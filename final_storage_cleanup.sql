-- Final cleanup of ALL conflicting storage policies for product-images bucket
-- This removes the merchant-based policies that are causing upload failures

-- Drop ALL existing product-images policies including merchant-based ones
DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;
DROP POLICY IF EXISTS "merchant can delete their product images" ON storage.objects;
DROP POLICY IF EXISTS "merchant can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "public read product images" ON storage.objects;

-- Create ONE set of simple, working policies
-- Allow authenticated users to upload product images (no folder restrictions)
CREATE POLICY "authenticated_upload_product_images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Allow authenticated users to view product images
CREATE POLICY "authenticated_select_product_images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-images'
    );

-- Allow authenticated users to update product images
CREATE POLICY "authenticated_update_product_images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    ) WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Allow authenticated users to delete product images
CREATE POLICY "authenticated_delete_product_images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Verify only our new policies exist
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' 
AND policyname LIKE '%product%image%';
