import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import SuccessPage from '../common/SuccessPage';
import { useAppContext } from '../../contexts/AppContext';
import { enquiryAPI } from '../../utils/api';

const EnquiryForm = ({ onSuccess }) => {
  const { createEnquiry, loading } = useAppContext();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerMobile: '',
    propertyType: '',
    budgetRange: '',
    source: 'DIGITAL',
    sourceNote: ''
  });

  const [errors, setErrors] = useState({});
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);
  const [followUp, setFollowUp] = useState({ remarks: '', date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('mobile'); // 'mobile' | 'form'
  const [existingEnquiry, setExistingEnquiry] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const propertyTypes = [
    { value: 'STUDIO', label: 'Studio' },
    { value: 'ONE_BHK', label: '1 BHK' },
    { value: 'ONE_HALF_BHK', label: '1.5 BHK' },
    { value: 'TWO_BHK', label: '2 BHK' },
    { value: 'JODI', label: 'Jodi' } // special handling
  ];

  const budgetRanges = [
    { value: '20_30', label: '20-30l' },
    { value: '30_40', label: '30-40l' },
    { value: '40_50', label: '40-50l' },
    { value: '50_60', label: '50-60l' },
    { value: '60_ABOVE', label: '60l above' }
  ];

  const sources = [
    { value: 'DIGITAL', label: 'Digital' },
    { value: 'REFERRAL', label: 'Referal' },
    { value: 'WALKIN', label: 'Walkin' },
    { value: 'CC', label: 'CC' },
    { value: 'OTHER', label: 'Other' },
    { value: 'CP', label: 'CP' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }

    if (!formData.customerMobile.trim()) {
      newErrors.customerMobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.customerMobile.replace(/\D/g, ''))) {
      newErrors.customerMobile = 'Mobile number must be 10 digits';
    }

    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    }

    if (!formData.budgetRange) {
      newErrors.budgetRange = 'Budget range is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const normalizeMobile = (value) => (value || '').replace(/\D/g, '');

  const prefillFromEnquiry = (e) => {
    if (!e) return;
    setFormData(prev => ({
      ...prev,
      customerName: e.customerName || '',
      customerEmail: e.customerEmail || '',
      customerMobile: e.customerMobile || e.customerPhone || prev.customerMobile,
      propertyType: e.propertyType || '',
      budgetRange: e.budgetRange || '',
      source: e.source || 'DIGITAL',
      sourceNote: ''
    }));
  };

  const handleMobileContinue = async () => {
    const mobile = normalizeMobile(formData.customerMobile);
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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Clean mobile number to only digits
      const cleanMobile = formData.customerMobile.replace(/\D/g, '');
      
      // Map UI selections to backend enums/fields
      let mappedPropertyType = formData.propertyType;
      let mappedBudget = formData.budgetRange;
      let mappedSource = formData.source;
      let remarks = '';

      // property type mapping (JODI -> remarks, don't set enum)
      if (mappedPropertyType === 'JODI') {
        mappedPropertyType = null;
        remarks += 'Property Type: JODI. ';
      }

      // budget mapping
      const budgetMap = {
        '20_30': 'TWENTY_TO_30L',
        '30_40': 'THIRTY_TO_50L',
        '40_50': 'THIRTY_TO_50L',
        '50_60': 'FIFTY_TO_75L',
        '60_ABOVE': 'FIFTY_TO_75L'
      };
      mappedBudget = budgetMap[mappedBudget] || null;

      // source mapping to backend LeadSource
      const sourceMap = {
        'DIGITAL': 'ADVERTISEMENT',
        'REFERRAL': 'REFERRAL',
        'WALKIN': 'WALK_IN',
        'CC': 'ADVERTISEMENT',
        'OTHER': 'WEBSITE',
        'CP': 'ADVERTISEMENT'
      };
      const backendSource = sourceMap[mappedSource] || 'WEBSITE';

      if (['CP','REFERRAL','OTHER'].includes(formData.source) && formData.sourceNote?.trim()) {
        remarks += `Source Note: ${formData.sourceNote.trim()}`;
      }

      const enquiryData = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail?.trim() || null,
        customerMobile: cleanMobile,
        propertyType: mappedPropertyType,
        budgetRange: mappedBudget,
        source: backendSource,
        remarks: remarks || null
        // Don't send status - let backend set default
      };

      console.log('Sending enquiry data:', enquiryData);
      const newEnquiry = await createEnquiry(enquiryData);
      setSubmittedEnquiry(newEnquiry);

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerMobile: '',
        propertyType: '',
        budgetRange: '',
        source: 'DIGITAL',
        sourceNote: ''
      });

      alert(`Enquiry submitted successfully! Reference ID: ${newEnquiry.id}`);
      
      if (onSuccess) {
        onSuccess(newEnquiry);
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert(`Failed to submit enquiry: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-6">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto">
        <Card>
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
              Enquiry Form
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 px-2">
              Please fill out the form below to submit your enquiry
            </p>
          </div>
          
          {!submittedEnquiry && step === 'mobile' && (
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="customerMobile"
                  value={formData.customerMobile}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.customerMobile ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit mobile number"
                  pattern="[0-9]{10}"
                  required
                />
                {errors.customerMobile && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerMobile}</p>
                )}
              </div>
              <div className="pt-4">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                  onClick={handleMobileContinue}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {!submittedEnquiry && step === 'form' && (
          <form onSubmit={handleSubmit}>
            {existingEnquiry && (
              <div className="flex items-start justify-between p-3 sm:p-4 mb-4 rounded-md border bg-amber-50 border-amber-200">
                <div className="text-xs sm:text-sm text-amber-800">
                  Existing record found for this mobile. Review and submit, or click Edit.
                </div>
                {!isEditMode && (
                  <Button type="button" variant="secondary" onClick={() => setIsEditMode(true)}>
                    Edit form
                  </Button>
                )}
              </div>
            )}
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter customer name"
                required
                disabled={!!existingEnquiry && !isEditMode}
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
              )}
            </div>

            {/* Customer Email (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (optional)
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                disabled={!!existingEnquiry && !isEditMode}
              />
              {errors.customerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
              )}
            </div>

            {/* Customer Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="customerMobile"
                value={formData.customerMobile}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerMobile ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit mobile number"
                pattern="[0-9]{10}"
                required
                disabled={!!existingEnquiry && !isEditMode}
              />
              {errors.customerMobile && (
                <p className="mt-1 text-sm text-red-600">{errors.customerMobile}</p>
              )}
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.propertyType ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={!!existingEnquiry && !isEditMode}
              >
                <option value="">Select property type</option>
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.propertyType && (
                <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>
              )}
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range *
              </label>
              <select
                name="budgetRange"
                value={formData.budgetRange}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.budgetRange ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={!!existingEnquiry && !isEditMode}
              >
                <option value="">Select budget range</option>
                {budgetRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              {errors.budgetRange && (
                <p className="mt-1 text-sm text-red-600">{errors.budgetRange}</p>
              )}
            </div>

            {/* Removed: Location Preference, Requirements, Priority */}

            {/* Source with conditional note for CP/Referal/Other */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!existingEnquiry && !isEditMode}
              >
                {sources.map(source => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
              {(formData.source === 'CP' || formData.source === 'REFERRAL' || formData.source === 'OTHER') && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    name="sourceNote"
                    value={formData.sourceNote}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add details for selected source"
                    disabled={!!existingEnquiry && !isEditMode}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                disabled={isSubmitting || loading || (!!existingEnquiry && !isEditMode)}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
              </Button>
            </div>
          </form>
          )}

          {submittedEnquiry && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                Your enquiry has been submitted. Reference ID: <b>{submittedEnquiry.id}</b>
              </div>
              <div className="p-4 bg-white border rounded-md">
                <div className="text-sm font-medium text-gray-700 mb-2">Schedule a follow-up</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={followUp.date}
                    onChange={(e) => setFollowUp(prev => ({ ...prev, date: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Remarks (optional)"
                    value={followUp.remarks}
                    onChange={(e) => setFollowUp(prev => ({ ...prev, remarks: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    onClick={async () => {
                      try {
                        if (followUp.remarks.trim()) {
                          await fetch(`/api/v1/enquiries/${submittedEnquiry.id}/remarks`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'text/plain' },
                            body: followUp.remarks.trim()
                          });
                        }
                        if (followUp.date) {
                          const iso = new Date(followUp.date).toISOString();
                          await fetch(`/api/v1/enquiries/${submittedEnquiry.id}/schedule-follow-up?followUpDate=${encodeURIComponent(iso)}`, {
                            method: 'POST'
                          });
                        }
                        alert('Follow-up saved');
                      } catch (e) {
                        alert('Failed to save follow-up');
                      }
                    }}
                  >
                    Save Follow-up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EnquiryForm;
