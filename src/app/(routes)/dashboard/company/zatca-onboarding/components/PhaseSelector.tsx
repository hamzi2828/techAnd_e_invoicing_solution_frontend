'use client';

import React from 'react';
import { FileCode, Link2, CheckCircle } from 'lucide-react';
import { OnboardingPhase } from '../../types';

interface PhaseSelectorProps {
  selectedPhase: OnboardingPhase | null;
  onSelectPhase: (phase: OnboardingPhase) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const PHASE_CONFIG: Record<OnboardingPhase, {
  label: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
}> = {
  phase1_generation: {
    label: 'Phase 1 - Generation',
    description: 'Basic XML generation and QR code compliance',
    details: [
      'Generate ZATCA-compliant XML invoices',
      'Create QR codes for simplified invoices',
      'Basic validation and formatting',
      'Suitable for initial compliance setup'
    ],
    icon: <FileCode className="h-6 w-6" />
  },
  phase2_integration: {
    label: 'Phase 2 - Integration',
    description: 'Full API integration with cryptographic stamps',
    details: [
      'Real-time ZATCA API integration',
      'Cryptographic signing and stamping',
      'Clearance and reporting workflows',
      'Production-ready compliance'
    ],
    icon: <Link2 className="h-6 w-6" />
  }
};

export default function PhaseSelector({
  selectedPhase,
  onSelectPhase,
  isLoading,
  disabled
}: PhaseSelectorProps) {
  const phases: OnboardingPhase[] = ['phase1_generation', 'phase2_integration'];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Onboarding Phase</h3>
        <p className="text-sm text-gray-600">
          Choose the ZATCA compliance phase that matches your business requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phases.map((phase) => {
          const config = PHASE_CONFIG[phase];
          const isSelected = selectedPhase === phase;

          return (
            <button
              key={phase}
              type="button"
              onClick={() => !disabled && !isLoading && onSelectPhase(phase)}
              disabled={disabled || isLoading}
              className={`
                relative p-5 rounded-xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-primary bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                }
                ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              )}

              {/* Icon and label */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {config.icon}
                </div>
                <div>
                  <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                    {config.label}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3">
                {config.description}
              </p>

              {/* Details list */}
              <ul className="space-y-1.5">
                {config.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-primary' : 'bg-gray-400'}`} />
                    {detail}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Phase comparison note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Phase 1 is recommended for initial setup and testing.
          Phase 2 provides full production capabilities with real-time ZATCA integration.
        </p>
      </div>
    </div>
  );
}
