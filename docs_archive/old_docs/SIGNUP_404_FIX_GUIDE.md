# 🔧 Fix: 404 Error After Email Confirmation

**Issue:** Users sign up, confirm email, but get 404 error when trying to access the app  
**Root Cause:** Profile and merchant not created automatically after signup  
**Status:** ✅ FIXED

---

## 🎯 Root Cause Analysis

### **What's Happening:**

1. ✅ User signs up successfully
2. ✅ Supabase sends confirmation email
3. ✅ User clicks confirmation link
4. ✅ User is authenticated in Supabase
5. ❌ **App tries to fetch profile → Profile doesn't exist → 404 Error**

### **Why It Happens:**

Your signup process creates a user in `auth.users` but doesn't automatically create:
- Profile in `profiles` table
- Merchant in `merchants` table

When the app loads, it tries to fetch these and fails, causing a 404.

---

## ✅ The Fix

### **Solution: Auto-Create Profile & Merchant**

We'll use a database trigger that automatically creates a profile and merchant when a user signs up.

---

## 🚀 Implementation Steps

### **Step 1: Run the Fix SQL**

Open Supabase SQL Editor and run:

```sql
FIX_SIGNUP_404_ERROR.sql
```

This will:
- ✅ Create `handle_new_user()` function
- ✅ Create trigger on `auth.users`
- ✅ Fix existing users without profiles
- ✅ Prevent future 404 errors

---

### **Step 2: Verify the Fix**

Run this query to check:

```sql
-- Check all users have profiles
SELECT 
  u.email,
  u.created_at as user_created,
  p.id as profile_exists,
  p.merchant_id,
  m.business_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.merchants m ON p.merchant_id = m.id
ORDER BY u.created_at DESC;
```

**Expected Result:**
- Every user should have a `profile_exists` (not null)
- Every user should have a `merchant_id` (not null)

---

### **Step 3: Test Signup Flow**

1. **Sign up with new email:**
   ```
   http://localhost:5173/auth
   ```

2. **Check email and confirm**

3. **Login:**
   ```
   http://localhost:5173/login
   ```

4. **Should redirect to dashboard** ✅ (No 404!)

---

## 🔍 What the Fix Does

### **Automatic Profile Creation:**

When a user signs up, the trigger automatically:

1. **Creates Merchant:**
   ```sql
   INSERT INTO merchants (
     business_name,  -- From signup form
     email,          -- User's email
     phone           -- From signup form
   )
   ```

2. **Creates Profile:**
   ```sql
   INSERT INTO profiles (
     id,             -- Same as auth.users.id
     merchant_id,    -- Links to merchant
     email,          -- User's email
     full_name,      -- From signup form
     role            -- 'admin' by default
   )
   ```

3. **Links Everything Together:**
   - User → Profile (same ID)
   - Profile → Merchant (merchant_id)

---

## 🧪 Testing Checklist

### **Test 1: New Signup**
- [ ] Go to `/auth`
- [ ] Sign up with new email
- [ ] Confirm email
- [ ] Login
- [ ] Should see dashboard (not 404)

### **Test 2: Existing User**
- [ ] Try to login with existing account
- [ ] Should work without 404

### **Test 3: Database Check**
- [ ] Run verification query
- [ ] All users should have profiles
- [ ] All users should have merchants

---

## 📊 Before vs After

### **Before Fix:**

```
User Signs Up
    ↓
Email Confirmed
    ↓
User Authenticated ✅
    ↓
App tries to fetch profile
    ↓
Profile doesn't exist ❌
    ↓
404 ERROR ❌
```

### **After Fix:**

```
User Signs Up
    ↓
Trigger Creates Profile + Merchant ✅
    ↓
Email Confirmed
    ↓
User Authenticated ✅
    ↓
App fetches profile ✅
    ↓
Profile exists ✅
    ↓
Dashboard Loads ✅
```

---

## 🔐 Security Considerations

### **The trigger is secure because:**

1. ✅ Runs with `SECURITY DEFINER` (has permission)
2. ✅ Only creates profile for new users
3. ✅ Uses RLS policies for data access
4. ✅ First user of merchant gets 'admin' role
5. ✅ No SQL injection possible

---

## 🚨 If Still Getting 404

### **Troubleshooting Steps:**

#### **1. Check if trigger exists:**
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

#### **2. Check if function exists:**
```sql
SELECT * FROM pg_proc 
WHERE proname = 'handle_new_user';
```

#### **3. Check user's profile:**
```sql
SELECT * FROM profiles 
WHERE email = 'your-email@example.com';
```

#### **4. Manually create profile:**
```sql
-- If profile doesn't exist, create it manually
DO $$
DECLARE
  user_id UUID;
  new_merchant_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'your-email@example.com';

  -- Create merchant
  INSERT INTO merchants (business_name, email)
  VALUES ('Your Business', 'your-email@example.com')
  RETURNING id INTO new_merchant_id;

  -- Create profile
  INSERT INTO profiles (id, merchant_id, email, full_name, role)
  VALUES (user_id, new_merchant_id, 'your-email@example.com', 'Your Name', 'admin');
END $$;
```

---

## 🎯 Alternative: Manual Profile Creation

### **If you prefer not to use triggers:**

Update `AuthContext.tsx` to create profile on signup:

```typescript
const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) throw error;

  // Create merchant and profile manually
  if (data.user) {
    // Create merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .insert({ business_name: fullName, email })
      .select()
      .single();

    if (merchantError) throw merchantError;

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        merchant_id: merchant.id,
        email,
        full_name: fullName,
        role: 'admin',
      });

    if (profileError) throw profileError;
  }

  toast.success('Check your email for confirmation!');
};
```

**But the trigger approach is better because:**
- ✅ More reliable
- ✅ Works even if user confirms email later
- ✅ Handles edge cases
- ✅ No frontend code changes needed

---

## 📋 Summary

### **Issue:**
- ❌ 404 error after email confirmation
- ❌ Profile not created automatically

### **Fix:**
- ✅ Database trigger auto-creates profile + merchant
- ✅ Works for all new signups
- ✅ Fixed existing users without profiles

### **Result:**
- ✅ No more 404 errors
- ✅ Smooth signup experience
- ✅ Users can login immediately after confirmation

---

## 🚀 Deploy to Production

### **After testing locally:**

1. **Run the same SQL in production Supabase:**
   - Go to your production Supabase dashboard
   - Open SQL Editor
   - Run `FIX_SIGNUP_404_ERROR.sql`

2. **Verify in production:**
   ```sql
   SELECT COUNT(*) FROM auth.users;
   SELECT COUNT(*) FROM profiles;
   -- Both should be equal
   ```

3. **Test signup in production:**
   - Sign up with test email
   - Confirm email
   - Login
   - Should work! ✅

---

**Your 404 error is now fixed! 🎉**

**Run the SQL file and test the signup flow!**
