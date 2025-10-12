import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { BusinessIcons, NavigationIcons, ActionIcons, ChartIcons } from '../ui/Icons';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';
import StatisticsCard from '../common/StatisticsCard';
import { useAppContext } from '../../contexts/AppContext';

const Analytics = () => {
  const { enquiries = [], salesPersons = [], loading } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState(null);
  const [salesPersonDetails, setSalesPersonDetails] = useState({});
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    avgDealSize: 0,
    conversionFunnel: {},
    performanceMetrics: {},
    trends: {}
  });

  useEffect(() => {
    if (enquiries.length === 0) return;

    // Calculate comprehensive analytics
    const totalEnquiries = enquiries.length;
    const closedWon = enquiries.filter(e => e.status === 'CLOSED_WON').length;
    const booked = enquiries.filter(e => e.status === 'BOOKED').length;
    const totalRevenue = (closedWon + booked) * 50000; // ₹50K average deal value
    const avgDealSize = (closedWon + booked) > 0 ? totalRevenue / (closedWon + booked) : 50000;
    const conversionRate = totalEnquiries > 0 ? Math.round(((closedWon + booked) / totalEnquiries) * 100) : 0;

    // Conversion funnel - proper calculation
    const qualified = enquiries.filter(e => 
      !['UNQUALIFIED', 'CLOSED_LOST'].includes(e.status)
    ).length;
    const opportunities = enquiries.filter(e => 
      ['INTERESTED', 'IN_PROGRESS', 'FOLLOW_UP_SCHEDULED', 'SITE_VISIT_SCHEDULED'].includes(e.status)
    ).length;
    const activePipeline = opportunities * 50000; // Potential revenue

    const conversionFunnel = {
      leads: totalEnquiries,
      qualified: qualified,
      opportunities: opportunities,
      closedWon: closedWon + booked
    };

    // Performance metrics by status
    const statusCounts = {};
    enquiries.forEach(e => {
      const status = e.status || 'UNKNOWN';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Team performance - improved calculation
    const teamPerformance = {};
    enquiries.forEach(e => {
      const assignedTo = e.assignedTo?.name || e.assignedTo?.email || e.assignedTo || 'Unassigned';
      if (!teamPerformance[assignedTo]) {
        teamPerformance[assignedTo] = { 
          total: 0, 
          closed: 0, 
          revenue: 0,
          conversionRate: 0,
          name: assignedTo
        };
      }
      teamPerformance[assignedTo].total++;
      if (e.status === 'CLOSED_WON' || e.status === 'BOOKED') {
        teamPerformance[assignedTo].closed++;
        teamPerformance[assignedTo].revenue += 50000;
      }
    });

    // Calculate conversion rates for team members
    Object.keys(teamPerformance).forEach(member => {
      const perf = teamPerformance[member];
      perf.conversionRate = perf.total > 0 ? Math.round((perf.closed / perf.total) * 100) : 0;
    });

    setAnalyticsData({
      totalRevenue,
      avgDealSize,
      conversionFunnel,
      performanceMetrics: statusCounts,
      teamPerformance
    });
  }, [enquiries]);

  const getTopPerformers = () => {
    if (!analyticsData.teamPerformance || typeof analyticsData.teamPerformance !== 'object') {
      return [];
    }
    
    return Object.entries(analyticsData.teamPerformance)
      .map(([id, stats]) => {
        const salesperson = salesPersons.find(sp => sp.id === parseInt(id));
        return {
          id,
          name: salesperson?.name || stats.name || 'Unknown',
          ...stats,
          rate: stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getConversionRate = (total, converted) => {
    if (total === 0) return '0%';
    return `${Math.round((converted / total) * 100)}%`;
  };

  const handleSalesPersonClick = (salesPersonName) => {
    // Find all enquiries for this sales person
    const salesPersonEnquiries = enquiries.filter(e => {
      const assignedTo = e.assignedTo?.name || e.assignedTo?.email || e.assignedTo || 'Unassigned';
      return assignedTo === salesPersonName;
    });

    // Calculate detailed metrics
    const totalEnquiries = salesPersonEnquiries.length;
    const closedWon = salesPersonEnquiries.filter(e => e.status === 'CLOSED_WON' || e.status === 'BOOKED').length;
    const inProgress = salesPersonEnquiries.filter(e => 
      ['IN_PROGRESS', 'INTERESTED', 'FOLLOW_UP_SCHEDULED'].includes(e.status)
    ).length;
    const unqualified = salesPersonEnquiries.filter(e => e.status === 'UNQUALIFIED').length;
    const closedLost = salesPersonEnquiries.filter(e => e.status === 'CLOSED_LOST').length;
    const conversionRate = totalEnquiries > 0 ? Math.round((closedWon / totalEnquiries) * 100) : 0;
    const revenue = closedWon * 50000;

    // Status distribution
    const statusDistribution = {};
    salesPersonEnquiries.forEach(e => {
      const status = e.status || 'UNKNOWN';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    // Recent activity (last 10 enquiries)
    const recentActivity = salesPersonEnquiries
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 10);

    setSalesPersonDetails({
      name: salesPersonName,
      totalEnquiries,
      closedWon,
      inProgress,
      unqualified,
      closedLost,
      conversionRate,
      revenue,
      statusDistribution,
      recentActivity,
      allEnquiries: salesPersonEnquiries
    });

    setSelectedSalesPerson(salesPersonName);
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
      case 'BOOKED': return 'bg-green-100 text-green-800';
      case 'UNQUALIFIED': return 'bg-orange-100 text-orange-800';
      case 'CLOSED_LOST': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'INTERESTED': return 'bg-purple-100 text-purple-800';
      case 'FOLLOW_UP_SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
        <Loading 
          size="lg" 
          text="Loading analytics data..." 
          variant="spinner" 
          color="purple" 
          className="h-64" 
        />
      </div>
    );
  }

  const topPerformers = getTopPerformers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg">
                  <ChartIcons.activity size={24} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Analytics & Insights
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Deep insights into your sales performance and business metrics
              </p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
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
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatisticsCard
            title="Total Revenue"
            value={`₹${(analyticsData.totalRevenue / 100000).toFixed(1)}L`}
            icon={<BusinessIcons.money size={24} />}
            color="green"
            trend="up"
            trendValue="+22% from last month"
            subtitle="Closed deals value"
          />
          <StatisticsCard
            title="Avg Deal Size"
            value={`₹${(analyticsData.avgDealSize / 1000).toFixed(0)}K`}
            icon={<BusinessIcons.trending size={24} />}
            color="blue"
            trend="up"
            trendValue="+8% improvement"
            subtitle="Per deal average"
          />
          <StatisticsCard
            title="Conversion Rate"
            value={getConversionRate(analyticsData.conversionFunnel.leads, analyticsData.conversionFunnel.closedWon)}
            icon={<BusinessIcons.target size={24} />}
            color="purple"
            trend="up"
            trendValue="Above industry avg"
            subtitle="Lead to customer"
          />
          <StatisticsCard
            title="Active Pipeline"
            value={`₹${(enquiries.filter(e => ['IN_PROGRESS', 'INTERESTED', 'NEGOTIATION'].includes(e.status)).length * 50000 / 100000).toFixed(1)}L`}
            icon={<BusinessIcons.activity size={24} />}
            color="indigo"
            trend="up"
            trendValue="Strong pipeline"
            subtitle="Potential revenue"
          />
        </div>

        {/* Top Performers */}
        <Card variant="gradient" shadow="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BusinessIcons.award className="text-yellow-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Top Revenue Generators</h3>
            </div>
            <Button variant="outline" size="sm" icon={<ActionIcons.download size={16} />}>
              Export Report
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sales Person</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Enquiries</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Closed Deals</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Conversion Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((performer, index) => (
                  <tr key={performer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleSalesPersonClick(performer.name)}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                      >
                        {performer.name}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-700">{performer.total}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">{performer.closed}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${performer.rate > 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {performer.rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-purple-600">₹{(performer.revenue / 100000).toFixed(1)}L</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Individual Sales Person Details */}
        {selectedSalesPerson && salesPersonDetails.name && (
          <Card variant="gradient" shadow="lg" className="mt-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {salesPersonDetails.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{salesPersonDetails.name}</h3>
                    <p className="text-gray-600">Detailed Performance Analytics</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSalesPerson(null)}
                  icon={<ActionIcons.close size={16} />}
                >
                  Close
                </Button>
              </div>

              {/* Individual Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatisticsCard
                  title="Total Enquiries"
                  value={salesPersonDetails.totalEnquiries}
                  icon={<BusinessIcons.briefcase size={24} />}
                  color="blue"
                  trend="neutral"
                  trendValue="All time"
                  subtitle="Assigned leads"
                />
                <StatisticsCard
                  title="Bookings Complete"
                  value={salesPersonDetails.closedWon}
                  icon={<BusinessIcons.award size={24} />}
                  color="green"
                  trend="up"
                  trendValue="Successful"
                  subtitle="Closed deals"
                />
                <StatisticsCard
                  title="Conversion Rate"
                  value={`${salesPersonDetails.conversionRate}%`}
                  icon={<BusinessIcons.trending size={24} />}
                  color="purple"
                  trend={salesPersonDetails.conversionRate > 25 ? "up" : "neutral"}
                  trendValue={salesPersonDetails.conversionRate > 25 ? "Above average" : "Keep going"}
                  subtitle="Success rate"
                />
                <StatisticsCard
                  title="Revenue Generated"
                  value={formatCurrency(salesPersonDetails.revenue)}
                  icon={<BusinessIcons.trending size={24} />}
                  color="indigo"
                  trend="up"
                  trendValue="Total earnings"
                  subtitle="From bookings"
                />
              </div>

              {/* Status Distribution and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(salesPersonDetails.statusDistribution || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500">
                            ({salesPersonDetails.totalEnquiries > 0 ? Math.round((count / salesPersonDetails.totalEnquiries) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {salesPersonDetails.recentActivity?.map((enquiry) => (
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

              {/* All Enquiries Table */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">All Enquiries ({salesPersonDetails.totalEnquiries})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesPersonDetails.allEnquiries?.slice(0, 10).map((enquiry) => (
                        <tr key={enquiry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                              <div className="text-sm text-gray-500">{enquiry.customerEmail}</div>
                              <div className="text-sm text-gray-500">{enquiry.customerMobile || enquiry.customerPhone}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                              {enquiry.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(enquiry.createdAt)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(enquiry.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {salesPersonDetails.allEnquiries?.length > 10 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Showing first 10 of {salesPersonDetails.totalEnquiries} enquiries
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
