import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionAccess } from '../../hooks/useSubscriptionAccess';
import { Clock, AlertCircle, X } from 'lucide-react';

export function SubscriptionBanner() {
  const navigate = useNavigate();
  const { isTrialActive, isTrialExpired, trialDaysRemaining, subscriptionStatus } = useSubscriptionAccess();
  const [dismissed, setDismissed] = useState(false);

  // Don't show banner if dismissed or has active subscription
  if (dismissed || subscriptionStatus === 'active') {
    return null;
  }

  // Trial Active - Show warning when less than 5 days
  if (isTrialActive && trialDaysRemaining <= 5 && trialDaysRemaining > 0) {
    return (
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">
              {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left in your trial
            </span>
            <span className="hidden md:inline">- Subscribe now to continue using all features</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/subscription')}
              className="bg-white text-orange-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
            >
              Subscribe Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trial Expired
  if (isTrialExpired) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">
              Your trial has expired
            </span>
            <span className="hidden md:inline">- Subscribe to continue using KrishiSethu</span>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  // Subscription Expired
  if (subscriptionStatus === 'expired') {
    return (
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">
              Your subscription has expired
            </span>
            <span className="hidden md:inline">- Renew to regain access</span>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-white text-orange-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            Renew Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}
