-- Debug script to identify subscription issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check for duplicate active subscriptions for the specific merchant
SELECT 
    'DUPLICATE CHECK' as check_type,
    merchant_id,
    COUNT(*) as active_count,
    STRING_AGG(id::text, ', ') as subscription_ids,
    STRING_AGG(end_date::text, ', ') as end_dates
FROM user_subscriptions
WHERE merchant_id = 'd0894866-ef62-47e0-a466-7250616a18f8'
AND status = 'active'
GROUP BY merchant_id;

-- 2. Check ALL subscriptions for this merchant (including non-active)
SELECT 
    'ALL SUBSCRIPTIONS' as check_type,
    id,
    merchant_id,
    plan_type,
    status,
    start_date,
    end_date,
    created_at,
    updated_at
FROM user_subscriptions
WHERE merchant_id = 'd0894866-ef62-47e0-a466-7250616a18f8'
ORDER BY created_at DESC;

-- 3. Check if unique index exists
SELECT 
    'INDEX CHECK' as check_type,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_subscriptions'
AND indexname = 'unique_active_subscription_idx';

-- 4. Check RLS policies
SELECT 
    'RLS POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_subscriptions'
ORDER BY policyname;

-- 5. Check if trigger exists
SELECT 
    'TRIGGER CHECK' as check_type,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_subscriptions'
AND trigger_name = 'enforce_single_active_subscription';

-- 6. Check for any merchants with multiple active subscriptions
SELECT 
    'SYSTEM-WIDE DUPLICATES' as check_type,
    merchant_id,
    COUNT(*) as active_count
FROM user_subscriptions
WHERE status = 'active'
GROUP BY merchant_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 7. Try to manually clean up the specific merchant (if duplicates found)
-- Uncomment and run if needed:
/*
WITH ranked_subs AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY merchant_id 
            ORDER BY end_date DESC, created_at DESC
        ) as rn
    FROM user_subscriptions
    WHERE merchant_id = 'd0894866-ef62-47e0-a466-7250616a18f8'
    AND status = 'active'
)
UPDATE user_subscriptions
SET status = 'expired', updated_at = NOW()
WHERE id IN (SELECT id FROM ranked_subs WHERE rn > 1)
RETURNING id, merchant_id, status, end_date;
*/
