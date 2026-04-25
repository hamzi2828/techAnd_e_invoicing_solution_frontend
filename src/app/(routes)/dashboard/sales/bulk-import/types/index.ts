export interface Company {
    _id: string;
    id?: string;
    companyName: string;
    companyNameAr?: string;
    taxIdNumber?: string;
    zatcaCredentials?: {
        status: 'pending' | 'verified';
    };
}

export interface ImportedInvoice {
    invoiceNumber: string;
    status: string;
    id: string;
    customerId: string;
    customerName: string;
    total: number;
    itemCount: number;
}

export interface ImportError {
    row: number;
    invoiceNumber: string;
    errors: string[];
}

export interface ImportWarning {
    row: number;
    invoiceNumber: string;
    warnings: string[];
}

export interface ImportResult {
    totalProcessed: number;
    successful: number;
    failed: number;
    invoices: ImportedInvoice[];
    errors: ImportError[];
    warnings: ImportWarning[];
}

export interface ValidationResult {
    totalInvoices: number;
    totalLineItems: number;
    invoicesWithLines: number;
    invoicesWithoutLines: number;
    warnings: string[];
}

export type ImportStep = 'download' | 'upload' | 'results';

export interface ImportState {
    step: ImportStep;
    isLoading: boolean;
    error: string | null;
    selectedCompany: Company | null;
    file: File | null;
    validationResult: ValidationResult | null;
    importResult: ImportResult | null;
}
