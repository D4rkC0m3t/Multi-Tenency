import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionAccess } from '../../hooks/useSubscriptionAccess';
import { AlertCircle, Lock, CreditCard } from 'lucide-react';

interface FeatureAccessGuardProps {
  children: React.ReactNode;
  feature?: string;
  showUpgradePrompt?: boolean;
}

export function FeatureAccessGuard({ 
  children, 
  feature = 'this feature',
  showUpgradePrompt = true 
}: FeatureAccessGuardProps) {
  const navigate = useNavigate();
  const { hasAccess, isTrialExpired, trialDaysRemaining, subscriptionStatus, loading } = useSubscriptionAccess();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If user has access, show the feature
  if (hasAccess) {
    return <>{children}</>;
  }

  // If no access, show appropriate message
  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-2xl w-full">
        {/* Trial Expired */}
        {isTrialExpired && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8 text-center shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <Lock className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Trial Period Expired
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Your 15-day free trial has ended. Subscribe now to continue using {feature}.
            </p>
            <div className="bg-white rounded-lg p-4 mb-6 border border-red-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Trial Status:</strong> Expired
              </p>
              <p className="text-sm text-gray-600">
                <strong>Days Remaining:</strong> 0 days
              </p>
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
            >
              <CreditCard className="h-6 w-6" />
              Subscribe Now to Continue
            </button>
          </div>
        )}

        {/* Subscription Expired */}
        {subscriptionStatus === 'expired' && (
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-8 text-center shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="bg-orange-100 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-orange-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Subscription Expired
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Your subscription has expired. Renew now to regain access to {feature}.
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
            >
              <CreditCard className="h-6 w-6" />
              Renew Subscription
            </button>
          </div>
        )}

        {/* No Subscription */}
        {subscriptionStatus === 'none' && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <Lock className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Subscription Required
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              You need an active subscription to access {feature}.
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
            >
              <CreditCard className="h-6 w-6" />
              View Subscription Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
