-- Fix existing user roles and update signup trigger for admin default role
-- This addresses the role assignment issue where users should be admin by default

-- 1. Update existing users with 'staff' role to 'admin' role
UPDATE public.profiles 
SET role = 'admin', updated_at = NOW()
WHERE role = 'staff' 
AND merchant_id IS NULL; -- Only update users who haven't set up merchants yet

-- 2. Update the signup trigger function to use 'admin' as default role
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
        role = COALESCE(EXCLUDED.role, profiles.role), -- Keep existing role if already set
        updated_at = NOW();
    
    RAISE NOTICE 'Successfully created profile for new user: % (email: %) - Role: admin, No merchant assigned yet', NEW.id, user_email;
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

-- 3. Recreate the trigger with updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

COMMENT ON FUNCTION handle_new_user_signup() IS 'Updated signup trigger that assigns admin role by default for new users';
