import { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  Upload,
  AlertCircle,
  CreditCard,
  Calendar,
  Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { validateInput } from '../../utils/securityValidation';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string;
  features_enabled: any;
}

interface PaymentSubmission {
  id: string;
  plan_type: string;
  amount: number;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

export function SubscriptionPage() {
  const { merchant } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(15);

  useEffect(() => {
    if (merchant?.id) {
      fetchSubscriptionData();
    }
  }, [merchant]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // Fetch active subscription (use maybeSingle to avoid 406 error when no subscription exists)
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('merchant_id', merchant?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      }

      setSubscription(subData);

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_submissions')
        .select('*')
        .eq('merchant_id', merchant?.id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payment history:', paymentsError);
      }

      setPaymentHistory(paymentsData || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file
      const validation = validateInput.file(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
        e.target.value = ''; // Clear input
        return;
      }
      
      setScreenshot(file);
      toast.success('File selected successfully');
    }
  };

  const uploadScreenshot = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${merchant?.id}_${Date.now()}.${fileExt}`;
    const filePath = `payment-screenshots/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('payments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate transaction ID if provided
    if (transactionId && !validateInput.transactionId(transactionId)) {
      toast.error('Invalid transaction ID format. Only letters, numbers, hyphens and underscores allowed.');
      return;
    }

    if (!screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    try {
      setSubmitting(true);

      // Upload screenshot
      const screenshotUrl = await uploadScreenshot(screenshot);

      // Get amount based on plan and billing cycle
      let amount;
      if (selectedPlan === 'monthly') {
        amount = billingCycle === 'monthly' ? 3999 : 39996; // ₹3,333 * 12
      } else {
        amount = billingCycle === 'monthly' ? 6999 : 69996; // ₹5,833 * 12
      }

      // Validate amount
      if (!validateInput.amount(amount)) {
        toast.error('Invalid payment amount');
        return;
      }

      // Sanitize transaction ID
      const sanitizedTransactionId = transactionId 
        ? validateInput.sanitizeText(transactionId) 
        : null;

      // Submit payment
      const { error } = await supabase
        .from('payment_submissions')
        .insert({
          merchant_id: merchant?.id,
          plan_type: selectedPlan,
          amount,
          payment_method: 'phonepe',
          transaction_id: sanitizedTransactionId,
          payment_screenshot_url: screenshotUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Payment submitted successfully! We will verify it soon.');
      setShowPaymentForm(false);
      setTransactionId('');
      setScreenshot(null);
      fetchSubscriptionData();
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  // Calculate trial days remaining (15 days from account creation)
  useEffect(() => {
    if (merchant && !subscription) {
      const createdAt = new Date(merchant.created_at || Date.now());
      const today = new Date();
      const daysSinceCreation = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = Math.max(0, 15 - daysSinceCreation);
      setTrialDaysRemaining(remaining);
    }
  }, [merchant, subscription]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Choose Your Favorite Package.
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Select one of your favorite package and get the facilities.
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-gray-900' 
                  : 'bg-transparent border-2 border-white text-white hover:bg-white/10'
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-gray-900' 
                  : 'bg-transparent border-2 border-white text-white hover:bg-white/10'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

      {/* Trial Alert - Show if no subscription */}
      {!subscription && trialDaysRemaining > 0 && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 mb-6 border-2 border-yellow-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="h-12 w-12 text-white" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {trialDaysRemaining} Days Remaining in Trial
                </h3>
                <p className="text-white/90">
                  Subscribe now to continue using all features after your trial ends
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      )}

      {/* Trial Expired Alert */}
      {!subscription && trialDaysRemaining === 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-6 mb-6 border-2 border-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-12 w-12 text-white" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Trial Period Expired
                </h3>
                <p className="text-white/90">
                  Please subscribe to continue using KrishiSethu
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      )}

      {/* Current Subscription Card */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-lg p-6 mb-6 border border-green-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {subscription ? 'Active Subscription' : 'No Active Subscription'}
            </h2>
            {subscription && (
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-green-700 capitalize">
                  {subscription.plan_type} Plan
                </span>
              </div>
            )}
          </div>
          {subscription && (
            <span className="px-4 py-2 bg-green-600 text-white rounded-full font-semibold">
              Active
            </span>
          )}
        </div>

        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Days Remaining</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{getDaysRemaining()}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Start Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(subscription.start_date).toLocaleDateString('en-IN')}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">End Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(subscription.end_date).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You don't have an active subscription</p>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        )}
      </div>

      {/* Pricing Plans */}
      {!showPaymentForm && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Basic/Free Plan */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-500 rounded-2xl p-8 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
              <h3 className="text-xl font-bold text-white mb-6">Basic.</h3>
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-sm text-gray-400">₹</span>
                  <span className="text-5xl font-bold text-white">Free</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">15 Days Trial</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Access to basic POS features</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Limited customer support</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Basic storage space</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Limited software tools and features</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Suitable for individual or casual use</span>
                </li>
              </ul>
              <button
                className="w-full bg-transparent border-2 border-green-500 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Current Plan
              </button>
            </div>

            {/* Standard/Monthly Plan */}
            <div className="bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-500 rounded-2xl p-8 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 transform hover:scale-105">
              <h3 className="text-xl font-bold text-white mb-6">Standard.</h3>
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-sm text-gray-300">₹</span>
                  <span className="text-5xl font-bold text-white">{billingCycle === 'monthly' ? '3,999' : '3,333'}</span>
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  {billingCycle === 'monthly' ? 'per month' : 'per month (billed yearly)'}
                </p>
                {billingCycle === 'yearly' && (
                  <p className="text-xs text-green-400 mt-1 font-semibold">Save ₹7,988/year (17% off)</p>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200 text-sm">Full POS System</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200 text-sm">Inventory Management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200 text-sm">E-Invoice Generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200 text-sm">Reports & Analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200 text-sm">Email Support</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  setSelectedPlan('monthly');
                  setShowPaymentForm(true);
                }}
                className="w-full bg-white hover:bg-gray-100 text-green-900 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Premium/Yearly Plan */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-500 rounded-2xl p-8 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
              <h3 className="text-xl font-bold text-white mb-6">Premium.</h3>
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-sm text-gray-400">₹</span>
                  <span className="text-5xl font-bold text-white">{billingCycle === 'monthly' ? '6,999' : '5,833'}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {billingCycle === 'monthly' ? 'per month' : 'per month (billed yearly)'}
                </p>
                {billingCycle === 'yearly' && (
                  <p className="text-xs text-green-400 mt-1 font-semibold">Save ₹13,988/year (17% off)</p>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Everything in Standard</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Priority Support (24/7)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Advanced Analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Custom Integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Dedicated Account Manager</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  setSelectedPlan('yearly');
                  setShowPaymentForm(true);
                }}
                className="w-full bg-transparent border-2 border-green-500 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Payment</h2>
          <form onSubmit={handleSubmitPayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Plan
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {selectedPlan} Plan - ₹{selectedPlan === 'monthly' ? '3,999' : '45,000'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID (Optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter PhonePe transaction ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Screenshot *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label
                  htmlFor="screenshot-upload"
                  className="cursor-pointer text-green-600 hover:text-green-700 font-semibold"
                >
                  Click to upload screenshot
                </label>
                {screenshot && (
                  <p className="mt-2 text-sm text-gray-600">{screenshot.name}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !screenshot}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-gray-800 border border-green-500/30 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payment history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="border border-green-500/20 bg-gray-900 rounded-lg p-4 flex items-center justify-between hover:border-green-500/40 transition-colors"
              >
                <div>
                  <p className="font-semibold text-white capitalize">
                    {payment.plan_type} Plan
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(payment.created_at).toLocaleDateString('en-IN')}
                  </p>
                  {payment.status === 'rejected' && payment.rejection_reason && (
                    <p className="text-sm text-red-400 mt-1">
                      Reason: {payment.rejection_reason}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </p>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    payment.status === 'verified'
                      ? 'bg-green-500/20 text-green-400 border border-green-500'
                      : payment.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400 border border-red-500'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
