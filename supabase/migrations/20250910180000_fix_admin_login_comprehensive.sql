-- Comprehensive Admin Login Fix for KrishiSethu
-- This migration resolves all admin login issues identified in the system

-- 1. SAFELY ADD super_admin TO user_role ENUM (if not exists)
DO $$ 
BEGIN
    -- Check if super_admin already exists in the ENUM
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'super_admin' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        -- Add super_admin to the ENUM if it doesn't exist
        ALTER TYPE user_role ADD VALUE 'super_admin';
        RAISE NOTICE 'Added super_admin to user_role enum';
    ELSE
        RAISE NOTICE 'super_admin already exists in user_role enum';
    END IF;
END $$;

-- 2. ENSURE PROFILES TABLE HAS ALL REQUIRED COLUMNS
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_admin_login TIMESTAMPTZ;

-- 3. CREATE OPTIMIZED INDEXES FOR ADMIN OPERATIONS
DO $$
BEGIN
    -- Index for platform admin lookups
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_platform_admin'
    ) THEN
        CREATE INDEX idx_profiles_platform_admin ON profiles(is_platform_admin) WHERE is_platform_admin = TRUE;
    END IF;
    
    -- Index for role-based queries
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_role'
    ) THEN
        CREATE INDEX idx_profiles_role ON profiles(role);
    END IF;
END $$;

-- 4. FIX EMAIL CONSTRAINT CONFLICTS
-- Remove duplicate email uniqueness constraint (auth.users handles this)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_email_key' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_email_key;
        RAISE NOTICE 'Removed duplicate email constraint from profiles';
    END IF;
END $$;

-- Make email nullable since auth.users is the source of truth
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- 5. CREATE ROBUST SUPER ADMIN CREATION FUNCTION
CREATE OR REPLACE FUNCTION create_super_admin_profile(
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
        ARRAY[
            'all_merchants', 
            'system_metrics', 
            'audit_logs', 
            'user_management', 
            'subscription_management',
            'platform_notifications',
            'system_monitoring'
        ],
        NULL,  -- Super admin is not tied to any specific merchant
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        is_platform_admin = TRUE,
        admin_permissions = ARRAY[
            'all_merchants', 
            'system_metrics', 
            'audit_logs', 
            'user_management', 
            'subscription_management',
            'platform_notifications',
            'system_monitoring'
        ],
        merchant_id = NULL,
        is_active = TRUE,
        full_name = user_name,
        email = user_email,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    -- Update last admin login
    UPDATE profiles 
    SET last_admin_login = NOW() 
    WHERE id = profile_id;
    
    -- Log the super admin creation/update
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_audit_event') THEN
        PERFORM log_audit_event(
            NULL, -- No specific merchant
            'UPSERT',
            'super_admin',
            profile_id,
            NULL,
            jsonb_build_object(
                'email', user_email, 
                'role', 'super_admin',
                'is_platform_admin', true,
                'permissions', ARRAY[
                    'all_merchants', 
                    'system_metrics', 
                    'audit_logs', 
                    'user_management', 
                    'subscription_management'
                ]
            ),
            'info',
            jsonb_build_object(
                'action', 'super_admin_created_or_updated', 
                'email', user_email,
                'function', 'create_super_admin_profile'
            )
        );
    END IF;
    
    RAISE NOTICE 'Super admin profile created/updated for user: % (email: %)', profile_id, user_email;
    RETURN profile_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create super admin profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. IMPROVED USER SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- Extract full name from metadata or use default
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');
    
    -- Create regular user profile (not super admin)
    INSERT INTO profiles (
        id, 
        full_name, 
        email, 
        role, 
        is_platform_admin,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        'staff', -- Default role for new signups
        FALSE,
        TRUE,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Created profile for new user: % (email: %)', NEW.id, NEW.email;
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, just log and continue
        RAISE NOTICE 'Profile already exists for user: %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user % (email: %): %', NEW.id, NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RECREATE USER SIGNUP TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. FUNCTION TO VERIFY ADMIN ACCESS
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

-- 9. FUNCTION TO UPDATE ADMIN LOGIN TIME
CREATE OR REPLACE FUNCTION update_admin_login(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_user BOOLEAN := FALSE;
BEGIN
    -- Check if user is admin and update login time
    UPDATE profiles 
    SET last_admin_login = NOW(),
        updated_at = NOW()
    WHERE id = user_id 
    AND (role = 'super_admin' OR is_platform_admin = TRUE)
    RETURNING TRUE INTO is_admin_user;
    
    -- Log admin login if audit function exists
    IF is_admin_user AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_audit_event') THEN
        PERFORM log_audit_event(
            NULL,
            'LOGIN',
            'admin_session',
            user_id,
            NULL,
            jsonb_build_object('login_time', NOW(), 'user_id', user_id),
            'info',
            jsonb_build_object('action', 'admin_login', 'user_id', user_id)
        );
    END IF;
    
    RETURN COALESCE(is_admin_user, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ENSURE PROPER RLS POLICIES FOR PROFILES
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles admin_profile
            WHERE admin_profile.id = auth.uid()
            AND (admin_profile.role = 'super_admin' OR admin_profile.is_platform_admin = TRUE)
        )
    );

CREATE POLICY "Super admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles admin_profile
            WHERE admin_profile.id = auth.uid()
            AND (admin_profile.role = 'super_admin' OR admin_profile.is_platform_admin = TRUE)
        )
    );

-- 11. CREATE DEFAULT SUPER ADMIN IF NONE EXISTS
DO $$
DECLARE
    admin_count INTEGER;
    default_admin_id UUID;
BEGIN
    -- Check if any super admin exists
    SELECT COUNT(*) INTO admin_count
    FROM profiles 
    WHERE role = 'super_admin' OR is_platform_admin = TRUE;
    
    IF admin_count = 0 THEN
        -- Create a placeholder super admin entry that can be claimed
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
        ) RETURNING id INTO default_admin_id;
        
        RAISE NOTICE 'Created default super admin profile with ID: %', default_admin_id;
        RAISE NOTICE 'To activate: Create user with email admin@krishisethu.com in Supabase Auth, then run: SELECT create_super_admin_profile(''<user_uuid>'');';
    ELSE
        RAISE NOTICE 'Super admin already exists (count: %)', admin_count;
    END IF;
END $$;

-- 12. GRANT NECESSARY PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 13. ADD HELPFUL COMMENTS
COMMENT ON FUNCTION create_super_admin_profile IS 'Creates or updates a user profile with super admin privileges - comprehensive version with error handling';
COMMENT ON FUNCTION handle_new_user IS 'Automatically creates a profile when a new user signs up via Supabase Auth - improved version';
COMMENT ON FUNCTION verify_admin_access IS 'Verifies if a user has admin access and returns their permissions';
COMMENT ON FUNCTION update_admin_login IS 'Updates the last admin login time and logs the event';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== ADMIN LOGIN FIX COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create admin user in Supabase Auth UI with email: admin@krishisethu.com';
    RAISE NOTICE '2. Run: SELECT create_super_admin_profile(''<user_uuid>'') to grant admin privileges';
    RAISE NOTICE '3. Test admin login at /admin/login';
    RAISE NOTICE '=== END ===';
END $$;
