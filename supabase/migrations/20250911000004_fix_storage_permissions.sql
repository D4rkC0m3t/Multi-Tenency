-- This migration must be run as a superuser (postgres role)
-- It fixes permissions for the storage schema

-- 1. Switch to postgres user context
SET LOCAL ROLE postgres;

-- 2. Create the storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- 3. Grant all privileges on the storage schema to authenticated users
GRANT ALL PRIVILEGES ON SCHEMA storage TO authenticated, service_role, anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO authenticated, service_role, anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO authenticated, service_role, anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA storage TO authenticated, service_role, anon;

-- 4. Make sure the storage schema is in the search path
ALTER DATABASE postgres SET search_path TO "$user", public, storage;

-- 5. Create the storage.buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text NOT NULL,
  name text NOT NULL,
  owner uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false,
  avif_autodetection boolean DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[],
  owner_id uuid,
  PRIMARY KEY (id)
);

-- 6. Create the storage.objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id text,
  name text,
  owner uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb,
  path_tokens text[],
  version text,
  owner_id uuid,
  CONSTRAINT bucketname_objname UNIQUE (bucket_id, name)
);

-- 7. Grant permissions on tables
GRANT ALL PRIVILEGES ON TABLE storage.buckets TO authenticated, service_role, anon;
GRANT ALL PRIVILEGES ON TABLE storage.objects TO authenticated, service_role, anon;

-- 8. Create or replace the product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
ON CONFLICT (id) 
DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 9. Create or replace the merchant-logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'merchant-logos',
  'merchant-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
ON CONFLICT (id) 
DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 10. Create or replace storage helper function
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT string_to_array(trim(both '/' from name), '/')
  WHERE name IS NOT NULL;
$$;

-- 11. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 12. Create or replace storage policies
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload in their folder" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
  
  -- Create new policies
  -- Allow public read access to all files in public buckets
  CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'merchant-logos'));
  
  -- Allow users to view their own files
  CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (auth.role() = 'authenticated');
  
  -- Allow users to upload files to their own folder
  CREATE POLICY "Users can upload in their folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      bucket_id = 'product-images' OR
      (bucket_id = 'merchant-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
    )
  );
  
  -- Allow users to update their own files
  CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      auth.uid() = owner OR 
      (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text) OR
      (bucket_id = 'merchant-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
    )
  );
  
  -- Allow users to delete their own files
  CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    auth.role() = 'authenticated' AND (
      auth.uid() = owner OR 
      (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text) OR
      (bucket_id = 'merchant-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
    )
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- 13. Create a function to get public URL
CREATE OR REPLACE FUNCTION storage.get_public_url(bucket_id text, path text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT format('%s/storage/v1/object/public/%s/%s', 
    current_setting('app.settings.supabase_url', true),
    bucket_id,
    path
  );
$$;

-- 14. Reset to default role
RESET ROLE;
