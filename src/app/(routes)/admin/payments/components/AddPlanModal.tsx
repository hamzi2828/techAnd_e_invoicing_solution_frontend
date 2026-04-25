import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Plan, ValidationError } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plan: Omit<Plan, 'id'>) => Promise<boolean>;
  serverErrors?: ValidationError[];
  isLoading?: boolean;
}

export default function AddPlanModal({ isOpen, onClose, onAdd, serverErrors = [], isLoading = false }: AddPlanModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    monthlyPrice: '',
    yearlyPrice: '',
    subtitle: '',
    badge: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  // Convert server errors to local error format
  useEffect(() => {
    if (serverErrors && serverErrors.length > 0) {
      const serverErrorsMap: Record<string, string> = {};
      serverErrors.forEach(error => {
        if (error.path) {
          serverErrorsMap[error.path] = error.msg;
        }
      });
      setErrors(prev => ({ ...prev, ...serverErrorsMap }));
    }
  }, [serverErrors]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('admin.payments.addPlanModal.planNameRequired');
    }

    if (!formData.monthlyPrice || isNaN(Number(formData.monthlyPrice)) || Number(formData.monthlyPrice) <= 0) {
      newErrors.monthlyPrice = t('admin.payments.addPlanModal.monthlyPriceRequired');
    }

    if (!formData.yearlyPrice || isNaN(Number(formData.yearlyPrice)) || Number(formData.yearlyPrice) <= 0) {
      newErrors.yearlyPrice = t('admin.payments.addPlanModal.yearlyPriceRequired');
    }

    if (!formData.subtitle.trim()) {
      newErrors.subtitle = t('admin.payments.addPlanModal.subtitleRequired');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    const newPlan: Omit<Plan, 'id'> = {
      name: formData.name.trim(),
      monthlyPrice: Number(formData.monthlyPrice),
      yearlyPrice: Number(formData.yearlyPrice),
      subtitle: formData.description.trim() || formData.subtitle.trim(),
      featured: false,
      badge: formData.badge.trim() || undefined,
    };

    try {
      const success = await onAdd(newPlan);
      if (success) {
        handleClose();
      }
    } catch (error) {
      // Error handling is done by the parent component via serverErrors
      console.error('Error adding plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      monthlyPrice: '',
      yearlyPrice: '',
      subtitle: '',
      badge: '',
      description: '',
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('admin.payments.addPlanModal.title')}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.payments.addPlanModal.planName')} *
            </label>
            <input
              type="text"
              id="planName"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Enterprise"
              autoFocus
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="monthlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.payments.addPlanModal.monthlyPrice')} *
              </label>
              <input
                type="number"
                id="monthlyPrice"
                value={formData.monthlyPrice}
                onChange={(e) => handleInputChange('monthlyPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.monthlyPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="99"
                min="0"
                step="0.01"
              />
              {errors.monthlyPrice && <p className="mt-1 text-sm text-red-600">{errors.monthlyPrice}</p>}
            </div>

            <div>
              <label htmlFor="yearlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.payments.addPlanModal.yearlyPrice')} *
              </label>
              <input
                type="number"
                id="yearlyPrice"
                value={formData.yearlyPrice}
                onChange={(e) => handleInputChange('yearlyPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.yearlyPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="990"
                min="0"
                step="0.01"
              />
              {errors.yearlyPrice && <p className="mt-1 text-sm text-red-600">{errors.yearlyPrice}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.payments.addPlanModal.description')} *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('admin.payments.addPlanModal.descriptionPlaceholder')}
              rows={3}
              minLength={10}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className="text-sm text-red-600">{errors.description}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  {formData.description.length}/500 characters (min 10)
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.payments.addPlanModal.subtitle')} *
            </label>
            <input
              type="text"
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.subtitle ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('admin.payments.addPlanModal.subtitlePlaceholder')}
            />
            {errors.subtitle && <p className="mt-1 text-sm text-red-600">{errors.subtitle}</p>}
          </div>

          <div>
            <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.payments.addPlanModal.badge')}
            </label>
            <input
              type="text"
              id="badge"
              value={formData.badge}
              onChange={(e) => handleInputChange('badge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('admin.payments.addPlanModal.badgePlaceholder')}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
          >
{t('admin.payments.addPlanModal.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:via-blue-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('admin.payments.addPlanModal.creating')}
              </div>
            ) : (
              t('admin.payments.addPlanModal.addPlan')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}