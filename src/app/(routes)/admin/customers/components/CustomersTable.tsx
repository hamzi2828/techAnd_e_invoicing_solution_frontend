import React from 'react';
import {
  Eye,
  Edit,
  Trash2,
  Users,
  Building,
  Mail,
  Phone,
} from 'lucide-react';
import { CustomerDetails, CustomerAction } from '../types';

interface CustomersTableProps {
  customers: CustomerDetails[];
  selectedCustomers: string[];
  isLoading?: boolean;
  onSelectCustomer: (id: string) => void;
  onSelectAll: () => void;
  onCustomerAction: (action: CustomerAction, customer: CustomerDetails) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  selectedCustomers,
  isLoading = false,
  onSelectCustomer,
  onSelectAll,
  onCustomerAction,
}) => {
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const allSelected = customers.length > 0 && customers.every(c => selectedCustomers.includes(c.id));
  const someSelected = selectedCustomers.length > 0 && !allSelected;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or add some customers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoices
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => onSelectCustomer(customer.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      {customer.vatNumber && (
                        <p className="text-xs text-gray-500">VAT: {customer.vatNumber}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      {customer.email || 'No email'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {customer.phone || 'No phone'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    customer.type === 'business'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {customer.type === 'business' ? (
                      <>
                        <Building className="h-3 w-3 mr-1" />
                        Business
                      </>
                    ) : (
                      <>
                        <Users className="h-3 w-3 mr-1" />
                        Individual
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{customer.totalInvoices}</p>
                    <p className="text-xs text-gray-500">
                      Last: {formatDate(customer.lastInvoiceDate)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(customer.totalRevenue, customer.currency)}
                  </p>
                  {customer.averageInvoiceValue > 0 && (
                    <p className="text-xs text-gray-500">
                      Avg: {formatCurrency(customer.averageInvoiceValue, customer.currency)}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={customer.status === 'active'}
                      onChange={(e) => {
                        const newStatus = e.target.checked ? 'active' : 'inactive';
                        const action = e.target.checked ? 'activate' : 'deactivate';
                        onCustomerAction(action, customer);
                      }}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {customer.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onCustomerAction('view', customer)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="View customer"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onCustomerAction('edit', customer)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit customer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onCustomerAction('delete', customer)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersTable;