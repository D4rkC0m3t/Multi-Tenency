-- Create storage bucket for payment screenshots
-- Run this in Supabase SQL Editor or via migration

-- Create the payments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for payments bucket

-- Allow authenticated users to upload their own payment screenshots
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payments' AND
  (storage.foldername(name))[1] = 'payment-screenshots'
);

-- Allow users to view their own payment screenshots
CREATE POLICY "Users can view their payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payments' AND
  (storage.foldername(name))[1] = 'payment-screenshots'
);

-- Allow public access to payment screenshots (for admin verification)
CREATE POLICY "Public can view payment screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payments');

-- Allow service role to manage all files
CREATE POLICY "Service role can manage all payment files"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'payments');

COMMENT ON POLICY "Users can upload payment screenshots" ON storage.objects IS 'Allows authenticated users to upload payment screenshots';
COMMENT ON POLICY "Public can view payment screenshots" ON storage.objects IS 'Allows public access to view payment screenshots for verification';
