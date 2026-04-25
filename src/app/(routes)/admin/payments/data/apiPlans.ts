import { Plan, Feature } from '../types';
import * as paymentPlanService from '../services/paymentPlanService';

export class PaymentPlanDataManager {
  private static instance: PaymentPlanDataManager;
  private cachedPlans: Plan[] = [];
  private cachedFeatures: Feature[] = [];
  private lastFetch: number = 0;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  static getInstance(): PaymentPlanDataManager {
    if (!PaymentPlanDataManager.instance) {
      PaymentPlanDataManager.instance = new PaymentPlanDataManager();
    }
    return PaymentPlanDataManager.instance;
  }

  async getPlans(forceRefresh: boolean = false): Promise<Plan[]> {
    const now = Date.now();
    const isCacheValid = now - this.lastFetch < this.cacheTimeout;

    if (!forceRefresh && isCacheValid && this.cachedPlans.length > 0) {
      return this.cachedPlans;
    }

    try {
      const response = await paymentPlanService.getActivePaymentPlans();
      
      if (response.success && response.data) {
        this.cachedPlans = paymentPlanService.transformPlansArrayForFrontend(response.data);
        this.lastFetch = now;
        return this.cachedPlans;
      } else {
        throw new Error('Failed to fetch plans from API');
      }
    } catch (error) {
      console.error('Error fetching plans from API:', error);
      throw error;
    }
  }

  async getFeatures(forceRefresh: boolean = false): Promise<Feature[]> {
    const plans = await this.getPlans(forceRefresh);
    
    if (plans.length === 0) {
      return [];
    }

    const featuresMap = new Map<string, Feature>();

    plans.forEach((plan) => {
      if (plan.features && Array.isArray(plan.features)) {
        plan.features.forEach((feature) => {
          if (feature.name && typeof feature.name === 'string') {
            const featureId = feature.name.toLowerCase().replace(/\s+/g, '_');
            
            if (!featuresMap.has(featureId)) {
              featuresMap.set(featureId, {
                id: featureId,
                name: String(feature.name),
                starter: false,
                plus: false,
                premium: false
              });
            }

            const currentFeature = featuresMap.get(featureId)!;
            
            // Determine which plan type this is and mark the feature as available
            const planName = plan.name.toLowerCase();
            if (planName.includes('starter') || planName.includes('free') || planName.includes('basic')) {
              currentFeature.starter = true;
            }
            if (planName.includes('plus') || planName.includes('standard') || planName.includes('pro')) {
              currentFeature.plus = true;
            }
            if (planName.includes('premium') || planName.includes('enterprise') || planName.includes('advanced')) {
              currentFeature.premium = true;
            }

            // If no specific plan type is detected, default to all plans having this feature
            if (!planName.includes('starter') && !planName.includes('free') && !planName.includes('basic') &&
                !planName.includes('plus') && !planName.includes('standard') && !planName.includes('pro') &&
                !planName.includes('premium') && !planName.includes('enterprise') && !planName.includes('advanced')) {
              currentFeature.starter = true;
              currentFeature.plus = true;
              currentFeature.premium = true;
            }
          }
        });
      }
    });

    this.cachedFeatures = Array.from(featuresMap.values());
    return this.cachedFeatures;
  }


  async createPlan(planData: Omit<Plan, 'id'>): Promise<Plan | null> {
    try {
      const apiData = paymentPlanService.transformPlanDataForAPI(planData);
      const response = await paymentPlanService.createPaymentPlan(apiData);
      
      if (response.success && response.data) {
        const newPlan = paymentPlanService.transformPlanDataForFrontend(response.data);
        if (newPlan) {
          this.cachedPlans.push(newPlan);
          return newPlan;
        }
      }
      return null;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  async updatePlan(id: string, planData: Partial<Plan>): Promise<Plan | null> {
    try {
      const apiData = paymentPlanService.transformPartialPlanDataForAPI(planData);
      console.log('Sending to API - Plan ID:', id, 'Data:', apiData);
      const response = await paymentPlanService.updatePaymentPlan(id, apiData);
      
      if (response.success && response.data) {
        const updatedPlan = paymentPlanService.transformPlanDataForFrontend(response.data);
        if (updatedPlan) {
          const index = this.cachedPlans.findIndex(plan => plan.id === id);
          if (index !== -1) {
            this.cachedPlans[index] = updatedPlan;
          }
          return updatedPlan;
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  async deletePlan(id: string): Promise<boolean> {
    try {
      const response = await paymentPlanService.deletePaymentPlan(id);
      
      if (response.success) {
        this.cachedPlans = this.cachedPlans.filter(plan => plan.id !== id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cachedPlans = [];
    this.cachedFeatures = [];
    this.lastFetch = 0;
  }
}

export const planDataManager = PaymentPlanDataManager.getInstance();

export const getPlans = (forceRefresh?: boolean) => planDataManager.getPlans(forceRefresh);
export const getFeatures = (forceRefresh?: boolean) => planDataManager.getFeatures(forceRefresh);

