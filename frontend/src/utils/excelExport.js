import * as XLSX from 'xlsx';

/**
 * Export enquiries data to Excel with complete comments history
 * @param {Array} enquiries - Array of enquiry objects
 * @param {string} filename - Name of the Excel file
 */
export const exportEnquiriesToExcel = (enquiries, filename = 'My_Enquiries_Export') => {
  try {
    // Prepare data for Excel export
    const excelData = [];
    let serialNo = 1;

    enquiries.forEach((enquiry) => {
      console.log('Processing enquiry:', enquiry); // Debug log
      
      // Get all comments with dates - handle different comment structures
      const comments = enquiry.comments || [];
      const followUps = enquiry.followUps || [];
      
      // Handle different comment formats
      const processedComments = comments.map(comment => {
        // Handle if comment is just a string
        if (typeof comment === 'string') {
          return {
            type: 'Comment',
            text: comment,
            date: enquiry.updatedAt || enquiry.createdAt || new Date().toISOString(),
            author: enquiry.assignedTo?.name || enquiry.assignedTo?.email || 'System'
          };
        }
        
        // Handle if comment is an object
        return {
          type: 'Comment',
          text: comment.text || comment.comment || comment.content || comment.message || 'No comment text',
          date: comment.createdAt || comment.date || comment.timestamp || enquiry.updatedAt || new Date().toISOString(),
          author: comment.author || comment.createdBy || comment.user || enquiry.assignedTo?.name || 'System'
        };
      });
      
      // Process follow-ups
      const processedFollowUps = followUps.map(followUp => ({
        type: 'Follow Up',
        text: followUp.notes || followUp.comment || followUp.description || followUp.text || 'Follow up scheduled',
        date: followUp.scheduledDate || followUp.date || followUp.createdAt || new Date().toISOString(),
        author: followUp.assignedTo || followUp.createdBy || followUp.user || 'System'
      }));
      
      // Combine all activities
      const allActivities = [
        ...processedComments,
        ...processedFollowUps
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      // Always create at least one row, even if no activities
      // Add initial enquiry row with basic info
      const baseRowData = {
        'Sr. No.': serialNo++,
        'Customer Name': enquiry.customerName || enquiry.name || 'N/A',
        'Phone': enquiry.customerMobile || enquiry.customerPhone || enquiry.phone || enquiry.mobile || 'N/A',
        'Email': enquiry.customerEmail || enquiry.email || 'N/A',
        'Property Type': enquiry.propertyType?.replace(/_/g, ' ') || enquiry.property?.replace(/_/g, ' ') || 'Not Specified',
        'Budget Range': enquiry.budgetRange?.replace(/_/g, ' ') || enquiry.budget?.replace(/_/g, ' ') || 'Not Specified',
        'Interest Level': getInterestLevelText(enquiry.interestLevel || enquiry.interest),
        'Action': getActionText(enquiry.lastAction || enquiry.action || enquiry.nextAction),
        'Follow Up Date': formatDate(enquiry.followUpDate || enquiry.nextFollowUp || enquiry.followUp),
        'Current Status': getStatusText(enquiry.status),
        'Created Date': formatDate(enquiry.createdAt),
        'Last Updated': formatDate(enquiry.updatedAt)
      };

      if (allActivities.length === 0) {
        // No activities - just show basic enquiry info
        excelData.push({
          ...baseRowData,
          'Activity Type': 'Initial Enquiry',
          'Comments/Notes': enquiry.description || enquiry.requirements || enquiry.notes || 'Initial enquiry received',
          'Activity Date': formatDate(enquiry.createdAt),
          'Activity Author': enquiry.assignedTo?.name || enquiry.assignedTo?.email || enquiry.createdBy || 'System'
        });
      } else {
        // Create a row for each activity
        allActivities.forEach((activity, index) => {
          const rowData = {
            'Activity Type': activity.type,
            'Comments/Notes': activity.text || 'No comments',
            'Activity Date': formatDate(activity.date),
            'Activity Author': activity.author
          };

          if (index === 0) {
            // First row includes all base data
            excelData.push({
              ...baseRowData,
              ...rowData
            });
          } else {
            // Subsequent rows only show activity data
            excelData.push({
              'Sr. No.': '',
              'Customer Name': '',
              'Phone': '',
              'Email': '',
              'Property Type': '',
              'Budget Range': '',
              'Interest Level': '',
              'Action': '',
              'Follow Up Date': '',
              'Current Status': '',
              'Created Date': '',
              'Last Updated': '',
              ...rowData
            });
          }
        });
      }
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 8 },   // Sr. No.
      { wch: 20 },  // Customer Name
      { wch: 15 },  // Phone
      { wch: 25 },  // Email
      { wch: 15 },  // Property Type
      { wch: 15 },  // Budget Range
      { wch: 12 },  // Interest Level
      { wch: 15 },  // Action
      { wch: 15 },  // Follow Up Date
      { wch: 15 },  // Activity Type
      { wch: 40 },  // Comments/Notes
      { wch: 15 },  // Activity Date
      { wch: 15 },  // Activity Author
      { wch: 15 },  // Current Status
      { wch: 15 },  // Created Date
      { wch: 15 }   // Last Updated
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My Enquiries');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      filename: finalFilename,
      recordCount: enquiries.length,
      totalRows: excelData.length
    };

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Helper function to format dates
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Helper function to get interest level text
 */
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

/**
 * Helper function to get action text
 */
const getActionText = (action) => {
  if (!action) return 'No Action';
  
  switch (action.toUpperCase()) {
    case 'FOLLOW_UP': return 'Follow Up';
    case 'FOLLOWUP': return 'Follow Up';
    case 'INVENTORY_SALE': return 'Inventory Sale';
    case 'INVENTORY_HOLD': return 'Inventory Hold';
    case 'TOKEN_RECEIVED': return 'Token Received';
    case 'TOKEN_PROCESS': return 'Token Process';
    case 'BOOKED': return '🎉 Booked (Final)';
    case 'BOOKING': return '🎉 Booked (Final)';
    case 'UNQUALIFIED': return 'Unqualified';
    case 'SITE_VISIT': return 'Site Visit';
    case 'CALL': return 'Call Scheduled';
    case 'MEETING': return 'Meeting Scheduled';
    default: return action.replace(/_/g, ' ') || 'No Action';
  }
};

/**
 * Helper function to get status text
 */
const getStatusText = (status) => {
  switch (status) {
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
    default: return status || 'Unknown';
  }
};

export default exportEnquiriesToExcel;
