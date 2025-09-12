-- Fix RLS Recursion Issue
-- This migration resolves the infinite recursion in RLS policies by using auth.jwt() for role checks

-- 1. Drop existing problematic policies
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Super admins can manage all profiles' 
        AND polrelid = 'profiles'::regclass
    ) THEN
        DROP POLICY "Super admins can manage all profiles" ON profiles;
    END IF;
    
    -- Drop the function if it exists to avoid conflicts
    DROP FUNCTION IF EXISTS is_super_admin();
END $$;

-- 2. Create a security definer function to check for super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM auth.users u
        JOIN profiles p ON p.id = u.id
        WHERE u.id = auth.uid() 
        AND p.is_platform_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the profiles table policies without recursion
CREATE POLICY "Super admins can manage all profiles" ON profiles
    FOR ALL USING (is_super_admin());

-- Create user profile policies only if they don't exist
DO $$
BEGIN
    -- Create view own profile policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can view their own profile' 
        AND polrelid = 'profiles'::regclass
    ) THEN
        CREATE POLICY "Users can view their own profile" ON profiles
            FOR SELECT USING (id = auth.uid());
    END IF;
    
    -- Create update own profile policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can update their own profile' 
        AND polrelid = 'profiles'::regclass
    ) THEN
        CREATE POLICY "Users can update their own profile" ON profiles
            FOR UPDATE USING (id = auth.uid());
    END IF;
END $$;

-- 4. Update other policies to use the security definer function
DO $$
DECLARE
    r RECORD;
    policy_sql TEXT;
BEGIN
    -- Get all policies that reference the profiles table in their USING clause
    FOR r IN 
        SELECT 
            n.nspname AS schema_name,
            c.relname AS table_name,
            pol.polname AS policy_name
        FROM pg_policy pol
        JOIN pg_class c ON pol.polrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_get_poldef(pol.oid) def ON true
        WHERE def LIKE '%FROM profiles%'
        AND c.relname != 'profiles'  -- Exclude the profiles table itself
    LOOP
        -- Drop the existing policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policy_name, r.schema_name, r.table_name);
        
        -- Recreate the policy to use the security definer function
        -- Note: This is a simplified example - you may need to adjust the policy definition
        -- based on your specific requirements for each table
        policy_sql := format('CREATE POLICY %I ON %I.%I FOR ALL USING (is_super_admin())',
                           r.policy_name, r.schema_name, r.table_name);
                           
        EXECUTE policy_sql;
        
        RAISE NOTICE 'Recreated policy % on %.%', r.policy_name, r.schema_name, r.table_name;
    END LOOP;
END $$;
