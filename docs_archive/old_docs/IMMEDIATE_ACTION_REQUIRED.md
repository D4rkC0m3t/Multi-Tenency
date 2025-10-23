# IMMEDIATE ACTION REQUIRED

## Current Issues:
1. **401 Unauthorized** - Admin RLS policy doesn't match login logic
2. **406 Not Acceptable** - Duplicates STILL exist for merchant `d0894866-ef62-47e0-a466-7250616a18f8`

---

## STEP 1: Run Debug Script (FIRST!)

**File:** `DEBUG_SUBSCRIPTION_ISSUES.sql`

This will show you:
- How many duplicates exist
- Which subscriptions are active
- If policies are correct
- If triggers are working

**Run in Supabase SQL Editor NOW!**

---

## STEP 2: Run Comprehensive Fix

**File:** `20251023000005_fix_admin_auth_and_cleanup.sql`

This migration:
✅ Fixes RLS policies to match `is_platform_admin` OR `role = 'super_admin'` OR `role = 'admin'`  
✅ Aggressively cleans up ALL duplicate subscriptions  
✅ Adds stronger trigger to prevent future duplicates  
✅ Verifies cleanup succeeded  
✅ Adds helper function to fix specific merchants  

**Run in Supabase SQL Editor!**

---

## STEP 3: Verify Your Admin User

Run this to check your admin profile:

```sql
-- Check your admin user
SELECT 
    id,
    email,
    role,
    is_platform_admin,
    is_active
FROM profiles
WHERE email = 'YOUR_ADMIN_EMAIL@example.com';
```

**Expected Result:**
- `is_platform_admin = true` OR
- `role = 'super_admin'` OR  
- `role = 'admin'`
- `is_active = true`

---

## STEP 4: If Still Having Issues

Run this to manually fix the specific merchant:

```sql
-- Fix specific merchant
SELECT * FROM fix_merchant_subscriptions('d0894866-ef62-47e0-a466-7250616a18f8');
```

---

## STEP 5: Logout and Login Again

1. Logout from admin panel
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again at `/admin/login`
4. Try creating subscription

---

## Root Cause Analysis:

### 401 Error:
- **Problem:** RLS policy checked for `role = 'admin'`
- **Reality:** AdminLoginPage checks for `is_platform_admin` OR `role = 'super_admin'`
- **Fix:** Updated policy to match all three conditions

### 406 Error:
- **Problem:** Duplicates keep getting created
- **Reality:** Trigger wasn't aggressive enough
- **Fix:** New trigger expires ALL existing active subscriptions before allowing new one

---

## Expected Outcome After Fix:

✅ No 401 errors - Admin can authenticate  
✅ No 406 errors - Only one active subscription per merchant  
✅ No 403 errors - RLS policies allow admin operations  
✅ Subscription creation works  
✅ Clean console logs  

---

## If STILL Not Working:

Contact me with:
1. Output from `DEBUG_SUBSCRIPTION_ISSUES.sql`
2. Your admin user email
3. Screenshot of console errors
4. Result of: `SELECT * FROM pg_policies WHERE tablename = 'user_subscriptions';`

---

## Quick Test After Fix:

```sql
-- Should return 0 rows
SELECT merchant_id, COUNT(*) 
FROM user_subscriptions 
WHERE status = 'active' 
GROUP BY merchant_id 
HAVING COUNT(*) > 1;
```

---

## Summary:

**Run these in order:**
1. `DEBUG_SUBSCRIPTION_ISSUES.sql` - Diagnose
2. `20251023000005_fix_admin_auth_and_cleanup.sql` - Fix
3. Logout and login again
4. Test subscription creation

This WILL fix both issues! 🎯
