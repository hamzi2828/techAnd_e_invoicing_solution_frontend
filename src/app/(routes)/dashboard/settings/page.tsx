'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Settings,
  FileText,
  Bell,
  Save,
  Download,
  RefreshCw,
  CheckCircle,
  Hash,
  Activity,
  User,
  Shield,
  CreditCard,
  Calendar,
  Crown,
  Star,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
  Check,
  Clock,
  Receipt,
  Gift,
  Lock,
  Building2,
  Users,
  Headphones,
  Mail,
  Zap,
  Package,
  Palette,
  RotateCcw
} from 'lucide-react';
import { useTheme, GRADIENT_PRESETS } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import {
  getAvailablePlans,
  getCurrentSubscription,
  changePlan,
  cancelSubscription,
  getPaymentHistory,
  type Plan,
  type Subscription,
} from './services/subscriptionService';

const recentActivity = [
  { action: 'Logged in from new device', timestamp: '30 minutes ago', type: 'login' },
  { action: 'Created invoice INV-2024-001234', timestamp: '1 hour ago', type: 'invoice' },
  { action: 'Updated user permissions for John Doe', timestamp: '2 hours ago', type: 'admin' },
  { action: 'Added new customer: ABC Trading Co.', timestamp: '4 hours ago', type: 'customer' },
  { action: 'Generated monthly sales report', timestamp: '6 hours ago', type: 'export' },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'subscription';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    securityAlerts: true,
    maintenanceAlerts: true
  });

  // Subscription state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    planName?: string;
    createdAt: string;
    paidAt?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Modal state
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Appearance state
  const { gradientFrom, gradientTo, companyDefault, saveUserGradient, resetToDefault } = useTheme();
  const [selectedFrom, setSelectedFrom] = useState(gradientFrom);
  const [selectedTo, setSelectedTo] = useState(gradientTo);
  const [customFrom, setCustomFrom] = useState(gradientFrom);
  const [customTo, setCustomTo] = useState(gradientTo);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);

  useEffect(() => {
    setSelectedFrom(gradientFrom);
    setSelectedTo(gradientTo);
    setCustomFrom(gradientFrom);
    setCustomTo(gradientTo);
  }, [gradientFrom, gradientTo]);

  const handlePresetSelect = (from: string, to: string) => {
    setSelectedFrom(from);
    setSelectedTo(to);
    setCustomFrom(from);
    setCustomTo(to);
  };

  const handleCustomColorChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setCustomFrom(value);
      setSelectedFrom(value);
    } else {
      setCustomTo(value);
      setSelectedTo(value);
    }
  };

  const handleSaveAppearance = async () => {
    setIsSavingAppearance(true);
    try {
      await saveUserGradient(selectedFrom, selectedTo);
      toast.success('Your color theme saved successfully!');
    } catch {
      toast.error('Failed to save color theme.');
    } finally {
      setIsSavingAppearance(false);
    }
  };

  const handleResetToDefault = async () => {
    setIsSavingAppearance(true);
    try {
      await resetToDefault();
      setSelectedFrom(companyDefault.gradientFrom);
      setSelectedTo(companyDefault.gradientTo);
      setCustomFrom(companyDefault.gradientFrom);
      setCustomTo(companyDefault.gradientTo);
      toast.success('Reset to company default theme!');
    } catch {
      toast.error('Failed to reset theme.');
    } finally {
      setIsSavingAppearance(false);
    }
  };

  const isSelectedPreset = (from: string, to: string) => {
    return selectedFrom === from && selectedTo === to;
  };

  // Fetch subscription data
  const fetchSubscriptionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [plansData, subscriptionData, historyData] = await Promise.all([
        getAvailablePlans(),
        getCurrentSubscription(),
        getPaymentHistory(5),
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
      if (historyData.success) {
        setPaymentHistory(historyData.payments);
      }

      // Set billing cycle from current subscription
      if (subscriptionData?.billingCycle) {
        setBillingCycle(subscriptionData.billingCycle);
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'subscription' || activeTab === 'plans') {
      fetchSubscriptionData();
    }
  }, [activeTab, fetchSubscriptionData]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;

    try {
      setIsProcessing(true);
      const result = await changePlan({
        newPlanId: selectedPlan.id,
        billingCycle,
      });

      if (result.success) {
        // Handle free plan activation
        if (result.isFree) {
          // Free plan was activated successfully, refresh subscription data
          await fetchSubscriptionData();
          setShowChangePlanModal(false);
          setSuccessMessage(`Successfully activated ${selectedPlan.name} plan!`);
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);
          return;
        }

        // Paid plan - redirect to checkout
        if (result.publishableKey) {
          const checkoutUrl = `/payment/checkout?planId=${selectedPlan.id}&planName=${encodeURIComponent(selectedPlan.name)}&price=${billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}&currency=${selectedPlan.currency || 'SAR'}&billing=${billingCycle}`;
          window.location.href = checkoutUrl;
        }
      }
    } catch (err) {
      console.error('Error changing plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to change plan');
    } finally {
      setIsProcessing(false);
      setShowChangePlanModal(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      setIsProcessing(true);
      await cancelSubscription(currentSubscription.id);
      await fetchSubscriptionData();
      setShowCancelModal(false);
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return CheckCircle;
      case 'admin': return Shield;
      case 'role': return User;
      case 'export': return Download;
      case 'settings': return Settings;
      case 'invoice': return FileText;
      case 'customer': return User;
      case 'product': return Hash;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-green-600';
      case 'admin': return 'text-blue-600';
      case 'export': return 'text-lime-600';
      case 'settings': return 'text-orange-600';
      case 'invoice': return 'text-indigo-600';
      case 'customer': return 'text-cyan-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPrice = (plan: Plan) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const tabs = [
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'plans', name: 'Plans', icon: Package },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'activity', name: 'Recent Activity', icon: Activity }
  ];

  // Key features for plans comparison
  const keyFeatures = [
    'Number of Companies',
    'Invoice Volume',
    'ZATCA Phase 1 (Generation)',
    'ZATCA Phase 2 (Integration)',
    'ZATCA Onboarding',
    'Quotation',
    'Bulk Import',
    'Reports',
    'Report Scheduling',
    'Multiple Users',
    'Roles & Permissions',
    'Email Notifications',
    'Support',
    'API Access',
    'Custom Integrations',
  ];

  const getFeatureIcon = (featureName: string) => {
    const name = featureName.toLowerCase();
    if (name.includes('compan')) return Building2;
    if (name.includes('invoice') || name.includes('quotation')) return FileText;
    if (name.includes('user') || name.includes('role')) return Users;
    if (name.includes('zatca') || name.includes('phase')) return Shield;
    if (name.includes('email') || name.includes('notification')) return Mail;
    if (name.includes('support')) return Headphones;
    if (name.includes('report')) return Download;
    if (name.includes('bulk') || name.includes('import')) return Zap;
    if (name.includes('api') || name.includes('integration')) return Zap;
    return Check;
  };

  const formatLimit = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'Unlimited';
    return value.toLocaleString();
  };

  const getPlanColor = (planName: string) => {
    const colors: Record<string, string> = {
      'Free': 'from-gray-500 to-gray-600',
      'Basic': 'from-blue-500 to-blue-600',
      'Professional': 'from-green-500 to-emerald-600',
      'Enterprise': 'from-purple-500 to-indigo-600',
    };
    return colors[planName] || 'from-primary to-blue-600';
  };

  const getPlanBgColor = (planName: string) => {
    const colors: Record<string, string> = {
      'Free': 'bg-gray-50 border-gray-200',
      'Basic': 'bg-blue-50 border-blue-200',
      'Professional': 'bg-green-50 border-green-200',
      'Enterprise': 'bg-purple-50 border-purple-200',
    };
    return colors[planName] || 'bg-primary-50 border-primary-200';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your subscription and preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                  <span className="text-gray-600">Loading subscription data...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                  <p className="text-red-800 mb-4">{error}</p>
                  <button
                    onClick={fetchSubscriptionData}
                    className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Success Message */}
                  {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <p className="text-green-800 font-medium">{successMessage}</p>
                      </div>
                      <button
                        onClick={() => setSuccessMessage(null)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {/* Current Plan Section */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
                    {currentSubscription ? (
                      <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-primary-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-gradient-to-br from-primary to-indigo-600 rounded-lg shadow-lg">
                              <Crown className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-xl font-bold text-gray-900">{currentSubscription.plan.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  currentSubscription.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : currentSubscription.status === 'canceled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">
                                {currentSubscription.currency} {currentSubscription.unitAmount.toFixed(2)} / {currentSubscription.billingCycle}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            {currentSubscription.status === 'active' && (
                              <button
                                onClick={() => setShowCancelModal(true)}
                                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                              >
                                Cancel Plan
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subscription Details */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white/60 rounded-lg p-4">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span className="text-sm">Start Date</span>
                            </div>
                            <p className="font-semibold text-gray-900">{formatDate(currentSubscription.currentPeriodStart)}</p>
                          </div>
                          <div className="bg-white/60 rounded-lg p-4">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Clock className="h-4 w-4 mr-2" />
                              <span className="text-sm">Renewal Date</span>
                            </div>
                            <p className="font-semibold text-gray-900">{formatDate(currentSubscription.currentPeriodEnd)}</p>
                          </div>
                          <div className="bg-white/60 rounded-lg p-4">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Activity className="h-4 w-4 mr-2" />
                              <span className="text-sm">Days Remaining</span>
                            </div>
                            <p className="font-semibold text-gray-900">{currentSubscription.daysRemaining} days</p>
                          </div>
                        </div>

                        {currentSubscription.cancelAtPeriodEnd && (
                          <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm">
                              <AlertCircle className="h-4 w-4 inline mr-2" />
                              Your subscription will end on {formatDate(currentSubscription.currentPeriodEnd)}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                        <p className="text-gray-600 mb-4">Choose a plan below to get started</p>
                      </div>
                    )}
                  </div>

                  {/* Payment History Section */}
                  {paymentHistory.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {paymentHistory.map((payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {formatDate(payment.paidAt || payment.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {payment.description || payment.planName || 'Subscription Payment'}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {payment.currency} {payment.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.status === 'succeeded'
                                      ? 'bg-green-100 text-green-800'
                                      : payment.status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* Billing Toggle */}
              <div className="bg-gradient-to-r from-white via-primary-50 to-blue-50 rounded-2xl shadow-sm border border-primary-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Monthly
                      </span>
                      <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        style={{ backgroundColor: billingCycle === 'yearly' ? '#37469E' : '#e5e7eb' }}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                            billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Yearly
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1 rounded-full border border-green-200">
                        <span className="text-xs font-medium text-green-800 flex items-center">
                          <Gift className="h-3 w-3 mr-1" />
                          Save up to 17%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <button
                      onClick={fetchSubscriptionData}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              {isLoading ? (
                <div className="bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl shadow-sm border border-primary-200 p-8">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary mr-3" />
                    <span className="text-primary font-medium">Loading plans...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan) => {
                    const isCurrentPlan = currentSubscription?.plan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl ${
                          plan.featured || plan.popular
                            ? 'border-primary-400 ring-2 ring-primary-200'
                            : getPlanBgColor(plan.name)
                        }`}
                      >
                        {/* Popular/Current Badge */}
                        {(plan.popular || plan.featured || isCurrentPlan) && (
                          <div className="absolute top-0 left-0 right-0">
                            <div className={`bg-gradient-to-r ${isCurrentPlan ? 'from-green-500 to-emerald-600' : getPlanColor(plan.name)} text-white text-center py-1.5 text-xs font-bold`}>
                              <Crown className="h-3 w-3 inline mr-1" />
                              {isCurrentPlan ? 'Current Plan' : (plan.badge || 'Most Popular')}
                            </div>
                          </div>
                        )}

                        <div className={`p-6 ${(plan.popular || plan.featured || isCurrentPlan) ? 'pt-10' : ''}`}>
                          {/* Plan Header */}
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

                            <div className="mt-4">
                              <span className={`text-4xl font-bold bg-gradient-to-r ${getPlanColor(plan.name)} bg-clip-text text-transparent`}>
                                {plan.currency || 'SAR'} {billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                              </span>
                              <span className="text-gray-500 text-sm">
                                /{billingCycle === 'yearly' ? 'year' : 'month'}
                              </span>
                            </div>
                          </div>

                          {/* Limits */}
                          <div className="bg-white/60 rounded-lg p-3 mb-4">
                            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Limits</h4>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Companies</span>
                                <span className="font-medium">{formatLimit(plan.limits?.companies)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Invoices/mo</span>
                                <span className="font-medium">{formatLimit(plan.limits?.invoicesPerMonth)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Customers</span>
                                <span className="font-medium">{formatLimit(plan.limits?.customers)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Users</span>
                                <span className="font-medium">{formatLimit(plan.limits?.users)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Storage</span>
                                <span className="font-medium">
                                  {plan.limits?.storage ? `${plan.limits.storage} MB` : 'Unlimited'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-700 uppercase">Features</h4>
                            {plan.features
                              .filter(f => keyFeatures.includes(f.name))
                              .slice(0, 8)
                              .map((feature, idx) => {
                                const Icon = getFeatureIcon(feature.name);
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-center text-sm ${
                                      feature.included ? 'text-gray-700' : 'text-gray-400'
                                    }`}
                                  >
                                    {feature.included ? (
                                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                    ) : (
                                      <Lock className="h-4 w-4 text-gray-300 mr-2 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{feature.name}</span>
                                    {feature.limit && (
                                      <span className="ml-1 text-xs text-gray-400">
                                        ({feature.limit})
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                          </div>

                          {/* Select Button */}
                          <button
                            onClick={() => {
                              if (!isCurrentPlan) {
                                setSelectedPlan(plan);
                                setShowChangePlanModal(true);
                              }
                            }}
                            disabled={isCurrentPlan}
                            className={`w-full mt-4 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                              isCurrentPlan
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : `bg-gradient-to-r ${getPlanColor(plan.name)} text-white hover:shadow-lg`
                            }`}
                          >
                            {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Feature Comparison Table */}
              {!isLoading && plans.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
                    <p className="text-sm text-gray-500 mt-1">Detailed comparison of all plan features</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                          {plans.map((plan) => {
                            const isCurrentPlan = currentSubscription?.plan.id === plan.id;
                            return (
                              <th key={plan.id} className={`px-6 py-4 text-center text-sm font-semibold ${isCurrentPlan ? 'text-primary bg-primary-50' : 'text-gray-900'}`}>
                                {plan.name}
                                {isCurrentPlan && <span className="block text-xs font-normal text-primary">(Current)</span>}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {keyFeatures.map((featureName, idx) => (
                          <tr key={featureName} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-3 text-sm text-gray-700 font-medium">{featureName}</td>
                            {plans.map((plan) => {
                              const feature = plan.features.find(f => f.name === featureName);
                              const isIncluded = feature?.included ?? false;
                              const isCurrentPlan = currentSubscription?.plan.id === plan.id;
                              return (
                                <td key={plan.id} className={`px-6 py-3 text-center ${isCurrentPlan ? 'bg-primary-50/50' : ''}`}>
                                  {isIncluded ? (
                                    <div className="flex items-center justify-center">
                                      <Check className="h-5 w-5 text-green-500" />
                                      {feature?.limit && (
                                        <span className="ml-1 text-xs text-gray-500">
                                          ({feature.limit})
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <Lock className="h-4 w-4 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Color Theme</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Personalize your interface color. This overrides the company default.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetToDefault}
                    disabled={isSavingAppearance}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 mr-1.5" />
                    Reset to Default
                  </button>
                  <button
                    onClick={handleSaveAppearance}
                    disabled={isSavingAppearance}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-300"
                    style={{ backgroundImage: `linear-gradient(to right, ${selectedFrom}, ${selectedTo})` }}
                  >
                    {isSavingAppearance ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1.5" />
                    )}
                    Save Theme
                  </button>
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                <div className="bg-gray-50 rounded-xl p-6 border">
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      className="px-6 py-2.5 text-white rounded-lg text-sm font-medium shadow-md"
                      style={{ backgroundImage: `linear-gradient(to right, ${selectedFrom}, ${selectedTo})` }}
                    >
                      Primary Button
                    </button>
                    <div
                      className="h-10 w-32 rounded-lg shadow-inner"
                      style={{ backgroundImage: `linear-gradient(to right, ${selectedFrom}, ${selectedTo})` }}
                    />
                    <div
                      className="h-2 w-48 rounded-full"
                      style={{ backgroundImage: `linear-gradient(to right, ${selectedFrom}, ${selectedTo})` }}
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedFrom }} />
                      <span className="text-xs text-gray-500 font-mono">{selectedFrom}</span>
                      <span className="text-xs text-gray-400 mx-1">to</span>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTo }} />
                      <span className="text-xs text-gray-500 font-mono">{selectedTo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient Presets */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preset Gradients</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.from, preset.to)}
                      className={`group relative rounded-xl overflow-hidden transition-all duration-200 ${
                        isSelectedPreset(preset.from, preset.to)
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-105'
                          : 'hover:scale-105 hover:shadow-md'
                      }`}
                    >
                      <div
                        className="h-16 w-full"
                        style={{ backgroundImage: `linear-gradient(to right, ${preset.from}, ${preset.to})` }}
                      />
                      {isSelectedPreset(preset.from, preset.to) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Check className="h-6 w-6 text-white drop-shadow-lg" />
                        </div>
                      )}
                      <div className="px-2 py-1.5 bg-white text-center">
                        <span className="text-xs font-medium text-gray-700">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Colors</h3>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">From:</label>
                    <input
                      type="color"
                      value={customFrom}
                      onChange={(e) => handleCustomColorChange('from', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={customFrom}
                      onChange={(e) => handleCustomColorChange('from', e.target.value)}
                      className="w-24 px-2 py-1.5 text-sm font-mono border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-400 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">To:</label>
                    <input
                      type="color"
                      value={customTo}
                      onChange={(e) => handleCustomColorChange('to', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={customTo}
                      onChange={(e) => handleCustomColorChange('to', e.target.value)}
                      className="w-24 px-2 py-1.5 text-sm font-mono border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-400 outline-none"
                    />
                  </div>
                  <div
                    className="h-10 w-32 rounded-lg border shadow-inner"
                    style={{ backgroundImage: `linear-gradient(to right, ${customFrom}, ${customTo})` }}
                  />
                </div>
              </div>

              {/* Company Default Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ backgroundImage: `linear-gradient(to right, ${companyDefault.gradientFrom}, ${companyDefault.gradientTo})` }}
                  />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Company Default</p>
                    <p className="text-xs text-blue-600">
                      This is the default theme set by your admin. Click &quot;Reset to Default&quot; to use it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'emailNotifications' && 'Receive email notifications for important events'}
                          {key === 'smsNotifications' && 'Receive SMS notifications for urgent matters'}
                          {key === 'pushNotifications' && 'Receive browser push notifications'}
                          {key === 'systemAlerts' && 'Get notified about system updates and maintenance'}
                          {key === 'securityAlerts' && 'Critical security notifications (always enabled)'}
                          {key === 'maintenanceAlerts' && 'Scheduled maintenance and downtime notices'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleNotificationChange(key, e.target.checked)}
                          disabled={key === 'securityAlerts'}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${key === 'securityAlerts' ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </button>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-white border rounded-lg p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);

                    return (
                      <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('-600', '-100')}`}>
                          <Icon className={`h-4 w-4 ${colorClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary-50 rounded-lg transition-colors">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load More Activity
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Plan Modal */}
      {showChangePlanModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Confirm Plan Change</h3>
                <button
                  onClick={() => setShowChangePlanModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Crown className="h-5 w-5 text-primary mr-2" />
                  <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedPlan.currency || 'SAR'} {getPrice(selectedPlan)}
                  <span className="text-sm font-normal text-gray-600"> / {billingCycle}</span>
                </p>
              </div>

              <p className="text-gray-600 mb-6">
                {getPrice(selectedPlan) === 0
                  ? 'This is a free plan. Your plan will be activated immediately.'
                  : 'You will be redirected to complete the payment. Your new plan will be activated immediately after payment.'
                }
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowChangePlanModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePlan}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Processing...
                    </>
                  ) : getPrice(selectedPlan) === 0 ? (
                    'Activate Free Plan'
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && currentSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Cancel Subscription</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <AlertCircle className="h-6 w-6 text-red-600 mb-2" />
                <p className="text-red-800">
                  Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your billing period.
                </p>
              </div>

              <p className="text-gray-600 mb-6">
                Your subscription will remain active until <strong>{formatDate(currentSubscription.currentPeriodEnd)}</strong>.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Canceling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
