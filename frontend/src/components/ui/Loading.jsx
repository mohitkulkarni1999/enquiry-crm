import React from 'react';

const Loading = ({ 
  size = 'md', 
  variant = 'spinner',
  color = 'blue',
  text,
  fullScreen = false,
  overlay = false,
  className = ''
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    white: 'text-white'
  };

  const SpinnerLoader = () => (
    <svg 
      className={`animate-spin ${sizes[size]} ${colors[color]}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const DotsLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizes[size].replace('w-', 'w-').replace('h-', 'h-')} ${colors[color].replace('text-', 'bg-')} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );

  const PulseLoader = () => (
    <div className={`${sizes[size]} ${colors[color].replace('text-', 'bg-')} rounded-full animate-pulse`} />
  );

  const BarsLoader = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1 ${colors[color].replace('text-', 'bg-')} rounded-full animate-pulse`}
          style={{
            height: `${12 + (i % 2) * 8}px`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.2s'
          }}
        />
      ))}
    </div>
  );

  const RippleLoader = () => (
    <div className={`relative ${sizes[size]}`}>
      {[0, 1].map((i) => (
        <div
          key={i}
          className={`absolute inset-0 border-2 ${colors[color].replace('text-', 'border-')} rounded-full animate-ping`}
          style={{
            animationDelay: `${i * 0.5}s`,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'ripple':
        return <RippleLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`text-sm font-medium ${colors[color]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loader for content placeholders
export const Skeleton = ({ 
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = 'rounded',
  animated = true
}) => {
  return (
    <div 
      className={`bg-gray-200 ${height} ${width} ${rounded} ${
        animated ? 'animate-pulse' : ''
      } ${className}`}
    />
  );
};

// Card skeleton for loading cards
export const CardSkeleton = ({ lines = 3, showAvatar = false }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="animate-pulse">
        {showAvatar && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton height="h-4" width="w-24" />
              <Skeleton height="h-3" width="w-32" />
            </div>
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i}
              height="h-4" 
              width={i === lines - 1 ? 'w-3/4' : 'w-full'} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Table skeleton for loading tables
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} height="h-4" width="w-20" />
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  height="h-4" 
                  width={colIndex === 0 ? 'w-24' : 'w-16'} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
