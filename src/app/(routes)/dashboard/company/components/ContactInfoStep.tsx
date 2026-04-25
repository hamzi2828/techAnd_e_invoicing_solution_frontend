import React from 'react';
import { CompanyData, ValidationErrors, ValidFields } from './types';
import { ValidationMessage } from './ValidationMessage';

interface ContactInfoStepProps {
  data: CompanyData['contactInfo'];
  validationErrors: ValidationErrors;
  validFields: ValidFields;
  onChange: (field: string, value: string) => void;
}

const SAUDI_CITIES = [
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar',
  'Dhahran', 'Jubail', 'Tabuk', 'Abha', 'Khamis Mushait',
  'Hail', 'Buraidah', 'Qassim', 'Jazan', 'Najran', 'Al-Ahsa',
  'Yanbu', 'Taif', 'Arar', 'Sakaka', 'Al-Baha'
];

const SAUDI_PROVINCES = [
  'Riyadh Province', 'Makkah Province', 'Madinah Province',
  'Eastern Province', 'Asir Province', 'Tabuk Province',
  'Qassim Province', 'Ha\'il Province', 'Jazan Province',
  'Najran Province', 'Al-Baha Province', 'Northern Borders Province',
  'Al-Jawf Province'
];

export const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
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
            Email Address *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              validationErrors.email
                ? 'border-red-500'
                : validFields.email
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            placeholder="company@example.com"
          />
          <ValidationMessage error={validationErrors.email} />
          {validFields.email && !validationErrors.email && (
            <ValidationMessage success="✓ Valid email address" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number * (Saudi mobile)
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              validationErrors.phone
                ? 'border-red-500'
                : validFields.phone
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            placeholder="05XXXXXXXX or +9665XXXXXXXX"
          />
          <ValidationMessage error={validationErrors.phone} />
          {validFields.phone && !validationErrors.phone && (
            <ValidationMessage success="✓ Valid Saudi mobile number" />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website (Optional)
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => onChange('website', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              validationErrors.website ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://www.yourcompany.com"
          />
          <ValidationMessage error={validationErrors.website} />
          <p className="mt-1 text-sm text-gray-500">Must start with http:// or https://</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <textarea
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              validationErrors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your street address"
          />
          <ValidationMessage error={validationErrors.address} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District/Neighborhood *
          </label>
          <input
            type="text"
            value={data.district}
            onChange={(e) => onChange('district', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              validationErrors.district ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter district"
          />
          <ValidationMessage error={validationErrors.district} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <select
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              validationErrors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select City</option>
            {SAUDI_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <ValidationMessage error={validationErrors.city} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Province *
          </label>
          <select
            value={data.state}
            onChange={(e) => onChange('state', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              validationErrors.state ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Province</option>
            {SAUDI_PROVINCES.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
          <ValidationMessage error={validationErrors.state} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postal Code * (5 digits)
          </label>
          <input
            type="text"
            value={data.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              validationErrors.postalCode
                ? 'border-red-500'
                : validFields.postalCode
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            placeholder="12345"
            maxLength={5}
          />
          <ValidationMessage error={validationErrors.postalCode} />
          {validFields.postalCode && !validationErrors.postalCode && (
            <ValidationMessage success="✓ Valid postal code" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <select
            value={data.country}
            onChange={(e) => onChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
            disabled
          >
            <option value="Saudi Arabia">Saudi Arabia</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">Currently only Saudi Arabia is supported</p>
        </div>
      </div>
    </div>
  );
};
