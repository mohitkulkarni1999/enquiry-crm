import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { BusinessIcons, ActionIcons, UIIcons } from '../ui/Icons';
import Loading from '../ui/Loading';
import StatisticsCard from '../common/StatisticsCard';
import { useAppContext } from '../../contexts/AppContext';
import { enquiryAPI, salesPersonAPI } from '../../utils/api';

const SalesPersonDetails = () => {
  const { salesPersonName } = useParams();
  const navigate = useNavigate();
  const { enquiries = [], loading } = useAppContext();
  const [salesPersonDetails, setSalesPersonDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (salesPersonName) {
      loadSalesPersonData();
    }
  }, [salesPersonName]);

  const loadSalesPersonData = async () => {
    setIsLoading(true);
    
    try {
      // Decode the sales person name from URL
      const decodedName = decodeURIComponent(salesPersonName);
      console.log('Loading data for sales person:', decodedName);
      
      // First, try to get data from backend API
      let salesPersonEnquiries = [];
      
      try {
        // Get all sales persons to find the ID
        const salesPersons = await salesPersonAPI.getAll();
        console.log('All sales persons:', salesPersons);
        
        const currentSalesPerson = salesPersons.content?.find(sp => 
          sp.name === decodedName || 
          sp.username === decodedName ||
          sp.email === decodedName
        ) || salesPersons.find(sp => 
          sp.name === decodedName || 
          sp.username === decodedName ||
          sp.email === decodedName
        );
        
        console.log('Found sales person:', currentSalesPerson);
        
        if (currentSalesPerson && currentSalesPerson.id) {
          console.log('Fetching enquiries for sales person ID:', currentSalesPerson.id);
          salesPersonEnquiries = await enquiryAPI.getBySalesPerson(currentSalesPerson.id);
          console.log('Enquiries from API:', salesPersonEnquiries);
        }
      } catch (apiError) {
        console.log('API call failed, falling back to frontend filtering:', apiError);
      }
      
      // If API call failed or returned no results, fallback to frontend filtering
      if (salesPersonEnquiries.length === 0 && enquiries.length > 0) {
        console.log('Falling back to frontend filtering');
        salesPersonEnquiries = enquiries.filter(e => {
          if (!e.assignedTo) return false;
          
          // Handle different assignedTo formats
          if (typeof e.assignedTo === 'object' && e.assignedTo !== null) {
            return e.assignedTo.name === decodedName ||
                   e.assignedTo.username === decodedName ||
                   e.assignedTo.email === decodedName ||
                   e.assignedTo.user?.name === decodedName ||
                   e.assignedTo.user?.username === decodedName;
          }
          
          return e.assignedTo === decodedName;
        });
      }
      
      console.log(`Final result: ${salesPersonEnquiries.length} enquiries for ${decodedName}`);
      
      // Calculate metrics with the found enquiries
      calculateMetrics(decodedName, salesPersonEnquiries);
      
    } catch (error) {
      console.error('Error loading sales person data:', error);
      setIsLoading(false);
    }
  };

  const calculateMetrics = (decodedName, salesPersonEnquiries) => {

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

    // Monthly performance (last 6 months)
    const monthlyPerformance = {};
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
      const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      last6Months.push({ key: monthKey, name: monthName });
      monthlyPerformance[monthKey] = { bookings: 0, enquiries: 0 };
    }

    salesPersonEnquiries.forEach(e => {
      const enquiryMonth = new Date(e.createdAt).toISOString().substring(0, 7);
      if (monthlyPerformance[enquiryMonth]) {
        monthlyPerformance[enquiryMonth].enquiries++;
        if (e.status === 'CLOSED_WON' || e.status === 'BOOKED') {
          monthlyPerformance[enquiryMonth].bookings++;
        }
      }
    });

    setSalesPersonDetails({
      name: decodedName,
      totalEnquiries,
      closedWon,
      inProgress,
      unqualified,
      closedLost,
      conversionRate,
      revenue,
      statusDistribution,
      recentActivity,
      monthlyPerformance,
      last6Months,
      allEnquiries: salesPersonEnquiries
    });

    setIsLoading(false);
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
        <Loading 
          size="lg" 
          text="Loading sales person details..." 
          variant="spinner" 
          color="purple" 
          className="h-64" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/analytics')}
                icon={<UIIcons.chevronLeft size={16} />}
              >
                Back to Analytics
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {salesPersonDetails.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {salesPersonDetails.name}
                  </h1>
                  <p className="text-gray-600 text-lg">Detailed Performance Analytics</p>
                </div>
              </div>
            </div>
          </div>
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


        {/* Monthly Performance Chart */}
        <Card variant="gradient" shadow="lg" className="mb-8">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance (Last 6 Months)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {salesPersonDetails.last6Months?.map((month) => {
                const monthData = salesPersonDetails.monthlyPerformance[month.key] || { enquiries: 0, bookings: 0 };
                const conversionRate = monthData.enquiries > 0 ? Math.round((monthData.bookings / monthData.enquiries) * 100) : 0;
                
                return (
                  <div key={month.key} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">{month.name}</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{monthData.bookings}</div>
                    <div className="text-xs text-gray-500 mb-2">bookings</div>
                    <div className="text-sm text-gray-600">{monthData.enquiries} enquiries</div>
                    <div className="text-xs text-purple-600 font-medium">{conversionRate}% rate</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* All Enquiries Table */}
        <Card variant="gradient" shadow="lg">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">All Enquiries ({salesPersonDetails.totalEnquiries})</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesPersonDetails.allEnquiries?.map((enquiry) => (
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
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {enquiry.propertyType?.replace(/_/g, ' ') || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {enquiry.budgetRange?.replace(/_/g, ' ') || 'N/A'}
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
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesPersonDetails;
