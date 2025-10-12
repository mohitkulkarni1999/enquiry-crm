import React from 'react';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { BOOKING_PROGRESS } from '../../utils/constants';
import { getProgressPercentage, getInterestLevelIcon } from '../../utils/helpers';

const SalesInteractionForm = ({ 
  enquiry, 
  onInterestChange,
  onInterestLevelChange,
  onColdReasonChange,
  onUnqualifiedChange,
  onRemarksChange,
  onBookingProgressChange,
  onFollowUpDateChange,
  onAssignToCRM
}) => {
  const interestLevelOptions = [
    { value: '', label: 'Select interest temperature' },
    { value: 'hot', label: '🔥 Hot - Ready to buy immediately' },
    { value: 'warm', label: '🌡️ Warm - Interested but needs time' },
    { value: 'cold', label: '❄️ Cold - Interested but has concerns' }
  ];

  const interestOptions = [
    { value: '', label: 'Select interest level' },
    { value: 'interested', label: 'Interested' },
    { value: 'not_interested', label: 'Not Interested' }
  ];

  const getInterestLevelColor = (level) => {
    switch (level) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Interest Status and Follow-up Date */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Select
          label="Interest Status"
          required
          value={enquiry.interest}
          onChange={(e) => onInterestChange(enquiry.id, e.target.value)}
          options={interestOptions}
          className="focus:ring-purple-500"
        />

        <Input
          type="date"
          label="Follow-up Date"
          value={enquiry.followUpDate}
          onChange={(e) => onFollowUpDateChange(enquiry.id, e.target.value)}
          className="focus:ring-purple-500"
        />
      </div>

      {/* Conditional Fields for Interested Customers */}
      {enquiry.interest === 'interested' && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          
          {/* Interest Level */}
          <div>
            <Select
              label="Interest Level"
              required
              value={enquiry.interestLevel || ''}
              onChange={(e) => onInterestLevelChange(enquiry.id, e.target.value)}
              options={interestLevelOptions}
              className="focus:ring-purple-500"
            />
            
            {enquiry.interestLevel && (
              <div className={`mt-2 px-3 py-2 rounded-md border ${getInterestLevelColor(enquiry.interestLevel)}`}>
                <span className="text-sm font-medium">
                  {getInterestLevelIcon(enquiry.interestLevel)} {enquiry.interestLevel.toUpperCase()} LEAD
                </span>
              </div>
            )}
          </div>

          {/* Cold Lead Reason */}
          {enquiry.interestLevel === 'cold' && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why is this lead cold? What are their concerns?
              </label>
              <textarea
                value={enquiry.coldReason || ''}
                onChange={(e) => onColdReasonChange(enquiry.id, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Describe their hesitations, concerns, or reasons for being cold (e.g., budget concerns, location issues, timing problems, family approval needed, etc.)"
              />
              <div className="mt-2 text-xs text-blue-600">
                💡 <strong>Tip:</strong> Understanding cold lead reasons helps in follow-up strategy and addressing specific concerns.
              </div>
            </div>
          )}
          
          {/* Remarks Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Remarks & Messages
            </label>
            <textarea
              value={enquiry.remarks}
              onChange={(e) => onRemarksChange(enquiry.id, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
              placeholder="Add your remarks, customer feedback, or any important notes..."
            />
          </div>

          {/* Booking Progress */}
          <div>
            <Select
              label="Booking Progress"
              value={enquiry.bookingProgress}
              onChange={(e) => onBookingProgressChange(enquiry.id, e.target.value)}
              options={BOOKING_PROGRESS}
              placeholder="Select progress stage"
              className="focus:ring-purple-500"
            />
          </div>

          {/* Progress Indicator */}
          {enquiry.bookingProgress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{getProgressPercentage(enquiry.bookingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(enquiry.bookingProgress)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Registration Complete - Assign to CRM */}
          {enquiry.bookingProgress === 'registration' && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-green-800 mb-1">
                    🎉 Registration Complete!
                  </h4>
                  <p className="text-xs text-green-700">
                    Customer has completed the registration process. Ready to assign to CRM for ongoing relationship management.
                  </p>
                </div>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onAssignToCRM(enquiry.id)}
                  className="ml-4"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Assign to CRM
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Not Interested Section */}
      {enquiry.interest === 'not_interested' && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Not Interested
            </label>
            <textarea
              value={enquiry.remarks}
              onChange={(e) => onRemarksChange(enquiry.id, e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
              placeholder="Add reason why customer is not interested..."
            />
          </div>

          {/* Unqualified Buyer Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`unqualified-${enquiry.id}`}
                checked={enquiry.isUnqualified || false}
                onChange={(e) => onUnqualifiedChange(enquiry.id, e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor={`unqualified-${enquiry.id}`} className="text-sm font-medium text-gray-700">
                Mark as Unqualified Buyer
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              Check this if the customer doesn't meet our qualification criteria (budget mismatch, unrealistic expectations, etc.)
            </p>
            
            {enquiry.isUnqualified && (
              <div className="mt-3 ml-7 p-3 bg-gray-100 rounded-md">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Buyer marked as unqualified</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  This lead will be moved to the unqualified category and won't appear in active follow-ups.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInteractionForm;
