-- Fix duplicate active subscriptions issue
-- This migration cleans up duplicate active subscriptions and ensures only one active subscription per merchant

-- Step 1: Identify and keep only the latest active subscription for each merchant
-- Deactivate older duplicate active subscriptions
WITH ranked_subscriptions AS (
  SELECT 
    id,
    merchant_id,
    ROW_NUMBER() OVER (
      PARTITION BY merchant_id 
      ORDER BY end_date DESC, created_at DESC
    ) as rn
  FROM user_subscriptions
  WHERE status = 'active'
)
UPDATE user_subscriptions
SET 
  status = 'expired',
  updated_at = NOW()
WHERE id IN (
  SELECT id 
  FROM ranked_subscriptions 
  WHERE rn > 1
);

-- Step 2: Ensure the unique constraint exists
-- Drop existing constraint if it exists
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS unique_active_subscription;

-- Note: PostgreSQL doesn't support WHERE clause in table constraints
-- We'll use a unique partial index instead which serves the same purpose
DROP INDEX IF EXISTS unique_active_subscription_idx;

CREATE UNIQUE INDEX unique_active_subscription_idx 
ON user_subscriptions(merchant_id) 
WHERE status = 'active';

-- Step 3: Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_merchant_status 
ON user_subscriptions(merchant_id, status) 
WHERE status = 'active';

-- Step 4: Add a function to prevent duplicate active subscriptions
CREATE OR REPLACE FUNCTION prevent_duplicate_active_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to insert/update to active status
  IF NEW.status = 'active' THEN
    -- Check if there's already an active subscription for this merchant
    IF EXISTS (
      SELECT 1 
      FROM user_subscriptions 
      WHERE merchant_id = NEW.merchant_id 
        AND status = 'active' 
        AND id != NEW.id
    ) THEN
      -- Expire the old active subscription
      UPDATE user_subscriptions
      SET status = 'expired', updated_at = NOW()
      WHERE merchant_id = NEW.merchant_id 
        AND status = 'active' 
        AND id != NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to enforce single active subscription
DROP TRIGGER IF EXISTS enforce_single_active_subscription ON user_subscriptions;

CREATE TRIGGER enforce_single_active_subscription
  BEFORE INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_active_subscriptions();

-- Step 6: Add comment for documentation
COMMENT ON INDEX unique_active_subscription_idx IS 
  'Ensures only one active subscription per merchant at a time';

COMMENT ON FUNCTION prevent_duplicate_active_subscriptions() IS 
  'Automatically expires old active subscriptions when a new one is created';
