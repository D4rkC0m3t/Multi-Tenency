import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SubscriptionAccess {
  hasAccess: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialDaysRemaining: number;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'trial_expired' | 'none';
  subscriptionEndDate: string | null;
  planType: string | null;
  loading: boolean;
}

export function useSubscriptionAccess(): SubscriptionAccess {
  const { merchant } = useAuth();
  const [access, setAccess] = useState<SubscriptionAccess>({
    hasAccess: true, // Default to true during loading
    isTrialActive: false,
    isTrialExpired: false,
    trialDaysRemaining: 0,
    subscriptionStatus: 'none',
    subscriptionEndDate: null,
    planType: null,
    loading: true,
  });

  useEffect(() => {
    if (!merchant?.id) {
      setAccess(prev => ({ ...prev, loading: false, hasAccess: false }));
      return;
    }

    checkSubscriptionAccess();
  }, [merchant]);

  const checkSubscriptionAccess = async () => {
    try {
      if (!merchant?.id) return;

      // Check for active subscription (use maybeSingle to avoid 406 error)
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscription && !subError) {
        // Has active subscription
        const endDate = new Date(subscription.end_date);
        const today = new Date();
        const isExpired = endDate < today;

        setAccess({
          hasAccess: !isExpired,
          isTrialActive: false,
          isTrialExpired: false,
          trialDaysRemaining: 0,
          subscriptionStatus: isExpired ? 'expired' : 'active',
          subscriptionEndDate: subscription.end_date,
          planType: subscription.plan_type,
          loading: false,
        });
        return;
      }

      // No active subscription - check trial period
      const createdAt = new Date(merchant.created_at || Date.now());
      const today = new Date();
      const daysSinceCreation = Math.floor(
        (today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const trialDaysRemaining = Math.max(0, 15 - daysSinceCreation);
      const isTrialActive = trialDaysRemaining > 0;
      const isTrialExpired = trialDaysRemaining === 0;

      setAccess({
        hasAccess: isTrialActive, // Only has access if trial is active
        isTrialActive,
        isTrialExpired,
        trialDaysRemaining,
        subscriptionStatus: isTrialExpired ? 'trial_expired' : 'trial',
        subscriptionEndDate: null,
        planType: 'trial',
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription access:', error);
      setAccess(prev => ({ ...prev, loading: false, hasAccess: false }));
    }
  };

  return access;
}
