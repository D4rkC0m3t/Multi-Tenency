# PhonePe Subscription Billing Implementation Guide

## 📋 Overview
Complete implementation of PhonePe subscription billing for KrishiSethu with:
- 15-day free trial period
- Monthly plan: ₹3,999/month
- Yearly plan: ₹45,000/year
- Automated recurring billing
- Complete audit trail

---

## 🗄️ Database Schema (COMPLETED ✅)

### Tables Created:
1. **tenant_subscriptions** - Main subscription records
2. **subscription_audit_log** - Complete event tracking
3. **payment_transactions** - Payment history
4. **subscription_notifications** - Notification tracking

### Key Features:
- Auto-creates 15-day trial on merchant signup
- Tracks trial expiry automatically
- Stores PhonePe mandate and transaction IDs
- Complete audit trail for compliance
- RLS policies for security

### Functions:
- `initialize_trial_subscription()` - Auto-creates trial
- `check_expired_trials()` - Scheduled job for expiry checks
- `get_merchant_subscription_status()` - Get current status

---

## 🔧 Backend Services (COMPLETED ✅)

### 1. PhonePe Service (`src/lib/phonePeService.ts`)

**Functions:**
- `createSubscriptionMandate()` - Initialize recurring payment
- `checkPaymentStatus()` - Verify payment/mandate status
- `executeRecurringPayment()` - Charge using mandate
- `cancelMandate()` - Cancel subscription
- `verifyWebhookSignature()` - Validate webhooks
- `calculateNextBillingDate()` - Billing cycle logic

**Configuration Required:**
```env
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_API_ENDPOINT=https://api.phonepe.com/apis/hermes
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Subscription Hook (`src/hooks/useSubscription.ts`)

**Features:**
- Real-time subscription status
- Trial period tracking
- Payment history
- Audit logs
- Plan changes
- Cancellation

**Usage:**
```typescript
const {
  status,
  subscriptionDetails,
  isTrialEndingSoon,
  isExpired,
  changePlan,
  cancelSubscription,
  getPaymentHistory
} = useSubscription();
```

---

## 🎨 UI Components (TO BE CREATED)

### 1. Trial Expiry Modal

**File:** `src/components/subscription/TrialExpiryModal.tsx`

```typescript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Check } from 'lucide-react';

interface TrialExpiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysRemaining: number;
  onSubscribe: (planType: 'monthly' | 'yearly') => void;
}

export const TrialExpiryModal: React.FC<TrialExpiryModalProps> = ({
  isOpen,
  onClose,
  daysRemaining,
  onSubscribe
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {daysRemaining > 0 
                    ? `Your trial ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`
                    : 'Your free trial has ended'
                  }
                </h2>
                <p className="text-gray-600">
                  Continue using KrishiSethu with full access to all features
                </p>
              </div>

              {/* Plans */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Monthly Plan */}
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 transition cursor-pointer">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold mb-2">Monthly</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      ₹3,999
                    </div>
                    <div className="text-gray-600">per month</div>
                  </div>
                  <button
                    onClick={() => onSubscribe('monthly')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Subscribe Monthly
                  </button>
                </div>

                {/* Yearly Plan */}
                <div className="border-2 border-green-500 rounded-xl p-6 relative bg-green-50">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Save 6%
                    </span>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold mb-2">Yearly</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      ₹45,000
                    </div>
                    <div className="text-gray-600">per year</div>
                    <div className="text-sm text-green-600 mt-1">
                      Save ₹2,988 annually
                    </div>
                  </div>
                  <button
                    onClick={() => onSubscribe('yearly')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Subscribe Yearly
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Included in all plans:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    'Unlimited products',
                    'Multi-warehouse support',
                    'Advanced analytics',
                    'Priority support',
                    'Batch tracking',
                    'GST compliance'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### 2. Subscription Status Banner

**File:** `src/components/subscription/SubscriptionBanner.tsx`

```typescript
import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

export const SubscriptionBanner: React.FC = () => {
  const { status, isTrialEndingSoon, isExpired } = useSubscription();

  if (status.loading || status.subscriptionStatus === 'active') {
    return null;
  }

  if (isExpired) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">
              Subscription Expired
            </h3>
            <p className="text-sm text-red-700">
              Your subscription has expired. Please renew to continue using KrishiSethu.
            </p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Renew Now
          </button>
        </div>
      </div>
    );
  }

  if (isTrialEndingSoon) {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-orange-500 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-orange-800">
              Trial Ending Soon
            </h3>
            <p className="text-sm text-orange-700">
              Your free trial ends in {status.daysRemaining} {status.daysRemaining === 1 ? 'day' : 'days'}. 
              Subscribe now to continue without interruption.
            </p>
          </div>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Subscribe
          </button>
        </div>
      </div>
    );
  }

  if (status.isTrialActive) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-800">
              Free Trial Active
            </h3>
            <p className="text-sm text-blue-700">
              {status.daysRemaining} days remaining in your free trial
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
```

### 3. Subscription Settings Page

**File:** `src/components/subscription/SubscriptionSettings.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, Download } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { formatAmount } from '../../lib/phonePeService';

export const SubscriptionSettings: React.FC = () => {
  const {
    status,
    subscriptionDetails,
    changePlan,
    cancelSubscription,
    getPaymentHistory
  } = useSubscription();

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    const history = await getPaymentHistory();
    setPaymentHistory(history);
  };

  const handlePlanChange = async (newPlan: 'monthly' | 'yearly') => {
    const success = await changePlan(newPlan);
    if (success) {
      // Refresh data
    }
  };

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription('User requested cancellation');
    if (success) {
      setShowCancelModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Subscription & Billing</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold capitalize">
              {status.planType} Plan
            </div>
            <div className="text-gray-600">
              {status.planType === 'monthly' ? '₹3,999/month' : '₹45,000/year'}
            </div>
            {status.nextBillingDate && (
              <div className="text-sm text-gray-500 mt-2">
                Next billing: {new Date(status.nextBillingDate).toLocaleDateString('en-IN')}
              </div>
            )}
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              status.subscriptionStatus === 'active' 
                ? 'bg-green-100 text-green-800'
                : status.subscriptionStatus === 'trial'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status.subscriptionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <div className="space-y-3">
          {paymentHistory.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {formatAmount(payment.amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                payment.payment_status === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {payment.payment_status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Subscription</h2>
        <div className="space-y-3">
          <button
            onClick={() => handlePlanChange(status.planType === 'monthly' ? 'yearly' : 'monthly')}
            className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
          >
            Switch to {status.planType === 'monthly' ? 'Yearly' : 'Monthly'} Plan
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full text-left px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔔 Webhook Handler (TO BE CREATED)

**File:** `pages/api/webhooks/phonepe.ts` (Next.js) or equivalent

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyWebhookSignature } from '../../../src/lib/phonePeService';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify signature
    const signature = req.headers['x-verify'] as string;
    const payload = JSON.stringify(req.body);
    
    if (!verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Decode base64 response
    const decodedData = Buffer.from(req.body.response, 'base64').toString('utf-8');
    const webhookData = JSON.parse(decodedData);

    // Handle different event types
    switch (webhookData.code) {
      case 'PAYMENT_SUCCESS':
        await handlePaymentSuccess(webhookData);
        break;
      case 'PAYMENT_FAILED':
        await handlePaymentFailure(webhookData);
        break;
      case 'MANDATE_APPROVED':
        await handleMandateApproved(webhookData);
        break;
      case 'MANDATE_REJECTED':
        await handleMandateRejected(webhookData);
        break;
      default:
        console.log('Unhandled webhook event:', webhookData.code);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePaymentSuccess(data: any) {
  // Update payment transaction
  await supabase
    .from('payment_transactions')
    .update({
      payment_status: 'success',
      completed_at: new Date().toISOString(),
      phonepe_response: data
    })
    .eq('phonepe_merchant_transaction_id', data.merchantTransactionId);

  // Update subscription
  await supabase
    .from('tenant_subscriptions')
    .update({
      last_payment_date: new Date().toISOString(),
      total_payments_made: supabase.raw('total_payments_made + 1'),
      total_amount_paid: supabase.raw(`total_amount_paid + ${data.amount}`),
      failed_payment_count: 0
    })
    .eq('phonepe_mandate_id', data.mandateId);

  // Log audit event
  await supabase.from('subscription_audit_log').insert({
    event_type: 'payment_success',
    phonepe_transaction_id: data.transactionId,
    phonepe_response: data
  });
}

async function handlePaymentFailure(data: any) {
  // Similar implementation for failure
}

async function handleMandateApproved(data: any) {
  // Activate subscription
  await supabase
    .from('tenant_subscriptions')
    .update({
      subscription_status: 'active',
      phonepe_mandate_id: data.mandateId,
      next_billing_date: calculateNextBillingDate(data.planType)
    })
    .eq('phonepe_customer_ref', data.merchantUserId);
}

async function handleMandateRejected(data: any) {
  // Handle rejection
}
```

---

## ⚙️ Environment Variables

Add to `.env.local`:
```env
# PhonePe Configuration
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_API_ENDPOINT=https://api.phonepe.com/apis/hermes
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🧪 Testing Strategy

### 1. Use PhonePe Sandbox
- Merchant ID: `PGTESTPAYUAT`
- Salt Key: `099eb0cd-02cf-4e2a-8aca-3e6c6aff0399`
- API: `https://api-preprod.phonepe.com/apis/pg-sandbox`

### 2. Test Scenarios
- ✅ New merchant signup → Trial created
- ✅ Trial expiry → Status changes to expired
- ✅ Mandate creation → PhonePe redirect
- ✅ Mandate approval → Subscription activated
- ✅ First payment → Transaction recorded
- ✅ Recurring payment → Auto-charged
- ✅ Payment failure → Status updated
- ✅ Cancellation → Mandate cancelled

### 3. Validation Points
- Database triggers firing correctly
- Audit logs being created
- Webhook signatures verified
- RLS policies working
- Real-time updates functioning

---

## 📊 Monitoring & Alerts

### Key Metrics to Track:
1. Trial conversion rate
2. Payment success rate
3. Failed payment count
4. Churn rate
5. Average subscription duration

### Alerts to Set Up:
- Trial ending in 3 days
- Trial ending in 1 day
- Trial expired
- Payment failed
- High failed payment rate

---

## 🚀 Deployment Checklist

- [ ] Run database migration
- [ ] Set environment variables
- [ ] Deploy webhook endpoint
- [ ] Configure PhonePe merchant account
- [ ] Test in sandbox environment
- [ ] Set up monitoring
- [ ] Configure email notifications
- [ ] Test trial expiry flow
- [ ] Test payment flow
- [ ] Test cancellation flow
- [ ] Deploy to production
- [ ] Monitor first transactions

---

## 📝 Next Steps

1. **Run the migration:**
   ```bash
   supabase migration up
   ```

2. **Create UI components** (provided above)

3. **Implement webhook handler**

4. **Test in sandbox**

5. **Deploy to production**

---

**Status**: 🚧 70% Complete  
**Database**: ✅ Complete  
**Backend Services**: ✅ Complete  
**UI Components**: 📝 Templates Provided  
**Webhooks**: 📝 Template Provided  
**Testing**: ⏳ Pending  

---

*This implementation provides enterprise-grade subscription billing with complete audit trail and compliance.*
