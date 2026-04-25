import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Download, Printer, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { InvoiceData, Customer } from '../types';
import { Company } from '../../../company/types';

interface InvoicePreviewProps {
  isOpen: boolean;
  invoice: InvoiceData;
  selectedCustomer: Customer | null;
  selectedCompany: Company | null;
  onClose: () => void;
  qrCodeData?: string | null; // Base64 QR code data for Phase 1
  zatcaQrCode?: string | null; // Base64 PNG QR code from ZATCA (Phase 2)
  currentPhase?: 'phase1' | 'phase2' | 'not_onboarded';
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  isOpen,
  invoice,
  selectedCustomer,
  selectedCompany,
  onClose,
  qrCodeData,
  zatcaQrCode,
  currentPhase = 'not_onboarded',
}) => {
  const [generatedQrImage, setGeneratedQrImage] = useState<string | null>(null);

  // Generate QR code image from Phase 1 data
  useEffect(() => {
    const generateQR = async () => {
      if (qrCodeData && currentPhase === 'phase1') {
        try {
          const qrDataUrl = await QRCode.toDataURL(qrCodeData, {
            width: 150,
            margin: 2,
            errorCorrectionLevel: 'M',
          });
          setGeneratedQrImage(qrDataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    };
    generateQR();
  }, [qrCodeData, currentPhase]);

  if (!isOpen) return null;

  // Determine which QR code to display
  const displayQrCode = zatcaQrCode
    ? `data:image/png;base64,${zatcaQrCode}`
    : generatedQrImage;
  const qrLabel = zatcaQrCode ? 'ZATCA QR Code' : (generatedQrImage ? 'Phase 1 QR Code' : null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Invoice Preview Content */}
        <div className="p-8 bg-white">
          <div className="max-w-3xl mx-auto">
            {/* Company Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-600">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                {selectedCompany ? (
                  <>
                    <div className="text-2xl font-bold text-primary">{selectedCompany.companyName}</div>
                    {selectedCompany.companyNameAr && (
                      <p className="text-gray-600">{selectedCompany.companyNameAr}</p>
                    )}
                    <p className="text-gray-600">
                      {selectedCompany.address?.street}
                      {selectedCompany.address?.district && `, ${selectedCompany.address.district}`}
                    </p>
                    <p className="text-gray-600">
                      {selectedCompany.address?.city}
                      {selectedCompany.address?.postalCode && ` ${selectedCompany.address.postalCode}`}
                      {selectedCompany.address?.country && `, ${selectedCompany.address.country}`}
                    </p>
                    {selectedCompany.phone && <p className="text-gray-600">{selectedCompany.phone}</p>}
                    {selectedCompany.email && <p className="text-gray-600">{selectedCompany.email}</p>}
                    {selectedCompany.taxIdNumber && (
                      <p className="text-gray-600 font-medium">Tax ID: {selectedCompany.taxIdNumber}</p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-primary">E-Invoice Pro</div>
                    <p className="text-gray-600">Your Company Name</p>
                    <p className="text-gray-600">Company Address</p>
                    <p className="text-gray-600">City, Country</p>
                  </>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
       
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                {selectedCustomer && (
                  <div className="text-gray-700">
                    <p className="font-medium">{selectedCustomer.name || selectedCustomer.customerName}</p>
                    {selectedCustomer.companyName && <p>{selectedCustomer.companyName}</p>}
                    {typeof selectedCustomer.address === 'string' ? (
                      <>
                        <p>{selectedCustomer.address}</p>
                        <p>{selectedCustomer.city}, {selectedCustomer.country}</p>
                      </>
                    ) : selectedCustomer.address ? (
                      <>
                        {selectedCustomer.address.street && <p>{selectedCustomer.address.street}</p>}
                        <p>
                          {[selectedCustomer.address.city, selectedCustomer.address.state].filter(Boolean).join(', ')}
                          {selectedCustomer.address.postalCode && ` ${selectedCustomer.address.postalCode}`}
                        </p>
                        {selectedCustomer.address.country && <p>{selectedCustomer.address.country}</p>}
                      </>
                    ) : null}
                    <p>{selectedCustomer.email || selectedCustomer.contactInfo?.email}</p>
                    <p>{selectedCustomer.phone || selectedCustomer.contactInfo?.phone}</p>
                  </div>
                )}
              </div>
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span>{invoice.paymentTerms}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 font-semibold">Description</th>
                    <th className="text-center py-3 font-semibold">Qty</th>
                    <th className="text-right py-3 font-semibold">Price</th>
                    <th className="text-right py-3 font-semibold">Tax</th>
                    <th className="text-right py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-center">{item.quantity || 0}</td>
                      <td className="py-3 text-right">{(item.unitPrice || 0).toFixed(2)}</td>
                      <td className="py-3 text-right">{(item.taxAmount || 0).toFixed(2)}</td>
                      <td className="py-3 text-right font-medium">{(item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals and QR Code */}
            <div className="flex justify-between items-end mb-8">
              {/* QR Code Section */}
              <div className="flex-shrink-0">
                {displayQrCode ? (
                  <div className="text-center">
                    <div className="border border-gray-200 rounded-lg p-3 bg-white inline-block">
                      <Image
                        src={displayQrCode}
                        alt="Invoice QR Code"
                        width={120}
                        height={120}
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                      <QrCode className="h-3 w-3" />
                      {qrLabel}
                    </p>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <QrCode className="h-8 w-8 mx-auto mb-1" />
                      <p className="text-xs">QR Code</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="w-64">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{(invoice.subtotal || 0).toFixed(2)} {invoice.currency}</span>
                  </div>
                  {(invoice.totalDiscount || 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-{(invoice.totalDiscount || 0).toFixed(2)} {invoice.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (VAT):</span>
                    <span>{(invoice.totalTax || 0).toFixed(2)} {invoice.currency}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{(invoice.grandTotal || 0).toFixed(2)} {invoice.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            {(invoice.notes || invoice.termsAndConditions) && (
              <div className="border-t border-gray-200 pt-6">
                {invoice.notes && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                    <p className="text-gray-700">{invoice.notes}</p>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Terms and Conditions:</h4>
                    <p className="text-gray-700">{invoice.termsAndConditions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;