# URGENT FIX: 406 and 403 Errors

## Current Issues

### 1. **406 Error (Not Acceptable)**
```
GET .../user_subscriptions?merchant_id=eq.xxx&status=eq.active
406 (Not Acceptable)
```
**Cause:** Multiple active subscriptions still exist for merchant `d0894866-ef62-47e0-a466-7250616a18f8`

### 2. **403 Error (Forbidden)**
```
POST .../user_subscriptions
403 (Forbidden)
Error: new row violates row-level security policy
```
**Cause:** Admin users don't have permission to INSERT into `user_subscriptions` table

---

## Quick Fix (Run These in Order)

### Step 1: Fix Admin Permissions (CRITICAL)
**File:** `20251023000002_fix_admin_subscription_permissions.sql`

This migration:
- ✅ Allows admin users to create/update subscriptions
- ✅ Allows admin users to manage payments
- ✅ Fixes the 403 Forbidden error

**Run in Supabase SQL Editor:**
```sql
-- Copy and paste the entire contents of:
-- 20251023000002_fix_admin_subscription_permissions.sql
```

---

### Step 2: Clean Up Specific Merchant Duplicates
**File:** `20251023000003_cleanup_specific_merchant_duplicates.sql`

This migration:
- ✅ Finds all active subscriptions for merchant `d0894866-ef62-47e0-a466-7250616a18f8`
- ✅ Keeps only the latest one
- ✅ Expires all older duplicates
- ✅ Verifies cleanup was successful

**Run in Supabase SQL Editor:**
```sql
-- Copy and paste the entire contents of:
-- 20251023000003_cleanup_specific_merchant_duplicates.sql
```

---

### Step 3: Verify the Fix

**Check for any remaining duplicates:**
```sql
SELECT merchant_id, COUNT(*) as active_count, 
       STRING_AGG(id::text, ', ') as subscription_ids
FROM user_subscriptions
WHERE status = 'active'
GROUP BY merchant_id
HAVING COUNT(*) > 1;
```

**Expected Result:** 0 rows (no duplicates)

**Check admin permissions:**
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'user_subscriptions'
AND policyname LIKE '%Admin%';
```

**Expected Result:** Should see "Admins can manage all subscriptions" policy

---

## Why This Happened

### 406 Error Root Cause:
1. First migration (`20251023000001`) ran successfully
2. BUT it only expired duplicates that existed at that moment
3. New duplicates were created after the migration
4. The unique index prevents NEW duplicates but doesn't clean existing ones
5. Merchant `d0894866-ef62-47e0-a466-7250616a18f8` still has multiple active subscriptions

### 403 Error Root Cause:
1. RLS policies only allowed `service_role` to manage subscriptions
2. Admin users authenticate as regular users with `role='admin'` in profiles
3. They are NOT `service_role` (which is for server-side operations)
4. The policy blocked admin users from INSERT/UPDATE operations

---

## Complete Fix Workflow

### 1. Run Permission Fix (FIRST!)
```bash
# In Supabase SQL Editor
# Run: 20251023000002_fix_admin_subscription_permissions.sql
```

### 2. Run Cleanup Script
```bash
# In Supabase SQL Editor
# Run: 20251023000003_cleanup_specific_merchant_duplicates.sql
```

### 3. Refresh Browser
- Clear browser cache or hard refresh (Ctrl+Shift+R)
- The 406 errors should stop
- The 403 errors should stop

### 4. Test Subscription Creation
1. Go to `/admin/merchants`
2. Click "View Details" on merchant `d0894866-ef62-47e0-a466-7250616a18f8`
3. Try to create/extend subscription
4. ✅ Should work without errors

---

## Verification Queries

### Check Subscription Count Per Merchant:
```sql
SELECT 
    m.business_name,
    m.email,
    COUNT(us.id) as active_subscriptions,
    MAX(us.end_date) as latest_end_date
FROM merchants m
LEFT JOIN user_subscriptions us ON m.id = us.merchant_id AND us.status = 'active'
GROUP BY m.id, m.business_name, m.email
HAVING COUNT(us.id) > 1
ORDER BY COUNT(us.id) DESC;
```

### Check Admin Policies:
```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('user_subscriptions', 'payment_submissions')
ORDER BY tablename, policyname;
```

### Check Specific Merchant:
```sql
SELECT 
    id,
    merchant_id,
    plan_type,
    status,
    start_date,
    end_date,
    created_at
FROM user_subscriptions
WHERE merchant_id = 'd0894866-ef62-47e0-a466-7250616a18f8'
ORDER BY created_at DESC;
```

---

## Prevention Measures

### Already Implemented:
✅ Unique index prevents new duplicates  
✅ Trigger automatically expires old subscriptions  
✅ Frontend uses `.limit(1)` to handle edge cases  

### Now Adding:
✅ Admin RLS policies for proper permissions  
✅ Specific cleanup for problematic merchant  

---

## Rollback Plan

If something goes wrong:

```sql
-- Rollback permission changes
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payment_submissions;

-- Restore original policies
CREATE POLICY "Service role can manage all subscriptions"
    ON user_subscriptions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage all payments"
    ON payment_submissions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
```

---

## Expected Outcome

After running both migrations:

✅ **No more 406 errors** - Duplicates cleaned up  
✅ **No more 403 errors** - Admin has permissions  
✅ **Subscription creation works** - Admin can create/extend  
✅ **Clean console logs** - No error spam  
✅ **Unique constraint enforced** - No future duplicates  

---

## Summary

**Run these 2 migrations in order:**
1. `20251023000002_fix_admin_subscription_permissions.sql` - Fix permissions
2. `20251023000003_cleanup_specific_merchant_duplicates.sql` - Clean duplicates

**Then refresh browser and test!** 🚀
