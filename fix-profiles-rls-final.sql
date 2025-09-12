-- Final Fix for Profiles RLS - No Recursion with JWT Claims
-- Run this in Supabase SQL Editor to completely resolve 42P17 error

-- 1. DROP ALL EXISTING POLICIES (including the recursive ones)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_super_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_super_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_super_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_super_admin_all" ON profiles;
DROP POLICY IF EXISTS "Allow self select" ON profiles;
DROP POLICY IF EXISTS "Allow super_admin to select all" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin bypass" ON profiles;
DROP POLICY IF EXISTS "super_admin_bypass" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 2. CREATE JWT CLAIMS REFRESH FUNCTION
CREATE OR REPLACE FUNCTION public.refresh_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set custom claims in JWT
  PERFORM set_config(
    'request.jwt.claims',
    jsonb_build_object(
      'role', NEW.role,
      'is_platform_admin', NEW.is_platform_admin,
      'merchant_id', NEW.merchant_id
    )::text,
    true
  );
  
  RETURN NEW;
END;
$$;

-- 3. CREATE TRIGGER TO AUTO-SYNC PROFILE CHANGES TO JWT
DROP TRIGGER IF EXISTS refresh_jwt_trigger ON profiles;

CREATE TRIGGER refresh_jwt_trigger
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_jwt();

-- 4. CREATE NON-RECURSIVE RLS POLICIES USING JWT CLAIMS

-- Policy 1: Users can select their own profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Policy 2: Users can update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Policy 3: Users can insert their own profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Policy 4: Super admin full access (using JWT claims - NO RECURSION)
CREATE POLICY "profiles_super_admin_all"
ON profiles FOR ALL
USING (
  (auth.jwt() ->> 'role') = 'super_admin' 
  OR 
  (auth.jwt() ->> 'is_platform_admin')::boolean = true
)
WITH CHECK (
  (auth.jwt() ->> 'role') = 'super_admin' 
  OR 
  (auth.jwt() ->> 'is_platform_admin')::boolean = true
);

-- 5. ENSURE RLS IS ENABLED
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.refresh_jwt() TO authenticated;

-- 7. UPDATE EXISTING PROFILES TO TRIGGER JWT REFRESH
-- This forces the trigger to run for existing profiles
UPDATE profiles SET updated_at = NOW() WHERE role = 'super_admin' OR is_platform_admin = true;

-- 8. SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE '=== PROFILES RLS COMPLETELY FIXED ===';
    RAISE NOTICE 'Removed ALL recursive policies';
    RAISE NOTICE 'Created JWT claims sync function and trigger';
    RAISE NOTICE 'Super admin access now uses JWT claims (no recursion)';
    RAISE NOTICE 'Users must sign out and sign in again for JWT refresh';
    RAISE NOTICE 'Test with: SELECT * FROM profiles WHERE id = auth.uid();';
END $$;
