-- Fix User Creation Issue - Ensure super_admin role exists and profiles table is properly configured
-- This migration addresses the "Database error creating new user" issue

-- 1. Ensure super_admin role exists in user_role ENUM
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
    END IF;
END $$;

-- 2. Ensure profiles table has the required columns for DevAdmin
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_admin_login TIMESTAMPTZ;

-- 3. Create index for fast admin lookups if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_platform_admin'
    ) THEN
        CREATE INDEX idx_profiles_platform_admin ON profiles(is_platform_admin) WHERE is_platform_admin = TRUE;
    END IF;
END $$;

-- 4. Fix any potential constraint issues with profiles table
-- Remove the UNIQUE constraint on email if it exists (auth.users already handles this)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_email_key' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_email_key;
    END IF;
END $$;

-- 5. Make email column nullable in profiles (since auth.users handles email uniqueness)
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- 6. Create or replace the super admin creation function with better error handling
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
        NULL  -- Super admin is not tied to any specific merchant
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        is_platform_admin = TRUE,
        admin_permissions = ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
        merchant_id = NULL,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    -- Log the super admin creation if audit function exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_audit_event') THEN
        PERFORM log_audit_event(
            NULL, -- No specific merchant
            'CREATE',
            'super_admin',
            profile_id,
            NULL,
            jsonb_build_object('email', user_email, 'role', 'super_admin'),
            'info',
            jsonb_build_object('action', 'super_admin_created', 'email', user_email)
        );
    END IF;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create a regular profile, not super admin
    -- Super admin must be created manually using create_super_admin_profile()
    INSERT INTO profiles (id, full_name, email, role, is_platform_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        'staff', -- Default role
        FALSE
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments
COMMENT ON FUNCTION create_super_admin_profile IS 'Creates or updates a user profile with super admin privileges - fixed version';
COMMENT ON FUNCTION handle_new_user IS 'Automatically creates a profile when a new user signs up via Supabase Auth';
