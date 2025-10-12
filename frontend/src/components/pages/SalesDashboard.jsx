import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { BusinessIcons, NavigationIcons, ActionIcons, ChartIcons, ContactIcons } from '../ui/Icons';
import { showToast } from '../ui/Toast';
import Loading from '../ui/Loading';
import StatisticsCard from '../common/StatisticsCard';
import EnquiryTable from '../common/EnquiryTable';
import FollowUpNotifications from '../common/FollowUpNotifications';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { commentAPI, enquiryAPI, salesPersonAPI } from '../../utils/api';
import { exportEnquiriesToExcel } from '../../utils/excelExport';
import { exportEnquiriesToCSV } from '../../utils/csvExport';

const SalesDashboard = () => {
  const { enquiries = [], loading, updateEnquiryStatus, updateInterestLevel, loadEnquiries, scheduleEnquiryFollowUp } = useAppContext();
  const { user } = useAuth();
  const [myEnquiries, setMyEnquiries] = useState([]);
  const [salesMetrics, setSalesMetrics] = useState({
    totalAssigned: 0,
    inProgress: 0,
    converted: 0,
    conversionRate: 0,
    thisWeekCalls: 12,
    thisWeekMeetings: 8
  });
  const [commentModal, setCommentModal] = useState({ isOpen: false, enquiryId: null, enquiry: null });
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [totalBookings, setTotalBookings] = useState(0);

  const loadMyEnquiries = () => {
    if (!enquiries || !Array.isArray(enquiries) || !user) {
      return;
    }

    console.log('Loading enquiries for user:', user.id, 'Total enquiries:', enquiries.length);
    
    const assigned = enquiries.filter(e => 
      e.assignedTo?.id === user.id || 
      e.assignedTo?.user?.id === user.id ||
      e.assignedTo === user.id
    );
    
    console.log('Assigned enquiries:', assigned.length);
    console.log('Sample enquiry data:', assigned[0]);
    
    setMyEnquiries(assigned);
  };

  useEffect(() => {
    const loadUserEnquiries = async () => {
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('=== SALES DASHBOARD DEBUG ===');
      console.log('Current user:', user);
      
      try {
        // First, try to get enquiries by sales person ID using the backend API
        let userEnquiries = [];
        
        if (user.id) {
          console.log('Fetching enquiries for user ID:', user.id);
          userEnquiries = await enquiryAPI.getBySalesPerson(user.id);
          console.log('Enquiries from API by user ID:', userEnquiries);
        }
        
        // Skip the problematic username API call
        
        // If still no enquiries, try to find the sales person by username and get their ID
        if (userEnquiries.length === 0 && user.username) {
          console.log('No enquiries found by username, trying to find sales person by username:', user.username);
          
          // Get all sales persons and find the one matching current user
          const salesPersons = await salesPersonAPI.getAll();
          console.log('All sales persons:', salesPersons);
          
          const currentSalesPerson = salesPersons.content?.find(sp => 
            sp.name === user.username || 
            sp.username === user.username ||
            sp.email === user.email ||
            sp.user?.username === user.username
          ) || salesPersons.find(sp => 
            sp.name === user.username || 
            sp.username === user.username ||
            sp.email === user.email ||
            sp.user?.username === user.username
          );
          
          console.log('Found sales person:', currentSalesPerson);
          
          if (currentSalesPerson && currentSalesPerson.id) {
            console.log('Fetching enquiries for sales person ID:', currentSalesPerson.id);
            userEnquiries = await enquiryAPI.getBySalesPerson(currentSalesPerson.id);
            console.log('Enquiries from API by sales person ID:', userEnquiries);
          }
        }
        
        // If still no enquiries, fallback to filtering all enquiries (as backup)
        if (userEnquiries.length === 0 && enquiries && enquiries.length > 0) {
          console.log('Fallback: filtering all enquiries on frontend');
          userEnquiries = enquiries.filter(e => {
            if (!e.assignedTo) return false;
            
            if (typeof e.assignedTo === 'object' && e.assignedTo !== null) {
              return e.assignedTo.id === user.id || 
                     e.assignedTo.name === user.username ||
                     e.assignedTo.username === user.username;
            }
            
            return e.assignedTo === user.id || e.assignedTo === user.username;
          });
        }
        
        console.log('Final user enquiries:', userEnquiries.length);
        console.log('User enquiries data:', userEnquiries);
        
        setMyEnquiries(userEnquiries);

        // Calculate metrics
        const totalAssigned = userEnquiries.length;
        const inProgress = userEnquiries.filter(e => 
          ['IN_PROGRESS', 'INTERESTED', 'FOLLOW_UP_SCHEDULED', 'SITE_VISIT_SCHEDULED'].includes(e.status)
        ).length;
        const converted = userEnquiries.filter(e => e.status === 'CLOSED_WON').length;
        const conversionRate = totalAssigned > 0 ? Math.round((converted / totalAssigned) * 100) : 0;
        
        // Set total bookings for this sales person
        setTotalBookings(converted);

        setSalesMetrics({
          totalAssigned,
          inProgress,
          converted,
          conversionRate,
          thisWeekCalls: 12,
          thisWeekMeetings: 8
        });

      } catch (error) {
        console.error('Error loading user enquiries:', error);
        // Fallback to empty array
        setMyEnquiries([]);
      }
    };

    loadUserEnquiries();
  }, [enquiries, user]);

  // Load comment counts when myEnquiries changes
  useEffect(() => {
    if (myEnquiries.length > 0) {
      loadCommentCounts();
    }
  }, [myEnquiries]);

  const getRecentActivity = () => {
    return myEnquiries
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
  };

  const getUpcomingTasks = () => {
    return myEnquiries
      .filter(e => ['FOLLOW_UP_SCHEDULED', 'SITE_VISIT_SCHEDULED'].includes(e.status))
      .slice(0, 5);
  };

  const interestOptions = [
    { value: '', label: 'Select Interest Level' },
    { value: 'HOT', label: '🔥 Hot' },
    { value: 'WARM', label: '🌡️ Warm' },
    { value: 'COLD', label: '❄️ Cold' },
  ];

  const actionOptions = [
    { value: '', label: 'Select Action' },
    { value: 'FOLLOW_UP', label: 'Follow Up' },
    { value: 'INVENTORY_SALE', label: 'Inventory Sale' },
    { value: 'INVENTORY_HOLD', label: 'Inventory Hold' },
    { value: 'TAKEN_RECEIVED', label: 'Token Received' },
    { value: 'TOKEN', label: 'Token Process' },
    { value: 'BOOKED', label: '🎉 Booked (Final)' },
    { value: 'UNQUALIFIED', label: 'Unqualified' },
  ];

  const handleInterestChange = async (enquiryId, interest) => {
    try {
      if (interest && interest !== '') {
        console.log('Updating interest level:', enquiryId, interest);
        await updateInterestLevel(enquiryId, interest);
        showToast.success('Interest level updated successfully');
        loadMyEnquiries();
      }
    } catch (e) {
      console.error('Error updating interest level:', e);
      showToast.error('Failed to update interest level');
    }
  };

  const handleActionChange = async (enquiryId, status) => {
    try {
      if (status && status !== '') {
        console.log('Updating action:', enquiryId, status);
        
        // Handle BOOKED as final stage with confirmation
        if (status === 'BOOKED') {
          const confirmed = window.confirm(
            '🎉 Confirm Booking?\n\nThis will mark the enquiry as successfully closed (BOOKED). This is the final stage and indicates the deal is complete.\n\nAre you sure you want to proceed?'
          );
          
          if (confirmed) {
            await updateEnquiryStatus(enquiryId, 'CLOSED_WON'); // Mark as successfully closed
            showToast.success('🎉 Congratulations! Booking confirmed and enquiry successfully closed!');
          } else {
            // Reset the dropdown if user cancels
            loadMyEnquiries();
            return;
          }
        } else {
          await updateEnquiryStatus(enquiryId, status);
          
          // Show appropriate success messages for different actions
          const successMessages = {
            'FOLLOW_UP': 'Follow-up scheduled successfully',
            'INVENTORY_SALE': 'Inventory sale process initiated',
            'INVENTORY_HOLD': 'Inventory put on hold',
            'TAKEN_RECEIVED': 'Token received successfully',
            'TOKEN': 'Token process initiated',
            'UNQUALIFIED': 'Lead marked as unqualified'
          };
          
          const message = successMessages[status] || 'Action updated successfully';
          showToast.success(message);
        }
        
        loadMyEnquiries();
      }
    } catch (e) {
      console.error('Error updating action:', e);
      showToast.error('Failed to update action');
    }
  };

  const handleFollowUpDate = async (enquiryId, date) => {
    try {
      await scheduleEnquiryFollowUp(enquiryId, date);
    } catch (e) {
      console.error(e);
    }
  };


  const openCommentModal = async (enquiry) => {
    setCommentModal({ isOpen: true, enquiryId: enquiry.id, enquiry });
    setNewComment('');
    
    // Load comments for this enquiry
    try {
      const enquiryComments = await commentAPI.getByEnquiry(enquiry.id);
      setComments(enquiryComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  };

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, enquiryId: null, enquiry: null });
    setNewComment('');
    setComments([]);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await commentAPI.add(commentModal.enquiryId, user.id, newComment.trim());
      showToast.success('Comment added successfully');
      setNewComment('');
      
      // Reload comments
      const updatedComments = await commentAPI.getByEnquiry(commentModal.enquiryId);
      setComments(updatedComments);
      
      // Update comment count
      loadCommentCounts();
      
      closeCommentModal();
    } catch (e) {
      console.error(e);
      showToast.error('Failed to add comment');
    }
  };

  const loadCommentCounts = async () => {
    if (!myEnquiries || myEnquiries.length === 0) return;
    
    const counts = {};
    for (const enquiry of myEnquiries) {
      try {
        const count = await commentAPI.getCount(enquiry.id);
        counts[enquiry.id] = count;
      } catch (error) {
        console.error('Error loading comment count for enquiry:', enquiry.id, error);
        counts[enquiry.id] = 0;
      }
    }
    setCommentCounts(counts);
  };

  const handleExcelExport = async () => {
    try {
      showToast.loading('Preparing export...');
      
      console.log('Starting export with myEnquiries:', myEnquiries);
      
      // Create a simple CSV export with actual data
      const csvRows = [];
      let serialNo = 1;

      // CSV Headers
      const headers = [
        'Sr. No.',
        'Customer Name',
        'Phone',
        'Email',
        'Property Type',
        'Budget Range',
        'Interest Level',
        'Action',
        'Follow Up Date',
        'Comments/Notes',
        'Current Status',
        'Created Date',
        'Last Updated'
      ];
      
      csvRows.push(headers.join(','));

      // Process each enquiry
      for (const enquiry of myEnquiries) {
        console.log('Processing enquiry:', enquiry);
        
        // Try to load comments
        let comments = [];
        try {
          comments = await commentAPI.getByEnquiry(enquiry.id);
          console.log(`Comments for enquiry ${enquiry.id}:`, comments);
        } catch (error) {
          console.error('Error loading comments for enquiry:', enquiry.id, error);
        }

        // Create activities array
        const activities = [];
        
        // Add initial enquiry
        activities.push({
          type: 'Initial Enquiry',
          text: enquiry.description || enquiry.requirements || enquiry.notes || 'Initial enquiry received',
          date: enquiry.createdAt,
          author: enquiry.assignedTo?.name || enquiry.assignedTo?.email || enquiry.createdBy || 'System'
        });
        
        // Add comments as separate activities
        if (comments && comments.length > 0) {
          comments.forEach((comment, index) => {
            console.log(`Comment ${index + 1} full structure:`, JSON.stringify(comment, null, 2));
            
            let commentText = '';
            let commentAuthor = 'System';
            let commentDate = enquiry.updatedAt;
            
            // Handle different comment structures
            if (typeof comment === 'string') {
              commentText = comment;
            } else if (comment && typeof comment === 'object') {
              // Extract comment text from various possible fields
              commentText = comment.text || 
                           comment.comment || 
                           comment.content || 
                           comment.message || 
                           comment.description || 
                           comment.notes ||
                           comment.commentText ||
                           '';
              
              // Extract author information
              commentAuthor = comment.author || 
                             comment.createdBy || 
                             comment.user?.name || 
                             comment.user?.fullName ||
                             comment.userName || 
                             comment.authorName ||
                             'System';
              
              // Extract date information
              commentDate = comment.createdAt || 
                           comment.date || 
                           comment.timestamp || 
                           comment.dateCreated ||
                           enquiry.updatedAt;
            }
            
            const textString = String(commentText || '').trim();
            console.log(`Comment ${index + 1} extracted:`, {
              text: textString,
              author: commentAuthor,
              date: commentDate
            });
            
            if (textString && textString !== '{}' && textString !== '[object Object]') {
              // Format the comment with proper structure
              const formattedDate = formatDate(commentDate);
              const formattedComment = `Comment #${index + 1} by ${commentAuthor} (${formattedDate}): "${textString}"`;
              
              activities.push({
                type: 'Comment',
                text: formattedComment,
                date: commentDate,
                author: commentAuthor
              });
            }
          });
        }

        // Debug enquiry fields for Action and Interest
        console.log('Enquiry fields:', {
          interestLevel: enquiry.interestLevel,
          status: enquiry.status,
          fullEnquiry: enquiry
        });

        // Base enquiry data
        const baseData = [
          enquiry.customerName || enquiry.name || 'N/A',
          enquiry.customerMobile || enquiry.customerPhone || enquiry.phone || 'N/A',
          enquiry.customerEmail || enquiry.email || 'N/A',
          enquiry.propertyType?.replace(/_/g, ' ') || 'Not Specified',
          enquiry.budgetRange?.replace(/_/g, ' ') || 'Not Specified',
          getInterestLevelText(enquiry.interestLevel),
          getActionText(enquiry.status), // Use status field for action
          formatDate(enquiry.followUpDate || enquiry.nextFollowUp),
          getStatusText(enquiry.status), // Use status field for status display too
          formatDate(enquiry.createdAt),
          formatDate(enquiry.updatedAt)
        ];

        // Create a row for each activity
        activities.forEach((activity, index) => {
          const rowData = [
            index === 0 ? serialNo++ : '', // Sr. No. only on first row
            index === 0 ? baseData[0] : '', // Customer Name only on first row
            index === 0 ? baseData[1] : '', // Phone only on first row
            index === 0 ? baseData[2] : '', // Email only on first row
            index === 0 ? baseData[3] : '', // Property Type only on first row
            index === 0 ? baseData[4] : '', // Budget Range only on first row
            index === 0 ? baseData[5] : '', // Interest Level only on first row
            index === 0 ? baseData[6] : '', // Action only on first row
            index === 0 ? baseData[7] : '', // Follow Up Date only on first row
            activity.text, // Comments/Notes - each activity gets its own row
            index === 0 ? baseData[8] : '', // Current Status only on first row
            index === 0 ? baseData[9] : '', // Created Date only on first row
            index === 0 ? baseData[10] : ''  // Last Updated only on first row
          ];

          // Escape and add row
          csvRows.push(rowData.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
        });
      }

      // Create and download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `My_Enquiries_${timestamp}.csv`;
        
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast.success(
          `✅ CSV export successful!\n\n` +
          `📊 ${myEnquiries.length} enquiries exported\n` +
          `📝 ${csvRows.length - 1} total rows\n` +
          `📁 File: ${filename}`
        );
      } else {
        showToast.error('❌ Download not supported in this browser');
      }
      
    } catch (error) {
      console.error('Error during export:', error);
      showToast.error('❌ Failed to export file. Please try again.');
    }
  };

  // Helper functions for export
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getInterestLevelText = (level) => {
    if (!level) return 'Not Set';
    
    switch (level.toUpperCase()) {
      case 'HOT': return '🔥 Hot';
      case 'WARM': return '🌡️ Warm';
      case 'COLD': return '❄️ Cold';
      case 'HIGH': return '🔥 Hot';
      case 'MEDIUM': return '🌡️ Warm';
      case 'LOW': return '❄️ Cold';
      default: return level || 'Not Set';
    }
  };

  const getActionText = (action) => {
    console.log('Processing action:', action);
    
    if (!action) return 'Select Action';
    
    const actionStr = String(action).toUpperCase();
    
    // Match the exact dropdown values from actionOptions
    switch (actionStr) {
      case 'FOLLOW_UP': return 'Follow Up';
      case 'INVENTORY_SALE': return 'Inventory Sale';
      case 'INVENTORY_HOLD': return 'Inventory Hold';
      case 'TAKEN_RECEIVED': return 'Token Received';  // Note: dropdown has TAKEN_RECEIVED
      case 'TOKEN_RECEIVED': return 'Token Received';
      case 'TOKEN': return 'Token Process';
      case 'BOOKED': return 'Booked (Final)';
      case 'UNQUALIFIED': return 'Unqualified';
      
      // Status-based fallbacks
      case 'NEW': return 'Follow Up';
      case 'IN_PROGRESS': return 'Follow Up';
      case 'INTERESTED': return 'Follow Up';
      case 'FOLLOW_UP_SCHEDULED': return 'Follow Up';
      case 'SITE_VISIT_SCHEDULED': return 'Follow Up';
      case 'NEGOTIATION': return 'Follow Up';
      case 'CLOSED_WON': return 'Booked (Final)';
      case 'CLOSED_LOST': return 'Unqualified';
      
      default: 
        const formatted = actionStr.replace(/_/g, ' ');
        return formatted || 'Select Action';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    
    switch (status.toUpperCase()) {
      case 'NEW': return '🆕 New';
      case 'IN_PROGRESS': return '⏳ In Progress';
      case 'INTERESTED': return '👍 Interested';
      case 'FOLLOW_UP_SCHEDULED': return '📅 Follow Up Scheduled';
      case 'SITE_VISIT_SCHEDULED': return '🏠 Site Visit Scheduled';
      case 'NEGOTIATION': return '💬 Negotiation';
      case 'CLOSED_WON': return '🎉 Closed Won';
      case 'BOOKED': return '🎉 Booking Complete';
      case 'CLOSED_LOST': return '❌ Closed Lost';
      case 'UNQUALIFIED': return '⚠️ Unqualified';
      default: return status.replace(/_/g, ' ') || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6">
        <Loading 
          size="lg" 
          text="Loading your sales dashboard..." 
          variant="spinner" 
          color="green" 
          className="h-64" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl shadow-lg">
                  <BusinessIcons.briefcase size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    My Sales Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1">
                    Welcome back, {user?.username}! Here's your personal sales performance overview
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <FollowUpNotifications enquiries={myEnquiries} userId={user?.id} />
              <Button variant="outline" size="sm" icon={<ActionIcons.filter size={16} />} className="flex-1 sm:flex-none">
                Filter
              </Button>
              <Button variant="primary" size="sm" icon={<ActionIcons.download size={16} />} className="flex-1 sm:flex-none">
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatisticsCard
            title="My Enquiries"
            value={salesMetrics.totalAssigned}
            icon={<BusinessIcons.briefcase size={24} />}
            color="green"
            trend="up"
            trendValue="+3 this week"
            subtitle="Total assigned"
            className="h-full"
          />
          <StatisticsCard
            title="In Progress"
            value={salesMetrics.inProgress}
            icon={<BusinessIcons.activity size={24} />}
            color="blue"
            trend="up"
            trendValue="Active pipeline"
            subtitle="Working on"
            className="h-full"
          />
          <StatisticsCard
            title="Converted"
            value={salesMetrics.converted}
            icon={<BusinessIcons.trending size={24} />}
            color="purple"
            trend="up"
            trendValue="Great work!"
            subtitle="Closed deals"
            className="h-full"
          />
          <StatisticsCard
            title="Conversion Rate"
            value={`${salesMetrics.conversionRate}%`}
            icon={<BusinessIcons.award size={24} />}
            color="indigo"
            trend={salesMetrics.conversionRate > 20 ? "up" : "neutral"}
            trendValue={salesMetrics.conversionRate > 20 ? "Above average" : "Keep going"}
            subtitle="Success rate"
            className="h-full"
          />
        </div>

        {/* My Enquiries Table */}
        <Card variant="gradient" shadow="lg" className="overflow-hidden">
          <div className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ChartIcons.bar className="text-indigo-600" size={20} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">My Enquiries</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" icon={<ActionIcons.filter size={16} />} className="flex-1 sm:flex-none">
                  Filter
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={<ActionIcons.download size={16} />} 
                  className="flex-1 sm:flex-none"
                  onClick={handleExcelExport}
                >
                  Export
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-1/4" />
                <col className="w-1/6" />
                <col className="w-1/6" />
                <col className="w-1/8" />
                <col className="w-1/8" />
                <col className="w-1/6" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myEnquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4">
                      <div className="font-semibold text-gray-900 truncate">{e.customerName}</div>
                      <div className="text-xs text-gray-500 truncate">{e.customerEmail}</div>
                      <div className="text-xs text-gray-500">{e.customerMobile || e.customerPhone}</div>
                    </td>
                    <td className="px-3 py-4">
                      <select
                        value={e.interestLevel || ''}
                        onChange={(ev) => handleInterestChange(e.id, ev.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        {interestOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-4">
                      <select
                        value={e.status || ''}
                        onChange={(ev) => handleActionChange(e.id, ev.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        {actionOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-4">
                      <input
                        type="date"
                        onChange={(ev) => handleFollowUpDate(e.id, ev.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        defaultValue={e.nextFollowUpAt ? new Date(e.nextFollowUpAt).toISOString().substring(0,10) : ''}
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => openCommentModal(e)}
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium flex items-center space-x-1"
                        >
                          <ContactIcons.message size={12} />
                          <span>{commentCounts[e.id] || 0}</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      {e.status === 'CLOSED_WON' || e.status === 'BOOKED' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🎉 Booked
                        </span>
                      ) : e.status === 'UNQUALIFIED' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          🚫 Unqualified
                        </span>
                      ) : e.status === 'CLOSED_LOST' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ Lost
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🔄 Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </Card>

        {/* Comment Modal */}
        {commentModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Comments</h3>
                    <p className="text-blue-100 text-sm">
                      {commentModal.enquiry?.customerName} - {commentModal.enquiry?.customerEmail}
                    </p>
                  </div>
                  <button
                    onClick={closeCommentModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ActionIcons.close size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Existing Comments */}
                <div className="space-y-4 mb-6">
                  {comments.length > 0 ? (
                    comments.map((comment, index) => {
                      const date = new Date(comment.createdAt).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      });
                      const time = new Date(comment.createdAt).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      });
                      
                      return (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                {comment.commentNumber}
                              </span>
                              <span className="text-xs font-medium text-gray-600">Comment #{comment.commentNumber}</span>
                              <span className="text-xs text-gray-500">by {comment.user.name}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              <div className="font-medium">{date}</div>
                              <div>{time}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-800 whitespace-pre-wrap pl-8">
                            "{comment.commentText}"
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ContactIcons.message size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No comments yet</p>
                      <p className="text-sm">Add your first comment below</p>
                    </div>
                  )}
                </div>

                {/* Add New Comment */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Comment
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter your comment here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Comment #{comments.length + 1}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={closeCommentModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;


