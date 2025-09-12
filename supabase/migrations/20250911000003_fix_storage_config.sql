-- Fix storage bucket configurations and permissions

-- 1. Ensure the storage schema exists and is accessible
CREATE SCHEMA IF NOT EXISTS storage;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;

-- 2. Create or update the storage.buckets table if it doesn't exist
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

-- 3. Create or update the storage.objects table if it doesn't exist
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

-- 4. Create or replace the product-images bucket with correct configuration
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

-- 5. Create or replace the merchant-logos bucket with correct configuration
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

-- 6. Create or replace storage functions
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT string_to_array(trim(both '/' from name), '/');
$$;

-- 7. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO postgres, anon, authenticated, service_role;

-- 8. Set up RLS policies for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 9. Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload in their folder" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;
  DROP POLICY IF EXISTS "Public read access to merchant logos" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if policies don't exist
  RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- 10. Create new, simplified policies
-- Allow public read access to all files in public buckets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'merchant-logos') AND public = true);

-- Allow users to view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  (auth.uid() = owner OR bucket_id IN ('product-images', 'merchant-logos'))
);

-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload in their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' OR
  (bucket_id = 'merchant-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner OR 
  (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text) OR
  (bucket_id = 'merchant-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  auth.uid() = owner OR 
  (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text) OR
  (bucket_id = 'merchant-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
);

-- 11. Create storage helper functions
CREATE OR REPLACE FUNCTION storage.extension(name text) 
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT split_part(name, '.', array_length(string_to_array(name, '.'), 1));
$$;

-- 12. Create storage triggers for timestamps
CREATE OR REPLACE FUNCTION storage.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Ensure the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'set_storage_objects_updated_at'
  ) THEN
    CREATE TRIGGER set_storage_objects_updated_at
    BEFORE UPDATE ON storage.objects
    FOR EACH ROW
    EXECUTE FUNCTION storage.set_updated_at();
  END IF;
END $$;

-- 14. Create a function to get public URL
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
