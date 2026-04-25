'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { StatsCard, PageHeader, PaymentsTable } from './components';
import { getAdminPayments, type AdminPayment } from '@/app/(routes)/main/services/moyasarService';
import { Payment } from './types';

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRefunded: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAdminPayments({ limit: 50 });

        if (response.success) {
          // Map API response to Payment type expected by PaymentsTable
          const mappedPayments: Payment[] = response.payments.map((p: AdminPayment) => ({
            id: p.id,
            customer: p.customer || 'Unknown',
            amount: `${p.currency} ${p.amount.toFixed(2)}`,
            plan: p.plan || 'N/A',
            status: mapStatus(p.status),
            date: new Date(p.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            method: p.method || 'N/A',
          }));

          setPayments(mappedPayments);
          setStats(response.stats);
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPayments();
  }, []);

  // Map backend status to frontend status type
  function mapStatus(status: string): 'Completed' | 'Pending' | 'Failed' | 'Cancelled' {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return 'Completed';
      case 'pending':
      case 'processing':
        return 'Pending';
      case 'failed':
      case 'declined':
        return 'Failed';
      case 'cancelled':
      case 'canceled':
      case 'refunded':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }

  // Format currency for display
  function formatCurrency(amount: number): string {
    return `SAR ${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  const paymentStats = stats ? [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalAmount),
      change: 0,
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments.toString(),
      change: 0,
      changeType: 'increase' as const,
      icon: CreditCard,
      color: 'bg-blue-500',
    },
    {
      title: 'Successful',
      value: stats.successfulPayments.toString(),
      change: 0,
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
    {
      title: 'Failed',
      value: stats.failedPayments.toString(),
      change: 0,
      changeType: 'decrease' as const,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Payments & Billing"
          subtitle="Monitor subscription payments, billing history, and manage payment plans."
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading payments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Payments & Billing"
          subtitle="Monitor subscription payments, billing history, and manage payment plans."
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Billing"
        subtitle="Monitor subscription payments, billing history, and manage payment plans."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border p-8">
            <div className="text-center">
              <p className="text-gray-500">No payment statistics available</p>
            </div>
          </div>
        ) : (
          paymentStats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              color={stat.color}
            />
          ))
        )}
      </div>

      <PaymentsTable payments={payments} />
    </div>
  );
}