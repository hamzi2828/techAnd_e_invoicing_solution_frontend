'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Lock, SkipForward } from 'lucide-react';
import { ZatcaEnvironment, ZatcaEnvironmentCredentials, ZatcaProgression, BusinessTypeCredentials } from '../../types';

interface EnvironmentSelectorProps {
  environments: {
    sandbox: ZatcaEnvironmentCredentials;
    simulation: ZatcaEnvironmentCredentials;
    production: ZatcaEnvironmentCredentials;
  };
  progression: ZatcaProgression;
  activeEnvironment: ZatcaEnvironment | null;
  canSkipTo: ZatcaEnvironment[];
  selectedEnvironment: ZatcaEnvironment | null;
  currentBusinessType: 'B2B' | 'B2C' | null;
  onSelectEnvironment: (env: ZatcaEnvironment) => void;
  onSkipToEnvironment: (env: ZatcaEnvironment) => void;
  isLoading?: boolean;
}

// Phase 2 only supports Simulation and Production environments (per ZATCA onboarding flow)
const ENVIRONMENT_CONFIG: Record<ZatcaEnvironment, { label: string; description: string; icon: string }> = {
  sandbox: {
    label: 'Sandbox',
    description: 'Test environment for development and initial testing',
    icon: '🧪'
  },
  simulation: {
    label: 'Simulation',
    description: 'Pre-production environment for testing with ZATCA',
    icon: '🔄'
  },
  production: {
    label: 'Production',
    description: 'Live environment for real ZATCA e-invoicing',
    icon: '🚀'
  }
};

// All environments - Sandbox, Simulation, and Production
const PHASE2_ENVIRONMENTS: ZatcaEnvironment[] = ['sandbox', 'simulation', 'production'];

function getBusinessTypeCredentials(
  envCreds: ZatcaEnvironmentCredentials,
  businessType: 'B2B' | 'B2C' | null
): BusinessTypeCredentials | null {
  if (!businessType) return null;
  return businessType === 'B2B' ? envCreds?.b2b || null : envCreds?.b2c || null;
}

function getStatusInfo(
  env: ZatcaEnvironment,
  envStatus: ZatcaEnvironmentCredentials,
  progression: ZatcaProgression,
  businessType: 'B2B' | 'B2C' | null
): { label: string; color: string; bgColor: string; icon: React.ReactNode } {
  // Check if the specific business type is production locked
  const isB2BLocked = progression.b2bProductionLocked;
  const isB2CLocked = progression.b2cProductionLocked;
  const isCurrentTypeLocked = businessType === 'B2B' ? isB2BLocked : businessType === 'B2C' ? isB2CLocked : false;

  if (isCurrentTypeLocked && env !== 'production') {
    return {
      label: 'Locked',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: <Lock className="h-4 w-4" />
    };
  }

  // Check if environment was skipped
  if (progression.skippedEnvironments?.includes(env)) {
    return {
      label: 'Skipped',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: <SkipForward className="h-4 w-4" />
    };
  }

  // Get status for the current business type
  const btCreds = getBusinessTypeCredentials(envStatus, businessType);
  const status = btCreds?.status || 'not_started';

  if (status === 'verified') {
    return {
      label: 'Completed',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: <CheckCircle className="h-4 w-4" />
    };
  }

  if (status === 'not_started') {
    return {
      label: 'Not Started',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      icon: <Clock className="h-4 w-4" />
    };
  }

  // In progress
  return {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: <Clock className="h-4 w-4" />
  };
}

function getStepProgress(envStatus: ZatcaEnvironmentCredentials, businessType: 'B2B' | 'B2C' | null): number {
  const btCreds = getBusinessTypeCredentials(envStatus, businessType);
  if (!btCreds) return 0;

  if (btCreds.status === 'verified' || btCreds.hasProductionCSID) return 4;
  if (btCreds.status === 'test_invoices_submitted' || btCreds.hasTestInvoicesSubmitted) return 3;
  if (btCreds.status === 'compliance' || btCreds.hasComplianceCert) return 2;
  if (btCreds.status === 'csr_generated' || btCreds.hasCSR) return 1;
  return 0;
}

export default function EnvironmentSelector({
  environments,
  progression,
  activeEnvironment,
  canSkipTo,
  selectedEnvironment,
  currentBusinessType,
  onSelectEnvironment,
  onSkipToEnvironment,
  isLoading
}: EnvironmentSelectorProps) {
  // Phase 2 only shows Simulation and Production (per ZATCA onboarding flow)
  const envOrder: ZatcaEnvironment[] = PHASE2_ENVIRONMENTS;

  // Determine if production is locked for the current business type
  const isB2BLocked = progression.b2bProductionLocked;
  const isB2CLocked = progression.b2cProductionLocked;
  const isCurrentTypeLocked = currentBusinessType === 'B2B' ? isB2BLocked : currentBusinessType === 'B2C' ? isB2CLocked : false;

  // Get completed environments for the current business type
  const completedEnvironments = currentBusinessType === 'B2B'
    ? progression.b2bCompletedEnvironments || []
    : currentBusinessType === 'B2C'
    ? progression.b2cCompletedEnvironments || []
    : [];

  const isEnvironmentSelectable = (env: ZatcaEnvironment): boolean => {
    if (isCurrentTypeLocked) {
      // Only production can be selected/viewed when locked
      return env === 'production';
    }

    const envStatus = environments[env];

    // Can select if not skipped and not locked by higher environment
    if (progression.skippedEnvironments?.includes(env)) return false;

    // Check if any higher environment has started for this business type
    const envIndex = envOrder.indexOf(env);
    for (let i = envIndex + 1; i < envOrder.length; i++) {
      const higherEnv = envOrder[i];
      const higherStatus = environments[higherEnv];
      const btCreds = getBusinessTypeCredentials(higherStatus, currentBusinessType);
      if (btCreds && btCreds.status !== 'not_started' && !progression.skippedEnvironments?.includes(higherEnv)) {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="space-y-6">
      {/* Production Lock Warning */}
      {isCurrentTypeLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Production Environment Active for {currentBusinessType}</p>
              <p className="text-sm text-amber-700 mt-1">
                Your company is now using the production environment for {currentBusinessType} ZATCA e-invoicing.
                All other environments are locked for {currentBusinessType}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Business Type Indicator */}
      {currentBusinessType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Currently onboarding: <strong>{currentBusinessType}</strong> ({currentBusinessType === 'B2B' ? 'Standard Invoice - 0100000' : 'Simplified Invoice - 0200000'})
          </p>
        </div>
      )}

      {/* Environment Cards - Sandbox, Simulation and Production */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {envOrder.map((env) => {
          const config = ENVIRONMENT_CONFIG[env];
          const envStatus = environments[env];
          const statusInfo = getStatusInfo(env, envStatus, progression, currentBusinessType);
          const stepProgress = getStepProgress(envStatus, currentBusinessType);
          const isSelected = selectedEnvironment === env;
          const isSelectable = isEnvironmentSelectable(env);
          const canSkip = canSkipTo.includes(env);
          const isLocked = isCurrentTypeLocked && env !== 'production';
          const isActive = activeEnvironment === env;
          const btCreds = getBusinessTypeCredentials(envStatus, currentBusinessType);
          const isSkipped = progression.skippedEnvironments?.includes(env);

          return (
            <div
              key={env}
                className={`
                  relative rounded-xl border-2 p-5 transition-all
                  ${isSelected
                    ? 'border-primary bg-primary-50 shadow-lg'
                    : isSelectable
                    ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow cursor-pointer'
                    : 'border-gray-100 bg-gray-50 opacity-75'
                  }
                  ${isLocked ? 'cursor-not-allowed' : ''}
                `}
                onClick={() => {
                  if (isSelectable && !isLoading) {
                    onSelectEnvironment(env);
                  }
                }}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute -top-3 left-4 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                    Active
                  </div>
                )}

                {/* Lock Icon */}
                {isLocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                )}

                {/* Environment Icon & Name */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                      {config.label}
                    </h3>
                    <p className={`text-xs ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>

                {/* Progress Indicator */}
                {!isSkipped && !isLocked && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{stepProgress}/4 steps</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          stepProgress === 4 ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${(stepProgress / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Skip Button */}
                {canSkip && !isLocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoading) {
                        onSkipToEnvironment(env);
                      }
                    }}
                    disabled={isLoading}
                    className="mt-4 w-full py-2 px-3 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip to {config.label}
                  </button>
                )}

                {/* Onboarded Date */}
                {btCreds?.onboardedAt && (
                  <p className="mt-3 text-xs text-gray-500">
                    Completed: {new Date(btCreds.onboardedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
          );
        })}
      </div>

      {/* Selection Prompt */}
      {!selectedEnvironment && !isCurrentTypeLocked && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">Select an environment to continue</p>
          <p className="text-blue-600 text-sm mt-1">
            Choose <strong>Sandbox</strong> for development, <strong>Simulation</strong> for testing, or <strong>Production</strong> for live ZATCA e-invoicing.
          </p>
        </div>
      )}

      {/* Environment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Environment Summary {currentBusinessType && `(${currentBusinessType})`}
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm max-w-md mx-auto">
          <div className="text-center">
            <span className="text-gray-500">Completed:</span>
            <span className="ml-2 font-medium text-green-600">
              {completedEnvironments.filter(e => PHASE2_ENVIRONMENTS.includes(e)).length}
            </span>
          </div>
          <div className="text-center">
            <span className="text-gray-500">Status:</span>
            <span className={`ml-2 font-medium ${isCurrentTypeLocked ? 'text-green-600' : 'text-blue-600'}`}>
              {isCurrentTypeLocked ? 'Production Active' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
