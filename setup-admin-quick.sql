-- Quick Admin Setup Script for KrishiSethu
-- Run this in Supabase SQL Editor to fix admin login issues

-- 1. SAFELY ADD super_admin TO user_role ENUM (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'super_admin' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'super_admin';
        RAISE NOTICE 'Added super_admin to user_role enum';
    END IF;
END $$;

-- 2. ENSURE PROFILES TABLE HAS REQUIRED COLUMNS
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_admin_login TIMESTAMPTZ;

-- 3. CREATE ADMIN VERIFICATION FUNCTION
CREATE OR REPLACE FUNCTION verify_admin_access(user_id UUID)
RETURNS TABLE (
    is_admin BOOLEAN,
    role TEXT,
    is_platform_admin BOOLEAN,
    permissions TEXT[],
    last_login TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (p.role = 'super_admin' OR p.is_platform_admin) as is_admin,
        p.role::TEXT,
        p.is_platform_admin,
        p.admin_permissions,
        p.last_admin_login
    FROM profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.5. CREATE UPDATE ADMIN LOGIN FUNCTION
CREATE OR REPLACE FUNCTION update_admin_login(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles 
    SET last_admin_login = NOW(),
        updated_at = NOW()
    WHERE id = user_id 
    AND (role = 'super_admin' OR is_platform_admin = TRUE);
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. DROP EXISTING FUNCTION AND CREATE UNIQUE VERSION
DROP FUNCTION IF EXISTS create_super_admin_profile CASCADE;

-- CREATE SUPER ADMIN PROFILE FUNCTION (UNIQUE VERSION)
CREATE OR REPLACE FUNCTION create_super_admin_profile_v2(
    user_id UUID, 
    email TEXT DEFAULT NULL,
    full_name TEXT DEFAULT 'Platform Administrator'
)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Get email and name from auth.users if not provided
    SELECT au.email, COALESCE(au.raw_user_meta_data->>'full_name', full_name)
    INTO user_email, user_name
    FROM auth.users au
    WHERE au.id = user_id;
    
    -- Use provided values if auth lookup fails
    user_email := COALESCE(user_email, email, 'admin@krishisethu.com');
    user_name := COALESCE(user_name, full_name);

    -- Insert or update the profile with super admin privileges
    INSERT INTO profiles (
        id, 
        full_name, 
        email, 
        role, 
        is_platform_admin, 
        admin_permissions, 
        merchant_id,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        user_id,
        user_name,
        user_email,
        'super_admin',
        TRUE,
        ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
        NULL,
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        is_platform_admin = TRUE,
        admin_permissions = ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
        merchant_id = NULL,
        is_active = TRUE,
        full_name = user_name,
        email = user_email,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RAISE NOTICE 'Super admin profile created/updated for user: % (email: %)', profile_id, user_email;
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE DEFAULT SUPER ADMIN USER (if none exists)
DO $$
DECLARE
    admin_count INTEGER;
    default_user_id UUID := '47384497-de6e-4e1a-9b05-f593e98a8942'; -- From the error log
BEGIN
    -- Check if any super admin exists
    SELECT COUNT(*) INTO admin_count
    FROM profiles 
    WHERE role = 'super_admin' OR is_platform_admin = TRUE;
    
    IF admin_count = 0 THEN
        -- Check if the user from error log exists in auth.users
        IF EXISTS (SELECT 1 FROM auth.users WHERE id = default_user_id) THEN
            -- Create super admin profile for existing user
            PERFORM create_super_admin_profile_v2(default_user_id, 'devadmin@krishisethu.com', 'Development Administrator');
            RAISE NOTICE 'Created super admin profile for existing user: %', default_user_id;
        ELSE
            -- Create a placeholder profile that can be linked later
            INSERT INTO profiles (
                id,
                full_name,
                email,
                role,
                is_platform_admin,
                admin_permissions,
                merchant_id,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                'System Administrator',
                'admin@krishisethu.com',
                'super_admin',
                TRUE,
                ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
                NULL,
                TRUE,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Created placeholder super admin profile. Create user in Supabase Auth with email: admin@krishisethu.com';
        END IF;
    ELSE
        RAISE NOTICE 'Super admin already exists (count: %)', admin_count;
    END IF;
END $$;

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION verify_admin_access TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_login TO authenticated;
GRANT EXECUTE ON FUNCTION create_super_admin_profile_v2 TO authenticated;

-- 7. SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE '=== ADMIN SETUP COMPLETED ===';
    RAISE NOTICE 'Functions created: verify_admin_access, create_super_admin_profile_v2';
    RAISE NOTICE 'You can now test admin login at /admin/login';
    RAISE NOTICE 'Default credentials: devadmin@krishisethu.com / (your password)';
END $$;
