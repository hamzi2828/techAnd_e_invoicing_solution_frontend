"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, CheckCircle, CreditCard, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  loadMoyasarScript,
  initializeMoyasarForm,
  createCheckoutSession,
  type MoyasarFormConfig,
  type MoyasarPaymentResult,
  type MoyasarError,
} from '@/app/(routes)/main/services/moyasarService';
import { getAuthToken, isAuthenticated } from '@/helper/helper';

interface MoyasarPaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  paymentPlanId?: string;
  billingCycle?: 'monthly' | 'yearly';
  successUrl?: string;
  cancelUrl?: string;
  onSuccess?: (payment: MoyasarPaymentResult) => void;
  onError?: (error: Error) => void;
  onInitiating?: () => void;
  className?: string;
}

export default function MoyasarPaymentForm({
  amount,
  currency = 'SAR',
  description = 'Subscription Payment',
  paymentPlanId,
  billingCycle = 'monthly',
  successUrl,
  cancelUrl,
  onSuccess,
  onError,
  onInitiating,
  className = ''
}: MoyasarPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const initAttempted = useRef(false);

  const initializeForm = useCallback(async () => {
    // Prevent double initialization
    if (initAttempted.current) return;
    initAttempted.current = true;

    try {
      setIsLoading(true);
      setError(null);

      // Check authentication
      const token = getAuthToken();
      if (!token || !isAuthenticated()) {
        throw new Error('You must be logged in to make a payment. Please sign in first.');
      }

      // Load Moyasar script
      await loadMoyasarScript();

      // Get checkout session from backend
      const sessionData = await createCheckoutSession({
        paymentPlanId: paymentPlanId || '',
        amount,
        currency,
        successUrl: successUrl || `${window.location.origin}/payment/callback`,
        cancelUrl: cancelUrl || `${window.location.origin}/payment/cancel`,
        billingCycle,
        metadata: {
          description,
        }
      });

      if (!sessionData.success) {
        throw new Error('Failed to create checkout session');
      }

      // Clear any existing form content
      if (formContainerRef.current) {
        const formElement = formContainerRef.current.querySelector('.moyasar-form');
        if (formElement) {
          formElement.innerHTML = '';
        }
      }

      // Initialize Moyasar form
      const config = {
        element: '.moyasar-form',
        amount: sessionData.amount,
        currency: sessionData.currency,
        description: sessionData.description,
        publishable_api_key: sessionData.publishableKey,
        callback_url: sessionData.callbackUrl,
        methods: ['creditcard', 'stcpay'],
        metadata: sessionData.metadata,
        // Additional required config
        language: 'en',
        fixed_width: false,
        supported_networks: ['visa', 'mastercard', 'mada'],
        on_initiating: function() {
          console.log('Payment initiating...');
          if (onInitiating) onInitiating();
          return true;
        },
        on_completed: function(payment: MoyasarPaymentResult) {
          console.log('Payment completed:', payment);
          if (onSuccess) onSuccess(payment);
          return true;
        },
        on_failure: function(err: MoyasarError) {
          console.error('Payment failed:', err);
          const errorMessage = err?.message || 'Payment failed';
          setError(errorMessage);
          if (onError) onError(new Error(errorMessage));
          return true;
        }
      } as MoyasarFormConfig;

      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      initializeMoyasarForm(config);
      setIsInitialized(true);
      setIsLoading(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment form';
      console.error('Payment form initialization error:', err);
      setError(errorMessage);
      setIsLoading(false);
      onError?.(new Error(errorMessage));
    }
  }, [amount, currency, description, paymentPlanId, billingCycle, successUrl, cancelUrl, onSuccess, onError, onInitiating]);

  const retryInitialization = useCallback(() => {
    initAttempted.current = false;
    setError(null);
    setIsInitialized(false);
    initializeForm();
  }, [initializeForm]);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  // Error state
  if (error) {
    const isAuthError = error.includes('logged in') || error.includes('authorized') || error.includes('sign in');

    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Error</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex flex-wrap gap-3">
                {isAuthError ? (
                  <Link
                    href="/authentication?mode=signin"
                    className="inline-flex items-center bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Sign In to Continue
                  </Link>
                ) : (
                  <button
                    onClick={retryInitialization}
                    className="inline-flex items-center bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                )}
                <Link
                  href="/#pricing"
                  className="inline-flex items-center border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={formContainerRef} className={`relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-2xl">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Loading secure payment form...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Secure Payment</h3>
          </div>
        </div>

        <div className="p-6">
          {/* Amount display */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-gray-900">
                {currency} {amount.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          </div>

          {/* Moyasar form container */}
          <div className="moyasar-form min-h-[320px]"></div>

          {/* Success indicator */}
          {isInitialized && !isLoading && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Secured by Moyasar</span>
            </div>
          )}

          {/* Security notice */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                256-bit SSL Encryption
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                PCI DSS Compliant
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              We accept Visa, Mastercard, Mada, and STC Pay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
