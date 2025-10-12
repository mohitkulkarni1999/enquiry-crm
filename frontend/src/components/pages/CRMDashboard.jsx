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

const CRMDashboard = () => {
  const { enquiries = [], salesPersons = [], users = [], loading, error, deleteEnquiry, updateEnquiry, loadEnquiries, loadSalesPersons, loadUsers } = useAppContext();
  const { user } = useAuth();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalEnquiries: 0,
    newEnquiries: 0,
    inProgress: 0,
    converted: 0,
    conversionRate: 0,
    avgResponseTime: '2.5 hours',
    topSources: []
  });

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
        console.error('Error loading dashboard data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Calculate dashboard metrics when data changes
  useEffect(() => {
    if (!enquiries || !Array.isArray(enquiries)) return;

    const totalEnquiries = enquiries.length;
    const newEnquiries = enquiries.filter(e => e.status === 'NEW' || e.status === 'PENDING').length;
    const inProgress = enquiries.filter(e => 
      ['IN_PROGRESS', 'INTERESTED', 'FOLLOW_UP_SCHEDULED', 'SITE_VISIT_SCHEDULED'].includes(e.status)
    ).length;
    const converted = enquiries.filter(e => e.status === 'CLOSED_WON').length;
    const conversionRate = totalEnquiries > 0 ? Math.round((converted / totalEnquiries) * 100) : 0;

    // Calculate top sources
    const sourceCount = {};
    enquiries.forEach(e => {
      if (e.source) {
        sourceCount[e.source] = (sourceCount[e.source] || 0) + 1;
      }
    });
    
    const topSources = Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    setDashboardMetrics({
      totalEnquiries,
      newEnquiries,
      inProgress,
      converted,
      conversionRate,
      avgResponseTime: '2.5 hours',
      topSources
    });
  }, [enquiries]);

  // Calculate statistics
  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'NEW').length,
    assigned: enquiries.filter(e => e.status === 'ASSIGNED').length,
    inProgress: enquiries.filter(e => e.status === 'IN_PROGRESS').length,
    interested: enquiries.filter(e => e.status === 'INTERESTED').length,
    notInterested: enquiries.filter(e => e.status === 'NOT_INTERESTED').length,
    finalBooking: enquiries.filter(e => e.status === 'FINAL_BOOKING').length,
    closedWon: enquiries.filter(e => e.status === 'CLOSED_WON').length,
    closedLost: enquiries.filter(e => e.status === 'CLOSED_LOST').length
  };

  const handleStatusUpdate = async (enquiryId, newStatus) => {
    try {
      await updateEnquiry(enquiryId, { status: newStatus });
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (enquiryId) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await deleteEnquiry(enquiryId);
        alert('Enquiry deleted successfully!');
      } catch (error) {
        console.error('Error deleting enquiry:', error);
        alert('Failed to delete enquiry');
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'INTERESTED': return 'bg-green-100 text-green-800';
      case 'NOT_INTERESTED': return 'bg-red-100 text-red-800';
      case 'UNQUALIFIED': return 'bg-gray-100 text-gray-800';
      case 'FOLLOW_UP_SCHEDULED': return 'bg-orange-100 text-orange-800';
      case 'SITE_VISIT_SCHEDULED': return 'bg-indigo-100 text-indigo-800';
      case 'SITE_VISIT_COMPLETED': return 'bg-teal-100 text-teal-800';
      case 'NEGOTIATION': return 'bg-pink-100 text-pink-800';
      case 'DOCUMENTATION': return 'bg-cyan-100 text-cyan-800';
      case 'TOKEN_PAYMENT': return 'bg-emerald-100 text-emerald-800';
      case 'LOAN_PROCESSING': return 'bg-violet-100 text-violet-800';
      case 'FINAL_BOOKING': return 'bg-lime-100 text-lime-800';
      case 'REGISTRATION_COMPLETE': return 'bg-green-200 text-green-900';
      case 'CLOSED_WON': return 'bg-green-200 text-green-900';
      case 'CLOSED_LOST': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 3: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatPropertyType = (propertyType) => {
    if (!propertyType) return 'N/A';
    return propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatBudgetRange = (budgetRange) => {
    if (!budgetRange) return 'N/A';
    const budgetMap = {
      'UNDER_5L': 'Under ₹5L',
      'FIVE_TO_10L': '₹5-10L',
      'TEN_TO_20L': '₹10-20L',
      'TWENTY_TO_30L': '₹20-30L',
      'THIRTY_TO_50L': '₹30-50L',
      'FIFTY_TO_75L': '₹50-75L',
      'SEVENTY_FIVE_L_TO_1CR': '₹75L-1Cr',
      'ONE_TO_1_5CR': '₹1-1.5Cr',
      'ONE_5_TO_2CR': '₹1.5-2Cr',
      'TWO_TO_3CR': '₹2-3Cr',
      'THREE_TO_5CR': '₹3-5Cr',
      'ABOVE_5CR': 'Above ₹5Cr'
    };
    return budgetMap[budgetRange] || budgetRange;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Loading 
          size="lg" 
          text="Loading CRM Dashboard..." 
          variant="spinner" 
          color="blue" 
          className="h-64" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <NavigationIcons.crm size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    CRM Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1">
                    Comprehensive overview of your customer relationship management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['week', 'month', 'quarter'].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className="capitalize min-w-[80px] text-sm"
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatisticsCard
            title="Total Enquiries"
            value={enquiries.length}
            icon={<BusinessIcons.briefcase size={24} />}
            color="blue"
            trend="up"
            trendValue="+15% from last month"
            subtitle="All enquiries"
            className="h-full"
          />
          <StatisticsCard
            title="New Enquiries"
            value={enquiries.filter(e => e.status === 'NEW').length}
            icon={<BusinessIcons.user size={24} />}
            color="green"
            trend="up"
            trendValue="+8 this week"
            subtitle="Awaiting assignment"
            className="h-full"
          />
          <StatisticsCard
            title="In Progress"
            value={enquiries.filter(e => e.status === 'IN_PROGRESS' || e.status === 'ASSIGNED').length}
            icon={<BusinessIcons.activity size={24} />}
            color="yellow"
            trend="neutral"
            trendValue="Active pipeline"
            subtitle="Being worked on"
            className="h-full"
          />
          <StatisticsCard
            title="Conversion Rate"
            value={`${enquiries.length > 0 ? Math.round((enquiries.filter(e => e.status === 'CLOSED_WON').length / enquiries.length) * 100) : 0}%`}
            icon={<BusinessIcons.trending size={24} />}
            color="purple"
            trend="up"
            trendValue="Above target"
            subtitle="Lead to customer"
            className="h-full"
          />
        </div>

        {/* Full Enquiries Table */}
        <Card variant="gradient" shadow="lg" className="overflow-hidden">
          <div className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ChartIcons.bar className="text-indigo-600" size={20} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">All Enquiries</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" icon={<ActionIcons.filter size={16} />} className="flex-1 sm:flex-none">
                  Filter
                </Button>
                <Button variant="primary" size="sm" icon={<ActionIcons.download size={16} />} className="flex-1 sm:flex-none">
                  Export
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <EnquiryTable enquiries={enquiries} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CRMDashboard;
