# 🚀 Run Subscription Migration - Quick Guide

**Error:** 404 on `user_subscriptions` and `payment_submissions` tables  
**Solution:** Run the database migration to create these tables

---

## ⚡ Quick Fix (Choose One Method)

### **Method 1: Supabase Dashboard (Recommended)** ✅

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/fdukxfwdlwskznyiezgr
   ```

2. **Go to SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Paste Migration:**
   - Open file: `supabase/migrations/20251022000004_create_subscription_tables.sql`
   - Copy ALL content
   - Paste into SQL Editor

4. **Run Migration:**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message

5. **Verify:**
   - Go to "Table Editor"
   - Check if these tables exist:
     - ✅ `user_subscriptions`
     - ✅ `payment_submissions`
     - ✅ `payment_audit_log`

---

### **Method 2: Supabase CLI** 

```powershell
# Navigate to project directory
cd d:\multi-tenant_fertilizer_inventory_management_system_9nb07n_alphaproject

# Run migration
supabase db push

# Or run specific migration
supabase migration up
```

---

## 📋 What This Migration Creates

### **1. Tables:**
- `user_subscriptions` - Stores active subscriptions
- `payment_submissions` - Stores payment submissions for verification
- `payment_audit_log` - Audit trail for all events

### **2. Functions:**
- `check_subscription_access()` - Check if user has access
- `verify_payment_and_activate()` - Activate subscription after payment
- `reject_payment()` - Reject payment with reason
- `check_expired_subscriptions()` - Auto-expire old subscriptions

### **3. Security:**
- Row Level Security (RLS) policies
- Users can only see their own data
- Service role has full access

---

## ✅ After Running Migration

1. **Refresh your browser** (Ctrl+F5)
2. **Check console** - 404 errors should be gone
3. **Go to subscription page** - Should load without errors
4. **Trial countdown** - Should show days remaining

---

## 🧪 Test the Migration

### **Test 1: Check Tables Exist**
Run in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_subscriptions', 'payment_submissions', 'payment_audit_log');
```

Expected: 3 rows returned

### **Test 2: Check Subscription Access**
Run in SQL Editor:
```sql
SELECT * FROM check_subscription_access('YOUR-MERCHANT-ID');
```

Replace `YOUR-MERCHANT-ID` with your actual merchant ID.

Expected: Returns trial status and days remaining

---

## 🔍 Troubleshooting

### **Issue: "Permission denied"**
**Solution:** Make sure you're logged in as project owner

### **Issue: "Function already exists"**
**Solution:** Migration already ran, you're good!

### **Issue: "Table already exists"**
**Solution:** Tables already created, you're good!

### **Issue: Still getting 404**
**Solution:** 
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check Supabase project URL is correct

---

## 📊 Migration File Location

```
supabase/migrations/20251022000004_create_subscription_tables.sql
```

**File Size:** ~12KB  
**Tables:** 3  
**Functions:** 4  
**Policies:** 9  

---

## 🎯 Quick Verification Checklist

After running migration, verify:

- [ ] No more 404 errors in console
- [ ] Subscription page loads
- [ ] Trial countdown shows
- [ ] Can see pricing cards
- [ ] Tables visible in Supabase dashboard
- [ ] RLS policies active

---

## 💡 Important Notes

1. **Run this ONCE** - Don't run multiple times
2. **Backup first** - If you have important data
3. **Production** - Test in development first
4. **RLS Active** - Security policies are enabled

---

## 🚀 Next Steps After Migration

1. ✅ Migration runs successfully
2. ✅ Refresh browser
3. ✅ Test subscription page
4. ✅ Test trial countdown
5. ✅ Test payment submission (optional)
6. ✅ Test admin verification (optional)

---

## 📞 Need Help?

If migration fails:
1. Check error message in SQL Editor
2. Verify you have admin access
3. Check if tables already exist
4. Try running in smaller chunks

---

**Status:** Ready to Run! 🎊  
**Time to Complete:** ~30 seconds  
**Difficulty:** Easy ⭐

Just copy the SQL file content and paste it into Supabase SQL Editor, then click Run!
