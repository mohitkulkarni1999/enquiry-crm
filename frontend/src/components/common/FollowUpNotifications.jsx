import React, { useState, useEffect } from 'react';
import { BusinessIcons, ActionIcons } from '../ui/Icons';
import { showToast } from '../ui/Toast';
import { notificationAPI } from '../../utils/api';

const FollowUpNotifications = ({ enquiries = [], userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const followUpNotifications = await notificationAPI.getFollowUpNotifications(userId);
      setNotifications(followUpNotifications || []);
      
      // Show notification if there are follow-ups today
      if (followUpNotifications && followUpNotifications.length > 0) {
        showToast.info(`You have ${followUpNotifications.length} follow-up(s) scheduled for today!`);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to local filtering if API fails
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayFollowUps = enquiries.filter(enquiry => {
        if (!enquiry.nextFollowUpAt) return false;
        
        const followUpDate = new Date(enquiry.nextFollowUpAt);
        followUpDate.setHours(0, 0, 0, 0);
        
        return followUpDate.getTime() === today.getTime();
      });
      
      setNotifications(todayFollowUps);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeUntilFollowUp = (dateString) => {
    const now = new Date();
    const followUpDate = new Date(dateString);
    const diffTime = followUpDate - now;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 'Due now';
    if (diffHours <= 24) return `Due in ${diffHours} hours`;
    return formatDate(dateString);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
        disabled={loading}
      >
        <ActionIcons.bell size={20} className="text-red-600" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Follow-up Reminders</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ActionIcons.close size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              You have {notifications.length} follow-up(s) scheduled for today
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((enquiry) => (
              <div key={enquiry.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <BusinessIcons.user size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {enquiry.customerName}
                      </h4>
                      <span className="text-xs text-red-600 font-medium">
                        {getTimeUntilFollowUp(enquiry.nextFollowUpAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {enquiry.customerEmail} · {enquiry.customerMobile || enquiry.customerPhone}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        enquiry.interestLevel === 'HOT' ? 'bg-red-100 text-red-800' :
                        enquiry.interestLevel === 'WARM' ? 'bg-yellow-100 text-yellow-800' :
                        enquiry.interestLevel === 'COLD' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {enquiry.interestLevel || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Follow-up: {formatDate(enquiry.nextFollowUpAt)}
                      </span>
                    </div>
                    {enquiry.remarks && (
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        Last note: {enquiry.remarks}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark as Read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpNotifications;