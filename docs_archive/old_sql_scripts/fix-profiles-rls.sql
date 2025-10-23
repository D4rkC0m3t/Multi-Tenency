-- Fix Infinite Recursion in Profiles RLS Policies
-- Run this in Supabase SQL Editor to resolve the 42P17 error

-- 1. DROP ALL EXISTING POLICIES ON PROFILES TABLE
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

-- 2. CREATE CLEAN, NON-RECURSIVE RLS POLICIES

-- Policy 1: Users can view their own profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Policy 2: Users can update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Policy 3: Users can insert their own profile (for new signups)
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Policy 4: Super admins can view ALL profiles (no recursion)
CREATE POLICY "profiles_select_super_admin"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND (p.role = 'super_admin' OR p.is_platform_admin = true)
  )
);

-- Policy 5: Super admins can update ALL profiles (no recursion)
CREATE POLICY "profiles_update_super_admin"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND (p.role = 'super_admin' OR p.is_platform_admin = true)
  )
);

-- Policy 6: Super admins can insert profiles for others
CREATE POLICY "profiles_insert_super_admin"
ON profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND (p.role = 'super_admin' OR p.is_platform_admin = true)
  )
);

-- 3. ENSURE RLS IS ENABLED
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. TEST THE POLICIES
DO $$
BEGIN
    RAISE NOTICE '=== PROFILES RLS POLICIES FIXED ===';
    RAISE NOTICE 'Removed recursive policies that caused infinite loops';
    RAISE NOTICE 'Created clean policies for user self-access and super admin access';
    RAISE NOTICE 'Test with: SELECT * FROM profiles WHERE id = auth.uid();';
END $$;
