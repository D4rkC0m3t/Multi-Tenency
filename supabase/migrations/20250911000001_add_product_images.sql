-- Add product image support
-- Migration: 20250911000001_add_product_images.sql

-- Add image_url column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for product images
-- Policy 1: Allow merchants to upload images to their own folder
CREATE POLICY "Merchants can upload product images to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT m.id::text 
    FROM merchants m 
    JOIN profiles p ON p.merchant_id = m.id 
    WHERE p.id = auth.uid()
  )
);

-- Policy 2: Allow merchants to update their own product images
CREATE POLICY "Merchants can update their own product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT m.id::text 
    FROM merchants m 
    JOIN profiles p ON p.merchant_id = m.id 
    WHERE p.id = auth.uid()
  )
);

-- Policy 3: Allow merchants to delete their own product images
CREATE POLICY "Merchants can delete their own product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT m.id::text 
    FROM merchants m 
    JOIN profiles p ON p.merchant_id = m.id 
    WHERE p.id = auth.uid()
  )
);

-- Policy 4: Allow public read access to all product images
CREATE POLICY "Public read access to product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Add comment for documentation
COMMENT ON COLUMN products.image_url IS 'URL to product image stored in Supabase storage bucket';
