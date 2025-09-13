-- Multi-tenant RLS verification and enhancement for signup process
-- Ensures proper tenant isolation and security
-- NOTE: Run 20250913000006_add_enum_values.sql FIRST to add enum values

-- 1. Verify and enhance profiles RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Verify merchants table RLS policies
DROP POLICY IF EXISTS "Merchant owners can manage their merchant" ON public.merchants;
DROP POLICY IF EXISTS "Merchant users can view their merchant" ON public.merchants;

CREATE POLICY "Merchant owners can manage their merchant" ON public.merchants
    FOR ALL USING (
        owner_id = auth.uid() OR 
        id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'manager', 'super_admin')
        )
    );

CREATE POLICY "Merchant users can view their merchant" ON public.merchants
    FOR SELECT USING (
        id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid() AND merchant_id IS NOT NULL
        )
    );

-- 3. Create function to check user's merchant access
CREATE OR REPLACE FUNCTION get_user_merchant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT merchant_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to verify multi-tenant isolation
CREATE OR REPLACE FUNCTION verify_multitenant_access(table_merchant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_merchant_id UUID;
BEGIN
    -- Get user's merchant ID
    SELECT merchant_id INTO user_merchant_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- Allow access if merchant IDs match or user is platform admin
    RETURN (
        user_merchant_id = table_merchant_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND is_platform_admin = TRUE
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enhance products RLS policy for better multi-tenancy
DROP POLICY IF EXISTS "Users can manage products within their merchant" ON public.products;
CREATE POLICY "Users can manage products within their merchant" ON public.products
    FOR ALL USING (verify_multitenant_access(merchant_id));

-- 6. Enhance customers RLS policy
DROP POLICY IF EXISTS "Users can manage customers within their merchant" ON public.customers;
CREATE POLICY "Users can manage customers within their merchant" ON public.customers
    FOR ALL USING (verify_multitenant_access(merchant_id));

-- 7. Enhance suppliers RLS policy
DROP POLICY IF EXISTS "Users can manage suppliers within their merchant" ON public.suppliers;
CREATE POLICY "Users can manage suppliers within their merchant" ON public.suppliers
    FOR ALL USING (verify_multitenant_access(merchant_id));

-- 8. Enhance sales RLS policy
DROP POLICY IF EXISTS "Users can manage sales within their merchant" ON public.sales;
CREATE POLICY "Users can manage sales within their merchant" ON public.sales
    FOR ALL USING (verify_multitenant_access(merchant_id));

-- 9. Enhance purchases RLS policy
DROP POLICY IF EXISTS "Users can manage purchases within their merchant" ON public.purchases;
CREATE POLICY "Users can manage purchases within their merchant" ON public.purchases
    FOR ALL USING (verify_multitenant_access(merchant_id));

-- 10. Create function to handle new user onboarding flow
CREATE OR REPLACE FUNCTION get_user_onboarding_status(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    has_profile BOOLEAN,
    has_merchant BOOLEAN,
    merchant_id UUID,
    role TEXT,
    needs_merchant_setup BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (p.id IS NOT NULL) as has_profile,
        (p.merchant_id IS NOT NULL) as has_merchant,
        p.merchant_id,
        p.role::TEXT,
        (p.id IS NOT NULL AND p.merchant_id IS NULL) as needs_merchant_setup
    FROM public.profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create audit function for multi-tenant operations
CREATE OR REPLACE FUNCTION log_multitenant_operation(
    operation_type TEXT,
    table_name TEXT,
    record_id UUID,
    merchant_id UUID
) RETURNS VOID AS $$
BEGIN
    -- Log the operation for audit purposes (only if audit_logs table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
        INSERT INTO public.audit_logs (
            user_id,
            merchant_id,
            action,
            resource_type,
            resource_id,
            created_at
        ) VALUES (
            auth.uid(),
            merchant_id,
            operation_type,
            table_name,
            record_id,
            NOW()
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the main operation if audit logging fails
        RAISE WARNING 'Failed to log multitenant operation: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_merchant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_multitenant_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_onboarding_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_multitenant_operation(TEXT, TEXT, UUID, UUID) TO authenticated;

-- 13. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_merchant_id ON public.profiles(merchant_id) WHERE merchant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_merchants_owner_id ON public.merchants(owner_id);

-- 14. Add comments for documentation
COMMENT ON FUNCTION get_user_merchant_id() IS 'Returns the merchant_id for the current authenticated user';
COMMENT ON FUNCTION verify_multitenant_access(UUID) IS 'Verifies if current user has access to records with given merchant_id';
COMMENT ON FUNCTION get_user_onboarding_status(UUID) IS 'Returns onboarding status for user including merchant setup requirements';
COMMENT ON FUNCTION log_multitenant_operation(TEXT, TEXT, UUID, UUID) IS 'Logs multi-tenant operations for audit trail';

-- 15. Verify all tables have proper RLS enabled
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'merchants', 'products', 'customers', 'suppliers', 'sales', 'purchases', 'categories')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', table_record.schemaname, table_record.tablename);
        RAISE NOTICE 'Enabled RLS on table: %.%', table_record.schemaname, table_record.tablename;
    END LOOP;
END $$;
