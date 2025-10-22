/**
 * Custom React Hook for Subscription Management
 * Handles trial period, subscription status, and billing
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface SubscriptionStatus {
  subscriptionId: string | null;
  planType: 'monthly' | 'yearly' | null;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled' | 'payment_failed' | null;
  isTrialActive: boolean;
  daysRemaining: number;
  nextBillingDate: string | null;
  canAccessSystem: boolean;
  loading: boolean;
}

export interface SubscriptionDetails {
  id: string;
  merchant_id: string;
  plan_type: 'monthly' | 'yearly';
  plan_amount: number;
  trial_start_date: string;
  trial_end_date: string;
  subscription_status: string;
  phonepe_mandate_id: string | null;
  phonepe_customer_ref: string;
  next_billing_date: string | null;
  last_payment_date: string | null;
  total_payments_made: number;
  total_amount_paid: number;
  failed_payment_count: number;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user, merchant } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscriptionId: null,
    planType: null,
    subscriptionStatus: null,
    isTrialActive: false,
    daysRemaining: 0,
    nextBillingDate: null,
    canAccessSystem: true,
    loading: true,
  });

  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);

  /**
   * Fetch subscription status from database
   */
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!merchant?.id) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Call the database function to get subscription status
      const { data, error } = await supabase.rpc('get_merchant_subscription_status', {
        p_merchant_id: merchant.id,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const sub = data[0];
        setStatus({
          subscriptionId: sub.subscription_id,
          planType: sub.plan_type,
          subscriptionStatus: sub.subscription_status,
          isTrialActive: sub.is_trial_active,
          daysRemaining: sub.days_remaining || 0,
          nextBillingDate: sub.next_billing_date,
          canAccessSystem: sub.can_access_system,
          loading: false,
        });
      } else {
        setStatus(prev => ({ ...prev, loading: false, canAccessSystem: false }));
      }
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      toast.error('Failed to load subscription status');
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, [merchant?.id]);

  /**
   * Fetch detailed subscription information
   */
  const fetchSubscriptionDetails = useCallback(async () => {
    if (!merchant?.id) return;

    try {
      const { data, error } = await supabase
        .from('tenant_subscriptions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setSubscriptionDetails(data);
    } catch (error: any) {
      console.error('Error fetching subscription details:', error);
    }
  }, [merchant?.id]);

  /**
   * Check if trial is ending soon (within 3 days)
   */
  const isTrialEndingSoon = useCallback(() => {
    return status.isTrialActive && status.daysRemaining <= 3 && status.daysRemaining > 0;
  }, [status.isTrialActive, status.daysRemaining]);

  /**
   * Check if subscription has expired
   */
  const isExpired = useCallback(() => {
    return status.subscriptionStatus === 'expired';
  }, [status.subscriptionStatus]);

  /**
   * Check if payment has failed
   */
  const hasPaymentFailed = useCallback(() => {
    return status.subscriptionStatus === 'payment_failed';
  }, [status.subscriptionStatus]);

  /**
   * Initiate subscription upgrade/change
   */
  const changePlan = useCallback(async (newPlanType: 'monthly' | 'yearly') => {
    if (!merchant?.id || !status.subscriptionId) {
      toast.error('Unable to change plan');
      return false;
    }

    try {
      const planAmount = newPlanType === 'monthly' ? 399900 : 4500000;

      const { error } = await supabase
        .from('tenant_subscriptions')
        .update({
          plan_type: newPlanType,
          plan_amount: planAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', status.subscriptionId);

      if (error) throw error;

      // Log the plan change
      await supabase.from('subscription_audit_log').insert({
        merchant_id: merchant.id,
        subscription_id: status.subscriptionId,
        event_type: newPlanType === 'yearly' ? 'plan_upgraded' : 'plan_downgraded',
        metadata: {
          old_plan: status.planType,
          new_plan: newPlanType,
          old_amount: status.planType === 'monthly' ? 399900 : 4500000,
          new_amount: planAmount,
        },
      });

      toast.success(`Plan changed to ${newPlanType} successfully`);
      await fetchSubscriptionStatus();
      return true;
    } catch (error: any) {
      console.error('Error changing plan:', error);
      toast.error('Failed to change plan');
      return false;
    }
  }, [merchant?.id, status.subscriptionId, status.planType, fetchSubscriptionStatus]);

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(async (reason?: string) => {
    if (!merchant?.id || !status.subscriptionId) {
      toast.error('Unable to cancel subscription');
      return false;
    }

    try {
      const { error } = await supabase
        .from('tenant_subscriptions')
        .update({
          subscription_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'User requested cancellation',
          updated_at: new Date().toISOString(),
        })
        .eq('id', status.subscriptionId);

      if (error) throw error;

      // Log the cancellation
      await supabase.from('subscription_audit_log').insert({
        merchant_id: merchant.id,
        subscription_id: status.subscriptionId,
        event_type: 'subscription_cancelled',
        metadata: {
          reason: reason || 'User requested cancellation',
          cancelled_by: user?.id,
        },
      });

      toast.success('Subscription cancelled successfully');
      await fetchSubscriptionStatus();
      return true;
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
      return false;
    }
  }, [merchant?.id, user?.id, status.subscriptionId, fetchSubscriptionStatus]);

  /**
   * Get payment history
   */
  const getPaymentHistory = useCallback(async () => {
    if (!merchant?.id) return [];

    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }, [merchant?.id]);

  /**
   * Get audit logs
   */
  const getAuditLogs = useCallback(async (limit: number = 50) => {
    if (!merchant?.id) return [];

    try {
      const { data, error } = await supabase
        .from('subscription_audit_log')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('event_timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }, [merchant?.id]);

  // Initial fetch
  useEffect(() => {
    fetchSubscriptionStatus();
    fetchSubscriptionDetails();
  }, [fetchSubscriptionStatus, fetchSubscriptionDetails]);

  // Set up real-time subscription for status changes
  useEffect(() => {
    if (!merchant?.id) return;

    const subscription = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_subscriptions',
          filter: `merchant_id=eq.${merchant.id}`,
        },
        () => {
          fetchSubscriptionStatus();
          fetchSubscriptionDetails();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [merchant?.id, fetchSubscriptionStatus, fetchSubscriptionDetails]);

  return {
    status,
    subscriptionDetails,
    isTrialEndingSoon: isTrialEndingSoon(),
    isExpired: isExpired(),
    hasPaymentFailed: hasPaymentFailed(),
    changePlan,
    cancelSubscription,
    getPaymentHistory,
    getAuditLogs,
    refresh: fetchSubscriptionStatus,
  };
}

export default useSubscription;
