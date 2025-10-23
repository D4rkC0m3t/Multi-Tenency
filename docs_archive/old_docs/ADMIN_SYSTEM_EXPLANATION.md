# Admin System - Merchants & Payments Explanation

## System Architecture

### 1. Merchants Table
The `merchants` table contains ALL registered businesses in the system, regardless of payment status.

**Key Columns:**
- `id` - Unique merchant identifier
- `name` - Business name (legacy column)
- `business_name` - Business name (newer column, preferred)
- `email` - Merchant email
- `kyc_status` - KYC verification status (`pending`, `verified`, `rejected`)
- `is_active` - Whether the merchant account is active
- `created_at` - Registration date

**Important:** Every merchant that signs up is automatically added to this table.

### 2. Payment Submissions Table
The `payment_submissions` table contains ONLY payments that merchants have actually submitted.

**Key Columns:**
- `id` - Payment submission ID
- `merchant_id` - Reference to merchants table
- `plan_type` - `monthly` or `yearly`
- `amount` - Payment amount
- `status` - `pending`, `verified`, `rejected`, or `expired`
- `payment_screenshot_url` - Proof of payment
- `transaction_id` - Payment reference number

**Important:** This table is EMPTY for merchants who haven't submitted any payment yet.

### 3. User Subscriptions Table
The `user_subscriptions` table tracks active subscriptions after payment verification.

**Key Columns:**
- `merchant_id` - Reference to merchants table
- `plan_type` - `trial`, `monthly`, `yearly`, or `lifetime`
- `status` - `active`, `expired`, `cancelled`, or `suspended`
- `start_date` - Subscription start date
- `end_date` - Subscription expiry date
- `payment_submission_id` - Link to the payment that activated this subscription

## Current Behavior (Correct)

### Merchants Page (`/admin/merchants`)
**Shows:** ALL registered merchants
**Purpose:** View all businesses that have signed up, regardless of payment status
**Columns:** Name, Email, KYC Status, Created Date

### Payments Page (`/admin/payments`)
**Shows:** ONLY merchants who have submitted a payment
**Purpose:** Review and approve/reject payment submissions
**Columns:** Merchant, Plan, Amount, Transaction ID, Status, Date

## Why Some Merchants Don't Appear in Payments

If a merchant appears in the Merchants page but NOT in the Payments page, it means:
1. ✅ They have registered an account
2. ❌ They have NOT submitted any payment yet

This is **expected behavior** - the system doesn't auto-create pending payments for all merchants.

## Workflow

### New Merchant Registration
1. User signs up → Creates record in `merchants` table
2. User gets trial access (if configured)
3. Merchant appears in **Merchants page**
4. Merchant does NOT appear in **Payments page** yet

### Payment Submission
1. Merchant submits payment via frontend
2. Record created in `payment_submissions` table with `status = 'pending'`
3. Merchant now appears in **Payments page** with "Pending" status
4. Admin can view screenshot and verify/reject

### Payment Verification
1. Admin reviews payment in Payments page
2. Admin clicks "Verify & Activate"
3. System calls `verify_payment_and_activate` RPC function
4. Creates/updates record in `user_subscriptions` table
5. Payment status changes to `verified`
6. Merchant gets access to paid features

### Payment Rejection
1. Admin reviews payment in Payments page
2. Admin enters rejection reason
3. Admin clicks "Reject"
4. System calls `reject_payment` RPC function
5. Payment status changes to `rejected`
6. Merchant is notified (if notification system is configured)

## Dashboard Statistics

### Total Merchants
Count of ALL records in `merchants` table

### KYC Pending
Count of merchants where `kyc_status = 'pending'`

### Payments Pending
Count of records in `payment_submissions` where `status = 'pending'`

### Total Revenue
Sum of `amount` from `payment_submissions` where `status = 'verified'`

## Common Scenarios

### Scenario 1: New User Just Signed Up
- **Merchants Page:** ✅ Shows the merchant
- **Payments Page:** ❌ Doesn't show (no payment submitted)
- **Action Required:** Wait for merchant to submit payment

### Scenario 2: User Submitted Payment
- **Merchants Page:** ✅ Shows the merchant
- **Payments Page:** ✅ Shows with "Pending" status
- **Action Required:** Admin should verify/reject the payment

### Scenario 3: Payment Verified
- **Merchants Page:** ✅ Shows the merchant
- **Payments Page:** ✅ Shows with "Verified" status
- **Subscriptions:** ✅ Active subscription created
- **Action Required:** None (merchant has access)

### Scenario 4: Payment Rejected
- **Merchants Page:** ✅ Shows the merchant
- **Payments Page:** ✅ Shows with "Rejected" status
- **Subscriptions:** ❌ No active subscription
- **Action Required:** Merchant needs to resubmit payment

## How to Check Merchant Payment Status

### Option 1: Check Payments Page
1. Go to `/admin/payments`
2. Search for merchant name/email
3. If found → They have submitted a payment
4. If not found → They haven't submitted a payment yet

### Option 2: Check Database Directly
```sql
-- Get all merchants with their payment status
SELECT 
  m.id,
  m.business_name,
  m.email,
  m.kyc_status,
  ps.status as payment_status,
  ps.amount,
  ps.created_at as payment_date,
  us.status as subscription_status,
  us.end_date as subscription_end_date
FROM merchants m
LEFT JOIN payment_submissions ps ON m.id = ps.merchant_id
LEFT JOIN user_subscriptions us ON m.id = us.merchant_id AND us.status = 'active'
ORDER BY m.created_at DESC;
```

## Recommendations

### For Better Merchant Tracking
Consider adding a "Payment Status" column to the Merchants page that shows:
- "No Payment" - Never submitted a payment
- "Pending" - Payment submitted, awaiting verification
- "Active" - Has active subscription
- "Expired" - Subscription expired

### For Better Admin Experience
Consider adding filters to Merchants page:
- "With Payments" - Show only merchants who have submitted payments
- "Without Payments" - Show only merchants who haven't submitted payments
- "Active Subscriptions" - Show only merchants with active subscriptions
- "Expired Subscriptions" - Show only merchants with expired subscriptions

## Technical Notes

### RLS Policies
- Merchants can only see their own data
- Admins can see all merchants and payments
- Platform admins have full access

### Database Functions
- `verify_payment_and_activate(p_payment_id, p_verified_by, p_notes)` - Verifies payment and creates subscription
- `reject_payment(p_payment_id, p_rejected_by, p_reason)` - Rejects payment with reason

### Subscription Logic
- Trial period: 7 days (configurable)
- Monthly plan: 30 days
- Yearly plan: 365 days
- Lifetime plan: 100 years (effectively permanent)
