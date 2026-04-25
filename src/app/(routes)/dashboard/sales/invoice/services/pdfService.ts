interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }>;
  subtotal: number;
  totalTax: number;
  total: number;
  discount?: number;
  discountType?: string;
  notes?: string;
  termsAndConditions?: string;
  qrCode?: string; // Base64 QR code image (data URL or base64)
  qrCodeLabel?: string; // Label for the QR code (e.g., "ZATCA QR" or "Phase 1 QR")
}

interface CustomerData {
  customerName: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export class PDFService {
  static generatePDF(invoice: InvoiceData, customer: CustomerData | null): void {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: invoice.currency || 'SAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const calculateItemTotal = (item: { quantity: number; unitPrice: number; taxRate?: number }) => {
      const baseAmount = item.quantity * item.unitPrice;
      const taxAmount = baseAmount * ((item.taxRate || 0) / 100);
      return baseAmount + taxAmount;
    };

    const discountAmount = invoice.discountType === 'percentage'
      ? (invoice.subtotal * (invoice.discount || 0)) / 100
      : (invoice.discount || 0);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #fff;
          color: #333;
          line-height: 1.6;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .invoice-header {
          background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .invoice-header h1 {
          margin: 0;
          font-size: 2.5em;
          font-weight: 300;
        }
        .invoice-body {
          padding: 30px;
        }
        .invoice-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .detail-section h3 {
          color: #84cc16;
          border-bottom: 2px solid #84cc16;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .detail-item {
          margin-bottom: 8px;
        }
        .detail-label {
          font-weight: 600;
          color: #555;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-paid { background-color: #dcfce7; color: #166534; }
        .status-sent { background-color: #dbeafe; color: #1e40af; }
        .status-draft { background-color: #f3f4f6; color: #374151; }
        .status-overdue { background-color: #fecaca; color: #dc2626; }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          box-shadow: 0 0 0 1px #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .items-table th {
          background-color: #f9fafb;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .items-table tr:last-child td {
          border-bottom: none;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-section {
          background-color: #f9fafb;
          padding: 25px;
          border-radius: 8px;
          margin-top: 30px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .summary-row.total {
          border-top: 2px solid #84cc16;
          padding-top: 15px;
          margin-top: 15px;
          font-size: 1.2em;
          font-weight: 700;
          color: #84cc16;
        }
        .notes-section {
          margin-top: 30px;
          padding: 20px;
          background-color: #fafafa;
          border-left: 4px solid #84cc16;
        }
        .notes-section h4 {
          margin-top: 0;
          color: #84cc16;
        }
        .qr-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .qr-code-container {
          text-align: center;
        }
        .qr-code-container img {
          width: 120px;
          height: 120px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          background: white;
        }
        .qr-code-label {
          font-size: 0.75em;
          color: #6b7280;
          margin-top: 8px;
        }
        @media print {
          body { margin: 0; padding: 0; }
          .invoice-container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <h1>INVOICE</h1>
          <p style="margin: 10px 0 0 0; font-size: 1.1em;">#${invoice.invoiceNumber}</p>
        </div>

        <div class="invoice-body">
          <div class="invoice-details">
            <div class="detail-section">
              <h3>Invoice Information</h3>
              <div class="detail-item">
                <span class="detail-label">Invoice Number:</span> ${invoice.invoiceNumber}
              </div>
              <div class="detail-item">
                <span class="detail-label">Issue Date:</span> ${formatDate(invoice.invoiceDate)}
              </div>
              <div class="detail-item">
                <span class="detail-label">Due Date:</span> ${formatDate(invoice.dueDate)}
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="status-badge status-${invoice.status}">${invoice.status}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Currency:</span> ${invoice.currency}
              </div>
            </div>

            <div class="detail-section">
              <h3>Bill To</h3>
              ${customer ? `
                <div class="detail-item">
                  <span class="detail-label">Customer:</span> ${customer.customerName}
                </div>
                ${customer.contactInfo?.email ? `
                <div class="detail-item">
                  <span class="detail-label">Email:</span> ${customer.contactInfo.email}
                </div>
                ` : ''}
                ${customer.contactInfo?.phone ? `
                <div class="detail-item">
                  <span class="detail-label">Phone:</span> ${customer.contactInfo.phone}
                </div>
                ` : ''}
                ${customer.address ? `
                <div class="detail-item">
                  <span class="detail-label">Address:</span><br>
                  ${customer.address.street ? customer.address.street + '<br>' : ''}
                  ${[customer.address.city, customer.address.state, customer.address.postalCode].filter(Boolean).join(', ')}
                  ${customer.address.country ? '<br>' + customer.address.country : ''}
                </div>
                ` : ''}
              ` : '<p>Customer information not available</p>'}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-center">Tax %</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                  <td class="text-center">${item.taxRate || 0}%</td>
                  <td class="text-right">${formatCurrency(calculateItemTotal(item))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            ${(invoice.discount || 0) > 0 ? `
            <div class="summary-row" style="color: #dc2626;">
              <span>Discount ${invoice.discountType === 'percentage' ? `(${invoice.discount}%)` : ''}:</span>
              <span>-${formatCurrency(discountAmount)}</span>
            </div>
            ` : ''}
            <div class="summary-row">
              <span>Tax:</span>
              <span>${formatCurrency(invoice.totalTax)}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>${formatCurrency(invoice.total)}</span>
            </div>
          </div>

          ${invoice.notes || invoice.termsAndConditions ? `
          <div class="notes-section">
            ${invoice.notes ? `
            <h4>Notes:</h4>
            <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
            ` : ''}
            ${invoice.termsAndConditions ? `
            <h4>Terms and Conditions:</h4>
            <p>${invoice.termsAndConditions.replace(/\n/g, '<br>')}</p>
            ` : ''}
          </div>
          ` : ''}

          ${invoice.qrCode ? `
          <div class="qr-section">
            <div class="qr-code-container">
              <img src="${invoice.qrCode}" alt="QR Code" />
              <p class="qr-code-label">${invoice.qrCodeLabel || 'QR Code'}</p>
            </div>
            <div style="text-align: right; color: #6b7280; font-size: 0.85em;">
              <p style="margin: 0;">Scan QR code to verify invoice</p>
              <p style="margin: 4px 0 0 0;">ZATCA E-Invoice Compliant</p>
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  static downloadInvoice(invoice: InvoiceData, customer: CustomerData | null): void {
    this.generatePDF(invoice, customer);
  }
}