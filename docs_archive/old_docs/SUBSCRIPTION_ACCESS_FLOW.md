# Subscription Access Flow - Complete Documentation

## Overview
Complete implementation of subscription-based access control for merchant dashboard features with automatic activation after payment verification and manual subscription management.

---

## System Architecture

### 1. **Subscription Tables**

**user_subscriptions**
- `merchant_id` - Reference to merchant
- `plan_type` - monthly, quarterly, half-yearly, yearly, trial
- `status` - active, expired, cancelled, suspended
- `start_date` - Subscription start
- `end_date` - Subscription expiry
- `features_enabled` - JSON object with feature flags
- `max_users` - Maximum users allowed
- `max_products` - Maximum products allowed

**payment_submissions**
- `merchant_id` - Reference to merchant
- `plan_type` - monthly, yearly
- `amount` - Payment amount
- `status` - pending, verified, rejected
- `verified_by` - Admin who verified
- `verified_at` - Verification timestamp

---

## Access Control Logic

### **useSubscriptionAccess Hook**
Location: `src/hooks/useSubscriptionAccess.ts`

**Priority Order:**
1. **Active Subscription** → Full Access ✅
2. **Trial Period (15 days)** → Full Access ✅
3. **Expired Subscription** → No Access ❌
4. **Trial Expired** → No Access ❌
5. **No Subscription** → No Access ❌

**Code Logic:**
```typescript
// Check 1: Active subscription?
const subscription = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('merchant_id', merchant.id)
  .eq('status', 'active')
  .maybeSingle();

if (subscription && endDate > today) {
  return { hasAccess: true, subscriptionStatus: 'active' };
}

// Check 2: Trial period?
const daysSinceCreation = (today - createdAt) / (1000 * 60 * 60 * 24);
const trialDaysRemaining = Math.max(0, 15 - daysSinceCreation);

if (trialDaysRemaining > 0) {
  return { hasAccess: true, subscriptionStatus: 'trial' };
}

// No access
return { hasAccess: false, subscriptionStatus: 'trial_expired' };
```

---

## Feature Access Guard

### **FeatureAccessGuard Component**
Location: `src/components/common/FeatureAccessGuard.tsx`

**Usage:**
```tsx
<FeatureAccessGuard feature="POS System">
  <POSPage />
</FeatureAccessGuard>
```

**Behavior:**
- ✅ **Has Access** → Shows the feature
- ❌ **No Access** → Shows upgrade prompt with specific message

**Messages:**
1. **Trial Expired** → "Your 15-day free trial has ended"
2. **Subscription Expired** → "Your subscription has expired"
3. **No Subscription** → "You need an active subscription"

---

## Automatic Activation Flow

### **Payment Verification → Subscription Activation**

**When Admin Verifies Payment:**

1. Admin goes to `/admin/payments`
2. Clicks "View" on pending payment
3. Clicks "Verify & Activate"
4. System calls `verify_payment_and_activate()` RPC function

**Database Function Logic:**
```sql
CREATE OR REPLACE FUNCTION verify_payment_and_activate(
    p_payment_id UUID,
    p_verified_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Calculate subscription end date
    IF v_plan_type = 'monthly' THEN
        v_subscription_end := NOW() + INTERVAL '1 month';
    ELSIF v_plan_type = 'yearly' THEN
        v_subscription_end := NOW() + INTERVAL '1 year';
    END IF;
    
    -- Update payment status
    UPDATE payment_submissions
    SET status = 'verified', verified_at = NOW()
    WHERE id = p_payment_id;
    
    -- Create/Update subscription
    INSERT INTO user_subscriptions (
        merchant_id, plan_type, status,
        start_date, end_date
    ) VALUES (
        v_merchant_id, v_plan_type, 'active',
        NOW(), v_subscription_end
    )
    ON CONFLICT (merchant_id) WHERE status = 'active'
    DO UPDATE SET end_date = EXCLUDED.end_date;
    
    RETURN TRUE;
END;
$$;
```

**Result:**
- ✅ Payment marked as "verified"
- ✅ Subscription created/updated with status "active"
- ✅ Merchant dashboard features automatically unlocked
- ✅ Audit log entry created

---

## Manual Subscription Management

### **Admin Manual Extension**

**Location:** Merchant Detail Page → Subscription Status Card

**Options:**
1. **1 Month** - Extends by 30 days
2. **3 Months** - Extends by 90 days (Quarterly)
3. **6 Months** - Extends by 180 days (Half-Yearly)
4. **1 Year** - Extends by 365 days (Annually)

**For Active Subscription:**
```typescript
// Extends from current end date
const endDate = new Date(subscription.end_date);
endDate.setMonth(endDate.getMonth() + duration);

await supabase
  .from('user_subscriptions')
  .update({ end_date, plan_type })
  .eq('id', subscription.id);
```

**For No Subscription:**
```typescript
// Creates new subscription from today
await supabase
  .from('user_subscriptions')
  .insert({
    merchant_id,
    plan_type,
    status: 'active',
    start_date: NOW(),
    end_date: NOW() + duration,
    features_enabled: { pos: true, inventory: true, reports: true, einvoice: true },
    max_users: 10,
    max_products: 10000
  });

// Also activate merchant account
await supabase
  .from('merchants')
  .update({ is_active: true })
  .eq('id', merchant_id);
```

---

## Complete User Flows

### **Flow 1: New Merchant Registration**

```
1. Merchant signs up
   ↓
2. Account created with created_at timestamp
   ↓
3. Trial period starts (15 days)
   ↓
4. useSubscriptionAccess returns:
   - hasAccess: true
   - subscriptionStatus: 'trial'
   - trialDaysRemaining: 15
   ↓
5. Merchant can access all features
   ↓
6. Trial countdown visible in UI
```

---

### **Flow 2: Merchant Submits Payment**

```
1. Merchant goes to /subscription
   ↓
2. Selects plan (monthly/yearly)
   ↓
3. Uploads payment screenshot
   ↓
4. Payment submission created with status: 'pending'
   ↓
5. Admin receives notification
   ↓
6. Admin verifies payment
   ↓
7. verify_payment_and_activate() called
   ↓
8. Subscription created/updated with status: 'active'
   ↓
9. Merchant dashboard features remain accessible
   ↓
10. Trial badge replaced with subscription badge
```

---

### **Flow 3: Admin Manual Subscription**

```
1. Admin goes to /admin/merchants
   ↓
2. Clicks "View Details" on merchant
   ↓
3. Scrolls to "Subscription Status" card
   ↓
4. Selects duration (e.g., "3 Months")
   ↓
5. Clicks "Create Subscription" or "Extend Subscription"
   ↓
6. Confirms action
   ↓
7. Subscription created/extended in database
   ↓
8. Merchant account activated (is_active = true)
   ↓
9. Merchant dashboard features immediately accessible
   ↓
10. Toast: "✅ Subscription created/extended!"
```

---

### **Flow 4: Trial Expiration**

```
1. 15 days pass since registration
   ↓
2. useSubscriptionAccess calculates:
   - trialDaysRemaining: 0
   - hasAccess: false
   - subscriptionStatus: 'trial_expired'
   ↓
3. FeatureAccessGuard blocks access
   ↓
4. Shows "Trial Period Expired" message
   ↓
5. "Subscribe Now" button → /subscription
   ↓
6. Merchant submits payment
   ↓
7. Admin verifies → Access restored
```

---

### **Flow 5: Subscription Expiration**

```
1. Subscription end_date passes
   ↓
2. useSubscriptionAccess detects:
   - endDate < today
   - hasAccess: false
   - subscriptionStatus: 'expired'
   ↓
3. FeatureAccessGuard blocks access
   ↓
4. Shows "Subscription Expired" message
   ↓
5. "Renew Subscription" button → /subscription
   ↓
6. Merchant renews → Access restored
```

---

## Feature Access Implementation

### **Protected Routes in App.tsx**

```tsx
<Route path="pos" element={
  <FeatureAccessGuard feature="POS System">
    <POSPage />
  </FeatureAccessGuard>
} />

<Route path="inventory" element={
  <FeatureAccessGuard feature="Inventory Management">
    <StockMovementsPage />
  </FeatureAccessGuard>
} />

<Route path="reports" element={
  <FeatureAccessGuard feature="Reports & Analytics">
    <ReportsPage />
  </FeatureAccessGuard>
} />

<Route path="einvoice" element={
  <FeatureAccessGuard feature="E-Invoice">
    <EInvoicePage />
  </FeatureAccessGuard>
} />
```

---

## Refresh Mechanism

### **Subscription Status Refresh**

The `useSubscriptionAccess` hook now includes a `refresh()` function:

```typescript
const { hasAccess, refresh } = useSubscriptionAccess();

// Call refresh after subscription changes
await refresh();
```

**Auto-refresh triggers:**
- Merchant logs in
- Page reload
- Manual call after subscription update

---

## Database Triggers

### **Automatic Expiration Check**

```sql
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE user_subscriptions
    SET status = 'expired'
    WHERE status = 'active'
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule to run daily
SELECT cron.schedule(
    'check-expired-subscriptions',
    '0 0 * * *', -- Daily at midnight
    'SELECT check_expired_subscriptions()'
);
```

---

## Testing Checklist

### **Manual Subscription**
- [ ] Create subscription for merchant without subscription
- [ ] Merchant can immediately access dashboard features
- [ ] Extend active subscription
- [ ] End date correctly extended
- [ ] Merchant account activated (is_active = true)

### **Payment Verification**
- [ ] Merchant submits payment
- [ ] Admin verifies payment
- [ ] Subscription automatically created
- [ ] Merchant dashboard features unlocked
- [ ] Payment status shows "verified"

### **Trial Period**
- [ ] New merchant has 15-day trial
- [ ] Trial countdown visible
- [ ] Features accessible during trial
- [ ] Access blocked after trial expires
- [ ] Upgrade prompt shown

### **Subscription Expiration**
- [ ] Access blocked when subscription expires
- [ ] Renewal prompt shown
- [ ] Access restored after renewal

### **Feature Guards**
- [ ] All protected routes show upgrade prompt when no access
- [ ] Features accessible with active subscription
- [ ] Features accessible during trial

---

## Troubleshooting

### Issue: Features still blocked after manual subscription
**Solution:** 
1. Check `user_subscriptions` table - status should be 'active'
2. Check `end_date` is in the future
3. Check `merchants.is_active` is true
4. Refresh browser or call `refresh()` function

### Issue: Payment verified but features still blocked
**Solution:**
1. Verify `verify_payment_and_activate()` function executed successfully
2. Check `user_subscriptions` table for new record
3. Check subscription status is 'active'
4. Merchant may need to logout and login again

### Issue: Trial not working for new merchants
**Solution:**
1. Check `merchants.created_at` timestamp exists
2. Verify 15-day calculation in `useSubscriptionAccess`
3. Check no expired subscription exists

---

## Summary

✅ **Automatic Activation** - Payment verification creates subscription  
✅ **Manual Management** - Admin can create/extend subscriptions  
✅ **Trial Period** - 15 days free access for new merchants  
✅ **Feature Guards** - Protected routes with upgrade prompts  
✅ **Access Control** - Real-time subscription status checking  
✅ **Account Activation** - Merchant account activated with subscription  
✅ **Refresh Mechanism** - Subscription status can be refreshed  
✅ **Audit Trail** - All actions logged in payment_audit_log  

The complete subscription access flow is now implemented with automatic activation after payment verification and manual subscription management! 🚀
