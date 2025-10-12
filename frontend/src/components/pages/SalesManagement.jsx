import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { BusinessIcons, NavigationIcons, ActionIcons, ChartIcons } from '../ui/Icons';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';
import StatisticsCard from '../common/StatisticsCard';
import EnquiryTable from '../common/EnquiryTable';

const SalesManagement = () => {
  const { enquiries = [], salesPersons = [], users = [], loading, loadEnquiries, loadSalesPersons, loadUsers } = useAppContext();
  const { user } = useAuth();

  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          loadEnquiries(),
          loadSalesPersons(),
          loadUsers()
        ]);
      } catch (error) {
        console.error('Error loading sales management data:', error);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6">
        <Loading 
          size="lg" 
          text="Loading sales management..." 
          variant="spinner" 
          color="blue" 
          className="h-64" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatisticsCard
            title="Total Enquiries"
            value={enquiries.length}
            icon={<BusinessIcons.briefcase size={24} />}
            color="blue"
            trend="up"
            trendValue={`${enquiries.length} total`}
            subtitle="All time"
          />
          <StatisticsCard
            title="Active Leads"
            value={enquiries.filter(e => ['IN_PROGRESS', 'INTERESTED', 'FOLLOW_UP_SCHEDULED'].includes(e.status)).length}
            icon={<BusinessIcons.trending size={24} />}
            color="green"
            trend="up"
            trendValue="In pipeline"
            subtitle="Working on"
          />
          <StatisticsCard
            title="Conversions"
            value={enquiries.filter(e => e.status === 'CLOSED_WON').length}
            icon={<BusinessIcons.award size={24} />}
            color="purple"
            trend="up"
            trendValue="Successful"
            subtitle="Closed deals"
          />
          <StatisticsCard
            title="Team Members"
            value={users.filter(u => u.role === 'SALES').length}
            icon={<BusinessIcons.users size={24} />}
            color="indigo"
            trend="neutral"
            trendValue="Active reps"
            subtitle="Sales team"
          />
        </div>

        {/* Enquiries Table */}
        <Card variant="gradient" shadow="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ChartIcons.bar className="text-indigo-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">All Enquiries</h3>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" icon={<ActionIcons.filter size={16} />}>
                Filter
              </Button>
              <Button variant="primary" size="sm" icon={<ActionIcons.download size={16} />}>
                Export
              </Button>
            </div>
          </div>
          <EnquiryTable enquiries={enquiries} />
        </Card>
      </div>
    </div>
  );
};

export default SalesManagement;
