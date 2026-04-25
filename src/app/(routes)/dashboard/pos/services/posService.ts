import { getAuthHeader } from '@/helper/helper';
import { CartItem, POSOrder, PaymentMethod } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const POS_ENDPOINT = `${API_BASE_URL}/api/pos`;
const INVOICES_ENDPOINT = `${API_BASE_URL}/api/invoices`;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface CreateOrderPayload {
  customerId?: string;
  customerName: string;
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    total: number;
  }>;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

interface InvoicePayload {
  customer: string;
  invoiceDate: string;
  dueDate: string;
  items: Array<{
    product?: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discountRate: number;
    totalAmount: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  notes?: string;
}

class POSService {
  /**
   * Create a new POS order/sale
   */
  static async createOrder(order: CreateOrderPayload): Promise<POSOrder> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      // Validate items exist
      if (!order.items || order.items.length === 0) {
        throw new Error('Cart is empty. Please add items before checkout.');
      }

      // Try POS endpoint first
      const response = await fetch(POS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        const result: ApiResponse<POSOrder> = await response.json();
        if (result.success && result.data) {
          return result.data;
        }
      }

      // If no customer selected (walk-in), handle locally without invoice
      if (!order.customerId) {
        return this.createWalkInSale(order);
      }

      // If customer selected, create an invoice
      return await this.createInvoiceFromOrder(order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Create a walk-in sale (stored locally, no invoice)
   */
  static createWalkInSale(order: CreateOrderPayload): POSOrder {
    const saleId = `WALKIN-${Date.now()}`;
    const receiptNumber = `R${Date.now().toString().slice(-8)}`;

    // Store in local sales history
    const salesHistory = JSON.parse(localStorage.getItem('pos_sales_history') || '[]');
    const sale: POSOrder = {
      id: saleId,
      orderNumber: receiptNumber,
      customerId: undefined,
      customerName: 'Walk-in Customer',
      items: order.items.map(item => ({
        id: item.productId,
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        price: item.unitPrice,
        quantity: item.quantity,
        taxRate: item.taxRate,
        discount: item.discount,
        total: item.total
      })),
      subtotal: order.subtotal,
      discountPercent: order.discountPercent,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: 'completed',
      notes: 'Walk-in Sale',
      createdAt: new Date().toISOString()
    };

    salesHistory.unshift(sale);
    // Keep only last 100 sales in local storage
    if (salesHistory.length > 100) {
      salesHistory.pop();
    }
    localStorage.setItem('pos_sales_history', JSON.stringify(salesHistory));

    return sale;
  }

  /**
   * Create an invoice from POS order (fallback)
   */
  static async createInvoiceFromOrder(order: CreateOrderPayload): Promise<POSOrder> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 30);

      const invoicePayload: InvoicePayload = {
        customer: order.customerId || '',
        invoiceDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        items: order.items.map(item => ({
          product: item.productId,
          name: item.name,
          description: `SKU: ${item.sku}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discountRate: item.discount,
          totalAmount: item.total
        })),
        subtotal: order.subtotal,
        discount: order.discountAmount,
        tax: order.taxAmount,
        totalAmount: order.total,
        status: 'paid',
        paymentMethod: order.paymentMethod,
        notes: order.notes || `POS Sale - ${order.paymentMethod.toUpperCase()}`
      };

      const response = await fetch(INVOICES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(invoicePayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create invoice (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create invoice');
      }

      // Transform invoice response to POSOrder format
      return {
        id: result.data?._id || result.data?.id,
        orderNumber: result.data?.invoiceNumber,
        customerId: order.customerId,
        customerName: order.customerName,
        items: order.items.map(item => ({
          id: item.productId,
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          price: item.unitPrice,
          quantity: item.quantity,
          taxRate: item.taxRate,
          discount: item.discount,
          total: item.total
        })),
        subtotal: order.subtotal,
        discountPercent: order.discountPercent,
        discountAmount: order.discountAmount,
        taxAmount: order.taxAmount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: 'completed',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating invoice from order:', error);
      throw error;
    }
  }

  /**
   * Get today's sales summary
   */
  static async getTodaySummary(): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  }> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${POS_ENDPOINT}/summary/today`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        // Return default values if endpoint doesn't exist
        return {
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          topProducts: []
        };
      }

      const result = await response.json();
      return result.data || {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topProducts: []
      };
    } catch (error) {
      console.error('Error fetching today summary:', error);
      return {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topProducts: []
      };
    }
  }

  /**
   * Get recent POS orders
   */
  static async getRecentOrders(limit: number = 10): Promise<POSOrder[]> {
    try {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${POS_ENDPOINT}/orders/recent?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }

  /**
   * Print receipt (returns receipt HTML)
   */
  static generateReceiptHTML(order: POSOrder): string {
    const receiptDate = new Date().toLocaleString('en-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .items { margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { border-top: 1px dashed #000; padding-top: 10px; font-weight: bold; }
          .footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>RECEIPT</h2>
          <p>Order #: ${order.orderNumber || 'N/A'}</p>
          <p>Date: ${receiptDate}</p>
          <p>Customer: ${order.customerName}</p>
        </div>
        <div class="items">
          ${order.items.map(item => `
            <div class="item">
              <span>${item.name} x${item.quantity}</span>
              <span>SAR ${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="total">
          <div class="item"><span>Subtotal:</span><span>SAR ${order.subtotal.toFixed(2)}</span></div>
          ${order.discountAmount > 0 ? `<div class="item"><span>Discount:</span><span>-SAR ${order.discountAmount.toFixed(2)}</span></div>` : ''}
          <div class="item"><span>VAT (15%):</span><span>SAR ${order.taxAmount.toFixed(2)}</span></div>
          <div class="item"><span>TOTAL:</span><span>SAR ${order.total.toFixed(2)}</span></div>
        </div>
        <div class="footer">
          <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
          <p>Thank you for your purchase!</p>
        </div>
      </body>
      </html>
    `;
  }
}

export default POSService;
