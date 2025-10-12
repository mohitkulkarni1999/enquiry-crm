import React, { useState, forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  success,
  helperText,
  className = '',
  required = false,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    filled: 'bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  };

  const getInputClasses = () => {
    let classes = `w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${sizes[size]} ${variants[variant]}`;
    
    if (error) {
      classes = classes.replace('border-gray-300', 'border-red-500')
                      .replace('focus:border-blue-500', 'focus:border-red-500')
                      .replace('focus:ring-blue-500', 'focus:ring-red-500');
    } else if (success) {
      classes = classes.replace('border-gray-300', 'border-green-500')
                      .replace('focus:border-blue-500', 'focus:border-green-500')
                      .replace('focus:ring-blue-500', 'focus:ring-green-500');
    }
    
    if (disabled) {
      classes += ' bg-gray-100 text-gray-500 cursor-not-allowed';
    }
    
    if (icon) {
      classes += iconPosition === 'left' ? ' pl-10' : ' pr-10';
    }
    
    return `${classes} ${className}`;
  };

  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="mb-4">
      {label && (
        <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 ${
          focused ? 'text-blue-600' : ''
        } ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 ${focused ? 'text-blue-500' : ''} transition-colors duration-200`}>
              {loading ? <LoadingSpinner /> : icon}
            </span>
          </div>
        )}
        <input
          ref={ref}
          className={getInputClasses()}
          disabled={disabled || loading}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 ${focused ? 'text-blue-500' : ''} transition-colors duration-200`}>
              {loading ? <LoadingSpinner /> : icon}
            </span>
          </div>
        )}
        {success && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {success && !error && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </p>
      )}
      {helperText && !error && !success && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
