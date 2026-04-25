'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    Download,
    FileSpreadsheet,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    ArrowRight,
    RefreshCw,
    Eye,
    FileDown,
    Building2,
    ShieldCheck,
    Send,
    X,
    Pencil,
    Archive
} from 'lucide-react';
import JSZip from 'jszip';
import { BulkImportService, ImportResult } from './services/bulkImportService';
import { InvoiceService } from '../all-invoices/services/invoiceService';
import { Company } from './types';
import AlertModal, { useAlertModal } from '@/components/ui/AlertModal';

// Company service to get user's companies
const getCompanies = async (): Promise<Company[]> => {
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const response = await fetch(`${API_URL}/api/companies/created-by-me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch companies');
    }

    const result = await response.json();
    // API returns data as array directly, not { companies: [...] }
    return result.data || [];
};

export default function BulkImportPage() {
    const router = useRouter();

    // State
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [step, setStep] = useState<'select' | 'upload' | 'results'>('select');

    // Batch operations state
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

    // Alert modal state
    const { alert, showAlert, hideAlert } = useAlertModal();

    const [isBulkValidating, setIsBulkValidating] = useState(false);
    const [bulkValidationProgress, setBulkValidationProgress] = useState<{
        current: number;
        total: number;
        results: Array<{
            invoiceId: string;
            invoiceNumber: string;
            success: boolean;
            message: string;
        }>;
    } | null>(null);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
    const [bulkSubmitProgress, setBulkSubmitProgress] = useState<{
        current: number;
        total: number;
        results: Array<{
            invoiceId: string;
            invoiceNumber: string;
            success: boolean;
            message: string;
        }>;
    } | null>(null);
    const [isBulkDownloading, setIsBulkDownloading] = useState(false);
    const [bulkDownloadProgress, setBulkDownloadProgress] = useState<{
        current: number;
        total: number;
        results: Array<{
            invoiceId: string;
            invoiceNumber: string;
            success: boolean;
            message: string;
        }>;
    } | null>(null);
    // Track validation status for each invoice
    const [invoiceValidationStatus, setInvoiceValidationStatus] = useState<Record<string, 'pending' | 'valid' | 'invalid'>>({});

    // Load companies on mount
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                setIsLoading(true);
                const companiesData = await getCompanies();
                setCompanies(companiesData);

                // Auto-select first company if only one
                if (companiesData.length === 1) {
                    setSelectedCompany(companiesData[0]);
                }
            } catch (err) {
                setError(`Failed to load companies: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setIsLoading(false);
            }
        };

        loadCompanies();
    }, []);

    // Download template handler
    const handleDownloadTemplate = async () => {
        if (!selectedCompany) {
            setError('Please select a company first');
            return;
        }

        try {
            setIsDownloading(true);
            setError(null);

            const blob = await BulkImportService.downloadTemplate(selectedCompany._id);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_import_template_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Move to upload step
            setStep('upload');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to download template');
        } finally {
            setIsDownloading(false);
        }
    };

    // File drop handler
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    // Import handler
    const handleImport = async () => {
        if (!selectedCompany || !file) {
            setError('Please select a company and upload a file');
            return;
        }

        try {
            setIsImporting(true);
            setError(null);

            const result = await BulkImportService.processBulkImport(file, selectedCompany._id);

            setImportResult(result.data);
            setStep('results');

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setIsImporting(false);
        }
    };

    // Reset handler
    const handleReset = () => {
        setFile(null);
        setImportResult(null);
        setError(null);
        setStep('select');
    };

    // View invoices handler
    const handleViewInvoices = () => {
        router.push('/dashboard/sales/all-invoices');
    };

    // Download error report
    const handleDownloadErrorReport = () => {
        if (!importResult || importResult.errors.length === 0) return;

        const errorContent = importResult.errors.map(err =>
            `Row ${err.row} (${err.invoiceNumber}): ${err.errors.join(', ')}`
        ).join('\n');

        const blob = new Blob([errorContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `import_errors_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // Selection handlers
    const handleSelectAll = () => {
        if (!importResult) return;
        const allIds = importResult.invoices.map(inv => inv.id);
        if (selectedInvoices.length === importResult.invoices.length) {
            setSelectedInvoices([]);
        } else {
            setSelectedInvoices(allIds);
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedInvoices.includes(id)) {
            setSelectedInvoices(selectedInvoices.filter(selectedId => selectedId !== id));
        } else {
            setSelectedInvoices([...selectedInvoices, id]);
        }
    };

    // Get pending invoices (not yet validated)
    const getPendingSelectedInvoices = () => {
        if (!importResult) return [];
        return importResult.invoices.filter(inv => {
            const isSelected = selectedInvoices.includes(inv.id);
            const status = invoiceValidationStatus[inv.id] || 'pending';
            return isSelected && status === 'pending';
        });
    };

    // Get validated invoices (ready for submission)
    const getValidatedSelectedInvoices = () => {
        if (!importResult) return [];
        return importResult.invoices.filter(inv => {
            const isSelected = selectedInvoices.includes(inv.id);
            const status = invoiceValidationStatus[inv.id];
            return isSelected && status === 'valid';
        });
    };

    const pendingSelectedCount = getPendingSelectedInvoices().length;
    const validatedSelectedCount = getValidatedSelectedInvoices().length;

    // Bulk validate selected invoices
    const handleBulkValidate = async () => {
        const pendingInvoices = getPendingSelectedInvoices();

        if (pendingInvoices.length === 0) {
            showAlert('No pending invoices selected for validation.', 'warning');
            return;
        }

        setIsBulkValidating(true);
        setBulkValidationProgress({
            current: 0,
            total: pendingInvoices.length,
            results: []
        });

        const results: Array<{
            invoiceId: string;
            invoiceNumber: string;
            success: boolean;
            message: string;
        }> = [];

        const newValidationStatus = { ...invoiceValidationStatus };

        for (let i = 0; i < pendingInvoices.length; i++) {
            const invoice = pendingInvoices[i];

            try {
                const result = await InvoiceService.validateInvoice(invoice.id);
                results.push({
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    success: result.isValid,
                    message: result.isValid ? 'Validated successfully' : (result.errors[0] || 'Validation failed')
                });
                newValidationStatus[invoice.id] = result.isValid ? 'valid' : 'invalid';
            } catch (error) {
                results.push({
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    success: false,
                    message: error instanceof Error ? error.message : 'Validation failed'
                });
                newValidationStatus[invoice.id] = 'invalid';
            }

            setBulkValidationProgress({
                current: i + 1,
                total: pendingInvoices.length,
                results: [...results]
            });
        }

        setInvoiceValidationStatus(newValidationStatus);
    };

    // Close bulk validation progress
    const handleCloseBulkValidation = () => {
        setIsBulkValidating(false);
        setBulkValidationProgress(null);
    };

    // Bulk submit to ZATCA
    const handleBulkSubmit = async () => {
        const validatedInvoices = getValidatedSelectedInvoices();

        if (validatedInvoices.length === 0) {
            showAlert('No validated invoices selected for submission. Please validate invoices first.', 'warning');
            return;
        }

        setIsBulkSubmitting(true);
        setBulkSubmitProgress({
            current: 0,
            total: validatedInvoices.length,
            results: []
        });

        const results: Array<{
            invoiceId: string;
            invoiceNumber: string;
            success: boolean;
            message: string;
        }> = [];

        for (let i = 0; i < validatedInvoices.length; i++) {
            const invoice = validatedInvoices[i];

            try {
                const success = await InvoiceService.sendInvoice(invoice.id);
                results.push({
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    success,
                    message: success ? 'Submitted successfully' : 'Failed to submit'
                });
            } catch (error) {
                results.push({
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    success: false,
                    message: error instanceof Error ? error.message : 'Submit failed'
                });
            }

            setBulkSubmitProgress({
                current: i + 1,
                total: validatedInvoices.length,
                results: [...results]
            });
        }

        setSelectedInvoices([]);
    };

    // Close bulk submit progress
    const handleCloseBulkSubmit = () => {
        setIsBulkSubmitting(false);
        setBulkSubmitProgress(null);
    };

    // Bulk download selected invoices as ZIP
    const handleBulkDownload = async () => {
        if (!importResult) return;

        const invoicesToDownload = importResult.invoices.filter(inv => selectedInvoices.includes(inv.id));

        if (invoicesToDownload.length === 0) {
            showAlert('No invoices selected for download.', 'warning');
            return;
        }

        setIsBulkDownloading(true);
        setBulkDownloadProgress({
            current: 0,
            total: invoicesToDownload.length,
            results: []
        });

        const zip = new JSZip();
        const results: Array<{
            invoiceId: string;
            invoiceNumber: string;
            success: boolean;
            message: string;
        }> = [];

        let successCount = 0;

        for (let i = 0; i < invoicesToDownload.length; i++) {
            const inv = invoicesToDownload[i];

            try {
                const invoice = await InvoiceService.getInvoiceById(inv.id);

                if (invoice?.zatca?.pdfUrl) {
                    // Decode base64 PDF and add to ZIP
                    const pdfData = invoice.zatca.pdfUrl;
                    zip.file(`${inv.invoiceNumber}.pdf`, pdfData, { base64: true });
                    successCount++;
                    results.push({
                        invoiceId: inv.id,
                        invoiceNumber: inv.invoiceNumber,
                        success: true,
                        message: 'Added to ZIP'
                    });
                } else {
                    results.push({
                        invoiceId: inv.id,
                        invoiceNumber: inv.invoiceNumber,
                        success: false,
                        message: 'PDF not available (not cleared with ZATCA)'
                    });
                }
            } catch (error) {
                results.push({
                    invoiceId: inv.id,
                    invoiceNumber: inv.invoiceNumber,
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to fetch invoice'
                });
            }

            setBulkDownloadProgress({
                current: i + 1,
                total: invoicesToDownload.length,
                results: [...results]
            });
        }

        // Generate and download ZIP if there are any PDFs
        if (successCount > 0) {
            try {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const url = window.URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoices_${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error('Error creating ZIP:', error);
                showAlert('Failed to create ZIP file', 'error');
            }
        } else {
            showAlert('No PDFs available for download. Please clear invoices with ZATCA first.', 'warning');
        }
    };

    // Close bulk download progress
    const handleCloseBulkDownload = () => {
        setIsBulkDownloading(false);
        setBulkDownloadProgress(null);
    };

    // View invoice in new tab
    const handleViewInvoice = (id: string) => {
        window.open(`/dashboard/sales/invoice/${id}`, '_blank');
    };

    // Edit invoice in new tab
    const handleEditInvoice = (id: string) => {
        window.open(`/dashboard/sales/edit-invoice/${id}`, '_blank');
    };

    // Download invoice PDF
    const handleDownloadInvoice = async (id: string, invoiceNumber: string) => {
        try {
            const invoice = await InvoiceService.getInvoiceById(id);

            if (!invoice) {
                showAlert('Invoice not found', 'error');
                return;
            }

            if (invoice.zatca?.pdfUrl) {
                const pdfDataUrl = `data:application/pdf;base64,${invoice.zatca.pdfUrl}`;
                const link = document.createElement('a');
                link.href = pdfDataUrl;
                link.download = `invoice-${invoiceNumber || id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                showAlert('PDF not available for this invoice. Please clear the invoice with ZATCA first.', 'warning');
            }
        } catch (error) {
            console.error('Error downloading invoice:', error);
            showAlert('Failed to download invoice PDF', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Bulk Invoice Import</h1>
                <p className="text-gray-600 mt-1">
                    Import multiple invoices at once using an Excel template
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${step === 'select' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step === 'select' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                            {step !== 'select' ? <CheckCircle className="w-5 h-5" /> : '1'}
                        </div>
                        <span className="ml-2 font-medium">Download Template</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                    <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step === 'upload' ? 'bg-blue-100 text-blue-600' :
                            step === 'results' ? 'bg-green-100 text-green-600' : 'bg-gray-100'
                        }`}>
                            {step === 'results' ? <CheckCircle className="w-5 h-5" /> : '2'}
                        </div>
                        <span className="ml-2 font-medium">Upload & Import</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                    <div className={`flex items-center ${step === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step === 'results' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                        }`}>
                            3
                        </div>
                        <span className="ml-2 font-medium">Results</span>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Step 1: Company Selection & Template Download */}
            {step === 'select' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Download className="w-5 h-5 mr-2 text-blue-600" />
                        Step 1: Download Import Template
                    </h2>

                    <div className="space-y-4">
                        {/* Company Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCompany?._id || ''}
                                onChange={(e) => {
                                    const company = companies.find(c => c._id === e.target.value);
                                    setSelectedCompany(company || null);
                                }}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                                    !selectedCompany ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select Company</option>
                                {companies.map(company => {
                                    const isZatcaVerified = company.zatcaCredentials?.status === 'verified';
                                    return (
                                        <option key={company._id} value={company._id}>
                                            {company.companyName} {isZatcaVerified ? '✓ Phase 2' : '○ Phase 1'}
                                        </option>
                                    );
                                })}
                            </select>
                            {!selectedCompany && companies.length > 0 && (
                                <p className="mt-1 text-xs text-red-500">Company is required</p>
                            )}
                            {selectedCompany && (
                                <p className={`mt-1 text-xs ${selectedCompany.zatcaCredentials?.status === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {selectedCompany.zatcaCredentials?.status === 'verified'
                                        ? '✓ ZATCA verified (Phase 2)'
                                        : '○ Local mode (Phase 1)'}
                                </p>
                            )}
                            {companies.length === 0 && (
                                <p className="mt-1 text-xs text-red-500">
                                    No companies found. Please create a company first.
                                </p>
                            )}
                        </div>

                        {/* Template Info */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-2">Template Features:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Pre-filled with your existing customers
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Pre-filled with your product catalog
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Dropdown selections for easy data entry
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Instructions included in README sheet
                                </li>
                            </ul>
                        </div>

                        {/* Download Button */}
                        <button
                            onClick={handleDownloadTemplate}
                            disabled={!selectedCompany || isDownloading}
                            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                                selectedCompany && !isDownloading
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Template...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                                    Download Import Template
                                </>
                            )}
                        </button>

                        {/* Skip to Upload */}
                        <button
                            onClick={() => setStep('upload')}
                            disabled={!selectedCompany}
                            className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Already have a filled template? Skip to upload →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Upload File */}
            {step === 'upload' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-blue-600" />
                        Step 2: Upload Filled Template
                    </h2>

                    <div className="space-y-4">
                        {/* Selected Company Display */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center">
                                <Building2 className="w-5 h-5 text-gray-500 mr-2" />
                                <div>
                                    <span className="font-medium">{selectedCompany?.companyName}</span>
                                    <p className={`text-xs ${selectedCompany?.zatcaCredentials?.status === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {selectedCompany?.zatcaCredentials?.status === 'verified'
                                            ? '✓ ZATCA verified (Phase 2)'
                                            : '○ Local mode (Phase 1)'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setStep('select')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Change
                            </button>
                        </div>

                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                isDragActive
                                    ? 'border-blue-500 bg-blue-50'
                                    : file
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-blue-400'
                            }`}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <FileSpreadsheet className="w-12 h-12 text-green-600 mb-3" />
                                    <p className="font-medium text-green-900">{file.name}</p>
                                    <p className="text-sm text-green-600 mt-1">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="mt-3 text-red-600 hover:text-red-700 text-sm"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                    <p className="font-medium text-gray-700">
                                        {isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        or click to browse
                                    </p>
                                    <p className="text-xs text-gray-400 mt-3">
                                        Supports: .xlsx, .xls, .csv (Max 10MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Import Button */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setStep('select')}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!file || isImporting}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                                    file && !isImporting
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 mr-2" />
                                        Import Invoices
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Results */}
            {step === 'results' && importResult && (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-blue-600">{importResult.totalProcessed}</p>
                                <p className="text-sm text-blue-800">Total Processed</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-green-600">{importResult.successful}</p>
                                <p className="text-sm text-green-800">Successful</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-red-600">{importResult.failed}</p>
                                <p className="text-sm text-red-800">Failed</p>
                            </div>
                        </div>

                        {/* Success Message */}
                        {importResult.successful > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                    <p className="text-green-800">
                                        Successfully created {importResult.successful} invoice(s) as drafts.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Warnings */}
                        {importResult.warnings.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800">Warnings ({importResult.warnings.length})</p>
                                        <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                                            {importResult.warnings.slice(0, 5).map((warning, index) => (
                                                <li key={index}>
                                                    Row {warning.row}: {warning.warnings.join(', ')}
                                                </li>
                                            ))}
                                            {importResult.warnings.length > 5 && (
                                                <li>...and {importResult.warnings.length - 5} more</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Errors */}
                        {importResult.errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start">
                                    <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-red-800">Errors ({importResult.errors.length})</p>
                                        <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                                            {importResult.errors.slice(0, 5).map((err, index) => (
                                                <li key={index}>
                                                    Row {err.row} ({err.invoiceNumber}): {err.errors.join(', ')}
                                                </li>
                                            ))}
                                            {importResult.errors.length > 5 && (
                                                <li>...and {importResult.errors.length - 5} more</li>
                                            )}
                                        </ul>
                                    </div>
                                    {importResult.errors.length > 0 && (
                                        <button
                                            onClick={handleDownloadErrorReport}
                                            className="text-red-600 hover:text-red-700 text-sm flex items-center"
                                        >
                                            <FileDown className="w-4 h-4 mr-1" />
                                            Download
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Created Invoices List */}
                        {importResult.invoices.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-gray-900">Created Invoices</h3>
                                    {/* Batch Action Buttons */}
                                    {selectedInvoices.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">
                                                {selectedInvoices.length} selected:
                                            </span>
                                            <button
                                                onClick={handleBulkValidate}
                                                disabled={isBulkValidating || pendingSelectedCount === 0}
                                                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={pendingSelectedCount === 0 ? 'No pending invoices' : `Validate ${pendingSelectedCount} invoice(s)`}
                                            >
                                                <ShieldCheck className="w-4 h-4 mr-1.5" />
                                                Validate
                                                {pendingSelectedCount > 0 && (
                                                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                                                        {pendingSelectedCount}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleBulkSubmit}
                                                disabled={isBulkSubmitting || validatedSelectedCount === 0}
                                                className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={validatedSelectedCount === 0 ? 'No validated invoices' : `Submit ${validatedSelectedCount} invoice(s) to ZATCA`}
                                            >
                                                <Send className="w-4 h-4 mr-1.5" />
                                                Submit to ZATCA
                                                {validatedSelectedCount > 0 && (
                                                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                                                        {validatedSelectedCount}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleBulkDownload}
                                                disabled={isBulkDownloading}
                                                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={`Download ${selectedInvoices.length} invoice(s) as ZIP`}
                                            >
                                                <Archive className="w-4 h-4 mr-1.5" />
                                                Download ZIP
                                                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                                                    {selectedInvoices.length}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedInvoices.length === importResult.invoices.length && importResult.invoices.length > 0}
                                                        onChange={handleSelectAll}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Invoice #</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Customer</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-600">Items</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
                                                <th className="px-4 py-2 text-center font-medium text-gray-600">ZATCA Status</th>
                                                <th className="px-4 py-2 text-center font-medium text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {importResult.invoices.map((inv, index) => {
                                                const isSelected = selectedInvoices.includes(inv.id);
                                                const validationStatus = invoiceValidationStatus[inv.id] || 'pending';
                                                return (
                                                    <tr key={index} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleSelectOne(inv.id)}
                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 font-mono text-blue-600">{inv.invoiceNumber}</td>
                                                        <td className="px-4 py-2">{inv.customerName}</td>
                                                        <td className="px-4 py-2 text-right">{inv.itemCount}</td>
                                                        <td className="px-4 py-2 text-right font-medium">
                                                            {inv.total.toLocaleString('en-SA', { style: 'currency', currency: 'SAR' })}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {validationStatus === 'pending' && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                                    Pending
                                                                </span>
                                                            )}
                                                            {validationStatus === 'valid' && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Validated
                                                                </span>
                                                            )}
                                                            {validationStatus === 'invalid' && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    Failed
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => handleViewInvoice(inv.id)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                                    title="View invoice"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEditInvoice(inv.id)}
                                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                                                    title="Edit invoice"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDownloadInvoice(inv.id, inv.invoiceNumber)}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                                    title="Download PDF"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={handleReset}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Import More
                            </button>
                            <button
                                onClick={handleViewInvoices}
                                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
                            >
                                <Eye className="w-5 h-5 mr-2" />
                                View All Invoices
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Validation Progress Modal */}
            {isBulkValidating && bulkValidationProgress && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Bulk Validation</h3>
                                    <p className="text-sm text-gray-500">Validating {bulkValidationProgress.total} invoice(s)</p>
                                </div>
                                {bulkValidationProgress.current === bulkValidationProgress.total && (
                                    <button onClick={handleCloseBulkValidation} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <div className="px-6 py-4">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{bulkValidationProgress.current} / {bulkValidationProgress.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkValidationProgress.current / bulkValidationProgress.total) * 100}%` }} />
                                    </div>
                                </div>
                                {bulkValidationProgress.current < bulkValidationProgress.total && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
                                        <span className="text-gray-600">Validating invoices...</span>
                                    </div>
                                )}
                                {bulkValidationProgress.results.length > 0 && (
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {bulkValidationProgress.results.map((result, index) => (
                                            <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                                {result.success ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.invoiceNumber}</p>
                                                    <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {bulkValidationProgress.current === bulkValidationProgress.total && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Summary:</span>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />{bulkValidationProgress.results.filter(r => r.success).length} passed</span>
                                                <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" />{bulkValidationProgress.results.filter(r => !r.success).length} failed</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {bulkValidationProgress.current === bulkValidationProgress.total && (
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                    <button onClick={handleCloseBulkValidation} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Close</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Submit Progress Modal */}
            {isBulkSubmitting && bulkSubmitProgress && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Submitting to ZATCA</h3>
                                    <p className="text-sm text-gray-500">Submitting {bulkSubmitProgress.total} invoice(s)</p>
                                </div>
                                {bulkSubmitProgress.current === bulkSubmitProgress.total && (
                                    <button onClick={handleCloseBulkSubmit} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <div className="px-6 py-4">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{bulkSubmitProgress.current} / {bulkSubmitProgress.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkSubmitProgress.current / bulkSubmitProgress.total) * 100}%` }} />
                                    </div>
                                </div>
                                {bulkSubmitProgress.current < bulkSubmitProgress.total && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin mr-2" />
                                        <span className="text-gray-600">Submitting invoices to ZATCA...</span>
                                    </div>
                                )}
                                {bulkSubmitProgress.results.length > 0 && (
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {bulkSubmitProgress.results.map((result, index) => (
                                            <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                                {result.success ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.invoiceNumber}</p>
                                                    <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {bulkSubmitProgress.current === bulkSubmitProgress.total && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Summary:</span>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />{bulkSubmitProgress.results.filter(r => r.success).length} submitted</span>
                                                <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" />{bulkSubmitProgress.results.filter(r => !r.success).length} failed</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {bulkSubmitProgress.current === bulkSubmitProgress.total && (
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                    <button onClick={handleCloseBulkSubmit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Close</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Download Progress Modal */}
            {isBulkDownloading && bulkDownloadProgress && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Bulk Download</h3>
                                    <p className="text-sm text-gray-500">Downloading {bulkDownloadProgress.total} invoice(s)</p>
                                </div>
                                {bulkDownloadProgress.current === bulkDownloadProgress.total && (
                                    <button onClick={handleCloseBulkDownload} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <div className="px-6 py-4">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{bulkDownloadProgress.current} / {bulkDownloadProgress.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkDownloadProgress.current / bulkDownloadProgress.total) * 100}%` }} />
                                    </div>
                                </div>
                                {bulkDownloadProgress.current < bulkDownloadProgress.total && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-6 h-6 text-green-600 animate-spin mr-2" />
                                        <span className="text-gray-600">Fetching invoice PDFs...</span>
                                    </div>
                                )}
                                {bulkDownloadProgress.results.length > 0 && (
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {bulkDownloadProgress.results.map((result, index) => (
                                            <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                                {result.success ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.invoiceNumber}</p>
                                                    <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {bulkDownloadProgress.current === bulkDownloadProgress.total && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Summary:</span>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />{bulkDownloadProgress.results.filter(r => r.success).length} downloaded</span>
                                                <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" />{bulkDownloadProgress.results.filter(r => !r.success).length} failed</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {bulkDownloadProgress.current === bulkDownloadProgress.total && (
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                    <button onClick={handleCloseBulkDownload} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Close</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            <AlertModal
                isOpen={alert.isOpen}
                onClose={hideAlert}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />
        </div>
    );
}
