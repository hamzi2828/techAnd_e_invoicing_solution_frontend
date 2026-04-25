'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface OTPVerificationProps {
  companyId: string;
  initialPhoneNumber?: string;
  isVerified?: boolean;
  onSendOTP: (phoneNumber: string) => Promise<{ success: boolean; message: string; cooldownRemaining?: number; devOTP?: string }>;
  onVerifyOTP: (otp: string) => Promise<{ success: boolean; message: string; attemptsRemaining?: number; cooldownRemaining?: number }>;
  onResendOTP: () => Promise<{ success: boolean; message: string; cooldownRemaining?: number }>;
  onVerified?: () => void;
}

export default function OTPVerification({
  initialPhoneNumber,
  isVerified: initialVerified,
  onSendOTP,
  onVerifyOTP,
  onResendOTP,
  onVerified
}: OTPVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp' | 'verified'>(initialVerified ? 'verified' : 'phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [devOTP, setDevOTP] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || isLoading || cooldown > 0) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await onSendOTP(phoneNumber);
      if (result.success) {
        setStep('otp');
        setMessage(result.message);
        if (result.devOTP) {
          setDevOTP(result.devOTP);
        }
      } else {
        setError(result.message);
        if (result.cooldownRemaining) {
          setCooldown(result.cooldownRemaining);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOTP = [...otp];
    newOTP[index] = value.slice(-1); // Only take last digit
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOTP.every(d => d !== '') && newOTP.join('').length === 6) {
      handleVerifyOTP(newOTP.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOTP = pastedData.split('');
      setOtp(newOTP);
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpValue: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await onVerifyOTP(otpValue);
      if (result.success) {
        setStep('verified');
        setMessage(result.message);
        onVerified?.();
      } else {
        setError(result.message);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        if (result.attemptsRemaining !== undefined) {
          setAttemptsRemaining(result.attemptsRemaining);
        }
        if (result.cooldownRemaining) {
          setCooldown(result.cooldownRemaining);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isLoading || cooldown > 0) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);
    setOtp(['', '', '', '', '', '']);
    setDevOTP(null);

    try {
      const result = await onResendOTP();
      if (result.success) {
        setMessage(result.message);
        if ((result as { devOTP?: string }).devOTP) {
          setDevOTP((result as { devOTP?: string }).devOTP || null);
        }
      } else {
        setError(result.message);
        if (result.cooldownRemaining) {
          setCooldown(result.cooldownRemaining);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verified') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Phone Verified</h3>
        <p className="text-green-700">
          Your phone number has been successfully verified.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Verification</h3>
        <p className="text-sm text-gray-600">
          Verify your phone number to complete the onboarding process.
        </p>
      </div>

      {/* Error/Message Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800">{error}</p>
            {attemptsRemaining !== null && (
              <p className="text-red-600 text-sm mt-1">
                {attemptsRemaining} attempts remaining
              </p>
            )}
          </div>
        </div>
      )}

      {message && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* Dev OTP Display */}
      {devOTP && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <strong>Development Mode:</strong> OTP is <code className="bg-amber-100 px-2 py-0.5 rounded font-mono">{devOTP}</code>
          </p>
        </div>
      )}

      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+966 5XX XXX XXXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Enter your Saudi phone number</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phoneNumber.trim() || cooldown > 0}
            className="w-full py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all duration-300"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {cooldown > 0 ? `Wait ${cooldown}s` : isLoading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter the 6-digit code sent to your phone
            </label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setStep('phone')}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Change number
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading || cooldown > 0}
              className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}

      {/* Rate Limit Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Security:</strong> You can request up to 5 OTPs with a 60-second cooldown between attempts.
          The OTP is valid for 10 minutes.
        </p>
      </div>
    </div>
  );
}
