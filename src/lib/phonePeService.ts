/**
 * PhonePe Payment Gateway Integration Service
 * Handles subscription billing with autopay/mandate support
 */

import crypto from 'crypto';

// PhonePe Configuration
const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID || '',
  saltKey: process.env.PHONEPE_SALT_KEY || '',
  saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
  apiEndpoint: process.env.PHONEPE_API_ENDPOINT || 'https://api-preprod.phonepe.com/apis/pg-sandbox', // Use production URL in prod
  redirectUrl: process.env.NEXT_PUBLIC_APP_URL + '/subscription/callback',
  webhookUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/phonepe',
};

interface PhonePeResponse {
  success: boolean;
  code: string;
  message: string;
  data?: any;
}

interface MandateRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number; // in paise
  mobileNumber: string;
  deviceContext?: {
    deviceOS: string;
  };
  paymentInstrument: {
    type: 'UPI_MANDATE' | 'CARD_MANDATE';
    upi?: {
      vpa?: string;
    };
  };
  redirectUrl: string;
  redirectMode: 'POST' | 'REDIRECT';
  callbackUrl: string;
}

/**
 * Generate X-VERIFY header for PhonePe API authentication
 */
function generateXVerify(payload: string): string {
  const data = payload + '/pg/v1/pay' + PHONEPE_CONFIG.saltKey;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash + '###' + PHONEPE_CONFIG.saltIndex;
}

/**
 * Generate unique merchant transaction ID
 */
export function generateMerchantTransactionId(merchantId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KRISHI_${merchantId.substring(0, 8)}_${timestamp}_${random}`;
}

/**
 * Create PhonePe Mandate for Subscription
 */
export async function createSubscriptionMandate(params: {
  merchantId: string;
  merchantUserId: string;
  amount: number; // Monthly amount in paise
  mobileNumber: string;
  planType: 'monthly' | 'yearly';
}): Promise<PhonePeResponse> {
  try {
    const merchantTransactionId = generateMerchantTransactionId(params.merchantId);
    
    const mandateRequest: MandateRequest = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId,
      merchantUserId: params.merchantUserId,
      amount: params.amount,
      mobileNumber: params.mobileNumber,
      paymentInstrument: {
        type: 'UPI_MANDATE',
      },
      redirectUrl: PHONEPE_CONFIG.redirectUrl,
      redirectMode: 'REDIRECT',
      callbackUrl: PHONEPE_CONFIG.webhookUrl,
    };

    // Base64 encode the request
    const payload = Buffer.from(JSON.stringify(mandateRequest)).toString('base64');
    
    // Generate X-VERIFY header
    const xVerify = generateXVerify(payload);

    // Make API call to PhonePe
    const response = await fetch(`${PHONEPE_CONFIG.apiEndpoint}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      },
      body: JSON.stringify({
        request: payload,
      }),
    });

    const result = await response.json();

    return {
      success: result.success,
      code: result.code,
      message: result.message,
      data: {
        ...result.data,
        merchantTransactionId,
      },
    };
  } catch (error: any) {
    console.error('PhonePe Mandate Creation Error:', error);
    return {
      success: false,
      code: 'INTERNAL_ERROR',
      message: error.message || 'Failed to create mandate',
    };
  }
}

/**
 * Check Payment/Mandate Status
 */
export async function checkPaymentStatus(
  merchantTransactionId: string
): Promise<PhonePeResponse> {
  try {
    const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${merchantTransactionId}`;
    const xVerify = crypto
      .createHash('sha256')
      .update(endpoint + PHONEPE_CONFIG.saltKey)
      .digest('hex') + '###' + PHONEPE_CONFIG.saltIndex;

    const response = await fetch(
      `${PHONEPE_CONFIG.apiEndpoint}${endpoint}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
      }
    );

    const result = await response.json();

    return {
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    console.error('PhonePe Status Check Error:', error);
    return {
      success: false,
      code: 'INTERNAL_ERROR',
      message: error.message || 'Failed to check payment status',
    };
  }
}

/**
 * Execute Recurring Payment using Mandate
 */
export async function executeRecurringPayment(params: {
  mandateId: string;
  merchantTransactionId: string;
  amount: number; // in paise
  merchantUserId: string;
}): Promise<PhonePeResponse> {
  try {
    const recurringRequest = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: params.merchantTransactionId,
      merchantUserId: params.merchantUserId,
      amount: params.amount,
      mandateId: params.mandateId,
      callbackUrl: PHONEPE_CONFIG.webhookUrl,
    };

    const payload = Buffer.from(JSON.stringify(recurringRequest)).toString('base64');
    const xVerify = generateXVerify(payload);

    const response = await fetch(
      `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/recurring/debit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
        body: JSON.stringify({
          request: payload,
        }),
      }
    );

    const result = await response.json();

    return {
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    console.error('PhonePe Recurring Payment Error:', error);
    return {
      success: false,
      code: 'INTERNAL_ERROR',
      message: error.message || 'Failed to execute recurring payment',
    };
  }
}

/**
 * Cancel Mandate
 */
export async function cancelMandate(mandateId: string): Promise<PhonePeResponse> {
  try {
    const cancelRequest = {
      merchantId: PHONEPE_CONFIG.merchantId,
      mandateId: mandateId,
    };

    const payload = Buffer.from(JSON.stringify(cancelRequest)).toString('base64');
    const xVerify = generateXVerify(payload);

    const response = await fetch(
      `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/recurring/mandate/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
        body: JSON.stringify({
          request: payload,
        }),
      }
    );

    const result = await response.json();

    return {
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    console.error('PhonePe Mandate Cancellation Error:', error);
    return {
      success: false,
      code: 'INTERNAL_ERROR',
      message: error.message || 'Failed to cancel mandate',
    };
  }
}

/**
 * Verify Webhook Signature
 */
export function verifyWebhookSignature(
  payload: string,
  receivedSignature: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHash('sha256')
      .update(payload + PHONEPE_CONFIG.saltKey)
      .digest('hex');
    
    return expectedSignature === receivedSignature.split('###')[0];
  } catch (error) {
    console.error('Webhook Signature Verification Error:', error);
    return false;
  }
}

/**
 * Calculate next billing date based on plan type
 */
export function calculateNextBillingDate(
  planType: 'monthly' | 'yearly',
  fromDate: Date = new Date()
): Date {
  const nextDate = new Date(fromDate);
  
  if (planType === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }
  
  return nextDate;
}

/**
 * Format amount for display (paise to rupees)
 */
export function formatAmount(amountInPaise: number): string {
  return `₹${(amountInPaise / 100).toLocaleString('en-IN')}`;
}

/**
 * Get plan details
 */
export function getPlanDetails(planType: 'monthly' | 'yearly') {
  const plans = {
    monthly: {
      amount: 399900, // ₹3,999 in paise
      displayAmount: '₹3,999',
      interval: 'month',
      description: 'Billed monthly',
    },
    yearly: {
      amount: 4500000, // ₹45,000 in paise
      displayAmount: '₹45,000',
      interval: 'year',
      description: 'Billed annually (Save 6%)',
    },
  };
  
  return plans[planType];
}

export default {
  createSubscriptionMandate,
  checkPaymentStatus,
  executeRecurringPayment,
  cancelMandate,
  verifyWebhookSignature,
  calculateNextBillingDate,
  formatAmount,
  getPlanDetails,
  generateMerchantTransactionId,
};
