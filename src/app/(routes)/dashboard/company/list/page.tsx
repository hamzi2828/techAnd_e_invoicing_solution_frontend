'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Shield,
  Star,
  Plus,
  Lock,
  Zap,
  Crown
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { CompanyService } from '../services/companyService';
import { Company } from '../types';
import { usePlan } from '@/contexts/PlanContext';

export default function CompaniesListPage() {
  const router = useRouter();
  const { canCreate, planInfo, refreshPlanInfo } = usePlan();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Plan limit check
  const companyCheck = canCreate('company');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Apply client-side filtering
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.companyNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.taxIdNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.commercialRegistrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(company => company.status === filterStatus);
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, filterStatus]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch only companies created by the logged-in user
      const companiesData = await CompanyService.getCompaniesCreatedByMe();
      setCompanies(companiesData);
      setFilteredCompanies(companiesData);

      // Also refresh plan info to get updated usage counts
      refreshPlanInfo();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load companies';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyClick = (companyId: string) => {
    router.push(`/dashboard/company/profile/${companyId}`);
  };

  const handleSetDefault = async (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation(); // Prevent card click
    try {
      await CompanyService.setDefaultCompany(companyId);
      toast.success('Default company updated successfully');
      await fetchCompanies(); // Refresh the list
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default company';
      toast.error(errorMessage);
    }
  };

  const handleZatcaSetup = (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/dashboard/company/zatca-onboarding?companyId=${companyId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      case 'suspended':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (isLoading && filteredCompanies.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error && filteredCompanies.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Companies</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCompanies()}
            className="px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-1">Manage and view all registered companies</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Usage Indicator */}
            {!companyCheck.unlimited && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                !companyCheck.allowed
                  ? 'bg-red-50 border-red-200'
                  : companyCheck.percentage && companyCheck.percentage >= 80
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <Building2 className={`h-4 w-4 ${
                  !companyCheck.allowed
                    ? 'text-red-500'
                    : companyCheck.percentage && companyCheck.percentage >= 80
                    ? 'text-amber-500'
                    : 'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  !companyCheck.allowed
                    ? 'text-red-700'
                    : companyCheck.percentage && companyCheck.percentage >= 80
                    ? 'text-amber-700'
                    : 'text-gray-700'
                }`}>
                  {companyCheck.current} / {companyCheck.limit}
                </span>
                {/* Progress bar */}
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      !companyCheck.allowed
                        ? 'bg-red-500'
                        : companyCheck.percentage && companyCheck.percentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, companyCheck.percentage || 0)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Add Company Button */}
            {companyCheck.allowed ? (
              <button
                onClick={() => router.push('/dashboard/company')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Company
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard/settings?tab=subscription')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
              >
                <Zap className="h-4 w-4" />
                Upgrade to Add More
              </button>
            )}
          </div>
        </div>

        {/* Plan Limit Warning Banner */}
        {!companyCheck.unlimited && !companyCheck.allowed && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-800">Company Limit Reached</h3>
                <p className="text-sm text-amber-700 mt-0.5">
                  Your <span className="font-medium">{planInfo?.currentPlan?.name || 'Free'}</span> plan allows up to {companyCheck.limit} {companyCheck.limit === 1 ? 'company' : 'companies'}.
                  Upgrade your plan to create more companies and unlock additional features.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <Crown className="h-3 w-3" />
                    Current: {planInfo?.currentPlan?.name || 'Free'}
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company name, tax ID, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div
            key={company._id}
            onClick={() => company._id && handleCompanyClick(company._id)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            {/* Company Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {company.companyName}
                  </h3>
                  {company.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                {company.companyNameAr && (
                  <p className="text-sm text-gray-500 mt-1">{company.companyNameAr}</p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(company.status)}`}>
                {company.status}
              </span>
              <div className="flex items-center gap-1">
                {getVerificationIcon(company.verificationStatus)}
                <span className="text-xs text-gray-600 capitalize">
                  {company.verificationStatus}
                </span>
              </div>
              {/* ZATCA Status Badge */}
              {company.zatcaCredentials && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full
                  ${company.zatcaCredentials.status === 'verified'
                    ? 'text-green-600 bg-green-50 border border-green-200'
                    : company.zatcaCredentials.status === 'compliance'
                    ? 'text-blue-600 bg-blue-50 border border-blue-200'
                    : 'text-yellow-600 bg-yellow-50 border border-yellow-200'}`}
                >
                  ZATCA: {company.zatcaCredentials.status}
                </span>
              )}
            </div>

            {/* Company Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="text-gray-600">Tax ID: </span>
                  <span className="text-gray-900 font-medium">{company.taxIdNumber || 'N/A'}</span>
                </div>
              </div>

              {company.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-gray-600">
                      {company.address.city}, {company.address.country}
                    </span>
                  </div>
                </div>
              )}

              {company.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1 truncate">
                    <span className="text-gray-600">{company.email}</span>
                  </div>
                </div>
              )}

              {company.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-gray-600">{company.phone}</span>
                  </div>
                </div>
              )}

              {company.establishedDate && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-gray-600">Est. </span>
                    <span className="text-gray-900">
                      {new Date(company.establishedDate).getFullYear()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-500">
                    {company.industry || 'Industry not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      company._id && handleCompanyClick(company._id);
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-primary bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    View Details →
                  </button>
                  {!company.isDefault && (
                    <button
                      onClick={(e) => company._id && handleSetDefault(e, company._id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                      title="Set as Default"
                    >
                      <Star className="h-3 w-3" />
                      Default
                    </button>
                  )}
                  <button
                    onClick={(e) => company._id && handleZatcaSetup(e, company._id)}
                    className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors
                      ${company.zatcaCredentials?.status === 'verified'
                        ? 'text-green-700 bg-green-50 hover:bg-green-100'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      }`}
                    title={company.zatcaCredentials?.status === 'verified' ? 'View ZATCA Status' : 'Setup ZATCA'}
                  >
                    <Shield className="h-3 w-3" />
                    {company.zatcaCredentials?.status === 'verified' ? 'ZATCA' : 'Setup'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCompanies.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first company profile'}
            </p>
            {!(searchTerm || filterStatus !== 'all') && (
              companyCheck.allowed ? (
                <button
                  onClick={() => router.push('/dashboard/company')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Company
                </button>
              ) : (
                <div className="inline-flex flex-col items-center gap-3">
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    Company limit reached on your {planInfo?.currentPlan?.name || 'Free'} plan
                  </p>
                  <button
                    onClick={() => router.push('/dashboard/settings?tab=subscription')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Zap className="h-5 w-5" />
                    Upgrade Plan
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}