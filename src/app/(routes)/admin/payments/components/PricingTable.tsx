import React, { useState } from 'react';
import {
  Check,
  Lock,
  Star,
  Crown,
  Loader2,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Plan, Feature } from '../types';

interface PricingTableProps {
  plans: Plan[];
  features: Feature[];
  isYearly: boolean;
  isEditMode: boolean;
  onToggleFeature: (featureId: string, planId: string) => Promise<void>;
  onTogglePlanFeatured: (planId: string) => void;
  onTogglePlanStatus: (planId: string) => Promise<boolean>;
  onToggleFeatureStatus: (featureId: string) => void;
  onPlanEdit: (planId: string, field: keyof Plan, value: Plan[keyof Plan]) => void;
  onFeatureEdit: (featureId: string, oldName: string, newName: string) => Promise<void>;
}

export default function PricingTable({
  plans,
  features,
  isYearly,
  isEditMode,
  onToggleFeature,
  onTogglePlanFeatured,
  onTogglePlanStatus,
  onToggleFeatureStatus,
  onPlanEdit,
  onFeatureEdit,
}: PricingTableProps) {
  const [toggleLoading, setToggleLoading] = useState<string>('');
  const [statusLoading, setStatusLoading] = useState<string>('');
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingFeatureName, setEditingFeatureName] = useState<string>('');
  const [featureEditLoading, setFeatureEditLoading] = useState<boolean>(false);

  const handleFeatureEditStart = (feature: Feature) => {
    setEditingFeatureId(feature.id);
    setEditingFeatureName(feature.name);
  };

  const handleFeatureEditSave = async (feature: Feature) => {
    if (!editingFeatureName.trim() || editingFeatureName.trim() === feature.name) {
      setEditingFeatureId(null);
      setEditingFeatureName('');
      return;
    }

    setFeatureEditLoading(true);
    try {
      await onFeatureEdit(feature.id, feature.name, editingFeatureName.trim());
      setEditingFeatureId(null);
      setEditingFeatureName('');
    } catch (error) {
      console.error('Error editing feature:', error);
    } finally {
      setFeatureEditLoading(false);
    }
  };

  const handleFeatureEditCancel = () => {
    setEditingFeatureId(null);
    setEditingFeatureName('');
  };
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl shadow-sm border border-primary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Subscription plans comparison">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-4 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">Features</span>
                
                </div>
              </th>
              {plans.map((plan) => (
                <th key={plan.id} className={`px-6 py-4 text-center relative ${plan.isActive === false ? 'opacity-60' : ''}`}>
                  <div className={`relative ${plan.featured ? 'ring-2 ring-primary-500 rounded-t-lg bg-gradient-to-b from-primary-50 to-blue-50' : ''} ${plan.isActive === false ? 'grayscale' : ''}`}>
                    {plan.isActive === false && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                          <ToggleLeft className="h-3 w-3 mr-1" />
                          Inactive
                        </div>
                      </div>
                    )}
                    {plan.featured && plan.isActive !== false && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                          <Crown className="h-3 w-3 mr-1" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.trim().length > 0) {
                              onPlanEdit(plan.id, 'name', value);
                            }
                          }}
                          onBlur={(e) => {
                            // If field is empty on blur, restore original value
                            if (!e.target.value.trim()) {
                              e.target.value = plan.name;
                            }
                          }}
                          className="text-xl font-bold text-gray-900 bg-transparent border-b border-gray-300 text-center focus:outline-none focus:border-primary-500"
                          placeholder="Enter plan name"
                        />
                      ) : (
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      )}
                      
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">
                          SAR {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-gray-600">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      </div>
                      
                      {plan.badge && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Star className="h-3 w-3 mr-1" />
                            {plan.badge}
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-4 mb-6">
                        <button className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                          plan.featured
                            ? 'bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg'
                            : 'border border-primary-200 text-gray-700 hover:bg-primary-50'
                        }`}>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={plan.subtitle}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.trim().length > 0) {
                                  onPlanEdit(plan.id, 'subtitle', value);
                                }
                              }}
                              onBlur={(e) => {
                                // If field is empty on blur, restore original value
                                if (!e.target.value.trim()) {
                                  e.target.value = plan.subtitle;
                                }
                              }}
                              className="bg-transparent text-center focus:outline-none w-full"
                              placeholder="Enter plan subtitle"
                            />
                          ) : (
                            plan.subtitle
                          )}
                        </button>
                      </div>
                      
                      {isEditMode && (
                        <div className="flex justify-center space-x-2 mb-4">
                          <button
                            onClick={() => onTogglePlanFeatured(plan.id)}
                            className="text-xs text-gray-600 hover:text-primary-600"
                            title="Toggle featured"
                          >
                            <Star className={`h-4 w-4 ${plan.featured ? 'fill-primary-500 text-primary-500' : ''}`} />
                          </button>
                          <button
                            onClick={async () => {
                              setStatusLoading(plan.id);
                              try {
                                await onTogglePlanStatus(plan.id);
                              } finally {
                                setStatusLoading('');
                              }
                            }}
                            className={`text-xs flex items-center ${plan.isActive !== false ? 'text-green-600 hover:text-red-600' : 'text-red-600 hover:text-green-600'}`}
                            title={plan.isActive !== false ? 'Deactivate plan' : 'Activate plan'}
                            disabled={statusLoading === plan.id}
                          >
                            {statusLoading === plan.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : plan.isActive !== false ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={feature.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${feature.isActive === false ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    {isEditMode && editingFeatureId === feature.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editingFeatureName}
                          onChange={(e) => setEditingFeatureName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleFeatureEditSave(feature);
                            } else if (e.key === 'Escape') {
                              handleFeatureEditCancel();
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm font-medium text-gray-900 border border-primary-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          autoFocus
                          disabled={featureEditLoading}
                        />
                        {featureEditLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleFeatureEditSave(feature)}
                              className="text-green-600 hover:text-green-700"
                              title="Save"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleFeatureEditCancel}
                              className="text-gray-600 hover:text-gray-700"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {isEditMode && (
                          <button
                            onClick={() => handleFeatureEditStart(feature)}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                            title="Edit feature name"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                      </div>
                    )}
                    {isEditMode && editingFeatureId !== feature.id && (
                      <button
                        onClick={() => onToggleFeatureStatus(feature.id)}
                        className={`ml-2 ${feature.isActive !== false ? 'text-green-600 hover:text-red-600' : 'text-red-600 hover:text-green-600'}`}
                        title={feature.isActive !== false ? 'Deactivate feature' : 'Activate feature'}
                      >
                        {feature.isActive !== false ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
                {plans.map((plan) => {
                  // For each plan, check if this feature is included in the plan's features array
                  const isAvailable = plan.features?.some(f => 
                    typeof f === 'object' && f !== null && 'name' in f && 
                    f.name === feature.name && f.included !== false
                  ) || false;
                  
                  return (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <button
                        onClick={async () => {
                          if (isEditMode) {
                            const loadingKey = `${feature.id}-${plan.id}`;
                            setToggleLoading(loadingKey);
                            try {
                              await onToggleFeature(feature.id, plan.id);
                            } catch (error) {
                              console.error('Error toggling feature:', error);
                            } finally {
                              setToggleLoading('');
                            }
                          }
                        }}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                          isAvailable 
                            ? 'bg-green-100 text-green-600 hover:bg-red-100 hover:text-red-600' 
                            : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                        } ${isEditMode ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                        disabled={!isEditMode}
                        aria-label={`${feature.name} ${isAvailable ? 'included' : 'not included'} in ${plan.name} plan. ${isEditMode ? 'Click to toggle' : ''}`}
                        title={isEditMode ? (isAvailable ? 'Click to exclude feature' : 'Click to include feature') : ''}
                      >
                        {toggleLoading === `${feature.id}-${plan.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isAvailable ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-gradient-to-br from-white via-primary-50 to-blue-50 rounded-2xl shadow-sm border border-primary-200 p-6 ${plan.featured && plan.isActive !== false ? 'ring-2 ring-primary-500' : ''} ${plan.isActive === false ? 'opacity-60 grayscale' : ''}`}>
            <div className="text-center mb-6">
              {plan.isActive === false && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white shadow-lg">
                    <ToggleLeft className="h-3 w-3 mr-1" />
                    Inactive
                  </span>
                </div>
              )}
              {plan.featured && plan.isActive !== false && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white shadow-lg">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}
              {isEditMode ? (
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim().length > 0) {
                      onPlanEdit(plan.id, 'name', value);
                    }
                  }}
                  onBlur={(e) => {
                    // If field is empty on blur, restore original value
                    if (!e.target.value.trim()) {
                      e.target.value = plan.name;
                    }
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-b border-gray-300 text-center focus:outline-none focus:border-primary-500"
                  placeholder="Enter plan name"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              )}
              <div className="mt-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  SAR {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-gray-600">/{isYearly ? 'year' : 'month'}</span>
              </div>
              {plan.badge && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-blue-100 text-primary-800 border border-primary-200">
                    <Star className="h-3 w-3 mr-1" />
                    {plan.badge}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {features.map((feature) => {
                // Check if this feature is included in the plan's features array
                const isAvailable = plan.features?.some(f =>
                  typeof f === 'object' && f !== null && 'name' in f &&
                  f.name === feature.name && f.included !== false
                ) || false;

                return (
                  <div key={feature.id} className={`flex items-center justify-between ${feature.isActive === false ? 'opacity-50' : ''}`}>
                    {isEditMode && editingFeatureId === feature.id ? (
                      <div className="flex items-center space-x-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingFeatureName}
                          onChange={(e) => setEditingFeatureName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleFeatureEditSave(feature);
                            } else if (e.key === 'Escape') {
                              handleFeatureEditCancel();
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm text-gray-700 border border-primary-500 rounded-lg focus:outline-none"
                          autoFocus
                          disabled={featureEditLoading}
                        />
                        {featureEditLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
                        ) : (
                          <button
                            onClick={() => handleFeatureEditSave(feature)}
                            className="text-green-600"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {isEditMode && (
                          <>
                            <button
                              onClick={() => handleFeatureEditStart(feature)}
                              className="text-gray-400 hover:text-primary-600"
                              title="Edit feature"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onToggleFeatureStatus(feature.id)}
                              className={`${feature.isActive !== false ? 'text-green-500 hover:text-red-500' : 'text-red-500 hover:text-green-500'}`}
                              title={feature.isActive !== false ? 'Deactivate' : 'Activate'}
                            >
                              {feature.isActive !== false ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                        <span className="text-sm text-gray-700">{feature.name}</span>
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        if (isEditMode) {
                          const loadingKey = `${feature.id}-${plan.id}`;
                          setToggleLoading(loadingKey);
                          try {
                            await onToggleFeature(feature.id, plan.id);
                          } catch (error) {
                            console.error('Error toggling feature:', error);
                          } finally {
                            setToggleLoading('');
                          }
                        }
                      }}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200 ${
                        isAvailable 
                          ? 'bg-green-100 text-green-600 hover:bg-red-100 hover:text-red-600' 
                          : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                      } ${isEditMode ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                      disabled={!isEditMode}
                    >
                      {toggleLoading === `${feature.id}-${plan.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isAvailable ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Lock className="h-2 w-2" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6">
              <button className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                plan.featured
                  ? 'bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white hover:from-indigo-700 hover:via-blue-600 hover:to-primary shadow-lg'
                  : 'border border-primary-200 text-gray-700 hover:bg-primary-50'
              }`}>
                {isEditMode ? (
                  <input
                    type="text"
                    value={plan.subtitle}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.trim().length > 0) {
                        onPlanEdit(plan.id, 'subtitle', value);
                      }
                    }}
                    onBlur={(e) => {
                      // If field is empty on blur, restore original value
                      if (!e.target.value.trim()) {
                        e.target.value = plan.subtitle;
                      }
                    }}
                    className="bg-transparent text-center focus:outline-none w-full"
                    placeholder="Enter plan subtitle"
                  />
                ) : (
                  plan.subtitle
                )}
              </button>
            </div>

            {isEditMode && (
              <div className="flex justify-center space-x-4 mt-4 pt-4 border-t border-primary-100">
                <button
                  onClick={() => onTogglePlanFeatured(plan.id)}
                  className="text-xs text-gray-600 hover:text-primary-600 flex items-center"
                  title="Toggle featured"
                >
                  <Star className={`h-4 w-4 mr-1 ${plan.featured ? 'fill-primary-500 text-primary-500' : ''}`} />
                  Featured
                </button>
                <button
                  onClick={async () => {
                    setStatusLoading(plan.id);
                    try {
                      await onTogglePlanStatus(plan.id);
                    } finally {
                      setStatusLoading('');
                    }
                  }}
                  className={`text-xs flex items-center ${plan.isActive !== false ? 'text-green-600 hover:text-red-600' : 'text-red-600 hover:text-green-600'}`}
                  title={plan.isActive !== false ? 'Deactivate plan' : 'Activate plan'}
                  disabled={statusLoading === plan.id}
                >
                  {statusLoading === plan.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : plan.isActive !== false ? (
                    <ToggleRight className="h-5 w-5 mr-1" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 mr-1" />
                  )}
                  {plan.isActive !== false ? 'Active' : 'Inactive'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}