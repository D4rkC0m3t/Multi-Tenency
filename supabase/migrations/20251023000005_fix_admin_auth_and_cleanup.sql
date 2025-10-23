-- Comprehensive fix for admin authentication and subscription cleanup
-- This addresses both the 401 Unauthorized and 406 duplicate issues

-- Step 1: Fix RLS policies to match admin login logic
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payment_submissions;

-- Create corrected policies that match AdminLoginPage.tsx logic
CREATE POLICY "Admins can manage all subscriptions"
    ON public.user_subscriptions FOR ALL
    USING (
        -- Service role (backend operations)
        auth.jwt()->>'role' = 'service_role'
        OR
        -- Platform admins and super admins
        (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.is_platform_admin = true 
                    OR profiles.role = 'super_admin'
                    OR profiles.role = 'admin'
                )
                AND profiles.is_active = true
            )
        )
    )
    WITH CHECK (
        auth.jwt()->>'role' = 'service_role'
        OR
        (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.is_platform_admin = true 
                    OR profiles.role = 'super_admin'
                    OR profiles.role = 'admin'
                )
                AND profiles.is_active = true
            )
        )
    );

CREATE POLICY "Admins can manage all payments"
    ON public.payment_submissions FOR ALL
    USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.is_platform_admin = true 
                    OR profiles.role = 'super_admin'
                    OR profiles.role = 'admin'
                )
                AND profiles.is_active = true
            )
        )
    )
    WITH CHECK (
        auth.jwt()->>'role' = 'service_role'
        OR
        (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND (
                    profiles.is_platform_admin = true 
                    OR profiles.role = 'super_admin'
                    OR profiles.role = 'admin'
                )
                AND profiles.is_active = true
            )
        )
    );

-- Step 2: Aggressively clean up ALL duplicate active subscriptions
DO $$
DECLARE
    v_deleted_count INTEGER := 0;
BEGIN
    -- Keep only the latest active subscription for each merchant
    WITH ranked_subs AS (
        SELECT 
            id,
            merchant_id,
            ROW_NUMBER() OVER (
                PARTITION BY merchant_id 
                ORDER BY end_date DESC, created_at DESC, id DESC
            ) as rn
        FROM user_subscriptions
        WHERE status = 'active'
    )
    UPDATE user_subscriptions
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE id IN (SELECT id FROM ranked_subs WHERE rn > 1);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Expired % duplicate active subscriptions', v_deleted_count;
END $$;

-- Step 3: Verify cleanup
DO $$
DECLARE
    v_duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_duplicate_count
    FROM (
        SELECT merchant_id, COUNT(*) as cnt
        FROM user_subscriptions
        WHERE status = 'active'
        GROUP BY merchant_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF v_duplicate_count > 0 THEN
        RAISE WARNING 'Still have % merchants with duplicate active subscriptions', v_duplicate_count;
    ELSE
        RAISE NOTICE 'SUCCESS: No duplicate active subscriptions found';
    END IF;
END $$;

-- Step 4: Add a more aggressive trigger to prevent duplicates
DROP TRIGGER IF EXISTS enforce_single_active_subscription ON user_subscriptions;
DROP FUNCTION IF EXISTS prevent_duplicate_active_subscriptions();

CREATE OR REPLACE FUNCTION prevent_duplicate_active_subscriptions()
RETURNS TRIGGER AS $$
DECLARE
    v_existing_count INTEGER;
BEGIN
    -- If trying to insert/update to active status
    IF NEW.status = 'active' THEN
        -- Count existing active subscriptions for this merchant (excluding current row)
        SELECT COUNT(*) INTO v_existing_count
        FROM user_subscriptions 
        WHERE merchant_id = NEW.merchant_id 
          AND status = 'active' 
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
        
        IF v_existing_count > 0 THEN
            -- Expire ALL existing active subscriptions for this merchant
            UPDATE user_subscriptions
            SET status = 'expired', updated_at = NOW()
            WHERE merchant_id = NEW.merchant_id 
              AND status = 'active' 
              AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
            
            RAISE NOTICE 'Expired % existing active subscriptions for merchant %', v_existing_count, NEW.merchant_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_single_active_subscription
    BEFORE INSERT OR UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_active_subscriptions();

-- Step 5: Add index to speed up the duplicate check
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active_lookup 
ON user_subscriptions(merchant_id, status, id) 
WHERE status = 'active';

-- Step 6: Create a function to manually fix a specific merchant
CREATE OR REPLACE FUNCTION fix_merchant_subscriptions(p_merchant_id UUID)
RETURNS TABLE (
    action TEXT,
    subscription_id UUID,
    old_status TEXT,
    new_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked AS (
        SELECT 
            id,
            status,
            ROW_NUMBER() OVER (ORDER BY end_date DESC, created_at DESC) as rn
        FROM user_subscriptions
        WHERE merchant_id = p_merchant_id AND status = 'active'
    ),
    updated AS (
        UPDATE user_subscriptions us
        SET status = 'expired', updated_at = NOW()
        FROM ranked r
        WHERE us.id = r.id AND r.rn > 1
        RETURNING us.id, 'expired'::text as old_status, 'expired'::text as new_status
    )
    SELECT 
        'expired_duplicate'::text as action,
        id as subscription_id,
        'active'::text as old_status,
        new_status
    FROM updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Add comments
COMMENT ON POLICY "Admins can manage all subscriptions" ON user_subscriptions IS 
    'Allows platform admins, super admins, and service role to manage subscriptions';

COMMENT ON FUNCTION fix_merchant_subscriptions(UUID) IS 
    'Manually fixes duplicate subscriptions for a specific merchant';

COMMENT ON FUNCTION prevent_duplicate_active_subscriptions() IS 
    'Aggressively prevents duplicate active subscriptions by expiring existing ones';
