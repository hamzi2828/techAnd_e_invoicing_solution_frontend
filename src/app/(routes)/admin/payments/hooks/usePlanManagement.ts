import { useState, useEffect, useCallback } from 'react';
import { Plan, Feature, PlanStats, ValidationError } from '../types';
import { getPlans, getFeatures, planDataManager } from '../data/apiPlans';
import * as paymentPlanService from '../services/paymentPlanService';

interface UsePlanManagementResult {
  // Data
  plans: Plan[];
  features: Feature[];
  
  // States
  isLoading: boolean;
  error: string | null;
  isEditMode: boolean;
  
  // Actions
  loadData: (forceRefresh?: boolean) => Promise<void>;
  setIsEditMode: (mode: boolean) => void;
  clearError: () => void;
  
  // Plan Management
  createPlan: (planData: Omit<Plan, 'id'>) => Promise<boolean>;
  getValidationErrors: () => ValidationError[];
  updatePlan: (planId: string, planData: Partial<Plan>) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<boolean>;
  duplicatePlan: (planId: string, newName: string) => Promise<boolean>;
  togglePlanStatus: (planId: string) => Promise<boolean>;
  togglePlanFeatured: (planId: string) => Promise<void>;
  
  // Feature Management
  addFeature: (featureName: string) => Promise<boolean>;
  deleteFeature: (featureId: string) => void;
  toggleFeature: (featureId: string, planId: string) => Promise<void>;
  toggleFeatureStatus: (featureId: string) => void;
  editFeature: (featureId: string, oldName: string, newName: string) => Promise<void>;
  
  // Plan Editing
  handlePlanEdit: (planId: string, field: keyof Plan, value: Plan[keyof Plan]) => void;
  savePendingChanges: () => Promise<boolean>;
  hasPendingChanges: boolean;
  
  // Statistics
  getStats: () => Promise<PlanStats | null>;
}

export const usePlanManagement = (): UsePlanManagementResult => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<Plan>>>(new Map());

  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [plansData, featuresData] = await Promise.all([
        getPlans(forceRefresh),
        getFeatures(forceRefresh)
      ]);
      
      setPlans(plansData);
      setFeatures(featuresData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load plans data';
      setError(errorMessage);
      console.error('Error loading plans data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors([]);
  }, []);

  const getValidationErrors = useCallback(() => {
    return validationErrors;
  }, [validationErrors]);

  // Plan Management Functions
  const createPlan = useCallback(async (planData: Omit<Plan, 'id'>): Promise<boolean> => {
    try {
      setError(null);
      setValidationErrors([]);
      const newPlan = await planDataManager.createPlan(planData);
      if (newPlan) {
        setPlans(prev => [...prev, newPlan]);
        // Refresh features to include any new features from this plan
        const updatedFeatures = await getFeatures(true);
        setFeatures(updatedFeatures);
        return true;
      }
      return false;
    } catch (err) {
      if (err instanceof Error) {
        try {
          // Try to parse error message as JSON to extract validation errors
          const errorData = JSON.parse(err.message);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            setValidationErrors(errorData.errors);
          } else {
            setError(err.message);
          }
        } catch {
          // If parsing fails, treat as regular error
          setError(err.message);
        }
      } else {
        setError('Failed to create plan');
      }
      return false;
    }
  }, []);

  const updatePlan = useCallback(async (planId: string, planData: Partial<Plan>): Promise<boolean> => {
    try {
      setError(null);
      const updatedPlan = await planDataManager.updatePlan(planId, planData);
      if (updatedPlan) {
        setPlans(prev => prev.map(plan => 
          plan.id === planId ? updatedPlan : plan
        ));
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update plan';
      setError(errorMessage);
      return false;
    }
  }, []);

  const deletePlan = useCallback(async (planId: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this plan?')) {
      return false;
    }

    try {
      setError(null);
      const success = await planDataManager.deletePlan(planId);
      if (success) {
        setPlans(prev => prev.filter(plan => plan.id !== planId));
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete plan';
      setError(errorMessage);
      return false;
    }
  }, []);

  const duplicatePlan = useCallback(async (planId: string, newName: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await paymentPlanService.duplicatePaymentPlan(planId, newName);
      if (response.success && response.data) {
        const duplicatedPlan = paymentPlanService.transformPlanDataForFrontend(response.data);
        if (duplicatedPlan) {
          setPlans(prev => [...prev, duplicatedPlan]);
          return true;
        }
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate plan';
      setError(errorMessage);
      return false;
    }
  }, []);

  const togglePlanStatus = useCallback(async (planId: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await paymentPlanService.togglePaymentPlanStatus(planId);
      if (response.success && response.data) {
        const updatedPlan = paymentPlanService.transformPlanDataForFrontend(response.data);
        if (updatedPlan) {
          setPlans(prev => prev.map(plan => 
            plan.id === planId ? updatedPlan : plan
          ));
          return true;
        }
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle plan status';
      setError(errorMessage);
      return false;
    }
  }, []);

  const togglePlanFeatured = useCallback(async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    try {
      setError(null);
      const success = await updatePlan(planId, { featured: !plan.featured });
      if (success) {
        // Refresh all plans from API to get the latest state
        // This ensures we have the correct featured status for all plans
        const refreshedPlans = await getPlans(true);
        setPlans(refreshedPlans);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle featured status';
      setError(errorMessage);
    }
  }, [plans, updatePlan]);

  // Feature Management Functions
  const addFeature = useCallback(async (featureName: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Since features are part of plans, we need to add this feature to all existing plans
      // or create a way to manage features independently. For now, we'll add it to all plans.
      const updatePromises = plans.map(async (plan) => {
        const updatedFeatures = [
          ...(plan.features || []),
          {
            name: featureName,
            included: true,
            description: `${featureName} feature`
          }
        ];
        
        return planDataManager.updatePlan(plan.id, {
          ...plan,
          features: updatedFeatures
        });
      });

      await Promise.all(updatePromises);
      
      // Refresh features to include the new feature
      const updatedFeatures = await getFeatures(true);
      setFeatures(updatedFeatures);
      
      // Refresh plans to get updated data
      const updatedPlans = await getPlans(true);
      setPlans(updatedPlans);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add feature';
      setError(errorMessage);
      return false;
    }
  }, [plans]);

  const deleteFeature = useCallback((featureId: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      setFeatures(prev => prev.filter(feature => feature.id !== featureId));
    }
  }, []);

  const toggleFeatureStatus = useCallback((featureId: string) => {
    setFeatures(prev => prev.map(feature =>
      feature.id === featureId
        ? { ...feature, isActive: feature.isActive === false ? true : false }
        : feature
    ));
  }, []);

  const editFeature = useCallback(async (featureId: string, oldName: string, newName: string) => {
    if (!isEditMode || !newName.trim() || newName.trim() === oldName) return;

    try {
      setError(null);

      // Find all plans that have this feature and update the feature name
      const updatePromises = plans.map(async (plan) => {
        const hasFeature = plan.features?.some(f =>
          typeof f === 'object' && f !== null && 'name' in f && f.name === oldName
        );

        if (hasFeature) {
          const updatedFeatures = plan.features?.map(f => {
            if (typeof f === 'object' && f !== null && 'name' in f && f.name === oldName) {
              return { ...f, name: newName.trim() };
            }
            return f;
          });

          return planDataManager.updatePlan(plan.id, {
            ...plan,
            features: updatedFeatures
          });
        }
        return null;
      });

      await Promise.all(updatePromises);

      // Refresh data from API
      const [refreshedPlans, refreshedFeatures] = await Promise.all([
        getPlans(true),
        getFeatures(true)
      ]);

      setPlans(refreshedPlans);
      setFeatures(refreshedFeatures);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit feature';
      setError(errorMessage);
      console.error('Error editing feature:', err);
    }
  }, [isEditMode, plans]);

  const toggleFeature = useCallback(async (featureId: string, planId: string) => {
    if (!isEditMode) return;
    
    try {
      setError(null);

      // Find the feature being toggled
      const feature = features.find(f => f.id === featureId);
      if (!feature) {
        console.error('Feature not found:', featureId);
        return;
      }

      // Find the target plan by ID
      const targetPlan = plans.find(p => p.id === planId);
      if (!targetPlan) {
        console.error('Plan not found:', planId);
        return;
      }

      // Check if this feature is currently included in the plan
      const currentState = targetPlan.features?.some(f => 
        typeof f === 'object' && f !== null && 'name' in f && 
        f.name === feature.name && f.included !== false
      ) || false;
      const newState = !currentState;

      // Update the target plan
      const updatedFeatures = targetPlan.features ? [...targetPlan.features] : [];
      
      // Find the feature in this plan
      const featureIndex = updatedFeatures.findIndex(f => 
        typeof f === 'object' && f !== null && 'name' in f && f.name === feature.name
      );

      if (newState) {
        // Add or enable the feature
        if (featureIndex === -1) {
          // Add feature if it doesn't exist
          updatedFeatures.push({
            name: feature.name,
            included: true,
            description: `${feature.name} feature`
          });
        } else {
          // Enable existing feature
          updatedFeatures[featureIndex] = {
            ...updatedFeatures[featureIndex],
            included: true
          };
        }
      } else {
        // Remove or disable the feature
        if (featureIndex !== -1) {
          // Remove the feature entirely
          updatedFeatures.splice(featureIndex, 1);
        }
      }

      await planDataManager.updatePlan(targetPlan.id, {
        ...targetPlan,
        features: updatedFeatures
      });

      // Refresh data from API
      const [refreshedPlans, refreshedFeatures] = await Promise.all([
        getPlans(true),
        getFeatures(true)
      ]);
      
      setPlans(refreshedPlans);
      setFeatures(refreshedFeatures);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle feature';
      setError(errorMessage);
      console.error('Error toggling feature:', err);
    }
  }, [isEditMode, features, plans]);

  // Plan Editing with pending changes tracking
  const handlePlanEdit = useCallback((planId: string, field: keyof Plan, value: Plan[keyof Plan]) => {
    // Validate critical fields
    if (field === 'name' && (!value || typeof value !== 'string' || value.trim().length === 0)) {
      setError('Plan name cannot be empty');
      return;
    }
    
    if (field === 'subtitle' && (!value || typeof value !== 'string' || value.trim().length === 0)) {
      setError('Plan subtitle cannot be empty');
      return;
    }

    // Clear any previous errors when valid input is provided
    if (error && (field === 'name' || field === 'subtitle')) {
      setError(null);
    }
    
    // Update UI immediately
    setPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, [field]: value }
        : plan
    ));
    
    // Track pending changes (only if validation passes)
    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      const existing = newChanges.get(planId) || {};
      newChanges.set(planId, { ...existing, [field]: value });
      return newChanges;
    });
  }, [error]);

  // Save all pending changes
  const savePendingChanges = useCallback(async (): Promise<boolean> => {
    if (pendingChanges.size === 0) {
      return true;
    }

    // Clean and validate all pending changes before saving
    const cleanedChanges = new Map<string, Partial<Plan>>();
    const validationErrors: string[] = [];
    
    pendingChanges.forEach((changes, planId) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const cleanChanges: Partial<Plan> = {};
      
      // Only include valid, non-empty changes
      Object.keys(changes).forEach(key => {
        const value = changes[key as keyof Plan];
        
        if (key === 'name' || key === 'subtitle') {
          if (value && typeof value === 'string' && value.trim().length > 0) {
            if (key === 'name') {
              cleanChanges.name = value.trim();
            } else if (key === 'subtitle') {
              cleanChanges.subtitle = value.trim();
            }
          } else {
            validationErrors.push(`${key === 'name' ? 'Plan name' : 'Plan subtitle'} cannot be empty`);
          }
        } else if (value !== undefined && value !== null && value !== '') {
          cleanChanges[key as keyof Plan] = value as never;
        }
      });
      
      if (Object.keys(cleanChanges).length > 0) {
        cleanedChanges.set(planId, cleanChanges);
      }
    });

    if (validationErrors.length > 0) {
      setError(`Validation failed: ${validationErrors.join(', ')}`);
      return false;
    }

    if (cleanedChanges.size === 0) {
      setError('No valid changes to save');
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const updatePromises = Array.from(cleanedChanges.entries()).map(([planId, changes]) => {
        console.log('Updating plan:', planId, 'with cleaned changes:', changes);
        return updatePlan(planId, changes);
      });

      const results = await Promise.all(updatePromises);
      const allSuccessful = results.every(result => result);

      if (allSuccessful) {
        setPendingChanges(new Map());
        await loadData(true);
        return true;
      } else {
        setError('Some plan updates failed. Please try again.');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [pendingChanges, plans, updatePlan, loadData]);

  // Statistics
  const getStats = useCallback(async (): Promise<PlanStats | null> => {
    try {
      const response = await paymentPlanService.getPaymentPlanStats();
      return response.data || null;
    } catch (err) {
      console.error('Error getting stats:', err);
      return null;
    }
  }, []);

  return {
    // Data
    plans,
    features,
    
    // States
    isLoading,
    error,
    isEditMode,
    
    // Actions
    loadData,
    setIsEditMode,
    clearError,
    
    // Plan Management
    createPlan,
    updatePlan,
    deletePlan,
    duplicatePlan,
    togglePlanStatus,
    togglePlanFeatured,
    getValidationErrors,
    
    // Feature Management
    addFeature,
    deleteFeature,
    toggleFeature,
    toggleFeatureStatus,
    editFeature,

    // Plan Editing
    handlePlanEdit,
    savePendingChanges,
    hasPendingChanges: pendingChanges.size > 0,
    
    // Statistics
    getStats,
  };
};