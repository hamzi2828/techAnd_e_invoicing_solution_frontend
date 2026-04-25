import React from 'react';
import { Mail, Phone, Globe } from 'lucide-react';
import type { BasicInformationFormProps } from '../../types';

const BasicInformationForm: React.FC<BasicInformationFormProps> = ({
  customerType,
  formData,
  onUpdateField,
  fieldErrors = {},
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {customerType === 'business' ? 'Company Name' : 'Full Name'} *
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => onUpdateField('customerName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.customerName
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary focus:border-primary'
            }`}
            placeholder={customerType === 'business' ? 'Enter company name' : 'Enter full name'}
          />
          {fieldErrors.customerName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.customerName}</p>
          )}
        </div>

        {customerType === 'business' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commercial Registration Number
              </label>
              <input
                type="text"
                value={formData.commercialRegistrationNumber}
                onChange={(e) => onUpdateField('commercialRegistrationNumber', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="CR Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => onUpdateField('industry', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Construction">Construction</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VAT Number *
          </label>
          <input
            type="text"
            value={formData.vatNumber}
            onChange={(e) => onUpdateField('vatNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.vatNumber
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary focus:border-primary'
            }`}
            placeholder="300XXXXXXXXX003"
          />
          {fieldErrors.vatNumber && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.vatNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax ID
          </label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) => onUpdateField('taxId', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tax identification number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onUpdateField('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary focus:border-primary'
              }`}
              placeholder="email@example.com"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onUpdateField('phone', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.phone
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary focus:border-primary'
              }`}
              placeholder="+966 XX XXX XXXX"
            />
          </div>
          {fieldErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
          )}
        </div>

        {customerType === 'business' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => onUpdateField('contactPerson', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Primary contact person name"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => onUpdateField('website', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://www.example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Group
          </label>
          <select
            value={formData.customerGroup}
            onChange={(e) => onUpdateField('customerGroup', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Premium">Premium</option>
            <option value="Wholesale">Wholesale</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationForm;