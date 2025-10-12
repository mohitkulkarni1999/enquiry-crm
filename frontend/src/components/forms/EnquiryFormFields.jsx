import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { PROPERTY_TYPES, BUDGET_RANGES } from '../../utils/constants';

const EnquiryFormFields = ({ 
  formData, 
  errors, 
  onChange 
}) => {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Name Field */}
      <Input
        type="text"
        id="name"
        name="name"
        label="Full Name"
        required
        value={formData.name}
        onChange={onChange}
        error={errors.name}
        placeholder="Enter your full name"
      />

      {/* Mobile Number Field */}
      <Input
        type="tel"
        id="mobile"
        name="mobile"
        label="Mobile Number"
        required
        value={formData.mobile}
        onChange={onChange}
        error={errors.mobile}
        placeholder="Enter your mobile number"
      />

      {/* Email Field */}
      <Input
        type="email"
        id="email"
        name="email"
        label="Email Address"
        required
        value={formData.email}
        onChange={onChange}
        error={errors.email}
        placeholder="Enter your email address"
      />

      {/* Requirements Field */}
      <Select
        id="requirements"
        name="requirements"
        label="Requirements"
        required
        value={formData.requirements}
        onChange={onChange}
        error={errors.requirements}
        options={PROPERTY_TYPES}
        placeholder="Select property type"
      />

      {/* Budget Field */}
      <Select
        id="budget"
        name="budget"
        label="Budget"
        required
        value={formData.budget}
        onChange={onChange}
        error={errors.budget}
        options={BUDGET_RANGES}
        placeholder="Select your budget range"
      />
    </div>
  );
};

export default EnquiryFormFields;
