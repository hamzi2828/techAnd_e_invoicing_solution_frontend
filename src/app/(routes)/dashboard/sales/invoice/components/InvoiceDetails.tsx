import React from 'react';
import { Calendar, FileText, User, Building2 } from 'lucide-react';

interface InvoiceDetailsProps {
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    status: string;
    invoiceType?: string;
    paymentTerms?: string;
    currency: string;
  };
  customer: {
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
  } | null;
  company?: {
    companyName?: string;
    companyNameAr?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      district?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    taxIdNumber?: string;
    vatNumber?: string;
  } | null;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice, customer, company }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 px-6 py-8 text-white relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-wide">INVOICE</h1>
            <p className="text-blue-100 text-lg font-medium">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">Status</span>
            </div>
            <div className="relative">
              <span className={`
                inline-block px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-lg
                border-2 shadow-lg transform rotate-12 origin-center
                ${invoice.status === 'paid'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-900/30'
                  : invoice.status === 'sent'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-blue-900/30'
                  : invoice.status === 'overdue'
                  ? 'bg-red-600 border-red-400 text-white shadow-red-900/30'
                  : invoice.status === 'draft'
                  ? 'bg-gray-600 border-gray-400 text-white shadow-gray-900/30'
                  : 'bg-orange-600 border-orange-400 text-white shadow-orange-900/30'
                }
              `}>
                {invoice.status === 'overdue' ? 'OVERDUE' :
                 invoice.status === 'paid' ? 'PAID' :
                 invoice.status === 'sent' ? 'SENT' :
                 invoice.status === 'draft' ? 'DRAFT' :
                 invoice.status.toUpperCase()}
              </span>
              {/* Stamp effect shadow */}
              <div className={`
                absolute inset-0 rounded-lg transform rotate-12 opacity-20 -z-10
                ${invoice.status === 'paid' ? 'bg-green-700' :
                  invoice.status === 'sent' ? 'bg-blue-700' :
                  invoice.status === 'overdue' ? 'bg-red-700' :
                  invoice.status === 'draft' ? 'bg-gray-700' :
                  'bg-orange-700'
                }
              `} style={{ transform: 'rotate(12deg) translate(2px, 2px)' }}></div>
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="w-full h-full border-4 border-white/20 rounded-full transform rotate-45"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
          <div className="w-full h-full border-4 border-white/20 rounded-full transform -rotate-12"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Invoice Information Section - Full Width at Top */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-primary-200">
            Invoice Information
          </h3>
          <div className="grid grid-cols-5 gap-4">

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Issue Date</p>
                <p className="text-gray-900 font-semibold">{formatDate(invoice.invoiceDate)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Due Date</p>
                <p className="text-gray-900 font-semibold">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Invoice Type</p>
                <p className="text-gray-900 font-semibold capitalize">{invoice.invoiceType ? invoice.invoiceType.replace('_', ' ') : 'Standard'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700"> Terms</p>
                <p className="text-gray-900 font-semibold">{invoice.paymentTerms || ''}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Currency</p>
                <p className="text-gray-900 font-semibold">{invoice.currency}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill From and Bill To Section - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bill From - Company Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-primary-200">
              Bill From
            </h3>
            <div className="space-y-4">
              {company ? (
                <>
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-primary-200">
                    <Building2 className="h-6 w-6 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary-700">Company</p>
                      <p className="text-xl font-bold text-gray-900">
                        {company.companyName || 'N/A'}
                      </p>
                      {company.companyNameAr && (
                        <p className="text-sm text-gray-600 mt-1">{company.companyNameAr}</p>
                      )}
                    </div>
                  </div>

                  {company.email && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-gray-900 font-semibold">{company.email}</p>
                      </div>
                    </div>
                  )}

                  {company.phone && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-gray-900 font-semibold">{company.phone}</p>
                      </div>
                    </div>
                  )}

                  {company.address && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <div className="text-gray-900 font-semibold">
                          {company.address.street && <p>{company.address.street}</p>}
                          {company.address.district && <p>{company.address.district}</p>}
                          <p>
                            {[
                              company.address.city,
                              company.address.postalCode
                            ].filter(Boolean).join(' ')}
                          </p>
                          {company.address.country && <p>{company.address.country}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {company.taxIdNumber && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Tax ID</p>
                        <p className="text-gray-900 font-semibold">{company.taxIdNumber}</p>
                      </div>
                    </div>
                  )}

                  {company.vatNumber && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">VAT Number</p>
                        <p className="text-gray-900 font-semibold">{company.vatNumber}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500 p-4 bg-gray-50 rounded-lg">
                  No company information available
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-primary-200">
              Bill To
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-primary-200">
                <User className="h-6 w-6 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-700">Customer</p>
                  <p className="text-xl font-bold text-gray-900">
                    {customer?.customerName || 'N/A'}
                  </p>
                </div>
              </div>

              {customer?.contactInfo?.email && (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900 font-semibold">{customer.contactInfo.email}</p>
                  </div>
                </div>
              )}

              {customer?.contactInfo?.phone && (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900 font-semibold">{customer.contactInfo.phone}</p>
                  </div>
                </div>
              )}

              {customer?.address && (
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <div className="text-gray-900 font-semibold">
                      {customer.address.street && <p>{customer.address.street}</p>}
                      <p>
                        {[
                          customer.address.city,
                          customer.address.state,
                          customer.address.postalCode
                        ].filter(Boolean).join(', ')}
                      </p>
                      {customer.address.country && <p>{customer.address.country}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;