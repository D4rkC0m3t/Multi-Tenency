-- Emergency cleanup for specific merchant with duplicate subscriptions
-- This script specifically targets merchant: d0894866-ef62-47e0-a466-7250616a18f8

-- Step 1: Check current state (for logging)
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM user_subscriptions
    WHERE merchant_id = 'd0894866-ef62-47e0-a466-7250616a18f8'
    AND status = 'active';
    
    RAISE NOTICE 'Found % active subscriptions for merchant d0894866-ef62-47e0-a466-7250616a18f8', duplicate_count;
END $$;

-- Step 2: Keep only the latest subscription, expire all others
WITH ranked_subs AS (
    SELECT 
        id,
        merchant_id,
        end_date,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY merchant_id 
            ORDER BY end_date DESC, created_at DESC
        ) as rn
    FROM user_subscriptions
    WHERE merchant_id = 'd0894866-ef62-47e0-a466-7250616a18f8'
    AND status = 'active'
)
UPDATE user_subscriptions
SET 
    status = 'expired',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM ranked_subs WHERE rn > 1
)
RETURNING id, merchant_id, status;

-- Step 3: Verify cleanup
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM user_subscriptions
    WHERE merchant_id = 'd0894866-ef62-47e0-a466-7250616a18f8'
    AND status = 'active';
    
    RAISE NOTICE 'After cleanup: % active subscriptions remaining', remaining_count;
    
    IF remaining_count > 1 THEN
        RAISE EXCEPTION 'Cleanup failed: Still have % active subscriptions', remaining_count;
    END IF;
END $$;
