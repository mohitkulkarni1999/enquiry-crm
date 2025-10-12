import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { getPropertyTypeLabel, getBudgetLabel, getStatusColor, formatDate } from '../../utils/helpers';

const EnquiryCard = ({ 
  enquiry, 
  onStatusChange,
  onInterestChange,
  onRemarksChange,
  onAssignToCRM,
  showActions = true 
}) => {
  const statusVariant = {
    'new': 'primary',
    'in_progress': 'warning',
    'not_interested': 'danger',
    'unqualified': 'default',
    'booked': 'success'
  };

  return (
    <Card padding="sm" shadow="sm" className="border border-gray-200 hover:shadow-md transition-shadow">
      {/* Customer Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {enquiry.name.charAt(0)}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">{enquiry.name}</h3>
            <p className="text-sm text-gray-600">{enquiry.mobile} • {enquiry.email}</p>
            {enquiry.assignedTo && (
              <p className="text-xs text-purple-600">Assigned to: {enquiry.assignedTo.name}</p>
            )}
          </div>
        </div>
        <Badge variant={statusVariant[enquiry.status] || 'default'}>
          {enquiry.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <span className="text-xs text-gray-500 block">Property Type</span>
          <span className="font-medium">{getPropertyTypeLabel(enquiry.requirements)}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Budget</span>
          <span className="font-medium">{getBudgetLabel(enquiry.budget)}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Submitted</span>
          <span className="font-medium">{formatDate(enquiry.submittedAt)}</span>
        </div>
      </div>

      {/* Interest Level Badge */}
      {enquiry.interestLevel && (
        <div className="mb-4">
          <Badge 
            variant={enquiry.interestLevel === 'hot' ? 'danger' : enquiry.interestLevel === 'warm' ? 'warning' : 'info'}
            className="border"
          >
            {enquiry.interestLevel === 'hot' && '🔥'} 
            {enquiry.interestLevel === 'warm' && '🌡️'} 
            {enquiry.interestLevel === 'cold' && '❄️'} 
            {enquiry.interestLevel.toUpperCase()} LEAD
          </Badge>
        </div>
      )}

      {/* Remarks */}
      {enquiry.remarks && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Remarks:</h4>
          <p className="text-sm text-gray-600">{enquiry.remarks}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2">
          {enquiry.status === 'new' && (
            <>
              <Button 
                size="sm" 
                variant="success"
                onClick={() => onInterestChange && onInterestChange(enquiry.id, 'interested')}
              >
                Mark Interested
              </Button>
              <Button 
                size="sm" 
                variant="danger"
                onClick={() => onInterestChange && onInterestChange(enquiry.id, 'not_interested')}
              >
                Not Interested
              </Button>
            </>
          )}
          
          {enquiry.bookingProgress === 'registration' && (
            <Button 
              size="sm" 
              variant="success"
              onClick={() => onAssignToCRM && onAssignToCRM(enquiry.id)}
            >
              Assign to CRM
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default EnquiryCard;
