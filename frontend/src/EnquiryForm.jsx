import React, { useState } from 'react';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import EnquiryFormFields from './components/forms/EnquiryFormFields';
import SuccessPage from './components/common/SuccessPage';
import { SALES_PERSONS } from './utils/constants';
import { validateEmail, validateMobile, validateRequired, generateId } from './utils/helpers';

const EnquiryForm = ({ onEnquirySubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    requirements: '',
    budget: ''
  });

  const [errors, setErrors] = useState({});
  const [assignedSalesPerson, setAssignedSalesPerson] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateRequired(formData.name)) {
      newErrors.name = 'Name is required';
    }
    
    if (!validateRequired(formData.mobile)) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!validateRequired(formData.requirements)) {
      newErrors.requirements = 'Requirements are required';
    }
    
    if (!validateRequired(formData.budget)) {
      newErrors.budget = 'Budget is required';
    }
    
    return newErrors;
  };

  const assignRandomSalesPerson = () => {
    const availableSalesPersons = SALES_PERSONS.filter(sp => sp.available);
    if (availableSalesPersons.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSalesPersons.length);
      return availableSalesPersons[randomIndex];
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Assign random sales person
      const assignedSP = assignRandomSalesPerson();
      
      // Create enquiry object
      const enquiry = {
        id: generateId(),
        ...formData,
        assignedTo: assignedSP,
        status: 'new',
        interest: '',
        remarks: '',
        bookingProgress: '',
        followUpDate: '',
        submittedAt: new Date().toISOString(),
        followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Next day
      };
      
      console.log('Enquiry submitted and assigned:', enquiry);
      
      // Pass enquiry to parent component
      if (onEnquirySubmit) {
        onEnquirySubmit(enquiry);
      }
      
      setAssignedSalesPerson(assignedSP);
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        mobile: '',
        email: '',
        requirements: '',
        budget: ''
      });
    } else {
      setErrors(newErrors);
    }
  };

  const handleNewEnquiry = () => {
    setIsSubmitted(false);
    setAssignedSalesPerson(null);
  };

  if (isSubmitted && assignedSalesPerson) {
    return (
      <SuccessPage 
        assignedSalesPerson={assignedSalesPerson}
        onNewEnquiry={handleNewEnquiry}
      />
    );
  }

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
          
          <form onSubmit={handleSubmit}>
            <EnquiryFormFields 
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4 mt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
              >
                Submit Enquiry
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EnquiryForm;
