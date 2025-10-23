# 💳 PhonePe Payment Gateway Integration Guide

**Integration Type:** Standard Checkout - API Integration (Website)  
**Documentation:** https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-integration-website

---

## 🎯 Overview

### **What We're Building:**
Replace manual payment screenshot upload with automated PhonePe payment gateway integration.

### **Current Flow:**
```
User → Select Plan → Upload Screenshot → Wait for Admin Verification
```

### **New Flow:**
```
User → Select Plan → PhonePe Payment → Auto Verification → Instant Activation
```

---

## 📋 Prerequisites

### **1. PhonePe Business Account**
- Register at: https://business.phonepe.com
- Complete KYC verification
- Get approved for Payment Gateway

### **2. API Credentials (from PhonePe Dashboard)**
- **Merchant ID** - Your unique merchant identifier
- **Salt Key** - For request signing
- **Salt Index** - Version of salt key
- **API Endpoint** - UAT or Production

### **3. Environment Setup**
```env
# Add to .env file
VITE_PHONEPE_MERCHANT_ID=your_merchant_id
VITE_PHONEPE_SALT_KEY=your_salt_key
VITE_PHONEPE_SALT_INDEX=1
VITE_PHONEPE_API_URL=https://api.phonepe.com/apis/hermes
VITE_PHONEPE_REDIRECT_URL=https://www.krishisethu.in/payment/callback
```

---

## 🔧 Implementation Steps

### **Step 1: Install Dependencies**

```bash
npm install crypto-js axios
```

---

### **Step 2: Create PhonePe Service**

**File:** `src/services/phonePeService.ts`

```typescript
import CryptoJS from 'crypto-js';
import axios from 'axios';

const MERCHANT_ID = import.meta.env.VITE_PHONEPE_MERCHANT_ID;
const SALT_KEY = import.meta.env.VITE_PHONEPE_SALT_KEY;
const SALT_INDEX = import.meta.env.VITE_PHONEPE_SALT_INDEX;
const API_URL = import.meta.env.VITE_PHONEPE_API_URL;

export interface PhonePePaymentRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  callbackUrl: string;
  mobileNumber?: string;
  paymentInstrument: {
    type: string;
  };
}

export class PhonePeService {
  /**
   * Generate checksum for PhonePe API
   */
  private static generateChecksum(payload: string): string {
    const checksumString = payload + '/pg/v1/pay' + SALT_KEY;
    const checksum = CryptoJS.SHA256(checksumString).toString();
    return checksum + '###' + SALT_INDEX;
  }

  /**
   * Initiate PhonePe payment
   */
  static async initiatePayment(
    amount: number,
    userId: string,
    planType: string,
    billingCycle: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Generate unique transaction ID
      const merchantTransactionId = `TXN_${Date.now()}_${userId.substring(0, 8)}`;

      // Create payment request
      const paymentRequest: PhonePePaymentRequest = {
        merchantId: MERCHANT_ID,
        merchantTransactionId,
        merchantUserId: userId,
        amount: amount * 100, // Convert to paise
        redirectUrl: `${window.location.origin}/payment/callback`,
        redirectMode: 'POST',
        callbackUrl: `${window.location.origin}/api/phonepe/callback`,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // Convert to base64
      const payload = btoa(JSON.stringify(paymentRequest));

      // Generate checksum
      const checksum = this.generateChecksum(payload);

      // Make API request
      const response = await axios.post(
        `${API_URL}/pg/v1/pay`,
        {
          request: payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
          }
        }
      );

      if (response.data.success) {
        return {
          success: true,
          url: response.data.data.instrumentResponse.redirectInfo.url
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Payment initiation failed'
        };
      }
    } catch (error: any) {
      console.error('PhonePe payment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate payment'
      };
    }
  }

  /**
   * Verify payment status
   */
  static async verifyPayment(
    merchantTransactionId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const checksumString = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;
      const checksum = CryptoJS.SHA256(checksumString).toString() + '###' + SALT_INDEX;

      const response = await axios.get(
        `${API_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID
          }
        }
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Payment verification failed'
        };
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify payment'
      };
    }
  }
}
```

---

### **Step 3: Update Subscription Page**

**File:** `src/components/subscription/SubscriptionPage.tsx`

Add PhonePe payment option:

```typescript
import { PhonePeService } from '../../services/phonePeService';

// Add to component
const [paymentMethod, setPaymentMethod] = useState<'manual' | 'phonepe'>('phonepe');
const [processingPayment, setProcessingPayment] = useState(false);

const handlePhonePePayment = async () => {
  try {
    setProcessingPayment(true);

    // Get amount based on plan
    let amount;
    if (selectedPlan === 'monthly') {
      amount = billingCycle === 'monthly' ? 3999 : 39996;
    } else {
      amount = billingCycle === 'monthly' ? 6999 : 69996;
    }

    // Initiate payment
    const result = await PhonePeService.initiatePayment(
      amount,
      user?.id || '',
      selectedPlan,
      billingCycle
    );

    if (result.success && result.url) {
      // Save payment initiation to database
      const { error } = await supabase
        .from('payment_submissions')
        .insert({
          merchant_id: merchant?.id,
          plan_type: selectedPlan,
          amount,
          payment_method: 'phonepe',
          status: 'pending',
          transaction_id: null // Will be updated after callback
        });

      if (error) throw error;

      // Redirect to PhonePe payment page
      window.location.href = result.url;
    } else {
      toast.error(result.error || 'Failed to initiate payment');
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    toast.error('Failed to process payment');
  } finally {
    setProcessingPayment(false);
  }
};
```

Add UI for payment method selection:

```typescript
{/* Payment Method Selection */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Payment Method
  </label>
  <div className="grid grid-cols-2 gap-4">
    <button
      onClick={() => setPaymentMethod('phonepe')}
      className={`p-4 border-2 rounded-lg transition-all ${
        paymentMethod === 'phonepe'
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <CreditCard className="w-5 h-5" />
        <span className="font-medium">PhonePe</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Instant activation</p>
    </button>

    <button
      onClick={() => setPaymentMethod('manual')}
      className={`p-4 border-2 rounded-lg transition-all ${
        paymentMethod === 'manual'
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Upload className="w-5 h-5" />
        <span className="font-medium">Manual</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Upload screenshot</p>
    </button>
  </div>
</div>

{/* Payment Button */}
{paymentMethod === 'phonepe' ? (
  <button
    onClick={handlePhonePePayment}
    disabled={processingPayment}
    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
  >
    {processingPayment ? (
      <div className="flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span>Processing...</span>
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2">
        <CreditCard className="w-5 h-5" />
        <span>Pay with PhonePe</span>
      </div>
    )}
  </button>
) : (
  // Existing manual upload form
  <form onSubmit={handleSubmitPayment}>
    {/* ... existing form code ... */}
  </form>
)}
```

---

### **Step 4: Create Payment Callback Page**

**File:** `src/components/payment/PaymentCallback.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PhonePeService } from '../../services/phonePeService';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const merchantTransactionId = searchParams.get('transactionId');
      
      if (!merchantTransactionId) {
        setStatus('failed');
        setMessage('Invalid transaction');
        return;
      }

      // Verify payment with PhonePe
      const result = await PhonePeService.verifyPayment(merchantTransactionId);

      if (result.success && result.data.state === 'COMPLETED') {
        // Update payment status in database
        const { error } = await supabase
          .from('payment_submissions')
          .update({
            status: 'verified',
            transaction_id: merchantTransactionId,
            verified_at: new Date().toISOString()
          })
          .eq('transaction_id', merchantTransactionId);

        if (error) throw error;

        setStatus('success');
        setMessage('Payment successful! Your subscription is now active.');
        toast.success('Payment successful!');

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/subscription');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage('Payment failed or was cancelled');
        toast.error('Payment failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Failed to verify payment');
      toast.error('Payment verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/subscription')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

### **Step 5: Add Route in App.tsx**

```typescript
import { PaymentCallback } from './components/payment/PaymentCallback';

// Add route
<Route path="/payment/callback" element={<PaymentCallback />} />
```

---

## 🔐 Security Considerations

### **1. Never Expose Salt Key in Frontend**
```typescript
// ❌ WRONG - Don't do this
const SALT_KEY = 'your_salt_key_here';

// ✅ CORRECT - Use backend API
// Create Supabase Edge Function or backend API
```

### **2. Create Backend API for Payment**

**Recommended:** Create Supabase Edge Function

**File:** `supabase/functions/phonepe-payment/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { amount, userId, planType } = await req.json();

    // Generate checksum securely on server
    const SALT_KEY = Deno.env.get('PHONEPE_SALT_KEY');
    
    // ... PhonePe API call logic ...

    return new Response(
      JSON.stringify({ success: true, url: paymentUrl }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 🧪 Testing

### **1. UAT Environment**
```env
VITE_PHONEPE_API_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

### **2. Test Cards**
PhonePe provides test credentials in their dashboard

### **3. Test Flow**
1. Select plan
2. Click "Pay with PhonePe"
3. Use test credentials
4. Complete payment
5. Verify callback
6. Check subscription activation

---

## 📊 Database Schema Update

Add transaction tracking:

```sql
-- Add columns to payment_submissions
ALTER TABLE payment_submissions
ADD COLUMN IF NOT EXISTS phonepe_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS phonepe_payment_state TEXT,
ADD COLUMN IF NOT EXISTS phonepe_response_code TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_phonepe_transaction 
ON payment_submissions(phonepe_transaction_id);
```

---

## ✅ Deployment Checklist

- [ ] Get PhonePe API credentials
- [ ] Add environment variables
- [ ] Create Supabase Edge Function (recommended)
- [ ] Update SubscriptionPage.tsx
- [ ] Create PaymentCallback.tsx
- [ ] Add route in App.tsx
- [ ] Test in UAT environment
- [ ] Deploy to production
- [ ] Test with real payment
- [ ] Monitor transactions

---

## 🎯 Summary

**What You Get:**
- ✅ Automated payment processing
- ✅ Instant subscription activation
- ✅ No manual verification needed
- ✅ Better user experience
- ✅ Secure payment flow

**Next Steps:**
1. Get PhonePe credentials
2. Implement backend API (Supabase Edge Function)
3. Update frontend components
4. Test thoroughly
5. Deploy!

---

**Ready to implement? Let me know if you need help with any step!** 🚀
