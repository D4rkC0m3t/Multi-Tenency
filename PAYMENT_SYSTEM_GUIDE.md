# 💳 Payment Management System - Complete Guide

## 🎯 Overview

Complete payment verification and subscription management system for KrishiSethu. This system allows users to submit payments via PhonePe, and admins to verify and activate subscriptions.

---

## 📋 **System Components**

### **1. Database Schema** ✅
- `payment_submissions` - Stores payment submissions from users
- `user_subscriptions` - Manages active subscriptions
- `payment_audit_log` - Audit trail for all payment events

### **2. User Features** ✅
- **Subscription Page** (`/subscription`)
  - View current subscription status
  - See days remaining
  - Submit new payments
  - Upload payment screenshots
  - View payment history

### **3. Admin Features** ✅
- **Payment Management** (`/admin/payments`)
  - View all payment submissions
  - Filter by status (pending/verified/rejected)
  - Search by merchant name, email, or transaction ID
  - View payment screenshots
  - Verify payments and activate subscriptions
  - Reject payments with reasons
  - Real-time statistics dashboard

---

## 🚀 **Setup Instructions**

### **Step 1: Run Database Migrations**

```bash
# Navigate to your project directory
cd d:\multi-tenant_fertilizer_inventory_management_system_9nb07n_alphaproject

# Run the migrations in Supabase SQL Editor or via CLI
```

**Migrations to run (in order):**
1. `supabase/migrations/20251022000002_payment_management_system.sql`
2. `supabase/migrations/20251022000003_payment_storage_bucket.sql`

**Or manually in Supabase Dashboard:**
1. Go to SQL Editor
2. Copy and paste each migration file
3. Click "Run"

### **Step 2: Create Storage Bucket**

**Option A: Via SQL (Recommended)**
- Run the `20251022000003_payment_storage_bucket.sql` migration

**Option B: Via Dashboard**
1. Go to Supabase Dashboard → Storage
2. Click "Create Bucket"
3. Name: `payments`
4. Public: ✅ Yes
5. Click "Create"

### **Step 3: Configure Storage Policies**

If you created the bucket manually, add these policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payments');

-- Allow public viewing
CREATE POLICY "Public can view payment screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payments');
```

### **Step 4: Add PhonePe QR Code**

1. Save your PhonePe QR code image
2. Name it: `phonepe-qr.png`
3. Place in: `public/phonepe-qr.png`

---

## 👥 **User Flow**

### **For Customers:**

```
1. User lands on website → Clicks "Buy Now" on Pro Plan
   ↓
2. Modal opens with PhonePe QR code
   ↓
3. User scans QR → Pays via PhonePe
   ↓
4. User goes to Dashboard → Subscription page
   ↓
5. Clicks "Subscribe Now" → Selects plan
   ↓
6. Uploads payment screenshot → Submits
   ↓
7. Status shows "Pending" → Waits for verification
   ↓
8. Admin verifies → Status changes to "Verified"
   ↓
9. Subscription activated automatically! ✅
```

### **For Admins:**

```
1. Admin goes to /admin/payments
   ↓
2. Sees all pending payment submissions
   ↓
3. Clicks "View" on a payment
   ↓
4. Reviews:
   - Merchant details
   - Plan type
   - Amount
   - Payment screenshot
   - Transaction ID
   ↓
5. Decision:
   ├─ Verify → Subscription activated automatically
   └─ Reject → Enter reason → User notified
```

---

## 🔧 **Database Functions**

### **1. Check Subscription Access**
```sql
SELECT * FROM check_subscription_access('merchant-uuid');
```
Returns:
- `has_access` - Boolean
- `subscription_status` - active/expired/cancelled
- `days_remaining` - Integer
- `plan_type` - monthly/yearly
- `features_enabled` - JSON

### **2. Verify Payment**
```sql
SELECT verify_payment_and_activate(
  'payment-uuid',
  'admin-user-uuid',
  'Optional notes'
);
```
Actions:
- Updates payment status to 'verified'
- Creates/updates subscription
- Sets subscription dates
- Logs audit event

### **3. Reject Payment**
```sql
SELECT reject_payment(
  'payment-uuid',
  'admin-user-uuid',
  'Rejection reason'
);
```
Actions:
- Updates payment status to 'rejected'
- Stores rejection reason
- Logs audit event

### **4. Check Expired Subscriptions**
```sql
SELECT check_expired_subscriptions();
```
Actions:
- Finds expired subscriptions
- Updates status to 'expired'
- Logs audit events

---

## 📊 **Database Tables**

### **payment_submissions**
```sql
id                    UUID PRIMARY KEY
merchant_id           UUID (FK to merchants)
plan_type             TEXT (monthly/yearly)
amount                DECIMAL(10,2)
currency              TEXT (default: INR)
payment_method        TEXT (phonepe/bank_transfer/other)
transaction_id        TEXT (optional)
payment_screenshot_url TEXT
status                TEXT (pending/verified/rejected/expired)
verified_by           UUID (FK to auth.users)
verified_at           TIMESTAMPTZ
rejection_reason      TEXT
subscription_start_date TIMESTAMPTZ
subscription_end_date TIMESTAMPTZ
notes                 TEXT
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

### **user_subscriptions**
```sql
id                    UUID PRIMARY KEY
merchant_id           UUID (FK to merchants)
plan_type             TEXT (trial/monthly/yearly/lifetime)
status                TEXT (active/expired/cancelled/suspended)
start_date            TIMESTAMPTZ
end_date              TIMESTAMPTZ
trial_end_date        TIMESTAMPTZ
payment_submission_id UUID (FK to payment_submissions)
auto_renew            BOOLEAN
features_enabled      JSONB
max_users             INTEGER
max_products          INTEGER
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
cancelled_at          TIMESTAMPTZ
```

### **payment_audit_log**
```sql
id                    UUID PRIMARY KEY
payment_submission_id UUID (FK to payment_submissions)
merchant_id           UUID (FK to merchants)
event_type            TEXT (submission_created/payment_verified/etc)
performed_by          UUID (FK to auth.users)
performed_at          TIMESTAMPTZ
old_status            TEXT
new_status            TEXT
notes                 TEXT
metadata              JSONB
created_at            TIMESTAMPTZ
```

---

## 🎨 **UI Components**

### **1. Landing Page Payment Modal**
**Location:** `src/components/landing/LandingPageNew.tsx`

**Features:**
- PhonePe QR code display
- Plan details
- Payment instructions
- Email confirmation button

### **2. Subscription Page**
**Location:** `src/components/subscription/SubscriptionPage.tsx`
**Route:** `/subscription`

**Features:**
- Current subscription status
- Days remaining counter
- Pricing plans (monthly/yearly)
- Payment submission form
- Screenshot upload
- Payment history

### **3. Admin Payment Management**
**Location:** `src/components/admin/PaymentManagementPage.tsx`
**Route:** `/admin/payments`

**Features:**
- Statistics dashboard
- Filter by status
- Search functionality
- Payment details modal
- Verify/Reject actions
- Screenshot viewer

---

## 🔐 **Security & Permissions**

### **Row Level Security (RLS)**

**payment_submissions:**
- Users can view their own submissions
- Users can create submissions
- Service role can manage all

**user_subscriptions:**
- Users can view their own subscriptions
- Service role can manage all

**payment_audit_log:**
- Users can view their own audit logs
- Service role can manage all

### **Storage Policies:**
- Authenticated users can upload to `payment-screenshots/`
- Public can view (for admin verification)
- Service role has full access

---

## 📱 **API Usage Examples**

### **Submit Payment (User)**
```typescript
const { error } = await supabase
  .from('payment_submissions')
  .insert({
    merchant_id: merchantId,
    plan_type: 'monthly',
    amount: 3999,
    payment_method: 'phonepe',
    transaction_id: 'TXN123456',
    payment_screenshot_url: screenshotUrl,
    status: 'pending'
  });
```

### **Verify Payment (Admin)**
```typescript
const { error } = await supabase.rpc('verify_payment_and_activate', {
  p_payment_id: paymentId,
  p_verified_by: adminUserId,
  p_notes: 'Verified manually'
});
```

### **Check Subscription**
```typescript
const { data } = await supabase.rpc('check_subscription_access', {
  p_merchant_id: merchantId
});

if (data[0]?.has_access) {
  // User has active subscription
}
```

---

## 🎯 **Pricing Plans**

### **Monthly Plan**
- **Price:** ₹3,999/month
- **Features:**
  - Full POS System
  - Inventory Management
  - E-Invoice Generation
  - Reports & Analytics

### **Yearly Plan**
- **Price:** ₹45,000/year
- **Savings:** ₹2,988 (6% discount)
- **Features:**
  - Everything in Monthly
  - Priority Support
  - Advanced Analytics
  - Custom Integrations

---

## 🔄 **Subscription Lifecycle**

```
1. Trial (Optional)
   ↓
2. Payment Submitted → Status: Pending
   ↓
3. Admin Verifies → Status: Verified
   ↓
4. Subscription Activated → Status: Active
   ↓
5. Time Passes...
   ↓
6. Subscription Expires → Status: Expired
   ↓
7. User Renews → Back to Step 2
```

---

## 📈 **Admin Dashboard Statistics**

- **Total Submissions** - All payment submissions
- **Pending** - Awaiting verification
- **Verified** - Approved and activated
- **Rejected** - Declined with reasons

---

## 🛠️ **Maintenance Tasks**

### **Daily:**
- Check pending payments
- Verify legitimate submissions
- Respond to rejected payments

### **Weekly:**
- Review payment audit logs
- Check subscription expirations
- Generate payment reports

### **Monthly:**
- Run `check_expired_subscriptions()`
- Clean up old rejected submissions
- Analyze payment trends

---

## 🐛 **Troubleshooting**

### **Issue: Payment screenshot not uploading**
**Solution:**
1. Check storage bucket exists: `payments`
2. Verify storage policies are set
3. Check file size (max 5MB recommended)
4. Ensure user is authenticated

### **Issue: Subscription not activating after verification**
**Solution:**
1. Check `verify_payment_and_activate` function logs
2. Verify merchant_id exists
3. Check for unique constraint violations
4. Review audit log for errors

### **Issue: User can't see subscription page**
**Solution:**
1. Verify route is added in App.tsx
2. Check user authentication
3. Verify merchant_id in profile

---

## 📞 **Support**

For payment-related issues:
- **Email:** support@krishisethu.in
- **Phone:** +91 9963600975
- **Website:** www.krishisethu.in

---

## ✅ **Checklist for Going Live**

- [ ] Run all database migrations
- [ ] Create storage bucket
- [ ] Set up storage policies
- [ ] Add PhonePe QR code image
- [ ] Test payment submission flow
- [ ] Test admin verification flow
- [ ] Test subscription activation
- [ ] Test expiration handling
- [ ] Set up automated expiration checks
- [ ] Configure email notifications (optional)
- [ ] Train admin staff on verification process
- [ ] Document rejection reasons
- [ ] Set up monitoring and alerts

---

## 🎉 **Features Summary**

✅ **User Features:**
- Submit payments with screenshots
- Track payment status
- View subscription details
- See payment history
- Upload transaction IDs

✅ **Admin Features:**
- Verify payments
- Reject with reasons
- View all submissions
- Search and filter
- Statistics dashboard
- Audit trail

✅ **Automated:**
- Subscription activation
- Date calculations
- Expiration handling
- Audit logging
- RLS security

---

**System Status:** ✅ Ready for Production  
**Last Updated:** October 22, 2025  
**Version:** 1.0.0

---

*For technical support or feature requests, contact the development team.*
