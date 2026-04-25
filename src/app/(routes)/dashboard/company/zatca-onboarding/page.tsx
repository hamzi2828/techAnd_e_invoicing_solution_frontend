'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, CheckCircle, Loader2, AlertCircle, ArrowLeft, Info, RotateCcw, Settings, FileCode, Link2, Building2, Users } from 'lucide-react';
import { CompanyService } from '../services/companyService';
import {
  Company, ZatcaStatusResponse, ZatcaEnvironment, ZatcaEnvironmentCredentials,
  BusinessTypeCredentials, OnboardingPhase, BusinessType, OnboardingDetails, TLUStatus,
  ConfigurationResponse, VerificationStatusResponse
} from '../types';
import {
  EnvironmentSelector,
  TLUGenerator,
  ConfigurationDashboard,
  VerificationStatus
} from './components';

// Updated wizard steps for Phase 2 flow
type Phase2WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type TabType = 'onboarding' | 'config' | 'verification' | 'tlu';

// Initial screen type - for companies not yet onboarded
type InitialScreenType = 'phase_selection' | 'phase1_setup' | 'phase2_flow' | 'configuration';

function ZatcaOnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const tabParam = searchParams.get('tab') as TabType | null;
  const stepParam = searchParams.get('step');

  const [company, setCompany] = useState<Company | null>(null);
  const [currentStep, setCurrentStep] = useState<Phase2WizardStep>(
    stepParam ? (parseInt(stepParam) as Phase2WizardStep) : 1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Show loader until initial data is fetched
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [zatcaStatus, setZatcaStatus] = useState<ZatcaStatusResponse | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<ZatcaEnvironment | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // New state for extended onboarding
  const [selectedPhase, setSelectedPhase] = useState<OnboardingPhase | null>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [onboardingDetails, setOnboardingDetails] = useState<OnboardingDetails | null>(null);
  const [tluStatus, setTluStatus] = useState<TLUStatus | null>(null);
  const [configuration, setConfiguration] = useState<ConfigurationResponse | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'onboarding');

  // New state for initial screen flow
  const [screenType, setScreenType] = useState<InitialScreenType>('phase_selection');
  const screenTypeRef = React.useRef<InitialScreenType>('phase_selection'); // Track current screenType without causing re-renders
  const [isPhase1Complete, setIsPhase1Complete] = useState(false);
  const [b2bOnboarded, setB2bOnboarded] = useState(false);
  const [b2cOnboarded, setB2cOnboarded] = useState(false);
  const [pendingBusinessType, setPendingBusinessType] = useState<'B2B' | 'B2C' | null>(null);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Keep screenTypeRef in sync with screenType state
  useEffect(() => {
    screenTypeRef.current = screenType;
  }, [screenType]);

  // Update URL when step changes (only for Phase 2 flow)
  useEffect(() => {
    if (screenType === 'phase2_flow') {
      const params = new URLSearchParams(searchParams.toString());
      if (currentStep === 1) {
        params.delete('step');
      } else {
        params.set('step', currentStep.toString());
      }
      const newUrl = `/dashboard/company/zatca-onboarding?${params.toString()}`;
      // Only update if URL is different to avoid infinite loops
      if (window.location.search !== `?${params.toString()}`) {
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [currentStep, screenType, searchParams, router]);

  // Read step from URL on initial load
  useEffect(() => {
    if (stepParam && screenType === 'phase2_flow') {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= 8 && step !== currentStep) {
        setCurrentStep(step as Phase2WizardStep);
      }
    }
    // Clean up step param when not in Phase 2 flow
    if (stepParam && screenType !== 'phase2_flow') {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('step');
      router.replace(`/dashboard/company/zatca-onboarding?${params.toString()}`, { scroll: false });
    }
  }, [stepParam, screenType, searchParams, router]);

  // Helper to update URL with tab parameter
  const navigateToTab = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'onboarding') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.push(`/dashboard/company/zatca-onboarding?${params.toString()}`, { scroll: false });
  };

  // Phase 2 wizard steps (per ZATCA onboarding flow)
  // Environment (Sandbox/Simulation/Production) → Invoice Type (B2B/B2C) → CSR → Compliance → Test Invoices → Production CSID
  const phase2Steps = [
    { id: 1, name: 'Environment', description: 'Select Sandbox, Simulation or Production' },
    { id: 2, name: 'Invoice Type', description: 'Select B2B or B2C' },
    { id: 3, name: 'Generate CSR', description: 'Generate certificate request' },
    { id: 4, name: 'Compliance', description: 'Get compliance certificate' },
    { id: 5, name: 'Test Invoices', description: 'Submit test invoices' },
    { id: 6, name: 'Complete', description: 'Get production CSID' },
  ];

  // Helper to get the credentials for the current business type within an environment
  const getBusinessTypeCredentials = (envStatus: ZatcaEnvironmentCredentials | undefined, businessType: 'B2B' | 'B2C' | null): BusinessTypeCredentials | undefined => {
    if (!envStatus) return undefined;
    // If businessType is specified, use the nested structure
    if (businessType === 'B2B' && envStatus.b2b) return envStatus.b2b;
    if (businessType === 'B2C' && envStatus.b2c) return envStatus.b2c;
    // Fall back to legacy flat structure
    return undefined;
  };

  const getStepFromStatus = (envStatus: ZatcaEnvironmentCredentials | undefined, businessType: 'B2B' | 'B2C' | null = null): Phase2WizardStep => {
    if (!envStatus) return 1;

    // Get status from the nested B2B/B2C structure
    const btCredentials = getBusinessTypeCredentials(envStatus, businessType);
    if (btCredentials) {
      if (btCredentials.status === 'verified' || btCredentials.hasProductionCSID) return 7 as Phase2WizardStep;
      if (btCredentials.status === 'test_invoices_submitted' || btCredentials.hasTestInvoicesSubmitted) return 6;
      if (btCredentials.status === 'compliance' || btCredentials.hasComplianceCert) return 5;
      if (btCredentials.status === 'csr_generated' || btCredentials.hasCSR) return 4;
      return 3; // Ready for CSR generation (business type already selected)
    }

    // If no business type specified yet, check if B2B or B2C has any progress
    const b2bCreds = envStatus.b2b;
    const b2cCreds = envStatus.b2c;
    if (b2bCreds && b2bCreds.status !== 'not_started') {
      if (b2bCreds.status === 'verified' || b2bCreds.hasProductionCSID) return 7 as Phase2WizardStep;
      if (b2bCreds.status === 'test_invoices_submitted' || b2bCreds.hasTestInvoicesSubmitted) return 6;
      if (b2bCreds.status === 'compliance' || b2bCreds.hasComplianceCert) return 5;
      if (b2bCreds.status === 'csr_generated' || b2bCreds.hasCSR) return 4;
    }
    if (b2cCreds && b2cCreds.status !== 'not_started') {
      if (b2cCreds.status === 'verified' || b2cCreds.hasProductionCSID) return 7 as Phase2WizardStep;
      if (b2cCreds.status === 'test_invoices_submitted' || b2cCreds.hasTestInvoicesSubmitted) return 6;
      if (b2cCreds.status === 'compliance' || b2cCreds.hasComplianceCert) return 5;
      if (b2cCreds.status === 'csr_generated' || b2cCreds.hasCSR) return 4;
    }

    return 1;
  };

  // Determine if company is already onboarded (for showing configuration vs options screen)
  const determineScreenType = useCallback((
    status: ZatcaStatusResponse | null,
    phase: OnboardingPhase | null,
    config: ConfigurationResponse | null
  ): InitialScreenType => {
    console.log('=== DETERMINE SCREEN TYPE ===');
    console.log('Input - phase:', phase, 'config:', config);
    console.log('status?.activeEnvironment:', status?.activeEnvironment);
    console.log('config?.phase:', config?.phase, 'config?.b2bEnabled:', config?.b2bEnabled, 'config?.b2cEnabled:', config?.b2cEnabled);

    // No phase set means fresh start (after reset or new company)
    if (!phase && !config?.phase) {
      console.log('Result: phase_selection (no phase set)');
      setIsPhase1Complete(false);
      return 'phase_selection';
    }

    // If company has Phase 1 completed
    if (phase === 'phase1_generation' && config?.phase === 'phase1_generation') {
      console.log('Result: configuration (Phase 1 complete)');
      setIsPhase1Complete(true);
      return 'configuration';
    }

    // If company is in Phase 2 with some progress
    if (phase === 'phase2_integration' || (status?.activeEnvironment && status.environments)) {
      const activeEnv = status?.activeEnvironment;
      if (activeEnv && status?.environments?.[activeEnv]) {
        const envStatus = status.environments[activeEnv];
        // Check nested B2B/B2C status
        const b2bStatus = envStatus.b2b?.status;
        const b2cStatus = envStatus.b2c?.status;
        if ((b2bStatus && b2bStatus !== 'not_started') || (b2cStatus && b2cStatus !== 'not_started')) {
          console.log('Result: phase2_flow (env has B2B/B2C progress)');
          return 'phase2_flow';
        }
      }
      // Has phase but no environment progress yet - show phase 2 flow
      if (phase === 'phase2_integration') {
        console.log('Result: phase2_flow (phase2 selected)');
        return 'phase2_flow';
      }
    }

    // Check B2B/B2C onboarding status for Phase 2
    // Only consider them "onboarded" if Phase 2 has COMPLETED (environment verified)
    if (config && phase === 'phase2_integration' && status) {
      // Check if any environment has verified status in nested B2B/B2C structure
      const envs = status.environments;

      // Check B2B/B2C verified status separately
      const b2bVerified = envs && Object.values(envs).some(
        (e) => e && (e as ZatcaEnvironmentCredentials).b2b?.status === 'verified'
      );
      const b2cVerified = envs && Object.values(envs).some(
        (e) => e && (e as ZatcaEnvironmentCredentials).b2c?.status === 'verified'
      );

      const hasVerifiedEnv = b2bVerified || b2cVerified;

      if (hasVerifiedEnv) {
        // Phase 2 is complete for at least one business type
        setB2bOnboarded(b2bVerified || config.b2bEnabled || false);
        setB2cOnboarded(b2cVerified || config.b2cEnabled || false);
        console.log('Result: configuration (Phase 2 complete)', { b2bVerified, b2cVerified });
        return 'configuration';
      } else {
        // Phase 2 in progress - not yet completed
        setB2bOnboarded(false);
        setB2cOnboarded(false);
      }
    } else if (config && phase === 'phase1_generation') {
      // Phase 1 - don't need B2B/B2C separate onboarding
      setB2bOnboarded(false);
      setB2cOnboarded(false);
    }

    // Default: show phase selection for new companies
    console.log('Result: phase_selection (default)');
    return 'phase_selection';
  }, []);

  const fetchCompanyAndStatus = useCallback(async () => {
    if (!companyId) return;

    console.log('=== FETCH COMPANY AND STATUS ===');

    try {
      setIsLoading(true);
      const [companyData, statusData] = await Promise.all([
        CompanyService.getCompanyById(companyId),
        CompanyService.getZatcaStatus(companyId)
      ]);

      console.log('Fetched statusData:', statusData);

      setCompany(companyData);
      setZatcaStatus(statusData);

      let fetchedPhase: OnboardingPhase | null = null;
      let fetchedConfig: ConfigurationResponse | null = null;

      // Fetch additional data
      try {
        const [onboardingData, tluData, configData, verificationData] = await Promise.all([
          CompanyService.getOnboardingDetails(companyId),
          CompanyService.getTLUStatus(companyId),
          CompanyService.getConfiguration(companyId),
          CompanyService.getVerificationStatus(companyId)
        ]);

        console.log('Fetched onboardingData:', onboardingData);
        console.log('Fetched configData:', configData);

        fetchedPhase = onboardingData.phase;
        fetchedConfig = configData;

        setSelectedPhase(onboardingData.phase);
        setSelectedBusinessType(onboardingData.businessType);
        setOnboardingDetails(onboardingData.onboardingDetails);
        setTluStatus(tluData);
        setConfiguration(configData);
        setVerificationStatus(verificationData);

        // Update B2B/B2C status - only if Phase 2 is COMPLETED (has verified environment)
        // Check for verified environment status (both legacy and nested B2B/B2C)
        const envs = statusData?.environments;
        const hasVerifiedEnv = envs && Object.values(envs).some(
          (e) => {
            if (!e) return false;
            const envCreds = e as ZatcaEnvironmentCredentials;
            // Check legacy flat status
            if (envCreds.status === 'verified') return true;
            // Check nested B2B/B2C status
            if (envCreds.b2b?.status === 'verified' || envCreds.b2c?.status === 'verified') return true;
            return false;
          }
        );

        // Check B2B/B2C verified status separately
        const b2bVerified = envs && Object.values(envs).some(
          (e) => e && (e as ZatcaEnvironmentCredentials).b2b?.status === 'verified'
        );
        const b2cVerified = envs && Object.values(envs).some(
          (e) => e && (e as ZatcaEnvironmentCredentials).b2c?.status === 'verified'
        );

        if (onboardingData.phase === 'phase2_integration' && hasVerifiedEnv) {
          setB2bOnboarded(b2bVerified || configData.b2bEnabled || false);
          setB2cOnboarded(b2cVerified || configData.b2cEnabled || false);
        } else {
          // Not Phase 2 complete - reset these flags
          setB2bOnboarded(false);
          setB2cOnboarded(false);
        }
      } catch (err) {
        console.log('Error fetching additional data (expected for new company):', err);
        // New company without onboarding data yet
      }

      // Determine screen type based on company's current state
      // BUT if user is already in phase2_flow, preserve that state
      console.log('Calling determineScreenType with:', { statusData, fetchedPhase, fetchedConfig });
      const newScreenType = determineScreenType(statusData, fetchedPhase, fetchedConfig);
      const currentScreenType = screenTypeRef.current;
      console.log('New screen type:', newScreenType, 'Current screenType:', currentScreenType);

      // Only update screenType if:
      // 1. We're not already in phase2_flow (preserve user navigation)
      // 2. OR the new screen type is also phase2_flow or configuration (progress forward)
      // This prevents overriding user's explicit Phase 2 selection
      if (currentScreenType !== 'phase2_flow' || newScreenType === 'phase2_flow' || newScreenType === 'configuration') {
        setScreenType(newScreenType);
      }

      // Set selected environment based on current active or determine from status
      if (statusData.activeEnvironment) {
        setSelectedEnvironment(statusData.activeEnvironment);
        const envStatus = statusData.environments?.[statusData.activeEnvironment];
        // Use currentBusinessType from status if available
        const currentBT = statusData.currentBusinessType as 'B2B' | 'B2C' | null;
        const calculatedStep = getStepFromStatus(envStatus, currentBT);
        setCurrentStep(calculatedStep);
      } else if (statusData.progression?.productionLocked) {
        setSelectedEnvironment('production');
        setCurrentStep(8 as Phase2WizardStep);
      }
    } catch (err: unknown) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company data');
    } finally {
      setIsLoading(false);
      setInitialLoading(false); // Initial data fetch complete
    }
  }, [companyId, determineScreenType]);

  useEffect(() => {
    if (!companyId) {
      setError('Company ID is required');
      return;
    }
    fetchCompanyAndStatus();
  }, [companyId, fetchCompanyAndStatus]);

  useEffect(() => {
    if (screenType === 'phase2_flow' && selectedEnvironment && zatcaStatus?.environments) {
      // If user is starting a new business type flow (pendingBusinessType set, selectedBusinessType not set),
      // don't override the step - they should stay on step 2 for business type selection
      if (pendingBusinessType && !selectedBusinessType) {
        return; // Don't override step when starting new business type onboarding
      }

      const envStatus = zatcaStatus.environments[selectedEnvironment];
      // Pass current business type for nested B2B/B2C status lookup
      const currentBT = selectedBusinessType === 'B2B' || selectedBusinessType === 'B2C' ? selectedBusinessType : null;
      const step = getStepFromStatus(envStatus, currentBT);
      // Only update if we have progress
      if (step > 1) {
        setCurrentStep(step);
      } else if (selectedBusinessType) {
        setCurrentStep(3); // Ready for CSR generation
      } else {
        setCurrentStep(2); // Business type selection
      }
    }
  }, [selectedEnvironment, zatcaStatus, selectedBusinessType, screenType, pendingBusinessType]);

  // Handler for Phase 1 completion
  const handlePhase1Complete = async () => {
    if (!companyId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Set phase to Phase 1
      await CompanyService.setOnboardingPhase(companyId, 'phase1_generation');
      // Set business type to both (Phase 1 supports both B2B and B2C QR codes)
      await CompanyService.setBusinessType(companyId, 'both');

      setSelectedPhase('phase1_generation');
      setIsPhase1Complete(true);
      setScreenType('configuration');
      await fetchCompanyAndStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to complete Phase 1 setup');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for starting Phase 2 onboarding
  const handleStartPhase2 = async () => {
    if (!companyId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Save Phase 2 to backend immediately so it persists
      await CompanyService.setOnboardingPhase(companyId, 'phase2_integration');
      setSelectedPhase('phase2_integration');

      // Reset B2B/B2C onboarded status for fresh Phase 2 start
      // These will only be set to true when Phase 2 is COMPLETED (production CSID obtained)
      setB2bOnboarded(false);
      setB2cOnboarded(false);
      setPendingBusinessType(null);
      setSelectedBusinessType(null);
      setScreenType('phase2_flow');
      setCurrentStep(1); // Start with environment selection
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start Phase 2');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for starting additional B2B/B2C onboarding
  // Keeps the current environment and goes directly to business type confirmation
  const handleAddBusinessType = (type: 'B2B' | 'B2C') => {
    setPendingBusinessType(type);
    setSelectedBusinessType(null); // Clear selected so step 2 shows selection UI
    setScreenType('phase2_flow');
    // Stay in the same environment, just go to step 2 (business type selection)
    setCurrentStep(2);
  };

  // Handler for upgrading from Phase 1 to Phase 2
  const handleUpgradeToPhase2 = async () => {
    if (!companyId) return;

    setIsLoading(true);
    setError(null);
    try {
      await CompanyService.setOnboardingPhase(companyId, 'phase2_integration');
      setSelectedPhase('phase2_integration');
      // Reset B2B/B2C status - Phase 1 completion doesn't count as Phase 2 completion
      setB2bOnboarded(false);
      setB2cOnboarded(false);
      setPendingBusinessType(null);
      setSelectedBusinessType(null);
      setScreenType('phase2_flow');
      setCurrentStep(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade to Phase 2');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEnvironment = async (env: ZatcaEnvironment) => {
    if (!companyId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Set the active environment
      await CompanyService.setActiveEnvironment(companyId, env);
      // Also set phase to Phase 2 if not already set
      if (selectedPhase !== 'phase2_integration') {
        await CompanyService.setOnboardingPhase(companyId, 'phase2_integration');
        setSelectedPhase('phase2_integration');
      }
      setSelectedEnvironment(env);
      setCurrentStep(2); // Move to business type selection
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to select environment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToEnvironment = async (targetEnv: ZatcaEnvironment) => {
    if (!companyId) return;

    setIsLoading(true);
    setError(null);
    try {
      await CompanyService.skipToEnvironment(companyId, targetEnv);
      await fetchCompanyAndStatus();
      // Ensure we stay in phase2_flow after fetch
      setScreenType('phase2_flow');
      setSelectedEnvironment(targetEnv);
      setCurrentStep(2); // Move to business type selection
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to skip environment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessTypeSelect = async (type: BusinessType) => {
    if (!companyId) return;

    // Check if this type is already onboarded
    if ((type === 'B2B' && b2bOnboarded) || (type === 'B2C' && b2cOnboarded)) {
      setError(`${type} onboarding is already completed for this company.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await CompanyService.setBusinessType(companyId, type);
      setSelectedBusinessType(type);
      setPendingBusinessType(null);
      setCurrentStep(3); // Move to CSR generation
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set business type');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCSR = async () => {
    if (!companyId || !company || !selectedEnvironment) return;

    // Save the current business type before fetch might clear it
    const currentBusinessType = selectedBusinessType;

    setIsLoading(true);
    setError(null);
    try {
      const result = await CompanyService.generateCSR(companyId, company, selectedEnvironment, selectedBusinessType || 'both');
      if (result.success) {
        // Also generate TLU token
        await CompanyService.generateTLU(companyId, selectedEnvironment);
        await fetchCompanyAndStatus();

        // Restore the business type (fetchCompanyAndStatus may clear it)
        if (currentBusinessType === 'B2B' || currentBusinessType === 'B2C') {
          setSelectedBusinessType(currentBusinessType);
        }

        setCurrentStep(4); // Move to compliance certificate
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate CSR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplianceCert = async () => {
    if (!companyId || !otp || !selectedEnvironment) {
      setError('Please enter the OTP');
      return;
    }

    // Save the current business type before fetch might clear it
    const currentBusinessType = selectedBusinessType;

    setIsLoading(true);
    setError(null);
    try {
      // Pass businessType for separate B2B/B2C onboarding
      const businessTypeParam = selectedBusinessType === 'B2B' || selectedBusinessType === 'B2C'
        ? selectedBusinessType
        : undefined;
      const result = await CompanyService.getComplianceCertificate(companyId, otp, selectedEnvironment, businessTypeParam);
      if (result.success) {
        await fetchCompanyAndStatus();

        // Restore the business type (fetchCompanyAndStatus may clear it)
        if (currentBusinessType === 'B2B' || currentBusinessType === 'B2C') {
          setSelectedBusinessType(currentBusinessType);
        }

        setCurrentStep(5); // Move to test invoices
        setOtp('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get compliance certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTestInvoices = async () => {
    if (!companyId || !selectedEnvironment) return;

    // Save the current business type before fetch might clear it
    const currentBusinessType = selectedBusinessType;

    setIsLoading(true);
    setError(null);
    try {
      // Pass businessType for separate B2B/B2C onboarding
      const businessTypeParam = selectedBusinessType === 'B2B' || selectedBusinessType === 'B2C'
        ? selectedBusinessType
        : undefined;
      const result = await CompanyService.submitTestInvoices(companyId, selectedEnvironment, businessTypeParam);
      if (result.success) {
        await fetchCompanyAndStatus();

        // Restore the business type (fetchCompanyAndStatus may clear it)
        if (currentBusinessType === 'B2B' || currentBusinessType === 'B2C') {
          setSelectedBusinessType(currentBusinessType);
        }

        setCurrentStep(6); // Move to production CSID
      } else if (result.errors && result.errors.length > 0) {
        setError(`Test invoice submission errors: ${result.errors.join(', ')}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit test invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductionCSID = async () => {
    if (!companyId || !selectedEnvironment) return;

    // Save the current business type before fetch might clear it
    const completedBusinessType = selectedBusinessType;

    setIsLoading(true);
    setError(null);
    try {
      // Pass businessType for separate B2B/B2C onboarding
      const businessTypeParam = selectedBusinessType === 'B2B' || selectedBusinessType === 'B2C'
        ? selectedBusinessType
        : undefined;
      const result = await CompanyService.getProductionCSID(companyId, selectedEnvironment, businessTypeParam);
      if (result.success) {
        await fetchCompanyAndStatus();

        // Restore the business type that was just completed (fetchCompanyAndStatus may clear it)
        if (completedBusinessType === 'B2B' || completedBusinessType === 'B2C') {
          setSelectedBusinessType(completedBusinessType);
        }

        setCurrentStep(7 as Phase2WizardStep); // Complete

        // Update onboarding status
        if (completedBusinessType === 'B2B') {
          setB2bOnboarded(true);
        } else if (completedBusinessType === 'B2C') {
          setB2cOnboarded(true);
        } else if (completedBusinessType === 'both') {
          setB2bOnboarded(true);
          setB2cOnboarded(true);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get production CSID');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (!companyId) return;

    console.log('=== HANDLE RESET ONBOARDING ===');
    setIsResetting(true);
    setError(null);
    try {
      // Always reset ALL environments and onboarding data (pass undefined)
      console.log('Calling resetZatcaOnboarding with companyId:', companyId);
      const result = await CompanyService.resetZatcaOnboarding(companyId, undefined);
      console.log('Reset result:', result);
      if (result.success) {
        console.log('Reset successful, clearing local state...');
        setShowResetConfirm(false);
        setSelectedEnvironment(null);
        setSelectedPhase(null);
        setSelectedBusinessType(null);
        setOnboardingDetails(null);
        setCurrentStep(1);
        setOtp('');
        setIsPhase1Complete(false);
        setB2bOnboarded(false);
        setB2cOnboarded(false);
        setPendingBusinessType(null);
        setScreenType('phase_selection');
        console.log('Calling fetchCompanyAndStatus...');
        await fetchCompanyAndStatus();
        console.log('fetchCompanyAndStatus completed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset onboarding');
    } finally {
      setIsResetting(false);
    }
  };

  const refreshData = async () => {
    await fetchCompanyAndStatus();
  };

  if (!companyId) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Missing Company ID</h3>
          <p className="text-gray-600 mb-4">Please select a company to continue</p>
          <button
            onClick={() => router.push('/dashboard/company/list')}
            className="px-4 py-2 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary transition-all duration-300"
          >
            Go to Companies
          </button>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading ZATCA configuration...</p>
        </div>
      </div>
    );
  }

  // Tab-based Views
  if (activeTab !== 'onboarding' && companyId) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <button
            onClick={() => navigateToTab('onboarding')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Onboarding
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-100 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'config' && 'Configuration Dashboard'}
                {activeTab === 'verification' && 'Verification Status'}
                {activeTab === 'tlu' && 'TLU Token Management'}
              </h1>
              <p className="text-gray-600 mt-1">{company?.companyName}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => navigateToTab('config')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'config'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => navigateToTab('verification')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'verification'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => navigateToTab('tlu')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'tlu'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              TLU Token
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {activeTab === 'config' && (
            <ConfigurationDashboard
              configuration={configuration}
              zatcaStatus={zatcaStatus}
              company={company}
              onRefresh={refreshData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationStatus
              status={verificationStatus}
              onVerifyAPI={async () => {
                if (!companyId) return { success: false, message: 'Company ID required' };
                return CompanyService.verifyAPIConnection(companyId);
              }}
              onRefresh={refreshData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'tlu' && selectedEnvironment && (
            <TLUGenerator
              companyId={companyId}
              environment={selectedEnvironment}
              tluStatus={tluStatus}
              onGenerateTLU={async (env) => {
                const result = await CompanyService.generateTLU(companyId, env);
                return { success: result.success, message: result.message };
              }}
              onAttachTLU={async () => {
                return CompanyService.attachTLUToAPI(companyId);
              }}
              onRefresh={refreshData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'tlu' && !selectedEnvironment && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <p className="text-amber-800">No environment selected. Please complete onboarding first.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isComplete = currentStep >= 7;
  const showProgressSteps = screenType === 'phase2_flow' && selectedEnvironment && !isComplete;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-100 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ZATCA E-Invoicing Setup</h1>
              <p className="text-gray-600 mt-1">
                Complete these steps to enable ZATCA-compliant e-invoicing for {company?.companyName}
              </p>
            </div>
          </div>

          {/* Action Buttons - Always visible in all screens */}
          {(screenType === 'phase_selection' || screenType === 'phase2_flow' || screenType === 'configuration' || screenType === 'phase1_setup') && (
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => navigateToTab('config')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span> Configuration
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={isLoading || isResetting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reset ZATCA Onboarding?</h3>
            </div>
            <p className="text-gray-600 mb-4">
              This will clear all ZATCA credentials, phase settings, and business type configurations.
              The onboarding process will restart from the beginning. This action cannot be undone.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> You will need to generate new CSR, obtain new compliance certificates, and resubmit test invoices.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetOnboarding}
                disabled={isResetting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2 transition-colors"
              >
                {isResetting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isResetting ? 'Resetting...' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPTIONS SCREEN: Phase Selection (for new companies) */}
      {screenType === 'phase_selection' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Choose Your ZATCA Compliance Phase</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the phase that matches your business needs. Phase 1 provides basic QR code generation,
              while Phase 2 offers full ZATCA API integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Phase 1 Option */}
            <div className="relative p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setScreenType('phase1_setup')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileCode className="h-8 w-8 text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Phase 1 - Generation</h3>
                  <span className="text-sm text-gray-500">Basic QR Code Compliance</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Generate ZATCA-compliant QR codes for your invoices without API integration.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Generate QR codes for simplified invoices
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Basic XML invoice generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No API integration required
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Quick setup process
                </li>
              </ul>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                Recommended for Small Businesses
              </div>
            </div>

            {/* Phase 2 Option */}
            <div className="relative p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
              onClick={handleStartPhase2}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <Link2 className="h-8 w-8 text-indigo-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Phase 2 - Integration</h3>
                  <span className="text-sm text-gray-500">Full ZATCA API Integration</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Complete ZATCA API integration with cryptographic signing and real-time reporting.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Choose Simulation or Production environment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Select B2B or B2C invoice type
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Cryptographic signing &amp; real-time clearance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Full ZATCA compliance
                </li>
              </ul>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                Full Compliance
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1 SETUP SCREEN */}
      {screenType === 'phase1_setup' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                <FileCode className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Phase 1 - Generation Setup</h2>
                <p className="text-gray-600">Basic QR Code Compliance</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">What Phase 1 includes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>QR code generation for all your invoices (B2B and B2C)</li>
                    <li>ZATCA-compliant invoice XML structure</li>
                    <li>Offline compliance without API integration</li>
                    <li>You can upgrade to Phase 2 later for full integration</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Important Note</p>
                  <p>Phase 1 is suitable for businesses that don&apos;t require real-time ZATCA reporting.
                     You can always upgrade to Phase 2 later to enable full API integration.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setScreenType('phase_selection')}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePhase1Complete}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all duration-300"
              >
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURATION SCREEN (for onboarded companies) */}
      {screenType === 'configuration' && (
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ZATCA Configuration Status</h2>

            <div className={`grid gap-6 ${selectedEnvironment ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Current Phase */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {selectedPhase === 'phase1_generation' ? (
                        <FileCode className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Link2 className="h-5 w-5 text-indigo-600" />
                      )}
                      <span className="text-sm font-medium text-gray-500">Current Phase</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedPhase === 'phase1_generation' ? 'Phase 1 - Generation' : 'Phase 2 - Integration'}
                    </p>
                    {selectedPhase === 'phase1_generation' && (
                      <p className="text-sm text-gray-500 mt-1">Local QR code generation for invoices</p>
                    )}
                  </div>
                  {selectedPhase === 'phase1_generation' && (
                    <button
                      onClick={handleUpgradeToPhase2}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white font-medium flex items-center gap-2 transition-colors"
                    >
                      <Link2 className="h-4 w-4" />
                      Upgrade to Phase 2
                    </button>
                  )}
                </div>
              </div>

              {/* Active Environment */}
              {selectedEnvironment && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">Active Environment</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{selectedEnvironment}</p>
                </div>
              )}
            </div>
          </div>

          {/* B2B / B2C Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* B2B Status */}
            <div className={`p-6 rounded-xl border-2 ${b2bOnboarded ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${b2bOnboarded ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Building2 className={`h-6 w-6 ${b2bOnboarded ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">B2B (Standard)</h3>
                    <p className="text-sm text-gray-500">Business-to-Business Invoicing</p>
                  </div>
                </div>
                {b2bOnboarded && <CheckCircle className="h-6 w-6 text-green-500" />}
              </div>

              {b2bOnboarded ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Onboarded</span>
                </div>
              ) : (
                <button
                  onClick={() => handleAddBusinessType('B2B')}
                  disabled={isLoading || selectedPhase === 'phase1_generation'}
                  className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedPhase === 'phase1_generation' ? 'Upgrade to Phase 2 Required' : 'Onboard B2B'}
                </button>
              )}
            </div>

            {/* B2C Status */}
            <div className={`p-6 rounded-xl border-2 ${b2cOnboarded ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${b2cOnboarded ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Users className={`h-6 w-6 ${b2cOnboarded ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">B2C (Simplified)</h3>
                    <p className="text-sm text-gray-500">Business-to-Consumer Invoicing</p>
                  </div>
                </div>
                {b2cOnboarded && <CheckCircle className="h-6 w-6 text-green-500" />}
              </div>

              {b2cOnboarded ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Onboarded</span>
                </div>
              ) : (
                <button
                  onClick={() => handleAddBusinessType('B2C')}
                  disabled={isLoading || selectedPhase === 'phase1_generation'}
                  className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedPhase === 'phase1_generation' ? 'Upgrade to Phase 2 Required' : 'Onboard B2C'}
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* PHASE 2 FLOW: Progress Steps */}
      {showProgressSteps && (
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center min-w-max px-2">
            {phase2Steps.map((step, index) => {
              // Determine if this step is clickable (completed or current)
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isClickable = isCompleted || isCurrent;

              // Check if step has data to show
              const hasData =
                (step.id === 1 && selectedEnvironment) ||
                (step.id === 2 && selectedBusinessType);

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (isClickable || hasData) {
                          setCurrentStep(step.id as Phase2WizardStep);
                        }
                      }}
                      disabled={!isClickable && !hasData}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                        ${isCompleted
                          ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                          : isCurrent
                          ? 'bg-primary text-white ring-4 ring-primary-200'
                          : hasData
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      title={isClickable || hasData ? `Go to ${step.name}` : ''}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </button>
                    <span
                      className={`text-xs mt-2 text-center font-medium whitespace-nowrap
                        ${currentStep >= step.id || hasData ? 'text-gray-900' : 'text-gray-400'}
                        ${(isClickable || hasData) ? 'cursor-pointer hover:text-primary' : ''}`}
                      onClick={() => {
                        if (isClickable || hasData) {
                          setCurrentStep(step.id as Phase2WizardStep);
                        }
                      }}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < phase2Steps.length - 1 && (
                    <div className={`w-8 h-1 mx-1 transition-all
                      ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            &times;
          </button>
        </div>
      )}

      {/* PHASE 2 FLOW STEPS */}

      {/* Step 1: Environment Selection (Simulation or Production) */}
      {screenType === 'phase2_flow' && currentStep === 1 && zatcaStatus && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select Environment</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose <strong>Sandbox</strong> for development, <strong>Simulation</strong> for testing with ZATCA, or <strong>Production</strong> for live e-invoicing.
          </p>
          <EnvironmentSelector
            environments={zatcaStatus.environments}
            progression={zatcaStatus.progression}
            activeEnvironment={zatcaStatus.activeEnvironment}
            canSkipTo={zatcaStatus.canSkipTo}
            selectedEnvironment={selectedEnvironment}
            currentBusinessType={pendingBusinessType || zatcaStatus.currentBusinessType || null}
            onSelectEnvironment={handleSelectEnvironment}
            onSkipToEnvironment={handleSkipToEnvironment}
            isLoading={isLoading}
          />
          {/* Navigation buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => setScreenType('phase_selection')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Phase Selection
            </button>
            {/* Show continue button if viewing a completed step */}
            {selectedEnvironment && selectedBusinessType && (
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 text-primary hover:text-primary-700 font-medium"
              >
                Continue to Current Step →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Invoice Type Selection (B2B or B2C) */}
      {screenType === 'phase2_flow' && currentStep === 2 && selectedEnvironment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Select Invoice Type</h3>
            <p className="text-sm text-gray-600">
              Choose one invoice type to onboard. You can onboard the other type later from the configuration screen.
            </p>
          </div>

          {/* Show warning if trying to onboard a type that's already done */}
          {b2bOnboarded && b2cOnboarded && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Both B2B and B2C are already onboarded</p>
                  <p>This company has completed onboarding for both business types.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* B2B Option */}
            <button
              type="button"
              onClick={() => !b2bOnboarded && setPendingBusinessType('B2B')}
              disabled={isLoading || b2bOnboarded}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                b2bOnboarded
                  ? 'border-green-200 bg-green-50 cursor-not-allowed'
                  : pendingBusinessType === 'B2B'
                  ? 'border-primary bg-primary-50 shadow-md ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow cursor-pointer'
              }`}
            >
              {b2bOnboarded && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
              {!b2bOnboarded && pendingBusinessType === 'B2B' && (
                <div className="absolute top-3 right-3">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  b2bOnboarded ? 'bg-green-100' :
                  pendingBusinessType === 'B2B' ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <Building2 className={`h-6 w-6 ${
                    b2bOnboarded ? 'text-green-600' :
                    pendingBusinessType === 'B2B' ? 'text-primary' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">B2B (Standard)</h4>
                  <span className="text-xs text-gray-500">Standard Tax Invoice</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">Business-to-Business invoicing with full buyer details and VAT registration.</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Requires buyer VAT number</li>
                <li>• Invoices must be cleared by ZATCA</li>
                <li>• Full compliance reporting</li>
              </ul>
              {b2bOnboarded && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium mt-3">
                  <CheckCircle className="h-3 w-3" /> Already Onboarded
                </span>
              )}
            </button>

            {/* B2C Option */}
            <button
              type="button"
              onClick={() => !b2cOnboarded && setPendingBusinessType('B2C')}
              disabled={isLoading || b2cOnboarded}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                b2cOnboarded
                  ? 'border-green-200 bg-green-50 cursor-not-allowed'
                  : pendingBusinessType === 'B2C'
                  ? 'border-primary bg-primary-50 shadow-md ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow cursor-pointer'
              }`}
            >
              {b2cOnboarded && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
              {!b2cOnboarded && pendingBusinessType === 'B2C' && (
                <div className="absolute top-3 right-3">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  b2cOnboarded ? 'bg-green-100' :
                  pendingBusinessType === 'B2C' ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <Users className={`h-6 w-6 ${
                    b2cOnboarded ? 'text-green-600' :
                    pendingBusinessType === 'B2C' ? 'text-primary' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">B2C (Simplified)</h4>
                  <span className="text-xs text-gray-500">Simplified Tax Invoice</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">Business-to-Consumer invoicing with QR code verification for retail.</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• No buyer VAT required</li>
                <li>• Reported to ZATCA within 24hrs</li>
                <li>• QR code for verification</li>
              </ul>
              {b2cOnboarded && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium mt-3">
                  <CheckCircle className="h-3 w-3" /> Already Onboarded
                </span>
              )}
            </button>
          </div>

          {/* Navigation buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => pendingBusinessType && handleBusinessTypeSelect(pendingBusinessType)}
              disabled={!pendingBusinessType || isLoading}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                pendingBusinessType && !isLoading
                  ? 'bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Continue with ${pendingBusinessType || '...'} →`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generate CSR + TLU */}
      {screenType === 'phase2_flow' && currentStep === 3 && selectedEnvironment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
            <span className="capitalize">{selectedEnvironment}</span> Environment
            {selectedBusinessType && (
              <>
                <span className="text-gray-400">•</span>
                <span>{selectedBusinessType}</span>
              </>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-3">Step 3: Generate CSR & TLU Token</h2>
          <p className="text-gray-600 mb-6">
            Generate a Certificate Signing Request (CSR), Private Key, and TLU Token for ZATCA integration.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What happens:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A unique certificate request will be generated for your company</li>
                  <li>Private key will be securely encrypted and stored</li>
                  <li>TLU Token will be generated for API authentication</li>
                </ul>
              </div>
            </div>
          </div>

          {tluStatus && tluStatus.hasToken && (
            <div className="mb-6">
              <TLUGenerator
                companyId={companyId}
                environment={selectedEnvironment}
                tluStatus={tluStatus}
                onGenerateTLU={async (env) => {
                  const result = await CompanyService.generateTLU(companyId, env);
                  return { success: result.success, message: result.message };
                }}
                onAttachTLU={async () => {
                  return CompanyService.attachTLUToAPI(companyId);
                }}
                onRefresh={refreshData}
                isLoading={isLoading}
              />
            </div>
          )}

          <button
            onClick={handleGenerateCSR}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-300"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? 'Generating...' : 'Generate CSR & TLU Token'}
          </button>
        </div>
      )}

      {/* Step 4: Compliance Certificate */}
      {screenType === 'phase2_flow' && currentStep === 4 && selectedEnvironment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
            <span className="capitalize">{selectedEnvironment}</span> Environment
          </div>

          <h2 className="text-2xl font-bold mb-3">Step 4: Compliance Certificate</h2>
          <p className="text-gray-600 mb-6">
            Enter the OTP from ZATCA to obtain your compliance certificate.
          </p>

          {selectedEnvironment === 'sandbox' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-2">Sandbox Testing Mode</p>
                  <p className="mb-2">You&apos;re in sandbox environment. Try one of these test OTPs:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['123456', '111111', '000000'].map(testOtp => (
                      <button
                        key={testOtp}
                        onClick={() => setOtp(testOtp)}
                        className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded border border-yellow-300 font-mono text-sm transition-colors"
                      >
                        {testOtp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP (6 digits)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg tracking-wider font-mono"
            />
          </div>

          <button
            onClick={handleComplianceCert}
            disabled={isLoading || otp.length !== 6}
            className="px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-300"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? 'Verifying...' : 'Get Compliance Certificate'}
          </button>
        </div>
      )}

      {/* Step 5: Submit Test Invoices */}
      {screenType === 'phase2_flow' && currentStep === 5 && selectedEnvironment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
            <span className="capitalize">{selectedEnvironment}</span> Environment
          </div>

          <h2 className="text-2xl font-bold mb-3">Step 5: Submit Test Invoices</h2>
          <p className="text-gray-600 mb-6">
            Submit test invoices to ZATCA for validation.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What happens:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Sample invoices will be generated and submitted to ZATCA</li>
                  <li>{selectedBusinessType === 'B2B' ? 'Standard (B2B)' : selectedBusinessType === 'B2C' ? 'Simplified (B2C)' : 'Both standard and simplified'} invoices will be tested</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitTestInvoices}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-300"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? 'Submitting...' : 'Submit Test Invoices'}
          </button>
        </div>
      )}

      {/* Step 6: Complete Onboarding - Get Production CSID */}
      {screenType === 'phase2_flow' && currentStep === 6 && selectedEnvironment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
            <span className="capitalize">{selectedEnvironment}</span> Environment
            {selectedBusinessType && (
              <>
                <span className="text-gray-400">•</span>
                <span>{selectedBusinessType}</span>
              </>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-3">Step 6: Complete ZATCA Onboarding</h2>
          <p className="text-gray-600 mb-6">
            Obtain your final credentials to complete the ZATCA e-invoicing setup.
          </p>

          {selectedEnvironment === 'production' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Production Environment</p>
                  <p>Once complete, your company will be fully configured for live ZATCA e-invoicing.</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleProductionCSID}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-300"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? 'Completing...' : 'Complete Onboarding'}
          </button>
        </div>
      )}

      {/* Complete State - Company is fully configured */}
      {screenType === 'phase2_flow' && isComplete && selectedEnvironment && (() => {
        // Derive actual status from environment data
        const envStatus = zatcaStatus?.environments?.[selectedEnvironment];
        const b2bVerified = envStatus?.b2b?.status === 'verified';
        const b2cVerified = envStatus?.b2c?.status === 'verified';

        // Determine what to display based on actual verification status
        const configuredFor = b2bVerified && b2cVerified
          ? 'B2B & B2C'
          : b2bVerified
            ? 'B2B (Standard)'
            : b2cVerified
              ? 'B2C (Simplified)'
              : 'ZATCA';

        // Determine if we can add another business type
        const canAddB2C = b2bVerified && !b2cVerified;
        const canAddB2B = b2cVerified && !b2bVerified;

        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {b2bVerified && b2cVerified ? 'Company is Fully Configured!' : 'Onboarding Complete!'}
              </h2>
              <p className="text-gray-600 mb-2">
                <strong>{company?.companyName}</strong> is now configured for {configuredFor} ZATCA e-invoicing
                {selectedEnvironment !== 'production' && ` in the ${selectedEnvironment.charAt(0).toUpperCase() + selectedEnvironment.slice(1)} environment`}.
              </p>

              {/* Show option to add another business type in the same environment */}
              {(canAddB2C || canAddB2B) && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
                  <p className="text-sm text-blue-800 mb-3">
                    You can also onboard for {canAddB2C ? 'B2C (Simplified)' : 'B2B (Standard)'} invoicing
                    in the <span className="font-medium capitalize">{selectedEnvironment}</span> environment.
                  </p>
                  <button
                    onClick={() => handleAddBusinessType(canAddB2C ? 'B2C' : 'B2B')}
                    className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Start {canAddB2C ? 'B2C' : 'B2B'} Onboarding
                  </button>
                </div>
              )}

              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={() => setScreenType('configuration')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  View Configuration
                </button>
                <button
                  onClick={() => router.push('/dashboard/company/list')}
                  className="px-6 py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:via-blue-600 hover:to-primary font-medium transition-all duration-300"
                >
                  Back to Companies
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function ZatcaOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading ZATCA onboarding...</p>
        </div>
      </div>
    }>
      <ZatcaOnboardingPageContent />
    </Suspense>
  );
}
