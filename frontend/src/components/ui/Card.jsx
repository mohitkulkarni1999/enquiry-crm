import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default',
  rounded = 'default',
  variant = 'default',
  hover = false,
  border = true
}) => {
  const paddings = {
    none: '',
    xs: 'p-2 sm:p-3',
    sm: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10'
  };

  const shadows = {
    none: '',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    default: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl'
  };

  const roundeds = {
    none: '',
    xs: 'rounded',
    sm: 'rounded-md',
    default: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl'
  };

  const variants = {
    default: 'bg-white',
    gradient: 'bg-gradient-to-br from-white to-gray-50',
    glass: 'bg-white/80 backdrop-blur-sm',
    dark: 'bg-gray-900 text-white',
    primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
    warning: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
    danger: 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
  };

  const borderClasses = border ? 'border border-gray-200' : '';
  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'transition-shadow duration-200';

  return (
    <div className={`${variants[variant]} ${paddings[padding]} ${shadows[shadow]} ${roundeds[rounded]} ${borderClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
