import React from 'react';
import Card from '../ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatisticsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'gray',
  trend,
  trendValue,
  subtitle,
  loading = false,
  className = '' 
}) => {
  const colorClasses = {
    gray: {
      text: 'text-gray-700',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-500'
    },
    blue: {
      text: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500'
    },
    green: {
      text: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500'
    },
    yellow: {
      text: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500'
    },
    red: {
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500'
    },
    purple: {
      text: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-500'
    },
    indigo: {
      text: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-500'
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <Card padding="sm" shadow="sm" className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
          <div className="h-8 bg-gray-200 rounded mb-1 w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      padding="sm" 
      shadow="default" 
      hover={true}
      className={`${colorClasses[color].bg} ${colorClasses[color].border} border transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 uppercase tracking-wide">
            {title}
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${colorClasses[color].text} mb-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500">{subtitle}</div>
          )}
          {(trend || trendValue) && (
            <div className="flex items-center mt-2 space-x-1">
              {getTrendIcon()}
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color].bg} ${colorClasses[color].icon}`}>
            {typeof icon === 'string' ? (
              <span className="text-lg">{icon}</span>
            ) : (
              React.cloneElement(icon, { size: 20 })
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatisticsCard;
