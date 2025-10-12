import { PROPERTY_TYPES, BUDGET_RANGES, ENQUIRY_STATUS, INTEREST_LEVELS } from './constants';

// Get property type label from value
export const getPropertyTypeLabel = (type) => {
  const propertyType = PROPERTY_TYPES.find(pt => pt.value === type);
  return propertyType ? propertyType.label : type;
};

// Get budget label from value
export const getBudgetLabel = (budget) => {
  const budgetRange = BUDGET_RANGES.find(br => br.value === budget);
  return budgetRange ? budgetRange.label : budget;
};

// Get status color classes
export const getStatusColor = (status) => {
  switch (status) {
    case ENQUIRY_STATUS.NEW: 
      return 'bg-blue-100 text-blue-800';
    case ENQUIRY_STATUS.IN_PROGRESS: 
      return 'bg-yellow-100 text-yellow-800';
    case ENQUIRY_STATUS.NOT_INTERESTED: 
      return 'bg-red-100 text-red-800';
    case ENQUIRY_STATUS.UNQUALIFIED: 
      return 'bg-gray-100 text-gray-800';
    case ENQUIRY_STATUS.BOOKED: 
      return 'bg-green-100 text-green-800';
    default: 
      return 'bg-gray-100 text-gray-800';
  }
};

// Get interest level color classes
export const getInterestLevelColor = (level) => {
  switch (level) {
    case INTEREST_LEVELS.HOT: 
      return 'bg-red-100 text-red-800 border-red-200';
    case INTEREST_LEVELS.WARM: 
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case INTEREST_LEVELS.COLD: 
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Get interest level icon
export const getInterestLevelIcon = (level) => {
  switch (level) {
    case INTEREST_LEVELS.HOT: return '🔥';
    case INTEREST_LEVELS.WARM: return '🌡️';
    case INTEREST_LEVELS.COLD: return '❄️';
    default: return '';
  }
};

// Calculate booking progress percentage
export const getProgressPercentage = (progress) => {
  const stages = {
    'initial_discussion': 10,
    'site_visit_scheduled': 20,
    'site_visit_completed': 35,
    'negotiation': 50,
    'documentation': 65,
    'token_payment': 75,
    'loan_processing': 85,
    'final_booking': 95,
    'registration': 100
  };
  return stages[progress] || 0;
};

// Form validation helpers
export const validateEmail = (email) => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

export const validateMobile = (mobile) => {
  const mobileRegex = /^\d{10}$/;
  return mobileRegex.test(mobile.replace(/\s/g, ''));
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Date formatting helpers
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString();
};

// Generate unique ID
export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};
