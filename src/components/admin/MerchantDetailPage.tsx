import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { validateAdminAccess } from '../../utils/validateAdminAccess';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  DollarSign,
  CreditCard,
  Ban,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Plus,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MerchantDetail {
  id: string;
  name: string;
  business_name: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string;
  features_enabled: any;
}

interface Payment {
  id: string;
  plan_type: string;
  amount: number;
  status: string;
  created_at: string;
  transaction_id: string;
}

export function MerchantDetailPage() {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [extensionDuration, setExtensionDuration] = useState<'1month' | '3months' | '6months' | '1year'>('1month');

  useEffect(() => {
    if (merchantId) {
      fetchMerchantDetails();
    }
  }, [merchantId]);

  const fetchMerchantDetails = async () => {
    try {
      setLoading(true);

      // Fetch merchant details
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchantId)
        .single();

      if (merchantError) throw merchantError;

      // Fetch subscription
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('status', 'active')
        .single();

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payment_submissions')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(5);

      setMerchant(merchantData);
      setSubscription(subscriptionData || null);
      setPayments(paymentsData || []);
    } catch (error: any) {
      console.error('Error fetching merchant details:', error);
      toast.error('Failed to load merchant details');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseAccount = async () => {
    if (!merchant) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${merchant.is_active ? 'PAUSE' : 'ACTIVATE'} this merchant account?\n\n` +
      `Merchant: ${merchant.business_name || merchant.name}\n` +
      `Email: ${merchant.email}\n\n` +
      `${merchant.is_active ? 'This will prevent the merchant from accessing their account.' : 'This will restore access to the merchant account.'}`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('merchants')
        .update({ 
          is_active: !merchant.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', merchant.id);

      if (error) throw error;

      toast.success(
        merchant.is_active 
          ? '⏸️ Account paused successfully' 
          : '▶️ Account activated successfully'
      );

      // Refresh data
      fetchMerchantDetails();
    } catch (error: any) {
      console.error('Error updating merchant status:', error);
      toast.error('Failed to update account status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanAccount = async () => {
    if (!merchant) return;

    const confirmed = window.confirm(
      `⚠️ WARNING: BAN ACCOUNT ⚠️\n\n` +
      `Are you sure you want to BAN this merchant account?\n\n` +
      `Merchant: ${merchant.business_name || merchant.name}\n` +
      `Email: ${merchant.email}\n\n` +
      `This action will:\n` +
      `- Deactivate the merchant account\n` +
      `- Cancel active subscriptions\n` +
      `- Prevent future access\n\n` +
      `Type "BAN" to confirm this action.`
    );

    if (!confirmed) return;

    const banConfirmation = window.prompt('Type "BAN" to confirm:');
    if (banConfirmation !== 'BAN') {
      toast.error('Ban action cancelled');
      return;
    }

    try {
      setActionLoading(true);

      // Update merchant status
      const { error: merchantError } = await supabase
        .from('merchants')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', merchant.id);

      if (merchantError) throw merchantError;

      // Cancel active subscriptions
      if (subscription) {
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .update({ 
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .eq('merchant_id', merchant.id)
          .eq('status', 'active');

        if (subscriptionError) throw subscriptionError;
      }

      toast.success('🚫 Account banned successfully');

      // Refresh data
      fetchMerchantDetails();
    } catch (error: any) {
      console.error('Error banning merchant:', error);
      toast.error('Failed to ban account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel the subscription for ${merchant?.business_name || merchant?.name}?\n\n` +
      `This will immediately terminate their access to paid features.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      toast.success('Subscription cancelled successfully');
      fetchMerchantDetails();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendSubscription = async () => {
    if (!merchant) return;

    const durationLabels = {
      '1month': '1 Month',
      '3months': '3 Months (Quarterly)',
      '6months': '6 Months (Half-Yearly)',
      '1year': '1 Year (Annually)'
    };

    const confirmed = window.confirm(
      `Extend subscription for ${merchant.business_name || merchant.name}?\n\n` +
      `Duration: ${durationLabels[extensionDuration]}\n\n` +
      `This will ${subscription ? 'extend the existing subscription' : 'create a new subscription'}.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      // Validate admin access before proceeding
      const adminValidation = await validateAdminAccess();
      if (!adminValidation.valid) {
        toast.error(`Admin access validation failed: ${adminValidation.errors.join(', ')}`);
        console.error('Admin validation failed:', adminValidation);
        return;
      }

      console.log('Admin validation passed:', {
        uid: adminValidation.uid,
        role: adminValidation.role,
        isPlatformAdmin: adminValidation.isPlatformAdmin
      });

      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      let planType: string;

      if (subscription && subscription.status === 'active') {
        // Extend existing subscription from current end date
        startDate = new Date(subscription.end_date);
        endDate = new Date(subscription.end_date);
      } else {
        // Create new subscription from now
        startDate = now;
        endDate = new Date(now);
      }

      // Calculate end date based on duration
      // Note: Database only allows: 'trial', 'monthly', 'yearly', 'lifetime'
      switch (extensionDuration) {
        case '1month':
          endDate.setMonth(endDate.getMonth() + 1);
          planType = 'monthly';
          break;
        case '3months':
          endDate.setMonth(endDate.getMonth() + 3);
          planType = 'monthly'; // Use 'monthly' for quarterly (3 months)
          break;
        case '6months':
          endDate.setMonth(endDate.getMonth() + 6);
          planType = 'monthly'; // Use 'monthly' for half-yearly (6 months)
          break;
        case '1year':
          endDate.setFullYear(endDate.getFullYear() + 1);
          planType = 'yearly';
          break;
      }

      if (subscription && subscription.status === 'active') {
        // Update existing subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .update({ 
            end_date: endDate.toISOString(),
            plan_type: planType,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (error) throw error;

        toast.success(`✅ Subscription extended by ${durationLabels[extensionDuration]}!`);
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            merchant_id: merchant.id,
            plan_type: planType,
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            features_enabled: {
              pos: true,
              inventory: true,
              reports: true,
              einvoice: true
            },
            max_users: 10,
            max_products: 10000,
          });

        if (error) throw error;

        // Ensure merchant account is active
        const { error: merchantError } = await supabase
          .from('merchants')
          .update({ 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', merchant.id);

        if (merchantError) {
          console.error('Error activating merchant:', merchantError);
          // Don't throw - subscription was created successfully
        }

        toast.success(`✅ New subscription created for ${durationLabels[extensionDuration]}!`);
      }

      setShowExtensionDialog(false);
      fetchMerchantDetails();
    } catch (error: any) {
      console.error('Error extending subscription:', error);
      toast.error('Failed to extend subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2" />
        Loading merchant details…
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Merchant Not Found</h2>
          <p className="text-muted-foreground mb-4">The merchant you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/merchants')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Merchants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/merchants')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{merchant.business_name || merchant.name}</h1>
            <p className="text-muted-foreground">{merchant.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {merchant.is_active ? (
            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Active
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Business Name</div>
              <div className="font-medium">{merchant.business_name || merchant.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {merchant.email}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{merchant.phone || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">GST Number</div>
              <div className="font-medium">{merchant.gst_number || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="font-medium">{merchant.address || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Registered On</div>
              <div className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(merchant.created_at)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <>
                <div>
                  <div className="text-sm text-muted-foreground">Plan Type</div>
                  <div className="font-medium capitalize">{subscription.plan_type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                    subscription.status === 'active' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Start Date</div>
                  <div className="font-medium">{formatDate(subscription.start_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">End Date</div>
                  <div className="font-medium">{formatDate(subscription.end_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Days Remaining</div>
                  <div className="font-medium">
                    {Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
                {/* Extension Controls */}
                <div className="pt-3 border-t space-y-3">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Extend Subscription
                  </div>
                  <Select value={extensionDuration} onValueChange={(value: any) => setExtensionDuration(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months (Quarterly)</SelectItem>
                      <SelectItem value="6months">6 Months (Half-Yearly)</SelectItem>
                      <SelectItem value="1year">1 Year (Annually)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="w-full text-green-600 hover:text-green-700"
                    onClick={handleExtendSubscription}
                    disabled={actionLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {subscription.status === 'active' ? 'Extend Subscription' : 'Activate Subscription'}
                  </Button>
                </div>

                {subscription.status === 'active' && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-muted-foreground">No active subscription</p>
                </div>
                
                {/* Create New Subscription */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Subscription
                  </div>
                  <Select value={extensionDuration} onValueChange={(value: any) => setExtensionDuration(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months (Quarterly)</SelectItem>
                      <SelectItem value="6months">6 Months (Half-Yearly)</SelectItem>
                      <SelectItem value="1year">1 Year (Annually)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="w-full text-green-600 hover:text-green-700"
                    onClick={handleExtendSubscription}
                    disabled={actionLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Subscription
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment History
          </CardTitle>
          <CardDescription>Recent payment submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === 'verified' 
                        ? 'bg-green-500' 
                        : payment.status === 'pending' 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium capitalize">{payment.plan_type} Plan</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(payment.created_at)} • {payment.transaction_id || 'No TXN ID'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(payment.amount)}</div>
                    <div className={`text-sm capitalize ${
                      payment.status === 'verified' 
                        ? 'text-green-500' 
                        : payment.status === 'pending' 
                        ? 'text-yellow-500' 
                        : 'text-red-500'
                    }`}>
                      {payment.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-muted-foreground">No payment history</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Controls */}
      <Card className="border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Account Actions
          </CardTitle>
          <CardDescription>Manage merchant account status and access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className={merchant.is_active ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
              onClick={handlePauseAccount}
              disabled={actionLoading}
            >
              {merchant.is_active ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Account
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Activate Account
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={handleBanAccount}
              disabled={actionLoading || !merchant.is_active}
            >
              <Ban className="w-4 h-4 mr-2" />
              Ban Account
            </Button>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Action Descriptions
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Pause:</strong> Temporarily disable account access (reversible)</li>
              <li>• <strong>Ban:</strong> Permanently disable account and cancel subscriptions</li>
              <li>• <strong>Cancel Subscription:</strong> End active subscription immediately</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
