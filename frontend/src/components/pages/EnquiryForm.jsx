import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { settingsAPI, enquiryAPI } from '../../utils/api';
import { ActionIcons } from '../ui/Icons';

const EnquiryForm = ({ onSuccess }) => {
  const { createEnquiry, loading: appLoading } = useAppContext();
  
  const [formConfig, setFormConfig] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('mobile'); 
  const [existingEnquiry, setExistingEnquiry] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const config = await settingsAPI.getFormConfig();
      if (Array.isArray(config) && config.length > 0) {
        setFormConfig(config);
        
        // Initialize form data
        const initial = {};
        config.forEach(f => {
          initial[f.id] = '';
        });
        setFormData(initial);
      }
    } catch (err) {
      console.error('Failed to load form config', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    formConfig.forEach(f => {
      const val = String(formData[f.id] || '');
      
      if (f.required && !val.trim()) {
        newErrors[f.id] = `${f.label} is required`;
      }
      
      if (f.id === 'customerEmail' && val.trim() && !/\S+@\S+\.\S+/.test(val)) {
        newErrors[f.id] = 'Email is invalid';
      }

      if (f.id === 'customerMobile') {
        if (f.required && !val.trim()) {
          newErrors[f.id] = 'Mobile number is required';
        } else if (val.trim() && !/^[0-9]{10}$/.test(val.replace(/\D/g, ''))) {
          newErrors[f.id] = 'Mobile number must be 10 digits';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const normalizeMobile = (value) => (value || '').replace(/\D/g, '');

  const prefillFromEnquiry = (e) => {
    if (!e) return;
    const initial = { ...formData };
    
    // Fill core fields
    if (initial.customerName !== undefined) initial.customerName = e.customerName || '';
    if (initial.customerEmail !== undefined) initial.customerEmail = e.customerEmail || '';
    if (initial.customerMobile !== undefined) initial.customerMobile = e.customerMobile || e.customerPhone || initial.customerMobile;
    if (initial.propertyType !== undefined) initial.propertyType = e.propertyType || '';
    if (initial.budgetRange !== undefined) initial.budgetRange = e.budgetRange || '';
    if (initial.source !== undefined) initial.source = e.source || '';
    if (initial.remarks !== undefined) initial.remarks = e.remarks || '';
    
    // Fill custom fields
    if (e.customData) {
      Object.keys(e.customData).forEach(k => {
        if (initial[k] !== undefined) initial[k] = e.customData[k];
      });
    }
    
    setFormData(initial);
  };

  const handleMobileContinue = async () => {
    const mobile = normalizeMobile(formData.customerMobile || '');
    if (!/^\d{10}$/.test(mobile)) {
      setErrors(prev => ({ ...prev, customerMobile: 'Enter valid 10-digit mobile number' }));
      return;
    }
    try {
      const page = await enquiryAPI.search(mobile, 0, 5);
      const match = page?.content?.find((x) => normalizeMobile(x.customerMobile || x.customerPhone) === mobile) || null;
      if (match) {
        setExistingEnquiry(match);
        prefillFromEnquiry(match);
        setIsEditMode(false);
      } else {
        setExistingEnquiry(null);
        setIsEditMode(true);
      }
    } catch (e) {
      setExistingEnquiry(null);
      setIsEditMode(true);
    } finally {
      setStep('form');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Split into core fields and customData
      const payload = {
        customData: {}
      };

      formConfig.forEach(f => {
        if (f.isCore) {
          if (f.id === 'customerMobile') {
            payload[f.id] = (formData[f.id] || '').replace(/\D/g, '');
          } else {
            payload[f.id] = formData[f.id];
          }
        } else {
          payload.customData[f.id] = formData[f.id];
        }
      });

      // Default source if not provided in dynamic form
      if (!payload.source) {
        payload.source = "WEBSITE";
      }

      const newEnquiry = await createEnquiry(payload);
      setSubmittedEnquiry(newEnquiry);

      // Reset
      const resetForm = {};
      formConfig.forEach(f => resetForm[f.id] = '');
      setFormData(resetForm);

      alert(`Enquiry submitted successfully! Reference ID: ${newEnquiry.id}`);
      if (onSuccess) onSuccess(newEnquiry);
    } catch (error) {
      alert(`Failed to submit enquiry: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ActionIcons.loading size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  // Find mobile field for the first step
  const mobileField = formConfig.find(f => f.id === 'customerMobile');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-6">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <Card className="p-8 shadow-2xl rounded-3xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Enquiry Form
            </h1>
            <p className="text-gray-500">
              Please fill out the form below to submit your enquiry
            </p>
          </div>
          
          {!submittedEnquiry && step === 'mobile' && mobileField && (
            <div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {mobileField.label} *
                </label>
                <input
                  type="tel"
                  name="customerMobile"
                  value={formData.customerMobile || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.customerMobile ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter 10-digit mobile number"
                  pattern="[0-9]{10}"
                  required
                />
                {errors.customerMobile && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <ActionIcons.close size={14} /> {errors.customerMobile}
                  </p>
                )}
              </div>
              <div className="pt-8">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30"
                  disabled={appLoading}
                  onClick={handleMobileContinue}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {!submittedEnquiry && step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {existingEnquiry && (
              <div className="flex items-start justify-between p-4 mb-4 rounded-xl border bg-amber-50 border-amber-200">
                <div className="text-sm text-amber-800 font-medium pt-1">
                  Existing record found. Review and submit, or click Edit.
                </div>
                {!isEditMode && (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditMode(true)}>
                    Edit
                  </Button>
                )}
              </div>
            )}
            
            {formConfig.map(f => {
              if (f.id === 'customerMobile') {
                return (
                  <div key={f.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {f.label} {f.required && '*'}
                    </label>
                    <input
                      type="tel"
                      name={f.id}
                      value={formData[f.id] || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[f.id] ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder={`Enter ${f.label.toLowerCase()}`}
                      required={f.required}
                      disabled={!!existingEnquiry && !isEditMode}
                    />
                    {errors[f.id] && <p className="mt-1 text-sm text-red-600">{errors[f.id]}</p>}
                  </div>
                );
              }

              if (f.type === 'textarea') {
                return (
                  <div key={f.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {f.label} {f.required && '*'}
                    </label>
                    <textarea
                      name={f.id}
                      value={formData[f.id] || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[f.id] ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder={`Enter ${f.label.toLowerCase()}`}
                      required={f.required}
                      disabled={!!existingEnquiry && !isEditMode}
                    />
                    {errors[f.id] && <p className="mt-1 text-sm text-red-600">{errors[f.id]}</p>}
                  </div>
                );
              }

              if (f.type === 'select') {
                return (
                  <div key={f.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {f.label} {f.required && '*'}
                    </label>
                    <select
                      name={f.id}
                      value={formData[f.id] || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[f.id] ? 'border-red-500' : 'border-gray-200'
                      }`}
                      required={f.required}
                      disabled={!!existingEnquiry && !isEditMode}
                    >
                      <option value="">Select {f.label}</option>
                      {(f.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {errors[f.id] && <p className="mt-1 text-sm text-red-600">{errors[f.id]}</p>}
                  </div>
                );
              }

              // Default text/email/number input
              return (
                <div key={f.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {f.label} {f.required && '*'}
                  </label>
                  <input
                    type={f.type || 'text'}
                    name={f.id}
                    value={formData[f.id] || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[f.id] ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    required={f.required}
                    disabled={!!existingEnquiry && !isEditMode}
                  />
                  {errors[f.id] && <p className="mt-1 text-sm text-red-600">{errors[f.id]}</p>}
                </div>
              );
            })}

            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30"
                disabled={isSubmitting || appLoading || (!!existingEnquiry && !isEditMode)}
                icon={isSubmitting ? <ActionIcons.loading size={20} className="animate-spin" /> : null}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
              </Button>
            </div>
          </form>
          )}

          {submittedEnquiry && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ActionIcons.check size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h2>
              <p className="text-gray-500 mb-6">
                Your enquiry reference ID is <span className="font-bold text-gray-900">#{submittedEnquiry.id.substring(0,8)}</span>
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Submit Another
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EnquiryForm;
