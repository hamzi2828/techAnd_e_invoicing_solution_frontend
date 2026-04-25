// src/app/(routes)/main/hooks/usePricing.ts
import { useState, useEffect, useCallback } from 'react';
import { getPublicPaymentPlans, getPricingFeatures, Plan, Feature } from '../services/pricingService';

interface UsePricingReturn {
  plans: Plan[];
  features: Feature[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function usePricing(): UsePricingReturn {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [plansData, featuresData] = await Promise.all([
        getPublicPaymentPlans(),
        getPricingFeatures()
      ]);
      
      setPlans(plansData);
      setFeatures(featuresData);
    } catch (err) {
      console.error('Failed to load pricing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pricing data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    plans,
    features,
    isLoading,
    error,
    refetch: loadData,
    clearError,
  };
}