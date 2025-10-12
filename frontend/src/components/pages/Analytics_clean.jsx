import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { BusinessIcons, ActionIcons, ChartIcons } from '../ui/Icons';
import Loading from '../ui/Loading';
import StatisticsCard from '../common/StatisticsCard';
import { useAppContext } from '../../contexts/AppContext';

const Analytics = () => {
  const navigate = useNavigate();
  const { enquiries = [], salesPersons = [], loading } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    avgDealSize: 0,
    conversionFunnel: {},
    performanceMetrics: {},
    teamPerformance: {}
  });

  useEffect(() => {
    if (enquiries.length === 0) return;

    // Calculate comprehensive analytics
    const totalEnquiries = enquiries.length;
    const closedWon = enquiries.filter(e => e.status === 'CLOSED_WON').length;
    const booked = enquiries.filter(e => e.status === 'BOOKED').length;
    const totalRevenue = (closedWon + booked) * 50000; // ₹50K average deal value
    const avgDealSize = (closedWon + booked) > 0 ? totalRevenue / (closedWon + booked) : 50000;

    // Conversion funnel
    const qualified = enquiries.filter(e => 
      !['UNQUALIFIED', 'CLOSED_LOST'].includes(e.status)
    ).length;
    const opportunities = enquiries.filter(e => 
      ['INTERESTED', 'IN_PROGRESS', 'FOLLOW_UP_SCHEDULED', 'SITE_VISIT_SCHEDULED'].includes(e.status)
    ).length;

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

    // Team performance
    const teamPerformance = {};
    enquiries.forEach(e => {
      const assignedTo = e.assignedTo?.name || e.assignedTo?.email || e.assignedTo || 'Unassigned';
      if (!teamPerformance[assignedTo]) {
        teamPerformance[assignedTo] = { 
          total: 0, 
          closed: 0, 
          revenue: 0,
          name: assignedTo
        };
      }
      teamPerformance[assignedTo].total++;
      if (e.status === 'CLOSED_WON' || e.status === 'BOOKED') {
        teamPerformance[assignedTo].closed++;
        teamPerformance[assignedTo].revenue += 50000;
      }
    });

    // Calculate conversion rates
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
      .map(([id, stats]) => ({
        id,
        name: stats.name || 'Unknown',
        ...stats,
        rate: stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getConversionRate = (total, converted) => {
    if (total === 0) return '0%';
    return `${Math.round((converted / total) * 100)}%`;
  };

  const handleSalesPersonClick = (salesPersonName) => {
    navigate(`/sales-person-details/${encodeURIComponent(salesPersonName)}`);
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

        {/* Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card variant="gradient" shadow="lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartIcons.bar className="text-blue-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Conversion Funnel</h3>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Leads</span>
                  <span className="font-bold text-gray-900">{analyticsData.conversionFunnel.leads}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Qualified</span>
                  <span className="font-bold text-gray-900">{analyticsData.conversionFunnel.qualified}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{
                    width: `${(analyticsData.conversionFunnel.qualified / analyticsData.conversionFunnel.leads) * 100}%`
                  }}></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {getConversionRate(analyticsData.conversionFunnel.leads, analyticsData.conversionFunnel.qualified)} conversion
                </span>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Opportunities</span>
                  <span className="font-bold text-gray-900">{analyticsData.conversionFunnel.opportunities}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{
                    width: `${(analyticsData.conversionFunnel.opportunities / analyticsData.conversionFunnel.leads) * 100}%`
                  }}></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {getConversionRate(analyticsData.conversionFunnel.qualified, analyticsData.conversionFunnel.opportunities)} from qualified
                </span>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Closed Won</span>
                  <span className="font-bold text-gray-900">{analyticsData.conversionFunnel.closedWon}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{
                    width: `${(analyticsData.conversionFunnel.closedWon / analyticsData.conversionFunnel.leads) * 100}%`
                  }}></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {getConversionRate(analyticsData.conversionFunnel.opportunities, analyticsData.conversionFunnel.closedWon)} close rate
                </span>
              </div>
            </div>
          </Card>

          <Card variant="gradient" shadow="lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChartIcons.pie className="text-green-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Status Distribution</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analyticsData.performanceMetrics).slice(0, 6).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={status} size="sm" />
                    <span className="text-sm font-medium text-gray-700">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                    <div className="text-xs text-gray-500">
                      {Math.round((count / enquiries.length) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
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
      </div>
    </div>
  );
};

export default Analytics;
