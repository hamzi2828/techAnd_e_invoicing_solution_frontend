"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Plan } from '../services/pricingService';
import { usePricing } from '../hooks/usePricing';

interface PricingSectionProps {
  isAuthenticated?: boolean;
}

export default function PricingSection({ isAuthenticated = false }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);
  const { plans, isLoading, error, refetch } = usePricing();

  const getPrice = (plan: Plan) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getMonthlyPrice = (plan: Plan) => {
    return isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
  };

  const getSavingsPercentage = () => {
    if (plans.length === 0) return 0;
    const plan = plans[0];
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlyPrice = plan.yearlyPrice;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  };

  if (isLoading) {
    return (
      <div id="pricing" className="py-20">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Loading pricing plans...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="pricing" className="py-20">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Pricing</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div id="pricing" className="py-20">
        <div className="text-center">
          <p className="text-gray-600">No pricing plans available at the moment.</p>
        </div>
      </div>
    );
  }

  // Dynamic grid classes based on number of plans
  const getGridClasses = () => {
    const planCount = plans.length;
    if (planCount === 1) return "grid grid-cols-1 max-w-md mx-auto gap-8";
    if (planCount === 2) return "grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 lg:gap-8";
    if (planCount === 3) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-6 lg:gap-8";
    if (planCount === 4) return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8";
    // 5 or more plans: 3 per row with proper spacing
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto";
  };

  return (
    <div id="pricing" className="py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose Your Perfect Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Start your invoicing journey with a plan that fits your business needs
          {plans.length > 3 && (
            <span className="block text-sm text-gray-500 mt-2">
              {plans.length} plans available {plans.length > 3 ? '- view all options below' : ''}
            </span>
          )}
        </p>
        
        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            style={{
              backgroundColor: isYearly ? '#37469E' : '#e5e7eb'
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {isYearly && getSavingsPercentage() > 0 && (
            <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 px-3 py-1 rounded-full border-2 border-green-300 shadow-md animate-pulse">
              <span className="text-xs font-bold text-green-800">
                Save up to {getSavingsPercentage()}%
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className={getGridClasses()}>
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className={`relative bg-gradient-to-br from-white via-blue-50 to-primary-50 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full ${
              plan.popular
                ? 'ring-2 ring-primary ring-opacity-70 border-primary-300'
                : plan.featured
                ? 'ring-2 ring-blue-500 ring-opacity-70 border-blue-300'
                : 'border-gray-200'
            }`}
          >
            {/* Badge */}
            {(plan.popular || plan.featured || plan.badge) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className={`px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary via-blue-600 to-indigo-700 animate-pulse'
                    : plan.featured
                    ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700'
                    : 'bg-gradient-to-r from-primary-500 via-blue-600 to-indigo-700'
                }`}>
                  {plan.badge || (plan.popular ? 'Most Popular' : plan.featured ? 'Best Value' : '')}
                </div>
              </div>
            )}

            <div className="p-6 lg:p-8 flex flex-col h-full">
              {/* Plan Header */}
              <div className="text-center mb-6 lg:mb-8">
                <div className="flex items-center justify-center mb-4">
                  {plan.featured && <Crown className="h-6 w-6 text-primary-400 mr-2" />}
                  {plan.popular && <Star className="h-6 w-6 text-primary mr-2" />}
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {plan.currency || 'SAR'} {getMonthlyPrice(plan)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    / month
                  </span>
                </div>
                
                {isYearly && (
                  <div className="text-sm text-gray-500">
                    Billed annually ({plan.currency || 'SAR'} {getPrice(plan)})
                  </div>
                )}
                
                <p className="text-gray-600 mt-4">{plan.description}</p>
              </div>

              {/* Features List */}
              <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 shadow-sm ${
                      feature.included
                        ? 'bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-200 text-primary-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={`text-sm ${
                      feature.included ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {feature.name}
                      {feature.limit && (
                        <span className="text-gray-500 ml-1">
                          ({feature.limit})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center mt-auto">
                <Link
                  href={isAuthenticated
                    ? `/payment/checkout?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}&price=${getPrice(plan)}&currency=${plan.currency || 'SAR'}&billing=${isYearly ? 'yearly' : 'monthly'}`
                    : `/authentication?mode=signup&redirect=${encodeURIComponent(`/payment/checkout?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}&price=${getPrice(plan)}&currency=${plan.currency || 'SAR'}&billing=${isYearly ? 'yearly' : 'monthly'}`)}`
                  }
                  className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all duration-500 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary via-blue-600 to-indigo-700 hover:from-indigo-700 hover:via-blue-600 hover:to-primary text-white shadow-xl hover:shadow-2xl hover:scale-105'
                      : plan.featured
                      ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-600 hover:to-blue-500 text-white shadow-xl hover:shadow-2xl hover:scale-105'
                      : 'bg-gradient-to-br from-white via-blue-50 to-primary-100 border-2 border-primary-200 hover:border-primary-400 text-primary-700 hover:bg-gradient-to-br hover:from-primary-100 hover:via-blue-100 hover:to-indigo-200 shadow-md hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isAuthenticated ? 'Subscribe Now' : 'Get Started'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>

                <p className="text-xs text-gray-500 mt-3">
                  {isAuthenticated ? 'Secure payment via Moyasar' : '14-day free trial • Secure payment'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-16"
      >
        <p className="text-gray-600 mb-4">
          Need a custom solution for your enterprise?
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-primary hover:bg-primary-50 transition-colors"
        >
          Contact Sales
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </motion.div>
    </div>
  );
}