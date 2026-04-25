"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Shield, Lock, CheckCircle } from 'lucide-react';
import { isAuthenticated } from '@/helper/helper';
import MoyasarPaymentForm from '@/components/payments/MoyasarPaymentForm';
import Link from 'next/link';
import Image from 'next/image';
import { type MoyasarPaymentResult } from '@/app/(routes)/main/services/moyasarService';

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  description?: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      const currentUrl = window.location.href;
      router.push(`/authentication?mode=signin&redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Parse plan info from URL params
    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const price = searchParams.get('price');
    const currency = searchParams.get('currency') || 'SAR';
    const billingCycle = (searchParams.get('billing') as 'monthly' | 'yearly') || 'monthly';

    if (!planId || !price) {
      router.push('/#pricing');
      return;
    }

    setPlan({
      id: planId,
      name: decodeURIComponent(planName || 'Subscription Plan'),
      price: parseFloat(price),
      currency,
      billingCycle,
      description: `${decodeURIComponent(planName || 'Plan')} - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`
    });

    setIsLoading(false);
  }, [searchParams, router]);

  const handlePaymentSuccess = (payment: MoyasarPaymentResult) => {
    console.log('Payment successful:', payment);
    setPaymentSuccess(true);
    // The callback URL will handle the redirect
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
  };

  const handlePaymentInitiating = () => {
    setIsProcessing(true);
  };

  // Calculate totals
  const subtotal = plan?.price || 0;
  const vatRate = 0.15; // 15% VAT for Saudi Arabia
  const vatAmount = subtotal * vatRate;
  const totalAmount = subtotal + vatAmount;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Loading checkout...</h2>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No plan selected</h2>
          <p className="text-gray-600 mb-6">Please select a subscription plan to continue.</p>
          <Link
            href="/#pricing"
            className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            View Pricing Plans
          </Link>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Initiated!</h2>
          <p className="text-gray-600 mb-6">
            Please complete the payment in the new window. You will be redirected once the payment is confirmed.
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/#pricing"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Pricing
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">You&apos;re subscribing to <span className="font-semibold text-primary">{plan.name}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary - Left side */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary font-bold text-sm">1</span>
                </span>
                Order Summary
              </h2>

              {/* Plan details */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {plan.billingCycle === 'yearly' ? 'Annual billing (Save up to 20%)' : 'Monthly billing'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {plan.currency} {plan.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      /{plan.billingCycle === 'yearly' ? 'year' : 'month'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{plan.currency} {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (15%)</span>
                  <span>{plan.currency} {vatAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 text-lg">Total</span>
                    <span className="font-bold text-2xl text-gray-900">
                      {plan.currency} {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security badges */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center text-sm text-green-800">
                    <Shield className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Secure checkout powered by Moyasar</span>
                  </div>
                  <div className="flex items-center text-sm text-green-800">
                    <Lock className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>256-bit SSL encryption</span>
                  </div>
                </div>
              </div>

              {/* Accepted payment methods */}
              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-3 font-medium">ACCEPTED PAYMENT METHODS</p>
                <div className="flex items-center flex-wrap gap-3">
                  <Image src="/images/payment-methods/visa.svg" alt="Visa" width={50} height={32} />
                  <Image src="/images/payment-methods/mastercard.svg" alt="Mastercard" width={50} height={32} />
                  <Image src="/images/payment-methods/mada.svg" alt="Mada" width={50} height={32} />
                  <Image src="/images/payment-methods/stcpay.svg" alt="STC Pay" width={50} height={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form - Right side */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary font-bold text-sm">2</span>
                </span>
                Payment Details
              </h2>
            </div>

            <MoyasarPaymentForm
              amount={totalAmount}
              currency={plan.currency}
              description={plan.description || `${plan.name} Subscription`}
              paymentPlanId={plan.id}
              billingCycle={plan.billingCycle}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onInitiating={handlePaymentInitiating}
            />

            {isProcessing && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-3" />
                <span className="text-blue-800">Processing your payment...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            By completing this purchase, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
          <p className="mt-2">
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
