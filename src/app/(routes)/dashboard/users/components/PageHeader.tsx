'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, Download, UserPlus, Users, Zap, Lock, Crown } from 'lucide-react';

interface UserLimitCheck {
  allowed: boolean;
  current: number;
  limit: number | null;
  remaining: number | null;
  percentage: number | null;
  unlimited: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  userCheck?: UserLimitCheck;
  currentPlanName?: string;
}

export default function PageHeader({ title, subtitle, userCheck, currentPlanName }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Usage Indicator */}
          {userCheck && !userCheck.unlimited && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              !userCheck.allowed
                ? 'bg-red-50 border-red-200'
                : userCheck.percentage && userCheck.percentage >= 80
                ? 'bg-amber-50 border-amber-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <Users className={`h-4 w-4 ${
                !userCheck.allowed
                  ? 'text-red-500'
                  : userCheck.percentage && userCheck.percentage >= 80
                  ? 'text-amber-500'
                  : 'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                !userCheck.allowed
                  ? 'text-red-700'
                  : userCheck.percentage && userCheck.percentage >= 80
                  ? 'text-amber-700'
                  : 'text-gray-700'
              }`}>
                {userCheck.current} / {userCheck.limit}
              </span>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    !userCheck.allowed
                      ? 'bg-red-500'
                      : userCheck.percentage && userCheck.percentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, userCheck.percentage || 0)}%` }}
                />
              </div>
            </div>
          )}

          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>

          {/* Add User Button */}
          {!userCheck || userCheck.allowed ? (
            <Link
              href="/dashboard/users/add"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          ) : (
            <button
              onClick={() => router.push('/dashboard/settings?tab=subscription')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to Add More
            </button>
          )}
        </div>
      </div>

      {/* Plan Limit Warning Banner */}
      {userCheck && !userCheck.unlimited && !userCheck.allowed && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">User Limit Reached</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                Your <span className="font-medium">{currentPlanName || 'Free'}</span> plan allows up to {userCheck.limit} users.
                Upgrade your plan to add more users.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Crown className="h-3 w-3" />
                  Current: {currentPlanName || 'Free'}
                </span>
                <span className="text-amber-300">|</span>
                <button
                  onClick={() => router.push('/dashboard/settings?tab=subscription')}
                  className="text-xs font-medium text-amber-700 hover:text-amber-900 underline transition-colors"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}