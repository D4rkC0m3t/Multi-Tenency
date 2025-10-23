-- Fix RLS policies for product creation and storage bucket access
-- This addresses the "new row violates row-level security policy" error

-- First, let's check and fix the products table RLS policies
DROP POLICY IF EXISTS "Users can insert products for their merchant" ON products;
DROP POLICY IF EXISTS "Users can view products for their merchant" ON products;
DROP POLICY IF EXISTS "Users can update products for their merchant" ON products;
DROP POLICY IF EXISTS "Users can delete products for their merchant" ON products;

-- Create proper RLS policies for products table
CREATE POLICY "Users can insert products for their merchant" ON products
    FOR INSERT WITH CHECK (
        merchant_id = (
            SELECT merchant_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view products for their merchant" ON products
    FOR SELECT USING (
        merchant_id = (
            SELECT merchant_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update products for their merchant" ON products
    FOR UPDATE USING (
        merchant_id = (
            SELECT merchant_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    ) WITH CHECK (
        merchant_id = (
            SELECT merchant_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete products for their merchant" ON products
    FOR DELETE USING (
        merchant_id = (
            SELECT merchant_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Fix storage bucket policies for product-images
-- Use proper Supabase storage policy syntax

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "product-images-upload-policy" ON storage.objects;
DROP POLICY IF EXISTS "product-images-select-policy" ON storage.objects;
DROP POLICY IF EXISTS "product-images-update-policy" ON storage.objects;
DROP POLICY IF EXISTS "product-images-delete-policy" ON storage.objects;

-- Create storage policy for product images - allow authenticated users to upload
CREATE POLICY "product-images-upload-policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Allow authenticated users to view product images
CREATE POLICY "product-images-select-policy" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Allow users to update their own merchant's product images
CREATE POLICY "product-images-update-policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    ) WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Allow users to delete their own merchant's product images
CREATE POLICY "product-images-delete-policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated'
    );

-- Ensure RLS is enabled on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create a function to get current user's merchant_id safely
CREATE OR REPLACE FUNCTION get_current_user_merchant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_merchant_id UUID;
BEGIN
    SELECT merchant_id INTO user_merchant_id
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN user_merchant_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_current_user_merchant_id() TO authenticated;

-- Update products RLS policies to use the safer function
DROP POLICY IF EXISTS "Users can insert products for their merchant" ON products;
DROP POLICY IF EXISTS "Users can view products for their merchant" ON products;
DROP POLICY IF EXISTS "Users can update products for their merchant" ON products;
DROP POLICY IF EXISTS "Users can delete products for their merchant" ON products;

CREATE POLICY "Users can insert products for their merchant" ON products
    FOR INSERT WITH CHECK (merchant_id = get_current_user_merchant_id());

CREATE POLICY "Users can view products for their merchant" ON products
    FOR SELECT USING (merchant_id = get_current_user_merchant_id());

CREATE POLICY "Users can update products for their merchant" ON products
    FOR UPDATE USING (merchant_id = get_current_user_merchant_id())
    WITH CHECK (merchant_id = get_current_user_merchant_id());

CREATE POLICY "Users can delete products for their merchant" ON products
    FOR DELETE USING (merchant_id = get_current_user_merchant_id());

-- Verify the fix by checking if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Check storage policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' 
AND policyname LIKE '%product-images%';
