import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  dot = false,
  outline = false,
  className = '' 
}) => {
  const variants = {
    default: outline ? 'border-gray-300 text-gray-700 bg-white' : 'bg-gray-100 text-gray-800',
    primary: outline ? 'border-blue-300 text-blue-700 bg-blue-50' : 'bg-blue-100 text-blue-800',
    success: outline ? 'border-green-300 text-green-700 bg-green-50' : 'bg-green-100 text-green-800',
    warning: outline ? 'border-yellow-300 text-yellow-700 bg-yellow-50' : 'bg-yellow-100 text-yellow-800',
    danger: outline ? 'border-red-300 text-red-700 bg-red-50' : 'bg-red-100 text-red-800',
    info: outline ? 'border-cyan-300 text-cyan-700 bg-cyan-50' : 'bg-cyan-100 text-cyan-800',
    purple: outline ? 'border-purple-300 text-purple-700 bg-purple-50' : 'bg-purple-100 text-purple-800',
    pink: outline ? 'border-pink-300 text-pink-700 bg-pink-50' : 'bg-pink-100 text-pink-800',
    indigo: outline ? 'border-indigo-300 text-indigo-700 bg-indigo-50' : 'bg-indigo-100 text-indigo-800',
    orange: outline ? 'border-orange-300 text-orange-700 bg-orange-50' : 'bg-orange-100 text-orange-800',
    teal: outline ? 'border-teal-300 text-teal-700 bg-teal-50' : 'bg-teal-100 text-teal-800',
    lime: outline ? 'border-lime-300 text-lime-700 bg-lime-50' : 'bg-lime-100 text-lime-800'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1 text-base'
  };

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    lime: 'bg-lime-500'
  };

  const borderClass = outline ? 'border' : '';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full transition-all duration-200 ${variants[variant]} ${sizes[size]} ${borderClass} ${className}`}>
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-2 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

// Status-specific badge components
export const StatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    'NEW': { variant: 'primary', children: 'New' },
    'ASSIGNED': { variant: 'purple', children: 'Assigned' },
    'IN_PROGRESS': { variant: 'warning', children: 'In Progress' },
    'INTERESTED': { variant: 'success', children: 'Interested' },
    'NOT_INTERESTED': { variant: 'danger', children: 'Not Interested' },
    'UNQUALIFIED': { variant: 'default', children: 'Unqualified' },
    'FOLLOW_UP_SCHEDULED': { variant: 'orange', children: 'Follow-up Scheduled' },
    'SITE_VISIT_SCHEDULED': { variant: 'indigo', children: 'Site Visit Scheduled' },
    'SITE_VISIT_COMPLETED': { variant: 'teal', children: 'Site Visit Completed' },
    'NEGOTIATION': { variant: 'pink', children: 'Negotiation' },
    'DOCUMENTATION': { variant: 'info', children: 'Documentation' },
    'TOKEN_PAYMENT': { variant: 'lime', children: 'Token Payment' },
    'LOAN_PROCESSING': { variant: 'purple', children: 'Loan Processing' },
    'FINAL_BOOKING': { variant: 'success', children: 'Final Booking' },
    'REGISTRATION_COMPLETE': { variant: 'success', children: 'Registration Complete' },
    'CLOSED_WON': { variant: 'success', children: 'Closed Won' },
    'CLOSED_LOST': { variant: 'danger', children: 'Closed Lost' }
  };

  const config = statusConfig[status] || { variant: 'default', children: status };
  
  return <Badge {...config} {...props} />;
};

export const PriorityBadge = ({ priority, ...props }) => {
  const priorityConfig = {
    1: { variant: 'success', children: 'Low', dot: true },
    2: { variant: 'warning', children: 'Medium', dot: true },
    3: { variant: 'danger', children: 'High', dot: true }
  };

  const config = priorityConfig[priority] || { variant: 'default', children: 'Unknown' };
  
  return <Badge {...config} {...props} />;
};

export default Badge;
