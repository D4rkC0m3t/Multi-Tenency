-- CRITICAL FIX: Resolve infinite recursion in RLS policies
-- This fixes the issue where arjunin2020@gmail.com (and all users) cannot access their data

-- 1. Temporarily disable RLS on profiles to break the recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing problematic policies on profiles
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 3. Drop dependent policies first, then the problematic function
DROP POLICY IF EXISTS "Users can manage items in their merchant's purchases" ON purchase_items;
DROP POLICY IF EXISTS "Users can manage items in their merchant's sales" ON sale_items;
DROP POLICY IF EXISTS "Users can manage e-invoices for their own merchant" ON e_invoices;

-- Now drop the problematic functions that cause recursion
DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS get_my_merchant_id() CASCADE;

-- 4. Create a simple, non-recursive function to get merchant_id
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

-- 5. Create simple, non-recursive policies for profiles
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- 6. Re-enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Update merchant policies to use the new function
DROP POLICY IF EXISTS "Merchant owners and users can manage merchants" ON merchants;
CREATE POLICY "merchants_access" ON merchants
    FOR ALL USING (
        id = get_user_merchant_id() OR 
        owner_id = auth.uid()
    );

-- 8. Update other table policies to use the new function
DROP POLICY IF EXISTS "Users can manage their merchant's products" ON products;
CREATE POLICY "products_merchant_access" ON products
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "Users can manage their merchant's categories" ON categories;
CREATE POLICY "categories_merchant_access" ON categories
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "Users can manage their merchant's customers" ON customers;
CREATE POLICY "customers_merchant_access" ON customers
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "Users can manage their merchant's suppliers" ON suppliers;
CREATE POLICY "suppliers_merchant_access" ON suppliers
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "Users can manage their merchant's sales" ON sales;
CREATE POLICY "sales_merchant_access" ON sales
    FOR ALL USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "Users can manage their merchant's purchases" ON purchases;
CREATE POLICY "purchases_merchant_access" ON purchases
    FOR ALL USING (merchant_id = get_user_merchant_id());

-- 9. Handle sale_items and purchase_items
DROP POLICY IF EXISTS "Users can manage sale items for their merchant's sales" ON sale_items;
CREATE POLICY "sale_items_access" ON sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sales s 
            WHERE s.id = sale_items.sale_id 
            AND s.merchant_id = get_user_merchant_id()
        )
    );

DROP POLICY IF EXISTS "Users can manage purchase items for their merchant's purchases" ON purchase_items;
CREATE POLICY "purchase_items_access" ON purchase_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM purchases p 
            WHERE p.id = purchase_items.purchase_id 
            AND p.merchant_id = get_user_merchant_id()
        )
    );

-- 10. Ensure all users have proper profiles
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

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION ensure_user_profile();

-- 11. Fix any existing users without profiles
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

-- 12. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_merchant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_profile() TO authenticated;
