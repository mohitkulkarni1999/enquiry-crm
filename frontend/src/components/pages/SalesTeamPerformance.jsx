import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { BusinessIcons, ChartIcons, ActionIcons } from '../ui/Icons';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';
import StatisticsCard from '../common/StatisticsCard';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

const SalesTeamPerformance = () => {
  const { enquiries = [], users = [], loading, loadEnquiries, loadUsers } = useAppContext();
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [teamMetrics, setTeamMetrics] = useState({});
  const [individualMetrics, setIndividualMetrics] = useState({});

  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([loadEnquiries(), loadUsers()]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    fetchData();
  }, []);

  // Calculate team metrics
  useEffect(() => {
    if (enquiries.length > 0 && users.length > 0) {
      calculateTeamMetrics();
    }
  }, [enquiries, users, selectedPeriod]);

  // Calculate individual metrics when user is selected
  useEffect(() => {
    if (selectedUser && enquiries.length > 0) {
      calculateIndividualMetrics();
    }
  }, [selectedUser, enquiries, selectedPeriod]);

  const calculateTeamMetrics = () => {
    const salesUsers = users.filter(u => u.role === 'SALES');
    const metrics = {};

    salesUsers.forEach(salesUser => {
      const userEnquiries = enquiries.filter(e => 
        e.assignedTo?.id === salesUser.id || 
        e.assignedTo?.name === salesUser.name ||
        e.assignedTo?.email === salesUser.email
      );

      const totalEnquiries = userEnquiries.length;
      const closedWon = userEnquiries.filter(e => e.status === 'CLOSED_WON').length;
      const inProgress = userEnquiries.filter(e => 
        ['IN_PROGRESS', 'INTERESTED', 'FOLLOW_UP_SCHEDULED'].includes(e.status)
      ).length;
      const unqualified = userEnquiries.filter(e => e.status === 'UNQUALIFIED').length;
      const conversionRate = totalEnquiries > 0 ? Math.round((closedWon / totalEnquiries) * 100) : 0;
      const revenue = closedWon * 50000; // Assuming ₹50K average deal value

      metrics[salesUser.id] = {
        user: salesUser,
        totalEnquiries,
        closedWon,
        inProgress,
        unqualified,
        conversionRate,
        revenue,
        userEnquiries
      };
    });

    setTeamMetrics(metrics);
  };

  const calculateIndividualMetrics = () => {
    const userEnquiries = enquiries.filter(e => 
      e.assignedTo?.id === selectedUser.id || 
      e.assignedTo?.name === selectedUser.name ||
      e.assignedTo?.email === selectedUser.email
    );

    const totalEnquiries = userEnquiries.length;
    const closedWon = userEnquiries.filter(e => e.status === 'CLOSED_WON').length;
    const inProgress = userEnquiries.filter(e => 
      ['IN_PROGRESS', 'INTERESTED', 'FOLLOW_UP_SCHEDULED'].includes(e.status)
    ).length;
    const unqualified = userEnquiries.filter(e => e.status === 'UNQUALIFIED').length;
    const closedLost = userEnquiries.filter(e => e.status === 'CLOSED_LOST').length;
    const conversionRate = totalEnquiries > 0 ? Math.round((closedWon / totalEnquiries) * 100) : 0;
    const revenue = closedWon * 50000;

    // Status distribution
    const statusDistribution = {};
    userEnquiries.forEach(e => {
      statusDistribution[e.status] = (statusDistribution[e.status] || 0) + 1;
    });

    // Recent activity (last 10 enquiries)
    const recentActivity = userEnquiries
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 10);

    setIndividualMetrics({
      totalEnquiries,
      closedWon,
      inProgress,
      unqualified,
      closedLost,
      conversionRate,
      revenue,
      statusDistribution,
      recentActivity,
      userEnquiries
    });
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CLOSED_WON': return 'bg-green-100 text-green-800';
      case 'UNQUALIFIED': return 'bg-orange-100 text-orange-800';
      case 'CLOSED_LOST': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'INTERESTED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
        <Loading size="lg" text="Loading sales team performance..." variant="spinner" color="purple" className="h-64" />
      </div>
    );
  }

  const teamMetricsArray = Object.values(teamMetrics).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg">
              <BusinessIcons.users size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sales Team Performance
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Detailed performance analytics for your sales team
          </p>
        </div>

        {/* Period Selection */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['week', 'month', 'quarter', 'year'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Team Overview */}
        <Card variant="gradient" shadow="lg" className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartIcons.bar className="text-purple-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Team Overview</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Person</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Enquiries</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMetricsArray.map((metrics, index) => (
                    <tr key={metrics.user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {metrics.user.name?.charAt(0) || metrics.user.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{metrics.user.name || metrics.user.username}</div>
                            <div className="text-sm text-gray-500">{metrics.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{metrics.totalEnquiries}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {metrics.closedWon} bookings
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {metrics.inProgress} active
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{metrics.conversionRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatCurrency(metrics.revenue)}</td>
                      <td className="px-4 py-4">
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => setSelectedUser(metrics.user)}
                          icon={<ActionIcons.eye size={14} />}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Individual Performance Details */}
        {selectedUser && (
          <Card variant="gradient" shadow="lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedUser.name?.charAt(0) || selectedUser.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name || selectedUser.username}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  icon={<ActionIcons.close size={16} />}
                >
                  Close
                </Button>
              </div>

              {/* Individual Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatisticsCard
                  title="Total Enquiries"
                  value={individualMetrics.totalEnquiries}
                  icon={<BusinessIcons.briefcase size={24} />}
                  color="blue"
                  trend="neutral"
                  trendValue="All time"
                  subtitle="Assigned leads"
                />
                <StatisticsCard
                  title="Bookings Complete"
                  value={individualMetrics.closedWon}
                  icon={<BusinessIcons.award size={24} />}
                  color="green"
                  trend="up"
                  trendValue="Successful"
                  subtitle="Closed deals"
                />
                <StatisticsCard
                  title="Conversion Rate"
                  value={`${individualMetrics.conversionRate}%`}
                  icon={<ChartIcons.trending size={24} />}
                  color="purple"
                  trend={individualMetrics.conversionRate > 25 ? "up" : "neutral"}
                  trendValue={individualMetrics.conversionRate > 25 ? "Above average" : "Keep going"}
                  subtitle="Success rate"
                />
                <StatisticsCard
                  title="Revenue Generated"
                  value={formatCurrency(individualMetrics.revenue)}
                  icon={<BusinessIcons.trending size={24} />}
                  color="indigo"
                  trend="up"
                  trendValue="Total earnings"
                  subtitle="From bookings"
                />
              </div>

              {/* Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(individualMetrics.statusDistribution || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500">
                            ({individualMetrics.totalEnquiries > 0 ? Math.round((count / individualMetrics.totalEnquiries) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {individualMetrics.recentActivity?.map((enquiry) => (
                      <div key={enquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                          <div className="text-sm text-gray-500">{enquiry.customerEmail}</div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                            {enquiry.status?.replace(/_/g, ' ')}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(enquiry.updatedAt || enquiry.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SalesTeamPerformance;
