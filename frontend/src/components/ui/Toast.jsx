import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Professional toast configurations
export const showToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)',
        padding: '16px 20px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25)',
        padding: '16px 20px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast(message, {
      duration: 4500,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25)',
        padding: '16px 20px',
      },
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25)',
        padding: '16px 20px',
      },
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(107, 114, 128, 0.25)',
        padding: '16px 20px',
      },
      ...options,
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong!',
      },
      {
        position: 'top-right',
        style: {
          fontWeight: '500',
          borderRadius: '12px',
          padding: '16px 20px',
        },
        success: {
          style: {
            background: '#10B981',
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)',
          },
        },
        error: {
          style: {
            background: '#EF4444',
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25)',
          },
        },
        loading: {
          style: {
            background: '#6B7280',
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(107, 114, 128, 0.25)',
          },
        },
        ...options,
      }
    );
  },

  custom: (component, options = {}) => {
    return toast.custom(component, {
      position: 'top-right',
      duration: 4000,
      ...options,
    });
  },

  dismiss: (toastId) => {
    return toast.dismiss(toastId);
  },

  remove: (toastId) => {
    return toast.remove(toastId);
  },
};

// Professional Toaster component with custom styling
export const ProfessionalToaster = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        className: '',
        duration: 4000,
        style: {
          background: '#fff',
          color: '#374151',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '16px 20px',
          maxWidth: '400px',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default showToast;
