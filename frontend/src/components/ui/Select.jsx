import React from 'react';

const Select = ({ 
  label,
  error,
  required = false,
  options = [],
  placeholder = "Select an option",
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const baseClasses = 'w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white';
  const errorClasses = error ? 'border-red-500' : 'border-gray-300';

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
