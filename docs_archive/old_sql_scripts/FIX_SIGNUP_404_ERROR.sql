-- ============================================
-- FIX: 404 Error After Email Confirmation
-- ============================================
-- Issue: Users get 404 after confirming email because no profile/merchant is created
-- Solution: Auto-create profile and merchant when user signs up

-- ============================================
-- Step 1: Create function to handle new user signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_merchant_id UUID;
BEGIN
  -- Create a merchant for the new user
  INSERT INTO public.merchants (
    business_name,
    email,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Business'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NOW(),
    NOW()
  )
  RETURNING id INTO new_merchant_id;

  -- Create a profile for the new user
  INSERT INTO public.profiles (
    id,
    merchant_id,
    email,
    full_name,
    role,
    is_platform_admin,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    new_merchant_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'admin', -- First user of merchant is admin
    false,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 2: Create trigger on auth.users
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Step 3: Grant necessary permissions
-- ============================================

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, authenticated, service_role;

-- ============================================
-- Step 4: Fix existing users without profiles
-- ============================================

-- Find users without profiles
DO $$
DECLARE
  user_record RECORD;
  new_merchant_id UUID;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Create merchant for user
    INSERT INTO public.merchants (
      business_name,
      email,
      phone,
      created_at,
      updated_at
    )
    VALUES (
      COALESCE(user_record.raw_user_meta_data->>'full_name', 'New Business'),
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'phone', ''),
      NOW(),
      NOW()
    )
    RETURNING id INTO new_merchant_id;

    -- Create profile for user
    INSERT INTO public.profiles (
      id,
      merchant_id,
      email,
      full_name,
      role,
      is_platform_admin,
      created_at,
      updated_at
    )
    VALUES (
      user_record.id,
      new_merchant_id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', 'User'),
      'admin',
      false,
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created profile and merchant for user: %', user_record.email;
  END LOOP;
END $$;

-- ============================================
-- Step 5: Verify the fix
-- ============================================

-- Check all users have profiles
SELECT 
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.merchant_id,
  m.business_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.merchants m ON p.merchant_id = m.id
ORDER BY u.created_at DESC;

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ Created handle_new_user() function
-- ✅ Created trigger on auth.users
-- ✅ Fixed existing users without profiles
-- ✅ All new signups will auto-create profile + merchant
-- ✅ No more 404 errors after email confirmation!
