import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { BusinessIcons, ActionIcons, ContactIcons } from '../ui/Icons';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';

const SalesPersonForm = () => {
  const { 
    salesPersons, 
    enquiries, 
    loading, 
    error, 
    createSalesPerson, 
    updateSalesPerson,
    deleteSalesPerson,
    assignSalesPerson,
    autoAssignSalesPerson,
    updateEnquiryStatus,
    getEnquiriesBySalesPerson,
    getUnassignedEnquiries,
    clearError
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('manage');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState(null);
  const [salesPersonEnquiries, setSalesPersonEnquiries] = useState([]);
  const [unassignedEnquiries, setUnassignedEnquiries] = useState([]);
  
  // Form states
  const [salesPersonForm, setSalesPersonForm] = useState({
    name: '',
    email: '',
    mobile: '',
    department: '',
    designation: '',
    isAvailable: true
  });

  const [assignmentForm, setAssignmentForm] = useState({
    enquiryId: '',
    salesPersonId: ''
  });

  useEffect(() => {
    loadUnassignedEnquiries();
  }, []);

  useEffect(() => {
    if (selectedSalesPerson) {
      loadSalesPersonEnquiries(selectedSalesPerson.id);
    }
  }, [selectedSalesPerson]);

  const loadUnassignedEnquiries = async () => {
    try {
      const unassigned = await getUnassignedEnquiries();
      setUnassignedEnquiries(unassigned);
    } catch (error) {
      console.error('Error loading unassigned enquiries:', error);
    }
  };

  const loadSalesPersonEnquiries = async (salesPersonId) => {
    try {
      const enquiries = await getEnquiriesBySalesPerson(salesPersonId);
      setSalesPersonEnquiries(enquiries);
    } catch (error) {
      console.error('Error loading sales person enquiries:', error);
    }
  };

  const handleCreateSalesPerson = async (e) => {
    e.preventDefault();
    const loadingToast = showToast.loading('Creating sales person...');
    
    try {
      await createSalesPerson(salesPersonForm);
      setSalesPersonForm({
        name: '',
        email: '',
        mobile: '',
        department: '',
        designation: '',
        isAvailable: true
      });
      showToast.dismiss(loadingToast);
      showToast.success('Sales person created successfully! 🎉');
    } catch (error) {
      console.error('Error creating sales person:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Failed to create sales person. Please try again.');
    }
  };

  const handleAssignEnquiry = async (enquiryId, salesPersonId) => {
    const loadingToast = showToast.loading('Assigning enquiry...');
    
    try {
      await assignSalesPerson(enquiryId, salesPersonId);
      await loadUnassignedEnquiries();
      if (selectedSalesPerson) {
        await loadSalesPersonEnquiries(selectedSalesPerson.id);
      }
      showToast.dismiss(loadingToast);
      showToast.success('Enquiry assigned successfully! ✅');
    } catch (error) {
      console.error('Error assigning enquiry:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Failed to assign enquiry. Please try again.');
    }
  };

  const handleAutoAssign = async (enquiryId) => {
    const loadingToast = showToast.loading('Auto-assigning enquiry...');
    
    try {
      await autoAssignSalesPerson(enquiryId);
      await loadUnassignedEnquiries();
      showToast.dismiss(loadingToast);
      showToast.success('Enquiry auto-assigned successfully! 🤖');
    } catch (error) {
      console.error('Error auto-assigning enquiry:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Failed to auto-assign enquiry. Please try again.');
    }
  };

  const handleStatusUpdate = async (enquiryId, newStatus) => {
    const loadingToast = showToast.loading('Updating status...');
    
    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      if (selectedSalesPerson) {
        await loadSalesPersonEnquiries(selectedSalesPerson.id);
      }
      showToast.dismiss(loadingToast);
      showToast.success('Status updated successfully! 📊');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Failed to update status. Please try again.');
    }
  };

  const handleDeleteSalesPerson = async (salesPersonId) => {
    if (window.confirm('⚠️ Are you sure you want to delete this sales person? This action cannot be undone.')) {
      const loadingToast = showToast.loading('Deleting sales person...');
      
      try {
        await deleteSalesPerson(salesPersonId);
        if (selectedSalesPerson && selectedSalesPerson.id === salesPersonId) {
          setSelectedSalesPerson(null);
          setSalesPersonEnquiries([]);
        }
        showToast.dismiss(loadingToast);
        showToast.success('Sales person deleted successfully!');
      } catch (error) {
        console.error('Error deleting sales person:', error);
        showToast.dismiss(loadingToast);
        showToast.error('Failed to delete sales person. Please try again.');
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
      case 'NEGOTIATION': return 'bg-pink-100 text-pink-800';
      case 'FINAL_BOOKING': return 'bg-lime-100 text-lime-800';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Loading 
          size="lg" 
          text="Loading sales team data..." 
          variant="spinner" 
          color="blue" 
          className="h-64" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <BusinessIcons.users size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Sales Team Management
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Efficiently manage your sales team, assign leads, and track performance with our comprehensive CRM tools
          </p>
        </div>

        {error && (
          <Card variant="danger" className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ActionIcons.alert className="text-red-500" size={20} />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                icon={<ActionIcons.close size={16} />}
                className="text-red-500 hover:text-red-700"
              />
            </div>
          </Card>
        )}

        {/* Professional Tabs */}
        <Card className="mb-8 p-2">
          <nav className="flex space-x-2">
            <Button
              variant={activeTab === 'manage' ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setActiveTab('manage')}
              icon={<BusinessIcons.users size={18} />}
              className="flex-1 justify-center"
            >
              Manage Team
            </Button>
            <Button
              variant={activeTab === 'assign' ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setActiveTab('assign')}
              icon={<ActionIcons.add size={18} />}
              className="flex-1 justify-center relative"
            >
              Assign Enquiries
              {unassignedEnquiries.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unassignedEnquiries.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'performance' ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setActiveTab('performance')}
              icon={<BusinessIcons.trending size={18} />}
              className="flex-1 justify-center"
            >
              Performance
            </Button>
          </nav>
        </Card>

        {/* Manage Sales Team Tab */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Sales Person Form */}
            <Card variant="gradient" shadow="lg" className="">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BusinessIcons.user className="text-blue-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Sales Person</h2>
              </div>
              
              <form onSubmit={handleCreateSalesPerson} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <BusinessIcons.user className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={salesPersonForm.name}
                        onChange={(e) => setSalesPersonForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <ContactIcons.email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        required
                        value={salesPersonForm.email}
                        onChange={(e) => setSalesPersonForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <ContactIcons.phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        required
                        value={salesPersonForm.mobile}
                        onChange={(e) => setSalesPersonForm(prev => ({ ...prev, mobile: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="relative">
                      <BusinessIcons.briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={salesPersonForm.department}
                        onChange={(e) => setSalesPersonForm(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Sales & Marketing"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Designation
                    </label>
                    <div className="relative">
                      <BusinessIcons.award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={salesPersonForm.designation}
                        onChange={(e) => setSalesPersonForm(prev => ({ ...prev, designation: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Sales Executive"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={salesPersonForm.isAvailable}
                    onChange={(e) => setSalesPersonForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                  />
                  <label htmlFor="isAvailable" className="ml-3 flex items-center text-sm font-medium text-gray-900">
                    <BusinessIcons.users className="mr-2 text-blue-600" size={16} />
                    Available for new assignments
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<ActionIcons.add size={20} />}
                >
                  Create Sales Person
                </Button>
              </form>
            </Card>

            {/* Sales Persons List */}
            <Card variant="gradient" shadow="lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BusinessIcons.users className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sales Team</h2>
                    <p className="text-sm text-gray-600">{salesPersons.length} team members</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Available</div>
                  <div className="text-lg font-bold text-green-600">
                    {salesPersons.filter(p => p.isAvailable ?? p.available).length}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {salesPersons.length === 0 ? (
                  <div className="text-center py-12">
                    <BusinessIcons.users className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">No team members yet</p>
                    <p className="text-gray-400 text-sm">Add your first sales person to get started</p>
                  </div>
                ) : (
                  salesPersons.map((person) => (
                    <Card key={person.id} hover={true} className="border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{person.name}</h3>
                              {person.designation && (
                                <p className="text-sm text-gray-600 font-medium">{person.designation}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <ContactIcons.email size={14} className="text-gray-400" />
                              <span>{person.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <ContactIcons.phone size={14} className="text-gray-400" />
                              <span>{person.mobile || person.phone}</span>
                            </div>
                            {person.department && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <BusinessIcons.briefcase size={14} className="text-gray-400" />
                                <span>{person.department}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              (person.isAvailable ?? person.available)
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                (person.isAvailable ?? person.available) ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              {(person.isAvailable ?? person.available) ? 'Available' : 'Unavailable'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSalesPerson(person)}
                            icon={<ActionIcons.view size={14} />}
                          >
                            View
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteSalesPerson(person.id)}
                            icon={<ActionIcons.delete size={14} />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Assign Enquiries Tab */}
        {activeTab === 'assign' && (
          <Card variant="gradient" shadow="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ActionIcons.add className="text-orange-600" size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Unassigned Enquiries</h2>
                  <p className="text-sm text-gray-600">{unassignedEnquiries.length} enquiries waiting for assignment</p>
                </div>
              </div>
              {unassignedEnquiries.length > 0 && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    unassignedEnquiries.forEach(enquiry => handleAutoAssign(enquiry.id));
                  }}
                  icon={<BusinessIcons.target size={16} />}
                >
                  Auto Assign All
                </Button>
              )}
            </div>
            
            {unassignedEnquiries.length === 0 ? (
              <div className="text-center py-16">
                <ActionIcons.check className="mx-auto text-green-400 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500 text-lg mb-4">No unassigned enquiries found.</p>
                <p className="text-gray-400 text-sm">New enquiries will appear here for assignment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unassignedEnquiries.map((enquiry) => (
                  <Card key={enquiry.id} hover={true} className="border border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Customer Info */}
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {enquiry.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{enquiry.customerName}</h4>
                              <p className="text-xs text-gray-500">ID: #{enquiry.id}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <ContactIcons.email size={12} className="text-gray-400" />
                              <span className="truncate">{enquiry.customerEmail}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <ContactIcons.phone size={12} className="text-gray-400" />
                              <span>{enquiry.customerMobile}</span>
                            </div>
                          </div>
                        </div>

                        {/* Property & Budget */}
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Property Details</h5>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <BusinessIcons.briefcase size={12} className="text-gray-400" />
                              <span>{formatPropertyType(enquiry.propertyType)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <BusinessIcons.money size={12} className="text-gray-400" />
                              <span className="font-medium text-green-600">{formatBudgetRange(enquiry.budgetRange)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Priority & Date */}
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Priority & Date</h5>
                          <div className="space-y-2">
                            <PriorityBadge priority={enquiry.priority} />
                            <div className="text-xs text-gray-500">
                              Created: {formatDate(enquiry.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 lg:ml-6">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignEnquiry(enquiry.id, parseInt(e.target.value));
                              e.target.value = '';
                            }
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
                        >
                          <option value="">Assign to...</option>
                          {salesPersons.filter(sp => (sp.isAvailable ?? sp.available)).map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAutoAssign(enquiry.id)}
                          icon={<BusinessIcons.target size={14} />}
                          className="w-full"
                        >
                          Auto Assign
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Performance View Tab */}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Person Selection */}
            <Card variant="gradient" shadow="lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BusinessIcons.trending className="text-purple-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Team Performance</h2>
              </div>
              
              <div className="space-y-3">
                {salesPersons.length === 0 ? (
                  <div className="text-center py-8">
                    <BusinessIcons.users className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No team members to display</p>
                  </div>
                ) : (
                  salesPersons.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => setSelectedSalesPerson(person)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedSalesPerson?.id === person.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">{person.name}</div>
                          <div className="text-sm text-gray-600">{person.email}</div>
                          {person.designation && (
                            <div className="text-xs text-gray-500">{person.designation}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            (person.isAvailable ?? person.available)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${
                              (person.isAvailable ?? person.available) ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            {(person.isAvailable ?? person.available) ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>

            {/* Selected Sales Person Enquiries */}
            <Card variant="gradient" shadow="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedSalesPerson ? `${selectedSalesPerson.name}'s Portfolio` : 'Performance Dashboard'}
                  </h2>
                  {selectedSalesPerson && (
                    <p className="text-sm text-gray-600">
                      Managing {salesPersonEnquiries.length} enquiries
                    </p>
                  )}
                </div>
                {selectedSalesPerson && salesPersonEnquiries.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Conversion Rate</div>
                    <div className="text-lg font-bold text-green-600">
                      {Math.round((salesPersonEnquiries.filter(e => e.status === 'CLOSED_WON').length / salesPersonEnquiries.length) * 100)}%
                    </div>
                  </div>
                )}
              </div>
              
              {selectedSalesPerson ? (
                <div>
                  {salesPersonEnquiries.length === 0 ? (
                    <div className="text-center py-12">
                      <BusinessIcons.briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500 text-lg">No enquiries assigned yet</p>
                      <p className="text-gray-400 text-sm">Assign some enquiries to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                      {salesPersonEnquiries.map((enquiry) => (
                        <Card key={enquiry.id} hover={true} className="border border-gray-200">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {enquiry.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{enquiry.customerName}</h4>
                                  <p className="text-xs text-gray-500">ID: #{enquiry.id}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <ContactIcons.email size={12} className="text-gray-400" />
                                  <span className="truncate">{enquiry.customerEmail}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <BusinessIcons.briefcase size={12} className="text-gray-400" />
                                  <span>{formatPropertyType(enquiry.propertyType)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <BusinessIcons.money size={12} className="text-gray-400" />
                                  <span className="font-medium text-green-600">{formatBudgetRange(enquiry.budgetRange)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <PriorityBadge priority={enquiry.priority} size="xs" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="lg:ml-4">
                              <select
                                value={enquiry.status}
                                onChange={(e) => handleStatusUpdate(enquiry.id, e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
                              >
                                <option value="NEW">New</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="INTERESTED">Interested</option>
                                <option value="NOT_INTERESTED">Not Interested</option>
                                <option value="UNQUALIFIED">Unqualified</option>
                                <option value="FOLLOW_UP_SCHEDULED">Follow-up Scheduled</option>
                                <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
                                <option value="NEGOTIATION">Negotiation</option>
                                <option value="FINAL_BOOKING">Final Booking</option>
                                <option value="CLOSED_WON">Closed Won</option>
                                <option value="CLOSED_LOST">Closed Lost</option>
                              </select>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BusinessIcons.trending className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Analytics</h3>
                  <p className="text-gray-500 text-lg mb-4">Select a team member to view their performance</p>
                  <p className="text-gray-400 text-sm">Track enquiries, conversion rates, and sales metrics</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPersonForm;
