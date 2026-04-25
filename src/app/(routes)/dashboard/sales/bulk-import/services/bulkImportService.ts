const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
        'Authorization': `Bearer ${token}`
    };
};

export interface ImportResult {
    totalProcessed: number;
    successful: number;
    failed: number;
    invoices: Array<{
        invoiceNumber: string;
        status: string;
        id: string;
        customerId: string;
        customerName: string;
        total: number;
        itemCount: number;
    }>;
    errors: Array<{
        row: number;
        invoiceNumber: string;
        errors: string[];
    }>;
    warnings: Array<{
        row: number;
        invoiceNumber: string;
        warnings: string[];
    }>;
}

export interface ValidationResult {
    totalInvoices: number;
    totalLineItems: number;
    invoicesWithLines: number;
    invoicesWithoutLines: number;
    warnings: string[];
}

export const BulkImportService = {
    /**
     * Download import template
     */
    downloadTemplate: async (companyId: string): Promise<Blob> => {
        const response = await fetch(`${API_URL}/api/invoices/bulk-import/template/${companyId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to download template');
        }

        return response.blob();
    },

    /**
     * Process bulk import
     */
    processBulkImport: async (file: File, companyId: string): Promise<{
        success: boolean;
        message: string;
        data: ImportResult;
    }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', companyId);

        const response = await fetch(`${API_URL}/api/invoices/bulk-import`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        const result = await response.json();
        return result;
    },

    /**
     * Validate import file without creating invoices
     */
    validateImportFile: async (file: File, companyId: string): Promise<{
        success: boolean;
        message: string;
        data: ValidationResult;
    }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', companyId);

        const response = await fetch(`${API_URL}/api/invoices/bulk-import/validate`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        const result = await response.json();
        return result;
    },

    /**
     * Get import history
     */
    getImportHistory: async (): Promise<{
        success: boolean;
        data: { imports: any[] };
    }> => {
        const response = await fetch(`${API_URL}/api/invoices/bulk-import/history`, {
            method: 'GET',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });

        return response.json();
    }
};
