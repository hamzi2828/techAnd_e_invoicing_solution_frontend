import { QuotationData, LineItem, Product } from '../types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const QUOTATIONS_ENDPOINT = `${API_BASE_URL}/api/quotations`;

// Utility function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token'); // Adjust based on your auth implementation
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export class QuotationService {
  /**
   * Generate a unique line item ID
   */
  static generateLineItemId(): string {
    return `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate line item totals based on quantity, price, discount, and tax
   */
  static calculateLineItem(item: Partial<LineItem>): LineItem {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discount || 0;
    const discountType = item.discountType || 'percentage';
    const taxRate = item.taxRate || 0;

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
      amount: amountAfterDiscount,
      taxAmount,
      total,
    };
  }

  /**
   * Calculate quotation totals from line items
   */
  static calculateQuotationTotals(lineItems: LineItem[]) {
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
    return this.calculateLineItem({
      id: this.generateLineItemId(),
      productId: product?.id || '',
      description: product?.name || '',
      quantity: 1,
      unitPrice: product?.price || 0,
      discount: 0,
      discountType: 'percentage',
      taxRate: product?.taxRate || 15,
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
   * Add line item to quotation
   */
  static addLineItem(lineItems: LineItem[], product?: Product): LineItem[] {
    const newItem = this.createLineItemFromProduct(product);
    return [...lineItems, newItem];
  }

  /**
   * Remove line item from quotation
   */
  static removeLineItem(lineItems: LineItem[], id: string): LineItem[] {
    return lineItems.filter(item => item.id !== id);
  }

  /**
   * Generate default quotation number (fallback)
   */
  static generateQuoteNumber(): string {
    return `QUO-${Date.now()}`;
  }

  /**
   * Fetch next quotation number from backend
   */
  static async fetchNextQuoteNumber(companyId?: string): Promise<string> {
    try {
      // Use provided companyId or get from localStorage
      let finalCompanyId = companyId || localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId');

      if (!finalCompanyId) {
        console.warn('No company ID provided for quotation number generation');
        return this.generateQuoteNumber(); // Fallback to local generation
      }

      const response = await fetch(`${API_BASE_URL}/api/quotations/next-number/${finalCompanyId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        console.error('Failed to fetch next quotation number');
        return this.generateQuoteNumber(); // Fallback to local generation
      }

      const result = await response.json();

      if (result.success && result.data?.quoteNumber) {
        return result.data.quoteNumber;
      }

      return this.generateQuoteNumber(); // Fallback
    } catch (error) {
      console.error('Error fetching next quotation number:', error);
      return this.generateQuoteNumber(); // Fallback to local generation
    }
  }

  /**
   * Get default valid until date (30 days from now)
   */
  static getDefaultValidUntil(): string {
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return validUntil.toISOString().split('T')[0];
  }

  /**
   * Create initial quotation data
   */
  static async createInitialQuotationData(): Promise<QuotationData> {
    // Fetch the next quotation number from backend
    const quoteNumber = await this.fetchNextQuoteNumber();

    return {
      quoteNumber: quoteNumber,
      quoteDate: new Date().toISOString().split('T')[0],
      validUntil: this.getDefaultValidUntil(),
      currency: 'SAR',
      customerId: '',
      lineItems: [],
      subtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      grandTotal: 0,
      notes: '',
      termsAndConditions: 'This quotation is valid for 30 days from the date of issue.',
      paymentTerms: 'Net 30',
      status: 'draft',
    };
  }

  /**
   * Update quotation with new line items and recalculated totals
   */
  static updateQuotationWithLineItems(quotation: QuotationData, lineItems: LineItem[]): QuotationData {
    const totals = this.calculateQuotationTotals(lineItems);
    return {
      ...quotation,
      lineItems,
      ...totals,
    };
  }

  /**
   * Save quotation to backend
   */
  static async saveQuotation(quotation: QuotationData): Promise<{ success: boolean; message: string; quotation?: QuotationData }> {
    try {
      // Use companyId from quotation object (set when user selects company in UI)
      const companyId = quotation.companyId;

      console.log('[QUOTATION SERVICE] saveQuotation called with:', {
        companyId: quotation.companyId,
        quoteNumber: quotation.quoteNumber,
        customerId: quotation.customerId
      });

      if (!companyId) {
        throw new Error('Please select a company before saving the quotation');
      }

      const quotationPayload = {
        quoteNumber: quotation.quoteNumber,
        quoteDate: quotation.quoteDate,
        validUntil: quotation.validUntil,
        currency: quotation.currency,
        customerId: quotation.customerId,
        companyId: companyId,
        items: quotation.lineItems.map(item => ({ // Backend expects simpler structure
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 15 // Default to 15% if not specified
        })),
        notes: quotation.notes,
        termsAndConditions: quotation.termsAndConditions,
        discount: quotation.totalDiscount,
        discountType: 'percentage',
        isVatApplicable: true
      };

      console.log('[QUOTATION SERVICE] Sending payload to backend:', {
        companyId: quotationPayload.companyId,
        customerId: quotationPayload.customerId,
        quoteNumber: quotationPayload.quoteNumber,
        itemsCount: quotationPayload.items.length
      });

      const response = await fetch(QUOTATIONS_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(quotationPayload)
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save quotation');
      }

      return result.data;
    } catch (error) {
      console.error('Error saving quotation:', error);
      throw error;
    }
  }

  /**
   * Send quotation via backend
   */
  static async sendQuotation(quotation: QuotationData): Promise<{ success: boolean; message: string; quotation?: QuotationData }> {
    try {
      // First save the quotation if it doesn't have an ID
      let quotationId = quotation.id;

      if (!quotationId) {
        // Create the quotation first
        const savedQuotation = await this.saveQuotation(quotation);
        quotationId = savedQuotation.quotation?.id;
      }

      // Then send it
      const response = await fetch(`${QUOTATIONS_ENDPOINT}/${quotationId}/send`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to send quotation');
      }

      return result.data;
    } catch (error) {
      console.error('Error sending quotation:', error);
      throw error;
    }
  }

  /**
   * Validate quotation data
   */
  static validateQuotation(quotation: QuotationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!quotation.companyId || quotation.companyId.trim() === '') {
      errors.push('Company is required');
    }

    if (!quotation.customerId || quotation.customerId.trim() === '') {
      errors.push('Customer is required');
    }

    if (!quotation.quoteNumber || quotation.quoteNumber.trim() === '') {
      errors.push('Quotation number is required');
    }

    if (!quotation.quoteDate) {
      errors.push('Quote date is required');
    }

    if (!quotation.validUntil) {
      errors.push('Valid until date is required');
    }

    if (new Date(quotation.validUntil) < new Date(quotation.quoteDate)) {
      errors.push('Valid until date must be after quote date');
    }

    if (quotation.lineItems.length === 0) {
      errors.push('At least one line item is required');
    }

    // Validate line items
    quotation.lineItems.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        errors.push(`Line item ${index + 1}: Description is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than zero`);
      }
      if (item.unitPrice < 0) {
        errors.push(`Line item ${index + 1}: Unit price cannot be negative`);
      }
    });

    if (quotation.grandTotal <= 0) {
      errors.push('Quotation total must be greater than zero');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
