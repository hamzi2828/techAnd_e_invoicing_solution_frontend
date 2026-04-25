import React from 'react';
import { CompanyData, ValidationErrors, ValidFields } from './types';
import { ValidationMessage } from './ValidationMessage';

interface BasicInfoStepProps {
  data: CompanyData['basicInfo'];
  validationErrors: ValidationErrors;
  validFields: ValidFields;
  onChange: (field: string, value: string) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  validationErrors,
  validFields,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              validationErrors.companyName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your company name"
          />
          <ValidationMessage error={validationErrors.companyName} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trade Name
          </label>
          <input
            type="text"
            value={data.tradeName}
            onChange={(e) => onChange('tradeName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter trade name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration Number * (10 digits)
          </label>
          <input
            type="text"
            value={data.registrationNumber}
            onChange={(e) => onChange('registrationNumber', e.target.value)}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              validationErrors.registrationNumber
                ? 'border-red-500'
                : validFields.registrationNumber
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter 10-digit registration number"
            maxLength={10}
          />
          <ValidationMessage error={validationErrors.registrationNumber} />
          {validFields.registrationNumber && !validationErrors.registrationNumber && (
            <ValidationMessage success="✓ Valid registration number" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Number * (Must start with 3, 15 digits)
          </label>
          <input
            type="text"
            value={data.taxNumber}
            onChange={(e) => onChange('taxNumber', e.target.value)}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              validationErrors.taxNumber
                ? 'border-red-500'
                : validFields.taxNumber
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            placeholder="3XXXXXXXXXXXXXX"
            maxLength={15}
          />
          <ValidationMessage error={validationErrors.taxNumber} />
          {validFields.taxNumber && !validationErrors.taxNumber && (
            <ValidationMessage success="✓ Valid tax number" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry *
          </label>
          <select
            value={data.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              validationErrors.industry ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Construction">Construction</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
            <option value="Finance">Finance</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Transportation">Transportation</option>
            <option value="Tourism">Tourism</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Energy">Energy</option>
            <option value="Consulting">Consulting</option>
            <option value="Other">Other</option>
          </select>
          <ValidationMessage error={validationErrors.industry} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Established Date
          </label>
          <input
            type="date"
            value={data.establishedDate}
            onChange={(e) => onChange('establishedDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
};
