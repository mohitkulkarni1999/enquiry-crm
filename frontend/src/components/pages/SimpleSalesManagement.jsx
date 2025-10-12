import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BusinessIcons } from '../ui/Icons';

const SimpleSalesManagement = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg">
              <BusinessIcons.users size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Sales Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage your sales pipeline and team performance
          </p>
        </div>

        {/* Sales Pipeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Sales Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 mb-2">New Leads</h4>
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-sm text-blue-600">Unassigned</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <h4 className="font-semibold text-yellow-900 mb-2">In Progress</h4>
              <p className="text-2xl font-bold text-yellow-600">18</p>
              <p className="text-sm text-yellow-600">Active follow-ups</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-900 mb-2">Qualified</h4>
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-purple-600">Ready to close</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-semibold text-green-900 mb-2">Closed Won</h4>
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-green-600">This month</p>
            </div>
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Enquiries</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add New Lead
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Budget</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned To</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">John Smith</p>
                      <p className="text-sm text-gray-600">john@email.com</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">Apartment</td>
                  <td className="py-3 px-4 text-gray-700">₹50L - ₹75L</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      New
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">Unassigned</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Assign
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Sarah Wilson</p>
                      <p className="text-sm text-gray-600">sarah@email.com</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">Villa</td>
                  <td className="py-3 px-4 text-gray-700">₹1Cr - ₹1.5Cr</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      In Progress
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">Mike Johnson</td>
                  <td className="py-3 px-4">
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      View
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">Alex Chen</p>
                      <p className="text-sm text-gray-600">alex@email.com</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">Penthouse</td>
                  <td className="py-3 px-4 text-gray-700">₹2Cr+</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Closed Won
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">Emma Davis</td>
                  <td className="py-3 px-4">
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Team Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BusinessIcons.user size={24} className="text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Mike Johnson</h4>
              <p className="text-sm text-gray-600 mb-2">Senior Sales Rep</p>
              <p className="text-lg font-bold text-green-600">8 Deals Closed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BusinessIcons.user size={24} className="text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Emma Davis</h4>
              <p className="text-sm text-gray-600 mb-2">Sales Rep</p>
              <p className="text-lg font-bold text-blue-600">6 Deals Closed</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BusinessIcons.user size={24} className="text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Lisa Anderson</h4>
              <p className="text-sm text-gray-600 mb-2">Junior Sales Rep</p>
              <p className="text-lg font-bold text-purple-600">4 Deals Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSalesManagement;
