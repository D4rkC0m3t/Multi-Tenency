# Storage RLS Policies for merchant-logos bucket

Since the migration cannot create RLS policies due to permissions, you need to create these policies manually in the Supabase Dashboard:

## Go to: Storage → Policies → New Policy

### 1. Allow merchants to upload logos to their own folder
```sql
-- Policy Name: Merchants can upload logos to their own folder
-- Operation: INSERT
-- Target roles: authenticated

bucket_id = 'merchant-logos' 
AND auth.uid() IS NOT NULL
AND (storage.foldername(name))[1] IN (
  SELECT m.id::text 
  FROM merchants m 
  JOIN profiles p ON p.merchant_id = m.id 
  WHERE p.id = auth.uid()
)
```

### 2. Allow merchants to update their own logos
```sql
-- Policy Name: Merchants can update their own logos
-- Operation: UPDATE
-- Target roles: authenticated

bucket_id = 'merchant-logos' 
AND auth.uid() IS NOT NULL
AND (storage.foldername(name))[1] IN (
  SELECT m.id::text 
  FROM merchants m 
  JOIN profiles p ON p.merchant_id = m.id 
  WHERE p.id = auth.uid()
)
```

### 3. Allow merchants to delete their own logos
```sql
-- Policy Name: Merchants can delete their own logos
-- Operation: DELETE
-- Target roles: authenticated

bucket_id = 'merchant-logos' 
AND auth.uid() IS NOT NULL
AND (storage.foldername(name))[1] IN (
  SELECT m.id::text 
  FROM merchants m 
  JOIN profiles p ON p.merchant_id = m.id 
  WHERE p.id = auth.uid()
)
```

### 4. Allow public read access to all merchant logos
```sql
-- Policy Name: Public read access to merchant logos
-- Operation: SELECT
-- Target roles: public

bucket_id = 'merchant-logos'
```

## Alternative: Create via SQL (if you have service role access)

If you have service role access, you can run these commands directly:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create the policies
CREATE POLICY "Merchants can upload logos to their own folder"
ON storage.objects FOR INSERT
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

CREATE POLICY "Merchants can update their own logos"
ON storage.objects FOR UPDATE
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

CREATE POLICY "Merchants can delete their own logos"
ON storage.objects FOR DELETE
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

CREATE POLICY "Public read access to merchant logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'merchant-logos');
```
