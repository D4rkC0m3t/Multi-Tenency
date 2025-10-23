-- CRITICAL FIX: Resolve infinite recursion in RLS policies (CORRECTED VERSION)
-- This fixes the issue where arjunin2020@gmail.com (and all users) cannot access their data
-- Handles dependent objects properly to avoid CASCADE errors

-- 1. Temporarily disable RLS on profiles to break the recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing problematic policies on profiles
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 3. Drop dependent policies first (these depend on get_my_merchant_id function)
DROP POLICY IF EXISTS "Users can manage items in their merchant's purchases" ON purchase_items;
DROP POLICY IF EXISTS "Users can manage items in their merchant's sales" ON sale_items;
DROP POLICY IF EXISTS "Users can manage e-invoices for their own merchant" ON e_invoices;
DROP POLICY IF EXISTS "Users can manage their merchant's products" ON products;
DROP POLICY IF EXISTS "Users can manage their merchant's categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their merchant's customers" ON customers;
DROP POLICY IF EXISTS "Users can manage their merchant's suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can manage their merchant's sales" ON sales;
DROP POLICY IF EXISTS "Users can manage their merchant's purchases" ON purchases;
DROP POLICY IF EXISTS "Merchant owners and users can manage merchants" ON merchants;

-- 4. Now safely drop the problematic functions that cause recursion
DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS get_my_merchant_id();

-- 5. Create a simple, non-recursive function to get merchant_id
CREATE OR REPLACE FUNCTION get_user_merchant_id()
RETURNS UUID AS $$
BEGIN
    -- Direct query without RLS to avoid recursion
    RETURN (
        SELECT merchant_id 
        FROM profiles 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create simple, non-recursive policies for profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- 7. Re-enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Recreate merchant policies using the new function
DROP POLICY IF EXISTS "merchants_access" ON merchants;
CREATE POLICY "merchants_access" ON merchants
    FOR ALL USING (
        id = get_user_merchant_id() OR 
        owner_id = auth.uid()
    );

-- 9. Recreate other table policies using the new function
DROP POLICY IF EXISTS "products_merchant_access" ON products;
CREATE POLICY "products_merchant_access" ON products
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "categories_merchant_access" ON categories;
CREATE POLICY "categories_merchant_access" ON categories
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "customers_merchant_access" ON customers;
CREATE POLICY "customers_merchant_access" ON customers
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "suppliers_merchant_access" ON suppliers;
CREATE POLICY "suppliers_merchant_access" ON suppliers
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "sales_merchant_access" ON sales;
CREATE POLICY "sales_merchant_access" ON sales
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "purchases_merchant_access" ON purchases;
CREATE POLICY "purchases_merchant_access" ON purchases
    FOR ALL USING (merchant_id = get_user_merchant_id());

-- 10. Handle sale_items and purchase_items with subqueries
DROP POLICY IF EXISTS "sale_items_access" ON sale_items;
CREATE POLICY "sale_items_access" ON sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sales s 
            WHERE s.id = sale_items.sale_id 
            AND s.merchant_id = get_user_merchant_id()
        )
    );

DROP POLICY IF EXISTS "purchase_items_access" ON purchase_items;
CREATE POLICY "purchase_items_access" ON purchase_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM purchases p 
            WHERE p.id = purchase_items.purchase_id 
            AND p.merchant_id = get_user_merchant_id()
        )
    );

-- 11. Handle e_invoices table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'e_invoices') THEN
        EXECUTE 'CREATE POLICY "e_invoices_merchant_access" ON e_invoices
            FOR ALL USING (merchant_id = get_user_merchant_id())';
    END IF;
END $$;

-- 12. Ensure all users have proper profiles
-- Create a function to auto-create profiles for existing users
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'staff',
        true
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION ensure_user_profile();

-- 14. Fix any existing users without profiles (this will help arjunin2020@gmail.com)
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email),
    'staff',
    true
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 15. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_merchant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_profile() TO authenticated;

-- 16. Create a merchant for users who don't have one (like arjunin2020@gmail.com)
DO $$
DECLARE
    user_record RECORD;
    new_merchant_id UUID;
BEGIN
    -- Find users without merchant_id
    FOR user_record IN 
        SELECT p.id, p.email, p.full_name 
        FROM profiles p 
        WHERE p.merchant_id IS NULL 
        AND p.email IS NOT NULL
    LOOP
        -- Create a merchant for this user
        INSERT INTO merchants (name, business_name, owner_id, is_active, settings)
        VALUES (
            user_record.full_name || '''s Business',
            user_record.full_name || ' Store',
            user_record.id,
            true,
            '{}'::jsonb
        )
        RETURNING id INTO new_merchant_id;
        
        -- Update the user's profile with the new merchant_id
        UPDATE profiles 
        SET merchant_id = new_merchant_id 
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Created merchant % for user %', new_merchant_id, user_record.email;
    END LOOP;
END $$;
