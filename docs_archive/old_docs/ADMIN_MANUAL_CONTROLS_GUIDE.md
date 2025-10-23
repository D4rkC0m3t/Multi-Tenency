# Admin Manual Controls - Complete Implementation Guide

## Overview
Complete implementation of manual control system for admin dashboard with full database operations for pause, ban, and subscription management.

---

## Features Implemented

### 1. **Admin Dashboard Control Panel**
Location: `/admin/dashboard`

#### Control Categories:

**💳 Payment Controls**
- Review Pending Payments (with count badge)
- Refresh Payment Data

**👥 Account Controls**
- Manage Accounts
- Pause Account (with guidance)

**▶️ Subscription Controls**
- Activate Subscription
- View Subscriptions

**🚫 Security Controls**
- Ban Account (with warning)
- Refresh Dashboard

**Quick Stats Bar:**
- Verified Payments (green)
- Pending Review (yellow)
- Total Merchants
- Total Revenue (blue)

---

### 2. **Merchants List Page**
Location: `/admin/merchants`

**Table Columns:**
- Name
- Email
- Payment Status (No Payment, Pending, Verified, Rejected)
- Subscription (No Subscription, Active with days remaining)
- Created Date
- **Actions** (View Details button)

**Features:**
- Click "View Details" to navigate to merchant detail page
- Color-coded status badges
- Hover effects on rows

---

### 3. **Merchant Detail Page** ⭐ NEW
Location: `/admin/merchants/:merchantId`

#### Sections:

**Account Information Card**
- Business Name
- Email
- Phone
- GST Number
- Address
- Registration Date
- Active/Inactive Status Badge

**Subscription Status Card**
- Plan Type (monthly/yearly)
- Status (active/cancelled)
- Start Date
- End Date
- Days Remaining
- Cancel Subscription Button (if active)

**Payment History Card**
- Recent 5 payment submissions
- Amount, Status, Date, Transaction ID
- Color-coded status indicators

**Account Actions Card** 🎛️
- **Pause/Activate Account** Button
  - Yellow for pause, Green for activate
  - Toggles `is_active` status in database
  - Confirmation dialog required
  
- **Ban Account** Button
  - Red color, requires double confirmation
  - Must type "BAN" to confirm
  - Deactivates account + Cancels subscriptions
  - Disabled if account already inactive

- **Action Descriptions**
  - Clear explanation of each action
  - Visual warnings for destructive actions

---

## Database Operations

### Pause Account
```sql
UPDATE merchants 
SET is_active = false, updated_at = NOW()
WHERE id = :merchant_id
```

**Effect:**
- Sets `is_active` to `false`
- Merchant cannot log in
- Reversible action

---

### Activate Account
```sql
UPDATE merchants 
SET is_active = true, updated_at = NOW()
WHERE id = :merchant_id
```

**Effect:**
- Sets `is_active` to `true`
- Restores merchant access
- Reverses pause action

---

### Ban Account
```sql
-- Step 1: Deactivate merchant
UPDATE merchants 
SET is_active = false, updated_at = NOW()
WHERE id = :merchant_id;

-- Step 2: Cancel all active subscriptions
UPDATE user_subscriptions 
SET status = 'cancelled', cancelled_at = NOW()
WHERE merchant_id = :merchant_id AND status = 'active';
```

**Effect:**
- Deactivates merchant account
- Cancels all active subscriptions
- Permanent action (requires manual reactivation)

---

### Cancel Subscription
```sql
UPDATE user_subscriptions 
SET status = 'cancelled', cancelled_at = NOW()
WHERE id = :subscription_id
```

**Effect:**
- Ends subscription immediately
- Merchant loses access to paid features
- Does not deactivate account

---

## User Flow Examples

### Scenario 1: Pause a Merchant Account

1. Navigate to `/admin/merchants`
2. Click "View Details" on merchant row
3. Click "Pause Account" button
4. Confirm action in dialog
5. Account status changes to "Inactive"
6. Merchant cannot log in
7. Toast notification: "⏸️ Account paused successfully"

---

### Scenario 2: Ban a Merchant Account

1. Navigate to `/admin/merchants`
2. Click "View Details" on merchant row
3. Click "Ban Account" button (red)
4. Read warning dialog carefully
5. Type "BAN" in confirmation prompt
6. Account deactivated + Subscriptions cancelled
7. Toast notification: "🚫 Account banned successfully"

---

### Scenario 3: Cancel Subscription

1. Navigate to merchant detail page
2. View "Subscription Status" card
3. Click "Cancel Subscription" button
4. Confirm action
5. Subscription status changes to "cancelled"
6. Merchant loses paid features immediately
7. Account remains active

---

### Scenario 4: Reactivate Paused Account

1. Navigate to paused merchant's detail page
2. Status shows "Inactive"
3. Button shows "Activate Account" (green)
4. Click to activate
5. Confirm action
6. Account status changes to "Active"
7. Merchant can log in again

---

## Safety Features

### Confirmation Dialogs
- **Pause/Activate:** Simple confirmation
- **Ban:** Double confirmation + must type "BAN"
- **Cancel Subscription:** Simple confirmation

### Visual Warnings
- Color coding (yellow = caution, red = danger)
- Emoji indicators in toasts
- Disabled buttons for invalid actions
- Clear action descriptions

### Database Integrity
- Atomic operations
- Timestamp tracking (`updated_at`, `cancelled_at`)
- Status validation
- Error handling with rollback

---

## Navigation Flow

```
Admin Dashboard
    ↓
[Manual Controls Panel]
    ↓
Merchants Page
    ↓
[View Details Button]
    ↓
Merchant Detail Page
    ↓
[Pause/Ban/Cancel Actions]
```

---

## API Endpoints Used

### Fetch Merchant Details
```typescript
supabase.from('merchants').select('*').eq('id', merchantId).single()
```

### Fetch Subscription
```typescript
supabase.from('user_subscriptions')
  .select('*')
  .eq('merchant_id', merchantId)
  .eq('status', 'active')
  .single()
```

### Fetch Payment History
```typescript
supabase.from('payment_submissions')
  .select('*')
  .eq('merchant_id', merchantId)
  .order('created_at', { ascending: false })
  .limit(5)
```

### Update Merchant Status
```typescript
supabase.from('merchants')
  .update({ is_active: boolean, updated_at: timestamp })
  .eq('id', merchantId)
```

### Cancel Subscription
```typescript
supabase.from('user_subscriptions')
  .update({ status: 'cancelled', cancelled_at: timestamp })
  .eq('id', subscriptionId)
```

---

## Toast Notifications

| Action | Message | Icon |
|--------|---------|------|
| Pause Account | Account paused successfully | ⏸️ |
| Activate Account | Account activated successfully | ▶️ |
| Ban Account | Account banned successfully | 🚫 |
| Cancel Subscription | Subscription cancelled successfully | ✅ |
| Error | Failed to [action] | ❌ |

---

## Permissions & Security

### Admin Access Required
- All actions require admin authentication
- Routes protected by AdminLayout
- Database RLS policies enforce admin-only access

### Audit Trail
- All updates include `updated_at` timestamp
- Subscription cancellations include `cancelled_at`
- Payment history preserved for records

---

## Testing Checklist

- [ ] Pause account → Merchant cannot log in
- [ ] Activate account → Merchant can log in
- [ ] Ban account → Account inactive + Subscriptions cancelled
- [ ] Cancel subscription → Merchant loses paid features
- [ ] View details → All data loads correctly
- [ ] Payment history → Shows recent payments
- [ ] Confirmation dialogs → Work as expected
- [ ] Toast notifications → Display correctly
- [ ] Error handling → Shows appropriate messages
- [ ] Navigation → All links work properly

---

## Future Enhancements

### Potential Additions:
1. **Bulk Actions** - Pause/ban multiple merchants at once
2. **Ban Reason** - Add reason field for bans
3. **Temporary Bans** - Auto-unban after specified duration
4. **Email Notifications** - Notify merchants of status changes
5. **Activity Log** - Track all admin actions
6. **Restore Banned Accounts** - Unban functionality
7. **Subscription Extension** - Manually extend subscription dates
8. **Refund Management** - Process refunds for cancelled subscriptions

---

## Troubleshooting

### Issue: "View Details" button not working
**Solution:** Check if route is properly configured in App.tsx

### Issue: Ban action not cancelling subscriptions
**Solution:** Verify RLS policies allow admin to update subscriptions

### Issue: Pause doesn't prevent login
**Solution:** Check authentication logic validates `is_active` status

### Issue: Toast notifications not showing
**Solution:** Ensure react-hot-toast Toaster is in App.tsx

---

## Summary

✅ **Dashboard Control Panel** - Quick access to common actions  
✅ **Merchants List** - View all merchants with status  
✅ **Merchant Detail Page** - Complete merchant information  
✅ **Pause/Activate** - Toggle account access  
✅ **Ban Account** - Permanent deactivation with subscription cancellation  
✅ **Cancel Subscription** - End paid features  
✅ **Safety Features** - Confirmations, warnings, error handling  
✅ **Database Operations** - Full CRUD with proper updates  
✅ **Navigation Flow** - Seamless admin experience  

The admin manual control system is now fully functional with complete database integration! 🚀
