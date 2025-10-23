# 🔑 Admin Credentials Setup Guide

**Quick Setup:** Create your admin account in 2 minutes!

---

## 🎯 Two Types of Admin Access

### **1. Platform Admin (Super Admin)**
- Access to ALL merchants
- Payment management
- System-wide control
- URL: `/admin/dashboard` and `/admin/payments`

### **2. Merchant Admin**
- Access to YOUR merchant only
- Full merchant features
- URL: `/dashboard`

---

## 🚀 Quick Setup - Platform Admin

### **Step 1: Sign Up First**

1. Go to: http://localhost:5173/auth
2. Click "Sign Up"
3. Fill in details:
   ```
   Email: admin@krishisethu.in
   Password: Admin@123456
   Business Name: KrishiSethu Admin
   ```
4. Click "Sign Up"

---

### **Step 2: Make Yourself Platform Admin**

After signing up, run this SQL in Supabase:

```sql
-- Find your user ID first
SELECT id, email, role FROM profiles 
WHERE email = 'admin@krishisethu.in';

-- Make yourself platform admin
UPDATE profiles 
SET 
  role = 'super_admin',
  is_platform_admin = true
WHERE email = 'admin@krishisethu.in';

-- Verify
SELECT id, email, role, is_platform_admin 
FROM profiles 
WHERE email = 'admin@krishisethu.in';
```

---

### **Step 3: Login**

1. Go to: http://localhost:5173/admin/login
2. Enter credentials:
   ```
   Email: admin@krishisethu.in
   Password: Admin@123456
   ```
3. Click "Login"

---

## 📋 Default Admin Credentials (After Setup)

### **Platform Admin:**
```
URL: http://localhost:5173/admin/login
Email: admin@krishisethu.in
Password: Admin@123456
```

### **Or Regular Login:**
```
URL: http://localhost:5173/login
Email: admin@krishisethu.in
Password: Admin@123456
```

---

## 🔐 Production Admin Credentials

### **For Production (www.krishisethu.in):**

**Recommended credentials:**
```
Email: admin@krishisethu.in
Password: [Create a strong password]
```

**Setup steps:**
1. Sign up at: https://www.krishisethu.in/auth
2. Run SQL in Supabase production database
3. Login at: https://www.krishisethu.in/admin/login

---

## 🎯 Quick Test Credentials

### **For Testing Locally:**

**Admin Account:**
```
Email: admin@test.com
Password: Test@123456
```

**Setup SQL:**
```sql
-- After signing up with above credentials
UPDATE profiles 
SET 
  role = 'super_admin',
  is_platform_admin = true
WHERE email = 'admin@test.com';
```

---

## 🔍 Check If Admin Exists

Run this SQL in Supabase:

```sql
-- Check all admin users
SELECT 
  id,
  email,
  role,
  is_platform_admin,
  created_at
FROM profiles
WHERE role = 'super_admin' 
   OR is_platform_admin = true;
```

**If no results:** No admin exists yet - follow Step 1 & 2 above

---

## 🚨 If You Forgot Admin Password

### **Reset via Supabase:**

```sql
-- Get user ID
SELECT id, email FROM auth.users 
WHERE email = 'admin@krishisethu.in';

-- Then use Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Find the user
-- 3. Click "..." → "Reset Password"
-- 4. Send reset email
```

---

## 📊 Admin Access Levels

### **What Platform Admin Can Access:**

✅ `/admin/login` - Admin login page  
✅ `/admin/dashboard` - Admin dashboard  
✅ `/admin/payments` - Payment management  
✅ `/dashboard` - Regular dashboard  
✅ All merchant features  
✅ View all merchants' data  

### **What Merchant Admin Can Access:**

✅ `/login` - Regular login  
✅ `/dashboard` - Merchant dashboard  
✅ All features for their merchant  
❌ Cannot access other merchants  
❌ Cannot access `/admin/payments`  

---

## 🎓 Complete Setup Example

### **Step-by-Step:**

**1. Open browser:**
```
http://localhost:5173/auth
```

**2. Sign up with:**
```
Email: admin@krishisethu.in
Password: Admin@123456
Business Name: KrishiSethu Platform
Phone: 9876543210
```

**3. Open Supabase SQL Editor**

**4. Run this SQL:**
```sql
-- Make yourself platform admin
UPDATE profiles 
SET 
  role = 'super_admin',
  is_platform_admin = true
WHERE email = 'admin@krishisethu.in';
```

**5. Login:**
```
URL: http://localhost:5173/admin/login
Email: admin@krishisethu.in
Password: Admin@123456
```

**6. Success! 🎉**

---

## 🔐 Security Best Practices

### **For Production:**

1. **Use strong password:**
   ```
   Minimum 12 characters
   Mix of uppercase, lowercase, numbers, symbols
   Example: KrishiSethu@2025#Admin
   ```

2. **Change default credentials immediately**

3. **Enable 2FA (when implemented)**

4. **Use unique email:**
   ```
   ✅ admin@yourdomain.com
   ❌ admin@gmail.com
   ```

5. **Limit admin accounts:**
   - Only create admins when needed
   - Review admin list regularly

---

## 📞 Troubleshooting

### **Issue 1: "Invalid credentials"**
**Solution:**
- Check email spelling
- Check password (case-sensitive)
- Verify account exists in database

### **Issue 2: "Access denied"**
**Solution:**
- Check `is_platform_admin = true` in database
- Check `role = 'super_admin'` in database
- Clear browser cache and retry

### **Issue 3: "Cannot access /admin/payments"**
**Solution:**
- Verify you're logged in
- Check admin status in database
- Check browser console for errors

---

## ✅ Quick Verification

### **After setup, verify:**

```sql
-- Check your admin status
SELECT 
  email,
  role,
  is_platform_admin,
  merchant_id
FROM profiles
WHERE email = 'admin@krishisethu.in';

-- Should return:
-- email: admin@krishisethu.in
-- role: super_admin
-- is_platform_admin: true
-- merchant_id: [some UUID]
```

---

## 🎯 Summary

### **To Create Admin:**

1. ✅ Sign up at `/auth`
2. ✅ Run SQL to make platform admin
3. ✅ Login at `/admin/login`
4. ✅ Access admin features

### **Default Credentials (After Setup):**
```
Email: admin@krishisethu.in
Password: Admin@123456
```

### **Admin URLs:**
```
Login: http://localhost:5173/admin/login
Dashboard: http://localhost:5173/admin/dashboard
Payments: http://localhost:5173/admin/payments
```

---

**Ready to create your admin account! Follow Step 1 & 2 above!** 🚀
