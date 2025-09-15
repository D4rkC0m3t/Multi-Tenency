/**
 * Feature Flags Hook
 * Centralized feature flag management for safe feature rollouts
 */
import React from 'react';

export interface FeatureFlags {
  enhancedCustomerSearch: boolean;
  batchTracking: boolean;
  advancedReporting: boolean;
  dualCopyInvoice: boolean;
  stockManagement: boolean;
  eInvoiceGeneration: boolean;
}

export const useFeatureFlags = (): FeatureFlags => {
  return {
    // Customer search enhancements
    enhancedCustomerSearch: import.meta.env.VITE_ENABLE_ENHANCED_CUSTOMER_SEARCH === 'true',
    
    // Batch tracking for fertilizers
    batchTracking: import.meta.env.VITE_ENABLE_BATCH_TRACKING === 'true',
    
    // Advanced reporting features
    advancedReporting: import.meta.env.VITE_ENABLE_ADVANCED_REPORTING === 'true',
    
    // Dual copy invoice generation
    dualCopyInvoice: import.meta.env.VITE_ENABLE_DUAL_COPY_INVOICE === 'true',
    
    // Enhanced stock management
    stockManagement: import.meta.env.VITE_ENABLE_STOCK_MANAGEMENT === 'true',
    
    // E-Invoice generation
    eInvoiceGeneration: import.meta.env.VITE_ENABLE_EINVOICE_GENERATION === 'true',
  };
};

/**
 * Feature flag wrapper component
 * Usage: <FeatureFlag flag="enhancedCustomerSearch"><Component /></FeatureFlag>
 */
interface FeatureFlagProps {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({ 
  flag, 
  children, 
  fallback = null 
}) => {
  const flags = useFeatureFlags();
  
  return flags[flag] ? <>{children}</> : <>{fallback}</>;
};

/**
 * Multiple feature flags check
 * Usage: useFeatureFlags().enhancedCustomerSearch && useFeatureFlags().batchTracking
 */
export const useMultipleFlags = (flagNames: (keyof FeatureFlags)[]): boolean => {
  const flags = useFeatureFlags();
  return flagNames.every(flagName => flags[flagName]);
};

/**
 * Any feature flags check
 * Usage: useAnyFlags(['enhancedCustomerSearch', 'batchTracking'])
 */
export const useAnyFlags = (flagNames: (keyof FeatureFlags)[]): boolean => {
  const flags = useFeatureFlags();
  return flagNames.some(flagName => flags[flagName]);
};
