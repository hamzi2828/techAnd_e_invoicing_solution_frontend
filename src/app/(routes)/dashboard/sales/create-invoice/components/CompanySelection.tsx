import React, { useState, useRef, useEffect } from 'react';
import { Search, Building2, X, ChevronDown, Shield, CheckCircle2 } from 'lucide-react';

interface Company {
  _id?: string;
  id?: string;
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  vatNumber?: string;
  taxIdNumber?: string;
  isDefault?: boolean;
  verificationStatus?: string;
  status?: string;
  zatcaCredentials?: {
    status?: string;
    onboardingPhase?: 'phase1_generation' | 'phase2_integration';
    businessType?: 'B2B' | 'B2C' | 'both';
    b2bEnabled?: boolean;
    b2cEnabled?: boolean;
    onboardingDetails?: {
      sellerName?: string;
      sellerNumber?: string;
    };
    activeEnvironment?: string | null;
    environments?: Record<string, { status?: string }>;
  };
}

interface CompanySelectionProps {
  companies: Company[];
  selectedCompany: Company | null;
  onCompanySelect: (company: Company | null) => void;
  onCompanyChange?: (companyId: string) => void;
  showZatcaStatus?: boolean;
  required?: boolean;
  error?: string;
}

const CompanySelection: React.FC<CompanySelectionProps> = ({
  companies,
  selectedCompany,
  onCompanySelect,
  onCompanyChange,
  showZatcaStatus = true,
  required = true,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.vatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.taxIdNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (company: Company) => {
    onCompanySelect(company);
    if (onCompanyChange) {
      onCompanyChange(company._id || company.id || '');
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompanySelect(null);
    if (onCompanyChange) {
      onCompanyChange('');
    }
    setSearchTerm('');
  };

  const getZatcaStatus = (company: Company) => {
    const creds = company.zatcaCredentials;

    // No credentials = not onboarded
    if (!creds) {
      return {
        isVerified: false,
        isOnboarded: false,
        label: 'Not Onboarded',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    }

    // No onboarding phase selected = fresh/reset state (not onboarded)
    if (!creds.onboardingPhase) {
      return {
        isVerified: false,
        isOnboarded: false,
        label: 'Not Onboarded',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    }

    // Check Phase 2 completion - must have verified status or production CSID in any environment
    const envs = creds.environments;
    const hasVerifiedEnvironment = envs && Object.values(envs).some(e => e?.status === 'verified');

    if (creds.onboardingPhase === 'phase2_integration' && hasVerifiedEnvironment) {
      return {
        isVerified: true,
        isOnboarded: true,
        label: 'Phase 2',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    }

    // Check Phase 2 in progress (has phase2 selected and some environment progress)
    if (creds.onboardingPhase === 'phase2_integration') {
      const hasProgress = envs && Object.values(envs).some(e => e?.status && e.status !== 'not_started');
      if (hasProgress) {
        return {
          isVerified: false,
          isOnboarded: true,
          label: 'Phase 2 (Setup)',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      }
      // Phase 2 selected but no progress yet
      return {
        isVerified: false,
        isOnboarded: true,
        label: 'Phase 2 (Pending)',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
    }

    // Check Phase 1
    if (creds.onboardingPhase === 'phase1_generation') {
      if (creds.onboardingDetails || creds.businessType) {
        return {
          isVerified: false,
          isOnboarded: true,
          label: 'Phase 1',
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
        };
      }
      // Phase 1 selected but not configured yet
      return {
        isVerified: false,
        isOnboarded: true,
        label: 'Phase 1 (Pending)',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
      };
    }

    // Has credentials but not onboarded
    return {
      isVerified: false,
      isOnboarded: false,
      label: 'Not Onboarded',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    };
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Company {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selected Company Display / Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg cursor-pointer transition-all ${
          isOpen
            ? 'ring-2 ring-primary border-primary'
            : error || (!selectedCompany && required)
            ? 'border-red-300 hover:border-red-400'
            : 'border-gray-300 hover:border-gray-400'
        } bg-white`}
      >
        {selectedCompany ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900 truncate">
                {selectedCompany.companyName}
              </span>
              {showZatcaStatus && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${getZatcaStatus(selectedCompany).bgColor} ${getZatcaStatus(selectedCompany).color}`}>
                  {getZatcaStatus(selectedCompany).isVerified ? (
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {getZatcaStatus(selectedCompany).label}
                    </span>
                  ) : (
                    getZatcaStatus(selectedCompany).label
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Clear selection"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-gray-500">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Select Company...</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Company List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCompanies.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No companies found</p>
                {searchTerm && (
                  <p className="text-xs mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              filteredCompanies.map((company) => {
                const zatcaStatus = getZatcaStatus(company);
                const isSelected = (selectedCompany?._id || selectedCompany?.id) === (company._id || company.id);

                return (
                  <button
                    key={company._id || company.id}
                    onClick={() => handleSelect(company)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">
                              {company.companyName}
                            </span>
                            {company.isDefault && (
                              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          {(company.vatNumber || company.taxIdNumber) && (
                            <p className="text-xs text-gray-500 truncate">
                              VAT: {company.vatNumber || company.taxIdNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {showZatcaStatus && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${zatcaStatus.bgColor} ${zatcaStatus.color}`}>
                            {zatcaStatus.isVerified ? (
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {zatcaStatus.label}
                              </span>
                            ) : (
                              zatcaStatus.label
                            )}
                          </span>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Status/Error Message */}
      {!selectedCompany && required && (
        <p className="mt-1 text-xs text-red-500">Company is required</p>
      )}
      {selectedCompany && showZatcaStatus && (() => {
        const status = getZatcaStatus(selectedCompany);

        if (!status.isOnboarded) {
          // Not onboarded - parent component (page.tsx) shows the alert
          return null;
        }
        return (
          <div className={`mt-2 p-2 rounded-lg border ${
            status.isVerified
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${status.color}`} />
              <span className={`text-sm font-medium ${status.color}`}>
                {status.isVerified
                  ? 'Phase 2 - ZATCA Integration'
                  : 'Phase 1 - Local Mode'}
              </span>
            </div>
            <p className={`text-xs mt-1 ${status.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
              {status.isVerified
                ? 'Documents will be cleared/reported with ZATCA automatically'
                : 'Documents generated locally with QR code'}
            </p>
          </div>
        );
      })()}
      {selectedCompany && !showZatcaStatus && (
        <p className="mt-1 text-xs text-green-600">
          ✓ {selectedCompany.companyName}
        </p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CompanySelection;
