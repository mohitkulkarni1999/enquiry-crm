import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { BusinessIcons, NavigationIcons, ActionIcons, ChartIcons } from '../ui/Icons';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';
import StatisticsCard from '../common/StatisticsCard';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../utils/api';

const SuperAdminDashboard = () => {
  const { enquiries = [], salesPersons = [], users = [], loading, loadEnquiries, loadSalesPersons, loadUsers } = useAppContext();
  const { user } = useAuth();
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEnquiries: 0,
    conversionRate: 0,
    revenue: 0,
    systemHealth: 'Excellent'
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'SALES',
    organization: ''
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

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
        console.error('Error loading super admin data:', error);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Calculate system metrics
    const totalEnquiries = enquiries.length;
    const closedWon = enquiries.filter(e => e.status === 'CLOSED_WON').length;
    const conversionRate = totalEnquiries > 0 ? Math.round((closedWon / totalEnquiries) * 100) : 0;
    const activeUsers = salesPersons.filter(sp => sp.isAvailable || sp.available).length;
    
    setSystemMetrics({
      totalUsers: salesPersons.length,
      activeUsers,
      totalEnquiries,
      conversionRate,
      revenue: closedWon * 50000, // Assuming average deal value
      systemHealth: 'Excellent'
    });
  }, [enquiries, salesPersons]);

  const getStatusDistribution = () => {
    const statusCounts = {};
    enquiries.forEach(enquiry => {
      statusCounts[enquiry.status] = (statusCounts[enquiry.status] || 0) + 1;
    });
    return statusCounts;
  };

  const getPriorityDistribution = () => {
    const priorityCounts = { 1: 0, 2: 0, 3: 0 };
    enquiries.forEach(enquiry => {
      priorityCounts[enquiry.priority] = (priorityCounts[enquiry.priority] || 0) + 1;
    });
    return priorityCounts;
  };

  const getTopPerformers = () => {
    console.log('=== ALL SALES PEOPLE PERFORMANCE ===');
    console.log('Total enquiries:', enquiries.length);
    console.log('Sales persons:', salesPersons);
    
    // Initialize performance for ALL sales people
    const performanceMap = {};
    
    // First, create entries for all sales people (even with 0 enquiries)
    salesPersons.forEach(sp => {
      const key = sp.name || sp.username || sp.id;
      performanceMap[key] = {
        id: sp.id,
        name: sp.name || sp.username || `Sales Person ${sp.id}`,
        total: 0,
        closed: 0,
        salesPerson: sp
      };
    });
    
    // Then count enquiries for each sales person
    enquiries.forEach(enquiry => {
      if (enquiry.assignedTo) {
        console.log(`Enquiry ${enquiry.id} assignedTo:`, enquiry.assignedTo);
        
        // Find the matching sales person
        let matchingSalesPerson = null;
        
        if (typeof enquiry.assignedTo === 'object' && enquiry.assignedTo !== null) {
          // Object format - find by ID or name
          const assignedId = enquiry.assignedTo.id;
          const assignedName = enquiry.assignedTo.name || enquiry.assignedTo.username;
          
          matchingSalesPerson = salesPersons.find(sp => 
            sp.id === assignedId || 
            sp.name === assignedName ||
            sp.username === assignedName
          );
        } else {
          // Direct ID/string assignment
          matchingSalesPerson = salesPersons.find(sp => 
            sp.id === enquiry.assignedTo || 
            sp.name === enquiry.assignedTo ||
            sp.username === enquiry.assignedTo
          );
        }
        
        if (matchingSalesPerson) {
          const key = matchingSalesPerson.name || matchingSalesPerson.username || matchingSalesPerson.id;
          if (performanceMap[key]) {
            performanceMap[key].total++;
            if (enquiry.status === 'CLOSED_WON' || enquiry.status === 'BOOKED') {
              performanceMap[key].closed++;
            }
          }
        }
      }
    });

    console.log('Performance map with all sales people:', performanceMap);

    return Object.entries(performanceMap)
      .map(([key, stats]) => ({
        id: stats.id,
        name: stats.name,
        total: stats.total,
        closed: stats.closed,
        rate: stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0,
        revenue: stats.closed * 50000 // Assuming average deal value
      }))
      .sort((a, b) => b.total - a.total); // Sort by total enquiries (not just closed)
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreatingUser(true);
    
    try {
      let response;
      if (userForm.role === 'CRM_ADMIN') {
        response = await authAPI.registerCrmAdmin({
          username: userForm.username,
          fullName: userForm.fullName,
          email: userForm.email,
          phone: userForm.phone,
          password: userForm.password,
        });
      } else if (userForm.role === 'SALES') {
        response = await authAPI.registerSales({
          username: userForm.username,
          fullName: userForm.fullName,
          email: userForm.email,
          phone: userForm.phone,
          password: userForm.password
        });
      } else if (userForm.role === 'SUPER_ADMIN') {
        response = await authAPI.registerSuperAdmin({
          username: userForm.username,
          fullName: userForm.fullName,
          email: userForm.email,
          password: userForm.password,
          organization: userForm.organization
        });
      }

      if (response?.success) {
        showToast.success(`${userForm.role.replace('_', ' ')} user created successfully!`);
        setUserForm({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          password: '',
          role: 'SALES',
          organization: ''
        });
        setShowUserForm(false);
        await loadUsers();
        await loadSalesPersons();
      } else {
        showToast.error(response?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast.error('Failed to create user. Please try again.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleFormChange = (e) => {
    setUserForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      password: '', // Don't pre-fill password
      role: user.role,
      organization: user.organization || ''
    });
    setShowUserForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdatingUser(true);
    
    try {
      let response;
      const updateData = {
        username: userForm.username,
        fullName: userForm.fullName,
        email: userForm.email,
        phone: userForm.phone,
        password: userForm.password || undefined, // Only update password if provided
        role: userForm.role
      };

      if (userForm.role === 'CRM_ADMIN') {
        response = await authAPI.updateCrmAdmin(editingUser.id, updateData);
      } else if (userForm.role === 'SALES') {
        response = await authAPI.updateSales(editingUser.id, updateData);
      } else if (userForm.role === 'SUPER_ADMIN') {
        response = await authAPI.updateSuperAdmin(editingUser.id, {
          ...updateData,
          organization: userForm.organization
        });
      }

      if (response?.success) {
        showToast.success(`${userForm.role.replace('_', ' ')} user updated successfully!`);
        setUserForm({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          password: '',
          role: 'SALES',
          organization: ''
        });
        setShowUserForm(false);
        setEditingUser(null);
        await loadUsers();
        await loadSalesPersons();
      } else {
        showToast.error(response?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast.error('Failed to update user. Please try again.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeletingUser(true);
    try {
      const response = await authAPI.deleteUser(userId);
      if (response?.success) {
        showToast.success(`User "${username}" deleted successfully!`);
        await loadUsers();
        await loadSalesPersons();
      } else {
        showToast.error(response?.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast.error('Failed to delete user. Please try again.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const statusDistribution = getStatusDistribution();
  const priorityDistribution = getPriorityDistribution();
  const topPerformers = getTopPerformers();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Loading 
          size="lg" 
          text="Loading Super Admin Dashboard..." 
          variant="spinner" 
          color="blue" 
          className="h-64" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
              <NavigationIcons.settings size={36} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
            Complete system overview and administrative controls for your CRM platform
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatisticsCard
            title="Total Users"
            value={systemMetrics.totalUsers}
            icon={<BusinessIcons.users size={24} />}
            color="blue"
            trend="up"
            trendValue="+12% this month"
            subtitle="System-wide users"
            className="h-full"
          />
          <StatisticsCard
            title="Active Users"
            value={systemMetrics.activeUsers}
            icon={<BusinessIcons.user size={24} />}
            color="green"
            trend="up"
            trendValue="+8% this week"
            subtitle="Currently active"
            className="h-full"
          />
          <StatisticsCard
            title="Total Enquiries"
            value={systemMetrics.totalEnquiries}
            icon={<BusinessIcons.briefcase size={24} />}
            color="purple"
            trend="up"
            trendValue="+25% this month"
            subtitle="All time enquiries"
            className="h-full"
          />
          <StatisticsCard
            title="Conversion Rate"
            value={`${systemMetrics.conversionRate}%`}
            icon={<BusinessIcons.trending size={24} />}
            color="indigo"
            trend={systemMetrics.conversionRate > 20 ? "up" : "down"}
            trendValue={systemMetrics.conversionRate > 20 ? "+5% improvement" : "Needs attention"}
            subtitle="Lead to customer"
            className="h-full"
          />
        </div>


        {/* Status & Priority Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card variant="gradient" shadow="lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChartIcons.pie className="text-orange-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Status Distribution</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={status} size="sm" />
                    <span className="text-sm font-medium text-gray-700">{status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="gradient" shadow="lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <ChartIcons.bar className="text-red-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Priority Distribution</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(priorityDistribution).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <PriorityBadge priority={parseInt(priority)} size="sm" />
                    <span className="text-sm font-medium text-gray-700">
                      {priority === '1' ? 'Low' : priority === '2' ? 'Medium' : 'High'} Priority
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* User Management */}
        <Card variant="gradient" shadow="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BusinessIcons.users className="text-indigo-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">User Management</h3>
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              icon={<ActionIcons.add size={16} />}
              onClick={() => setShowUserForm(true)}
            >
              Add User
            </Button>
          </div>
          
          {showUserForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h4>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      value={userForm.role}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SALES">Sales Representative</option>
                      <option value="CRM_ADMIN">CRM Administrator</option>
                      <option value="SUPER_ADMIN">Super Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={userForm.username}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={userForm.fullName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={userForm.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {editingUser && <span className="text-gray-500">(leave blank to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={userForm.password}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                      required={!editingUser}
                    />
                  </div>
                  {userForm.role === 'SUPER_ADMIN' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                      <input
                        type="text"
                        name="organization"
                        value={userForm.organization}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter organization"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                      setUserForm({
                        username: '',
                        fullName: '',
                        email: '',
                        phone: '',
                        password: '',
                        role: 'SALES',
                        organization: ''
                      });
                    }}
                    disabled={isCreatingUser || isUpdatingUser}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingUser || isUpdatingUser}
                    icon={(isCreatingUser || isUpdatingUser) ? <ActionIcons.loading size={16} className="animate-spin" /> : <ActionIcons.check size={16} />}
                  >
                    {isUpdatingUser ? 'Updating...' : isCreatingUser ? 'Creating...' : editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.role?.replace('_', ' ')} • {user.email || 'No email'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'CRM_ADMIN' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role?.replace('_', ' ')}
                  </span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                      disabled={isDeletingUser}
                      icon={<ActionIcons.edit size={14} />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={isDeletingUser}
                      icon={isDeletingUser ? <ActionIcons.loading size={14} className="animate-spin" /> : <ActionIcons.delete size={14} />}
                    >
                      {isDeletingUser ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* All Sales People Performance */}
        <Card variant="gradient" shadow="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BusinessIcons.users className="text-yellow-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sales Team Performance</h3>
            </div>
            <div className="text-sm text-gray-600">
              Total: {topPerformers.length} Sales People
            </div>
          </div>
          <div className="space-y-3">
            {topPerformers.length > 0 ? topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-blue-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{performer.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📊 {performer.total} Total Enquiries</span>
                      <span>✅ {performer.closed} Closed Deals</span>
                      <span>💰 ₹{(performer.revenue / 1000).toFixed(0)}K Revenue</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{performer.rate}%</p>
                      <p className="text-xs text-gray-500">Conversion Rate</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      performer.rate >= 50 ? 'bg-green-500' : 
                      performer.rate >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <BusinessIcons.users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No sales people found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
