import React from 'react';
import { MapPin } from 'lucide-react';
import type { AddressInformationFormProps } from '../../types';

const AddressInformationForm: React.FC<AddressInformationFormProps> = ({
  formData,
  onUpdateField,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-lime-600" />
        <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            value={formData.streetAddress}
            onChange={(e) => onUpdateField('streetAddress', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Enter street address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onUpdateField('city', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Enter city"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District/Province *
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => onUpdateField('district', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Enter district/province"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code *
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => onUpdateField('postalCode', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Enter postal code"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            value={formData.country}
            onChange={(e) => onUpdateField('country', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="">Select Country</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Qatar">Qatar</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Bahrain">Bahrain</option>
            <option value="Oman">Oman</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Building Number
          </label>
          <input
            type="text"
            value={formData.buildingNumber}
            onChange={(e) => onUpdateField('buildingNumber', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Building number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Number
          </label>
          <input
            type="text"
            value={formData.additionalNumber}
            onChange={(e) => onUpdateField('additionalNumber', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Additional number"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressInformationForm;