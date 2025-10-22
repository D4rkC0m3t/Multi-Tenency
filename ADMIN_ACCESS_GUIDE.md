# 🔐 Admin Access Guide

**Your Application:** Multi-Tenant Fertilizer Inventory Management System  
**Admin System:** Unified Login with Role-Based Access

---

## 🎯 How Admin Login Works

### **There is NO separate admin login page!**

Your system uses **role-based access control (RBAC)** with a **unified login system**.

**Everyone logs in through the same page:**
```
http://localhost:5173/auth
```

**What determines admin access:**
- User's `role` in the database
- User's `is_platform_admin` flag

---

## 👥 User Roles

Your system has 5 roles:

| Role | Access Level | Can Do |
|------|--------------|--------|
| **super_admin** | Platform-wide | Everything + manage all merchants |
| **admin** | Merchant-level | Full access to their merchant's data |
| **manager** | Merchant-level | Most features, limited settings |
| **staff** | Merchant-level | Daily operations |
| **cashier** | Merchant-level | POS and basic features |

---

## 🔑 Admin Access URLs

### **1. Payment Management (Platform Admin)**
```
http://localhost:5173/admin/payments
```

**Who can access:**
- Users with `is_platform_admin = true`
- Users with `role = 'super_admin'`

**What they can do:**
- View all payment submissions from all merchants
- Verify payments
- Reject payments with reasons
- Activate subscriptions

---

### **2. Regular Merchant Admin**
```
http://localhost:5173/dashboard
```

**Who can access:**
- Users with `role = 'admin'` (for their merchant)

**What they can do:**
- Full access to their merchant's data
- Manage products, sales, inventory
- View reports
- Manage users (if implemented)

---

## 🚀 How to Create Admin Users

### **Method 1: Create Platform Admin (Super Admin)**

Run this SQL in Supabase:

```sql
-- Create a platform admin account
-- First, sign up normally through the app, then run this:

UPDATE profiles 
SET 
  role = 'super_admin',
  is_platform_admin = true,
  admin_permissions = ARRAY['manage_payments', 'manage_merchants', 'view_all_data']
WHERE email = 'your-admin-email@example.com';
```

---

### **Method 2: Create Merchant Admin**

When a merchant signs up, they automatically get `role = 'admin'` for their merchant.

**To manually create:**
```sql
-- Set user as admin for their merchant
UPDATE profiles 
SET role = 'admin'
WHERE email = 'merchant-email@example.com';
```

---

## 📋 Step-by-Step: Access Payment Management

### **Step 1: Create Platform Admin Account**

1. **Sign up normally:**
   ```
   http://localhost:5173/auth
   ```
   - Use email: `admin@yourdomain.com`
   - Create account

2. **Promote to Platform Admin:**
   - Go to Supabase SQL Editor
   - Run:
   ```sql
   UPDATE profiles 
   SET 
     role = 'super_admin',
     is_platform_admin = true
   WHERE email = 'admin@yourdomain.com';
   ```

3. **Logout and Login again**

4. **Access Payment Management:**
   ```
   http://localhost:5173/admin/payments
   ```

---

### **Step 2: Verify Payments**

Once logged in as platform admin:

1. Go to `/admin/payments`
2. See all pending payment submissions
3. Click "Verify" to approve
4. Click "Reject" to deny with reason
5. View payment screenshots
6. Filter by status (pending/verified/rejected)

---

## 🔍 Check Your Current Role

### **Method 1: In Browser Console**
```javascript
// After logging in, run in browser console:
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
console.log('Your role:', profile.role);
console.log('Platform admin:', profile.is_platform_admin);
```

### **Method 2: In Supabase**
```sql
-- Check your profile
SELECT 
  email,
  role,
  is_platform_admin,
  admin_permissions
FROM profiles
WHERE email = 'your-email@example.com';
```

---

## 🛠️ Admin Features by Role

### **Platform Admin (super_admin)**
- ✅ Access `/admin/payments`
- ✅ View all merchants' data
- ✅ Verify/reject payments
- ✅ Manage subscriptions
- ✅ Access DevAdmin panel (if implemented)

### **Merchant Admin**
- ✅ Full access to their merchant's data
- ✅ Manage products, inventory, sales
- ✅ View reports and analytics
- ✅ Manage settings
- ❌ Cannot access `/admin/payments`
- ❌ Cannot see other merchants' data

### **Manager/Staff/Cashier**
- ✅ Limited access based on role
- ❌ Cannot access admin features
- ❌ Cannot manage settings

---

## 🔐 Security: How Access is Controlled

### **1. Row Level Security (RLS)**
Database automatically filters data by merchant:
```sql
-- Users can only see their merchant's data
CREATE POLICY "Users can view their merchant data"
  ON products FOR SELECT
  TO authenticated
  USING (merchant_id IN (
    SELECT merchant_id FROM profiles WHERE id = auth.uid()
  ));
```

### **2. Frontend Route Protection**
```typescript
// In App.tsx
<Route path="admin/payments" element={<PaymentManagementPage />} />

// PaymentManagementPage checks role internally
// Only platform admins can access
```

### **3. API Level Protection**
```typescript
// Check user role before allowing actions
if (profile.is_platform_admin || profile.role === 'super_admin') {
  // Allow admin actions
}
```

---

## 📊 Current Admin Setup

### **Payment Management Page:**
**File:** `src/components/admin/PaymentManagementPage.tsx`  
**Route:** `/admin/payments`  
**Access:** Platform admins only

**Features:**
- View all payment submissions
- Filter by status (pending/verified/rejected)
- Search by merchant name/email
- View payment screenshots
- Verify payments (activates subscription)
- Reject payments with reason
- Export data

---

## 🎯 Quick Setup Guide

### **For Testing (Development):**

1. **Create test admin account:**
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@test.com', crypt('Admin123!@#', gen_salt('bf')), NOW());

-- Get the user ID
SELECT id FROM auth.users WHERE email = 'admin@test.com';

-- Create profile
INSERT INTO profiles (id, email, full_name, role, is_platform_admin)
VALUES (
  'USER_ID_FROM_ABOVE',
  'admin@test.com',
  'Platform Admin',
  'super_admin',
  true
);
```

2. **Login:**
   - Go to `/auth`
   - Email: `admin@test.com`
   - Password: `Admin123!@#`

3. **Access admin panel:**
   - Go to `/admin/payments`

---

### **For Production:**

1. **Sign up normally** through the app
2. **Promote to admin** via SQL:
```sql
UPDATE profiles 
SET 
  role = 'super_admin',
  is_platform_admin = true,
  admin_permissions = ARRAY['all']
WHERE email = 'your-real-admin@yourdomain.com';
```

3. **Logout and login again**
4. **Access** `/admin/payments`

---

## 🚨 Important Security Notes

### **1. Protect Admin Emails**
- Use strong, unique passwords
- Enable 2FA (when implemented)
- Don't share admin credentials

### **2. Limit Platform Admins**
- Only create platform admins for trusted users
- Regular merchants should be `role = 'admin'` (not platform admin)

### **3. Audit Admin Actions**
- All payment verifications are logged in `payment_audit_log`
- Check logs regularly:
```sql
SELECT * FROM payment_audit_log 
ORDER BY created_at DESC 
LIMIT 50;
```

---

## 📝 Summary

### **Login URL:**
```
http://localhost:5173/auth
```
**Same for everyone!** Role determines access.

### **Admin Panel URL:**
```
http://localhost:5173/admin/payments
```
**Only for platform admins!**

### **To Become Admin:**
```sql
UPDATE profiles 
SET is_platform_admin = true, role = 'super_admin'
WHERE email = 'your-email@example.com';
```

### **Check Access:**
```sql
SELECT email, role, is_platform_admin 
FROM profiles 
WHERE email = 'your-email@example.com';
```

---

## 🎓 Role Hierarchy

```
super_admin (Platform Admin)
    ↓
admin (Merchant Admin)
    ↓
manager (Merchant Manager)
    ↓
staff (Merchant Staff)
    ↓
cashier (Merchant Cashier)
```

---

## 🔗 Related Files

- **Login Page:** `src/components/auth/LoginForm.tsx`
- **Payment Admin:** `src/components/admin/PaymentManagementPage.tsx`
- **Auth Context:** `src/contexts/AuthContext.tsx`
- **Routes:** `src/App.tsx`
- **Database Types:** `src/types/database.ts`

---

**Need help?** Check the `profiles` table in Supabase to see user roles!

**Quick Check:**
```sql
SELECT email, role, is_platform_admin FROM profiles;
```
