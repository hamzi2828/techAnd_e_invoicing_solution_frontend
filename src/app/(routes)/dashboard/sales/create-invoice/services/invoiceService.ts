import { InvoiceData, LineItem, Product, VatCategoryCode, VAT_CATEGORY_OPTIONS } from '../types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const INVOICES_ENDPOINT = `${API_BASE_URL}/api/invoices`;

// Utility function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token'); // Adjust based on your auth implementation
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }) 
  };
}

export class InvoiceService {
  /**
   * Generate a unique line item ID
   */
  static generateLineItemId(): string {
    return `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get tax rate from VAT category code
   */
  static getTaxRateFromCategory(categoryCode: VatCategoryCode): number {
    const category = VAT_CATEGORY_OPTIONS.find(c => c.code === categoryCode);
    return category?.rate ?? 15; // Default to 15% (Standard Rate)
  }

  /**
   * Calculate line item totals based on quantity, price, discount, and tax
   */
  static calculateLineItem(item: Partial<LineItem>): LineItem {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discount || 0;
    const discountType = item.discountType || 'percentage';
    const vatCategoryCode = item.vatCategoryCode || 'S'; // Default to Standard Rate
    // ALWAYS derive tax rate from VAT category to ensure consistency
    const taxRate = this.getTaxRateFromCategory(vatCategoryCode);

    const amount = quantity * unitPrice;
    const discountAmount = discountType === 'percentage'
      ? amount * (discount / 100)
      : Math.min(discount, amount);
    const amountAfterDiscount = amount - discountAmount;
    const taxAmount = amountAfterDiscount * (taxRate / 100);
    const total = amountAfterDiscount + taxAmount;

    return {
      id: item.id || this.generateLineItemId(),
      productId: item.productId || '',
      description: item.description || '',
      quantity,
      unitPrice,
      discount,
      discountType,
      taxRate,
      vatCategoryCode,
      taxExemptionReasonCode: item.taxExemptionReasonCode,
      taxExemptionReasonText: item.taxExemptionReasonText,
      amount: amountAfterDiscount,
      taxAmount,
      total,
    };
  }

  /**
   * Calculate invoice totals from line items
   */
  static calculateInvoiceTotals(lineItems: LineItem[]) {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const totalDiscount = lineItems.reduce((sum, item) => {
      const amount = item.quantity * item.unitPrice;
      const discountAmount = item.discountType === 'percentage'
        ? amount * (item.discount / 100)
        : Math.min(item.discount, amount);
      return sum + discountAmount;
    }, 0);

    return { subtotal, totalTax, grandTotal, totalDiscount };
  }

  /**
   * Create a new line item from a product
   */
  static createLineItemFromProduct(product?: Product): LineItem {
    // Determine VAT category based on tax rate
    const taxRate = product?.taxRate ?? 15;
    let vatCategoryCode: VatCategoryCode = 'S'; // Default to Standard Rate
    if (taxRate === 0) {
      vatCategoryCode = 'Z'; // Zero rate if tax is 0
    }

    return this.calculateLineItem({
      id: this.generateLineItemId(),
      productId: product?.id || '',
      description: product?.name || '',
      quantity: 1,
      unitPrice: product?.price || 0,
      discount: 0,
      discountType: 'percentage',
      taxRate,
      vatCategoryCode,
    });
  }

  /**
   * Update line item and recalculate totals
   */
  static updateLineItem(lineItems: LineItem[], id: string, updates: Partial<LineItem>): LineItem[] {
    return lineItems.map(item =>
      item.id === id ? this.calculateLineItem({ ...item, ...updates }) : item
    );
  }

  /**
   * Add line item to invoice
   */
  static addLineItem(lineItems: LineItem[], product?: Product): LineItem[] {
    const newItem = this.createLineItemFromProduct(product);
    return [...lineItems, newItem];
  }

  /**
   * Remove line item from invoice
   */
  static removeLineItem(lineItems: LineItem[], id: string): LineItem[] {
    return lineItems.filter(item => item.id !== id);
  }

  /**
   * Generate default invoice number (fallback)
   */
  static generateInvoiceNumber(): string {
    return `INV-${Date.now()}`;
  }

  /**
   * Fetch next invoice number from backend for a specific company
   */
  static async fetchNextInvoiceNumber(companyId?: string): Promise<string> {
    try {
      if (!companyId) {
        console.warn('No company ID provided, using fallback invoice number');
        return this.generateInvoiceNumber();
      }

      const response = await fetch(`${API_BASE_URL}/api/invoices/next-number/${companyId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        console.error('Failed to fetch next invoice number');
        return this.generateInvoiceNumber(); // Fallback to local generation
      }

      const result = await response.json();

      if (result.success && result.data?.invoiceNumber) {
        return result.data.invoiceNumber;
      }

      return this.generateInvoiceNumber(); // Fallback
    } catch (error) {
      console.error('Error fetching next invoice number:', error);
      return this.generateInvoiceNumber(); // Fallback to local generation
    }
  }

  /**
   * Get default due date (30 days from now)
   */
  static getDefaultDueDate(): string {
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Create initial invoice data
   */
  static async createInitialInvoiceData(): Promise<InvoiceData> {
    // Fetch the next invoice number from backend
    const invoiceNumber = await this.fetchNextInvoiceNumber();

    return {
      invoiceNumber: invoiceNumber,
      invoiceType: 'standard', // Customer Type: standard (B2B) or simplified (B2C)
      zatcaInvoiceTypeCode: 'CI', // Default to Tax Invoice (B2B)
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: this.getDefaultDueDate(),
      currency: 'SAR',
      companyId: '',
      customerId: '',
      lineItems: [],
      subtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      grandTotal: 0,
      notes: '',
      termsAndConditions: 'Payment is due within 30 days of invoice date.',
      paymentTerms: 'Net 30',
      status: 'draft',
    };
  }

  /**
   * Update invoice with new line items and recalculated totals
   */
  static updateInvoiceWithLineItems(invoice: InvoiceData, lineItems: LineItem[]): InvoiceData {
    const totals = this.calculateInvoiceTotals(lineItems);
    return {
      ...invoice,
      lineItems,
      ...totals,
    };
  }

  /**
   * Save invoice to backend
   */
  static async saveInvoice(invoice: InvoiceData): Promise<{ success: boolean; message: string; invoice?: InvoiceData }> {
    try {
      // Use the company ID from invoice data
      const companyId = invoice.companyId;

      if (!companyId) {
        throw new Error('Company ID is required. Please select a company.');
      }

      const invoicePayload = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType, // Customer Type (standard/simplified)
        zatcaInvoiceTypeCode: invoice.zatcaInvoiceTypeCode, // ZATCA Invoice Type Code (SI/CI/SP/CP/SD/CD/SN/CN)
        isAdvancePayment: invoice.isAdvancePayment || false, // Advance payment flag
        invoiceDate: invoice.issueDate, // Backend expects invoiceDate not issueDate
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        customerId: invoice.customerId,
        companyId: companyId,
        items: invoice.lineItems.map(item => ({ // Backend expects simpler structure
          ...(item.productId && { product: item.productId }), // Product reference (optional)
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 15, // Default to 15% if not specified
          vatCategoryCode: item.vatCategoryCode || 'S', // ZATCA VAT Category Code
          ...(item.taxExemptionReasonCode && { taxExemptionReasonCode: item.taxExemptionReasonCode }),
          ...(item.taxExemptionReasonText && { taxExemptionReasonText: item.taxExemptionReasonText }),
          discount: item.discount || 0
        })),
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        discount: invoice.totalDiscount,
        discountType: 'percentage',
        isVatApplicable: true
      };

      const response = await fetch(INVOICES_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(invoicePayload)
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save invoice');
      }

      return result.data;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  }

  /**
   * Send invoice via backend (with ZATCA integration)
   */
  static async sendInvoice(invoice: InvoiceData): Promise<{ success: boolean; message: string; invoice?: InvoiceData; zatcaUuid?: string; qrCode?: string; pdfUrl?: string }> {
    try {
      // First save the invoice if it doesn't have an ID
      let invoiceId = invoice.id;

      if (!invoiceId) {
        // Create the invoice first
        const savedInvoice = await this.saveInvoice(invoice);
        invoiceId = savedInvoice.invoice?.id;
      }

      // Then send it (ZATCA integration happens in backend)
      const response = await fetch(`${INVOICES_ENDPOINT}/${invoiceId}/send`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to send invoice');
      }

      return {
        success: true,
        message: result.message,
        invoice: result.data?.invoice,
        zatcaUuid: result.data?.zatcaUuid,
        qrCode: result.data?.qrCode,
        pdfUrl: result.data?.pdfUrl
      };
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  /**
   * Validate invoice against ZATCA rules
   */
  static async validateInvoiceWithZatca(invoiceId: string): Promise<{ success: boolean; isValid: boolean; errors: string[]; warnings: string[] }> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/${invoiceId}/zatca/validate`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Validation failed');
      }

      const result = await response.json();
      return {
        success: result.success,
        isValid: result.data?.isValid || false,
        errors: result.data?.errors || [],
        warnings: result.data?.warnings || []
      };
    } catch (error) {
      console.error('Error validating invoice:', error);
      throw error;
    }
  }

  /**
   * Download ZATCA PDF/A-3
   */
  static downloadZatcaPDF(invoiceId: string): void {
    window.open(`${INVOICES_ENDPOINT}/${invoiceId}/zatca/pdf`, '_blank');
  }

  /**
   * Get ZATCA QR Code
   */
  static async getZatcaQRCode(invoiceId: string): Promise<{ qrCode: string | null; uuid: string | null; hash: string | null }> {
    try {
      const response = await fetch(`${INVOICES_ENDPOINT}/${invoiceId}/zatca/qrcode`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get QR code');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting QR code:', error);
      throw error;
    }
  }

  /**
   * Validate invoice data
   */
  static validateInvoice(invoice: InvoiceData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!invoice.companyId || invoice.companyId.trim() === '') {
      errors.push('Company is required');
    }

    if (!invoice.customerId || invoice.customerId.trim() === '') {
      errors.push('Customer is required');
    }

    if (!invoice.invoiceType || invoice.invoiceType.trim() === '') {
      errors.push('Customer type is required');
    }

    if (!invoice.zatcaInvoiceTypeCode || invoice.zatcaInvoiceTypeCode.trim() === '') {
      errors.push('Invoice type (ZATCA) is required');
    }

    // Validate ZATCA invoice type code matches customer type
    if (invoice.invoiceType && invoice.zatcaInvoiceTypeCode) {
      const b2cCodes = ['SI', 'SP', 'SD', 'SN'];
      const b2bCodes = ['CI', 'CP', 'CD', 'CN'];

      if (invoice.invoiceType === 'simplified' && !b2cCodes.includes(invoice.zatcaInvoiceTypeCode)) {
        errors.push('Invoice type must be B2C type (SI, SP, SD, SN) for simplified invoices');
      }

      if (invoice.invoiceType === 'standard' && !b2bCodes.includes(invoice.zatcaInvoiceTypeCode)) {
        errors.push('Invoice type must be B2B type (CI, CP, CD, CN) for standard invoices');
      }
    }

    if (!invoice.invoiceNumber || invoice.invoiceNumber.trim() === '') {
      errors.push('Invoice number is required');
    }

    if (!invoice.issueDate) {
      errors.push('Issue date is required');
    }

    if (!invoice.dueDate) {
      errors.push('Due date is required');
    }

    if (new Date(invoice.dueDate) < new Date(invoice.issueDate)) {
      errors.push('Due date must be after issue date');
    }

    if (invoice.lineItems.length === 0) {
      errors.push('At least one line item is required');
    }

    // Validate line items
    invoice.lineItems.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        errors.push(`Line item ${index + 1}: Description is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than zero`);
      }
      if (item.unitPrice < 0) {
        errors.push(`Line item ${index + 1}: Unit price cannot be negative`);
      }
      // ZATCA: Validate VAT category and exemption reason
      const vatCategory = item.vatCategoryCode || 'S';
      const categoryRequiresReason = ['Z', 'E', 'O'].includes(vatCategory);
      if (categoryRequiresReason && !item.taxExemptionReasonCode) {
        errors.push(`Line item ${index + 1}: Tax exemption reason is required for ${vatCategory === 'Z' ? 'Zero Rate' : vatCategory === 'E' ? 'Exempt' : 'Not Subject to VAT'} items`);
      }
    });

    if (invoice.grandTotal <= 0) {
      errors.push('Invoice total must be greater than zero');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get invoice by ID
   */
  static async getInvoiceById(invoiceId: string): Promise<InvoiceData | null> {
    try {
      console.log('Fetching invoice from:', `${INVOICES_ENDPOINT}/${invoiceId}`);
      const response = await fetch(`${INVOICES_ENDPOINT}/${invoiceId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.error('Invoice not found (404)');
          return null;
        }
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`Failed to fetch invoice: ${response.status}`);
      }

      const result = await response.json();
      console.log('API result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch invoice');
      }

      // Return the invoice object directly (backend returns result.data.invoice or result.data)
      return result.data?.invoice || result.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }

  /**
   * Update invoice
   */
  static async updateInvoice(invoiceId: string, invoice: InvoiceData): Promise<boolean> {
    try {
      const invoicePayload = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType, // Customer Type (standard/simplified)
        zatcaInvoiceTypeCode: invoice.zatcaInvoiceTypeCode, // ZATCA Invoice Type Code
        isAdvancePayment: invoice.isAdvancePayment || false, // Advance payment flag
        invoiceDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        customerId: invoice.customerId,
        companyId: invoice.companyId,
        items: invoice.lineItems.map(item => ({
          ...(item.productId && { product: item.productId }), // Product reference (optional)
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 15,
          vatCategoryCode: item.vatCategoryCode || 'S', // ZATCA VAT Category Code
          ...(item.taxExemptionReasonCode && { taxExemptionReasonCode: item.taxExemptionReasonCode }),
          ...(item.taxExemptionReasonText && { taxExemptionReasonText: item.taxExemptionReasonText }),
          discount: item.discount || 0
        })),
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        discount: invoice.totalDiscount,
        discountType: 'percentage',
        isVatApplicable: true,
        status: invoice.status
      };

      const response = await fetch(`${INVOICES_ENDPOINT}/${invoiceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(invoicePayload)
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update invoice');
      }

      return true;
    } catch (error) {
      console.error('Error updating invoice:', error);
      return false;
    }
  }
}