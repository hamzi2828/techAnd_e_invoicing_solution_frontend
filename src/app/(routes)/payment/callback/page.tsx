"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, AlertCircle, ArrowRight, Home, RotateCcw } from 'lucide-react';
import { confirmPayment, type MoyasarPayment } from '@/app/(routes)/main/services/moyasarService';
import Link from 'next/link';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'error';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [payment, setPayment] = useState<MoyasarPayment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get('id');
      const paymentStatus = searchParams.get('status');
      const message = searchParams.get('message');

      console.log('Payment callback received:', { paymentId, paymentStatus, message });

      if (!paymentId) {
        setStatus('error');
        setErrorMessage('No payment ID found in callback');
        return;
      }

      // If status is already failed from Moyasar
      if (paymentStatus === 'failed') {
        setStatus('failed');
        setErrorMessage(message || 'Payment was not completed');
        return;
      }

      try {
        // Verify the payment with backend
        const result = await confirmPayment(paymentId);

        console.log('Payment verification result:', result);

        if (result.success) {
          setStatus('success');
          setPayment(result.payment);
        } else {
          setStatus('failed');
          setErrorMessage('Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-10 max-w-md">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full mx-auto" />
            <Loader2 className="h-20 w-20 animate-spin text-primary absolute inset-0 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
          <p className="text-gray-400 text-sm mt-4">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100">Thank you for your subscription</p>
          </div>

          <div className="p-8">
            {/* Payment details */}
            {payment && (
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </span>
                  Payment Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-mono text-gray-900 text-xs">{payment.id || payment.moyasarId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-500">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid
                    </span>
                  </div>
                  {payment.planName && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Plan</span>
                      <span className="font-semibold text-gray-900">{payment.planName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What's next */}
            <div className="bg-blue-50 rounded-xl p-5 mb-6 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">What&apos;s next?</h4>
              <p className="text-blue-700 text-sm">
                Your subscription is now active. You can start using all the features included in your plan immediately.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-all shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center w-full border-2 border-gray-200 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Failed header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <XCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-red-100">We couldn&apos;t process your payment</p>
          </div>

          <div className="p-8">
            {/* Error message */}
            <div className="bg-red-50 rounded-xl p-5 mb-6 border border-red-100">
              <p className="text-red-800">
                {errorMessage || 'Your payment could not be processed. Please try again or use a different payment method.'}
              </p>
            </div>

            {/* Common reasons */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Common reasons for payment failure:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  Insufficient funds in your account
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  Card expired or incorrect details
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  Transaction blocked by your bank
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-all shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Try Again
              </button>
              <Link
                href="/contact"
                className="flex items-center justify-center w-full border-2 border-gray-200 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-yellow-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Error header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-8 py-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-yellow-100">We encountered an unexpected error</p>
        </div>

        <div className="p-8">
          {/* Error message */}
          <div className="bg-yellow-50 rounded-xl p-5 mb-6 border border-yellow-100">
            <p className="text-yellow-800">
              {errorMessage || 'An unexpected error occurred while processing your request.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-all shadow-lg hover:shadow-xl"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retry
            </button>
            <Link
              href="/"
              className="flex items-center justify-center w-full border-2 border-gray-200 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center bg-white rounded-2xl shadow-xl p-10 max-w-md">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
