-- Fix signup trigger to handle profile creation properly for multi-tenant system
-- This addresses the 500 error during user signup and ensures proper tenant isolation

-- 1. First, let's make the email column nullable since auth.users is the source of truth
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- 2. Create an improved signup trigger function that handles multi-tenancy properly
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_email TEXT;
BEGIN
    -- Extract full name from metadata with fallback
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1), -- Use email prefix as fallback
        'New User'
    );
    
    -- Use email from auth.users
    user_email := NEW.email;
    
    -- Create profile WITHOUT merchant_id (multi-tenant isolation)
    -- Users must create/join a merchant through the settings page
    INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        role, 
        merchant_id, -- NULL initially - user must setup merchant
        is_active,
        is_platform_admin,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        user_name,
        user_email,
        'admin', -- Default role for new signups (first user should be admin)
        NULL, -- No merchant assigned initially
        TRUE,
        FALSE, -- Not a platform admin by default
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        updated_at = NOW();
    
    RAISE NOTICE 'Successfully created profile for new user: % (email: %) - No merchant assigned yet', NEW.id, user_email;
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Handle email uniqueness violation gracefully
        RAISE NOTICE 'Email conflict for user: % (email: %) - attempting update', NEW.id, user_email;
        
        -- Try to update existing profile instead
        UPDATE public.profiles 
        SET 
            full_name = COALESCE(user_name, full_name),
            updated_at = NOW()
        WHERE email = user_email OR id = NEW.id;
        
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation (critical for auth flow)
        RAISE WARNING 'Failed to create profile for user % (email: %): % - %', 
            NEW.id, user_email, SQLSTATE, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop existing trigger and recreate with new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- 4. Add index to improve performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;

-- 5. Create a function to manually fix any existing users without profiles
CREATE OR REPLACE FUNCTION fix_missing_profiles()
RETURNS INTEGER AS $$
DECLARE
    missing_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Find users without profiles
    FOR user_record IN 
        SELECT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN public.profiles p ON p.id = u.id
        WHERE p.id IS NULL
    LOOP
        -- Create missing profile
        INSERT INTO public.profiles (
            id,
            full_name,
            email,
            role,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            user_record.id,
            COALESCE(
                user_record.raw_user_meta_data->>'full_name',
                user_record.raw_user_meta_data->>'name',
                split_part(user_record.email, '@', 1),
                'User'
            ),
            user_record.email,
            'staff',
            TRUE,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        missing_count := missing_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Fixed % missing profiles', missing_count;
    RETURN missing_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Run the fix for any existing users
SELECT fix_missing_profiles();

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

COMMENT ON FUNCTION handle_new_user_signup() IS 'Improved signup trigger that handles profile creation with proper error handling';
COMMENT ON FUNCTION fix_missing_profiles() IS 'Utility function to create profiles for existing users who may be missing them';
