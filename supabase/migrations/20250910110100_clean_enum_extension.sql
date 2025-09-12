-- Clean ENUM Extension for super_admin role
-- This migration safely extends user_role ENUM and creates initial super_admin user

-- 1) Safely add super_admin to user_role ENUM
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- 2) Update default value to ensure compatibility
ALTER TABLE profiles
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE profiles
  ALTER COLUMN role SET DEFAULT 'staff';

-- 3) Add platform admin fields to profiles if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_admin_login TIMESTAMPTZ;

-- 4) Create index for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_platform_admin 
ON profiles(is_platform_admin) WHERE is_platform_admin = TRUE;

-- 5) Ensure at least one DevAdmin account exists
-- This creates a profile that can be linked to an auth.users record
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if we have an existing user with admin email
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'devadmin@krishisethu.com' 
    LIMIT 1;
    
    -- If user exists in auth.users, create/update their profile
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, full_name, email, role, is_platform_admin, admin_permissions, merchant_id)
        VALUES (
            admin_user_id,
            'Platform Administrator',
            'devadmin@krishisethu.com',
            'super_admin',
            TRUE,
            ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
            NULL
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'super_admin',
            is_platform_admin = TRUE,
            admin_permissions = ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
            merchant_id = NULL,
            updated_at = NOW();
    END IF;
END $$;

-- 6) Create super_admin RLS bypass policies
-- Super admins can view all merchants
DROP POLICY IF EXISTS "Super admins can view all merchants" ON merchants;
CREATE POLICY "Super admins can view all merchants" ON merchants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_platform_admin = TRUE
        )
    );

-- Super admins can manage all profiles
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
CREATE POLICY "Super admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.is_platform_admin = TRUE
        )
    );

-- Super admins can view all products across merchants
DROP POLICY IF EXISTS "Super admins can view all products" ON products;
CREATE POLICY "Super admins can view all products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_platform_admin = TRUE
        )
    );

-- Super admins can view all sales across merchants
DROP POLICY IF EXISTS "Super admins can view all sales" ON sales;
CREATE POLICY "Super admins can view all sales" ON sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_platform_admin = TRUE
        )
    );

-- Super admins can view all customers across merchants
DROP POLICY IF EXISTS "Super admins can view all customers" ON customers;
CREATE POLICY "Super admins can view all customers" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_platform_admin = TRUE
        )
    );

-- 7) Create helper function to check super admin status
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_platform_admin = TRUE 
        AND profiles.role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8) Update the super admin creation function
CREATE OR REPLACE FUNCTION create_super_admin_profile(user_id UUID, email TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
    user_email TEXT;
BEGIN
    -- Get email from auth.users if not provided
    IF email IS NULL THEN
        SELECT au.email INTO user_email
        FROM auth.users au
        WHERE au.id = user_id;
    ELSE
        user_email := email;
    END IF;

    -- Insert or update the profile with super admin privileges
    INSERT INTO profiles (id, full_name, email, role, is_platform_admin, admin_permissions, merchant_id)
    VALUES (
        user_id,
        'Platform Administrator',
        user_email,
        'super_admin',
        TRUE,
        ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
        NULL
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        is_platform_admin = TRUE,
        admin_permissions = ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
        merchant_id = NULL,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON FUNCTION is_super_admin IS 'Helper function to check if current user is a super admin';
COMMENT ON FUNCTION create_super_admin_profile IS 'Creates or updates a user profile with super admin privileges';

-- Verification queries (run these to test)
/*
-- Confirm ENUM has super_admin
SELECT unnest(enum_range(NULL::user_role));

-- Confirm profiles has super_admin capability
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('role', 'is_platform_admin');

-- Check if super_admin profiles exist
SELECT id, email, role, is_platform_admin FROM profiles WHERE role = 'super_admin';
*/
