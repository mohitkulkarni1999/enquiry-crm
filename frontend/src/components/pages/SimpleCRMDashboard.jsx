import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BusinessIcons } from '../ui/Icons';

const SimpleCRMDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
              <BusinessIcons.briefcase size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CRM Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Welcome back, {user?.name || user?.username}! Here's your CRM overview
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Enquiries</p>
                <p className="text-3xl font-bold text-blue-600">156</p>
                <p className="text-xs text-green-600">↗ +12% this month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BusinessIcons.briefcase size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Leads</p>
                <p className="text-3xl font-bold text-green-600">89</p>
                <p className="text-xs text-green-600">↗ +8% this week</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BusinessIcons.trending size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Conversions</p>
                <p className="text-3xl font-bold text-purple-600">23</p>
                <p className="text-xs text-purple-600">↗ +15% this month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BusinessIcons.award size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Team Members</p>
                <p className="text-3xl font-bold text-indigo-600">12</p>
                <p className="text-xs text-indigo-600">Active sales reps</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BusinessIcons.users size={24} className="text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">New enquiry from John Smith</p>
                  <p className="text-sm text-gray-600">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Lead assigned to Sarah Wilson</p>
                  <p className="text-sm text-gray-600">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Deal closed by Mike Johnson</p>
                  <p className="text-sm text-gray-600">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <BusinessIcons.user size={24} className="text-blue-600 mb-2" />
                <p className="font-medium text-blue-900">Add Lead</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <BusinessIcons.users size={24} className="text-green-600 mb-2" />
                <p className="font-medium text-green-900">Manage Team</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <BusinessIcons.trending size={24} className="text-purple-600 mb-2" />
                <p className="font-medium text-purple-900">View Reports</p>
              </button>
              <button className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <BusinessIcons.briefcase size={24} className="text-indigo-600 mb-2" />
                <p className="font-medium text-indigo-900">Export Data</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCRMDashboard;
