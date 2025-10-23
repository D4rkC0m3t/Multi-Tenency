# 🚀 How to Run the Complete Subscription Migration

**You said you haven't run any SQL files yet - Perfect! This is the ONLY file you need to run.**

---

## ⚡ Quick Steps (2 Minutes)

### **Step 1: Open Supabase Dashboard**
```
https://supabase.com/dashboard/project/fdukxfwdlwskznyiezgr
```
- Login with your Supabase account
- Select your project

### **Step 2: Go to SQL Editor**
- Click **"SQL Editor"** in the left sidebar
- Click **"+ New Query"** button

### **Step 3: Copy the Migration File**
- Open this file: **`COMPLETE_SUBSCRIPTION_MIGRATION.sql`**
- Press **Ctrl+A** (Select All)
- Press **Ctrl+C** (Copy)

### **Step 4: Paste and Run**
- Go back to Supabase SQL Editor
- Press **Ctrl+V** (Paste)
- Click the **"Run"** button (or press **Ctrl+Enter**)
- Wait for success message: ✅ "Subscription system migration completed successfully!"

### **Step 5: Refresh Your App**
- Go back to your app in browser
- Press **Ctrl+Shift+R** (Hard Refresh)
- All 404 errors should be gone! 🎉

---

## ✅ What This Creates

### **3 Database Tables:**
1. ✅ `user_subscriptions` - Stores active subscriptions
2. ✅ `payment_submissions` - Stores payment submissions  
3. ✅ `payment_audit_log` - Audit trail for all events

### **4 Functions:**
1. ✅ `check_subscription_access()` - Check trial/subscription status
2. ✅ `verify_payment_and_activate()` - Activate subscription after payment
3. ✅ `reject_payment()` - Reject payment with reason
4. ✅ `check_expired_subscriptions()` - Auto-expire old subscriptions

### **1 Storage Bucket:**
1. ✅ `payments` - For payment screenshot uploads

### **Security:**
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only see their own data
- ✅ Multi-tenant isolation
- ✅ Secure storage policies

---

## 🧪 Verify It Worked

### **Check 1: Tables Created**
In Supabase Dashboard:
1. Click **"Table Editor"** in left sidebar
2. You should see these tables:
   - ✅ `user_subscriptions`
   - ✅ `payment_submissions`
   - ✅ `payment_audit_log`

### **Check 2: Storage Bucket Created**
1. Click **"Storage"** in left sidebar
2. You should see:
   - ✅ `payments` bucket

### **Check 3: Functions Created**
1. Click **"Database"** → **"Functions"**
2. You should see:
   - ✅ `check_subscription_access`
   - ✅ `verify_payment_and_activate`
   - ✅ `reject_payment`
   - ✅ `check_expired_subscriptions`

### **Check 4: App Works**
1. Refresh your app (Ctrl+Shift+R)
2. ✅ No more 404 errors in console
3. ✅ Subscription page loads
4. ✅ Trial countdown shows

---

## 🎯 Test Your Subscription System

### **Test 1: View Subscription Page**
```
http://localhost:5173/subscription
```
Should show:
- ✅ Trial countdown (15 days)
- ✅ Pricing cards
- ✅ No errors

### **Test 2: Check Trial Status**
In Supabase SQL Editor, run:
```sql
SELECT * FROM check_subscription_access('YOUR-MERCHANT-ID');
```
Replace `YOUR-MERCHANT-ID` with your actual merchant ID from the merchants table.

Should return:
- `has_access`: true (if trial active)
- `subscription_status`: 'trial'
- `days_remaining`: 15 (or less)

---

## ❌ Troubleshooting

### **Error: "relation already exists"**
✅ **This is OK!** It means the table already exists. The migration uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times.

### **Error: "permission denied"**
❌ **Solution:** Make sure you're logged in as the project owner in Supabase Dashboard.

### **Error: "function already exists"**
✅ **This is OK!** The migration uses `CREATE OR REPLACE FUNCTION` so it will update the function.

### **Still getting 404 errors?**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check browser console for different errors
4. Verify tables exist in Supabase Table Editor

---

## 📋 Migration File Location

```
COMPLETE_SUBSCRIPTION_MIGRATION.sql
```

**This file includes EVERYTHING:**
- ✅ All tables from previous migrations
- ✅ All functions
- ✅ All security policies
- ✅ Storage bucket
- ✅ Indexes
- ✅ Triggers

**You only need to run this ONE file!**

---

## 🎉 After Migration Success

Your app will have:
- ✅ 15-day free trial system
- ✅ Trial countdown
- ✅ Feature blocking after expiration
- ✅ Payment submission system
- ✅ Admin verification system
- ✅ Subscription management
- ✅ Complete audit trail

---

## 📞 Need Help?

If you get stuck:
1. Check the error message in SQL Editor
2. Verify you have admin access to Supabase
3. Make sure you're in the correct project
4. Try running in smaller chunks if needed

---

## ✅ Quick Checklist

Before running:
- [ ] Opened Supabase Dashboard
- [ ] In correct project (fdukxfwdlwskznyiezgr)
- [ ] Opened SQL Editor
- [ ] Copied COMPLETE_SUBSCRIPTION_MIGRATION.sql

After running:
- [ ] Saw success message
- [ ] Tables visible in Table Editor
- [ ] Storage bucket created
- [ ] Refreshed app
- [ ] No 404 errors
- [ ] Subscription page works

---

**Time to Complete:** 2 minutes  
**Difficulty:** Easy ⭐  
**Files to Run:** 1 (COMPLETE_SUBSCRIPTION_MIGRATION.sql)

**Just copy, paste, and run! That's it!** 🚀
