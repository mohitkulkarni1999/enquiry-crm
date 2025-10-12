/**
 * Simple CSV export that works without external libraries
 * CSV files can be opened in Excel
 */

export const exportEnquiriesToCSV = (enquiries, filename = 'My_Enquiries_Export') => {
  try {
    console.log('Starting CSV export with enquiries:', enquiries);
    
    // Prepare CSV data
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
      'Activity Type',
      'Comments/Notes',
      'Activity Date',
      'Activity Author',
      'Current Status',
      'Created Date',
      'Last Updated'
    ];
    
    csvRows.push(headers.join(','));

    enquiries.forEach((enquiry) => {
      console.log('Processing enquiry for CSV:', enquiry);
      
      // Get all comments with dates
      const comments = enquiry.comments || [];
      const followUps = enquiry.followUps || [];
      
      // Process comments
      const processedComments = comments.map(comment => {
        if (typeof comment === 'string') {
          return {
            type: 'Comment',
            text: comment,
            date: enquiry.updatedAt || enquiry.createdAt || new Date().toISOString(),
            author: enquiry.assignedTo?.name || enquiry.assignedTo?.email || 'System'
          };
        }
        
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

      // Base row data
      const baseData = [
        serialNo++,
        enquiry.customerName || enquiry.name || 'N/A',
        enquiry.customerMobile || enquiry.customerPhone || enquiry.phone || enquiry.mobile || 'N/A',
        enquiry.customerEmail || enquiry.email || 'N/A',
        enquiry.propertyType?.replace(/_/g, ' ') || enquiry.property?.replace(/_/g, ' ') || 'Not Specified',
        enquiry.budgetRange?.replace(/_/g, ' ') || enquiry.budget?.replace(/_/g, ' ') || 'Not Specified',
        getInterestLevelText(enquiry.interestLevel || enquiry.interest),
        getActionText(enquiry.lastAction || enquiry.action || enquiry.nextAction),
        formatDate(enquiry.followUpDate || enquiry.nextFollowUp || enquiry.followUp),
        '', // Activity Type - will be filled per row
        '', // Comments/Notes - will be filled per row
        '', // Activity Date - will be filled per row
        '', // Activity Author - will be filled per row
        getStatusText(enquiry.status),
        formatDate(enquiry.createdAt),
        formatDate(enquiry.updatedAt)
      ];

      if (allActivities.length === 0) {
        // No activities - just show basic enquiry info
        const row = [...baseData];
        row[9] = 'Initial Enquiry'; // Activity Type
        row[10] = enquiry.description || enquiry.requirements || enquiry.notes || 'Initial enquiry received'; // Comments
        row[11] = formatDate(enquiry.createdAt); // Activity Date
        row[12] = enquiry.assignedTo?.name || enquiry.assignedTo?.email || enquiry.createdBy || 'System'; // Author
        
        csvRows.push(row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
      } else {
        // Create a row for each activity
        allActivities.forEach((activity, index) => {
          const row = [...baseData];
          
          if (index > 0) {
            // Clear base data for subsequent rows
            row[0] = ''; // Sr. No.
            row[1] = ''; // Customer Name
            row[2] = ''; // Phone
            row[3] = ''; // Email
            row[4] = ''; // Property Type
            row[5] = ''; // Budget Range
            row[6] = ''; // Interest Level
            row[7] = ''; // Action
            row[8] = ''; // Follow Up Date
            row[13] = ''; // Current Status
            row[14] = ''; // Created Date
            row[15] = ''; // Last Updated
          }
          
          row[9] = activity.type; // Activity Type
          row[10] = activity.text || 'No comments'; // Comments/Notes
          row[11] = formatDate(activity.date); // Activity Date
          row[12] = activity.author; // Activity Author
          
          csvRows.push(row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
        });
      }
    });

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const finalFilename = `${filename}_${timestamp}.csv`;
      
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', finalFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return {
        success: true,
        filename: finalFilename,
        recordCount: enquiries.length,
        totalRows: csvRows.length - 1 // Subtract header row
      };
    }
    
    return {
      success: false,
      error: 'Download not supported in this browser'
    };

  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper functions (same as Excel export)
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

const getInterestLevelText = (level) => {
  if (!level) return 'Not Set';
  
  switch (level.toUpperCase()) {
    case 'HOT': return 'Hot';
    case 'WARM': return 'Warm';
    case 'COLD': return 'Cold';
    case 'HIGH': return 'Hot';
    case 'MEDIUM': return 'Warm';
    case 'LOW': return 'Cold';
    default: return level || 'Not Set';
  }
};

const getActionText = (action) => {
  if (!action) return 'No Action';
  
  switch (action.toUpperCase()) {
    case 'FOLLOW_UP': return 'Follow Up';
    case 'FOLLOWUP': return 'Follow Up';
    case 'INVENTORY_SALE': return 'Inventory Sale';
    case 'INVENTORY_HOLD': return 'Inventory Hold';
    case 'TOKEN_RECEIVED': return 'Token Received';
    case 'TOKEN_PROCESS': return 'Token Process';
    case 'BOOKED': return 'Booked (Final)';
    case 'BOOKING': return 'Booked (Final)';
    case 'UNQUALIFIED': return 'Unqualified';
    case 'SITE_VISIT': return 'Site Visit';
    case 'CALL': return 'Call Scheduled';
    case 'MEETING': return 'Meeting Scheduled';
    default: return action.replace(/_/g, ' ') || 'No Action';
  }
};

const getStatusText = (status) => {
  if (!status) return 'Unknown';
  
  switch (status.toUpperCase()) {
    case 'NEW': return 'New';
    case 'IN_PROGRESS': return 'In Progress';
    case 'INTERESTED': return 'Interested';
    case 'FOLLOW_UP_SCHEDULED': return 'Follow Up Scheduled';
    case 'SITE_VISIT_SCHEDULED': return 'Site Visit Scheduled';
    case 'NEGOTIATION': return 'Negotiation';
    case 'CLOSED_WON': return 'Closed Won';
    case 'BOOKED': return 'Booking Complete';
    case 'CLOSED_LOST': return 'Closed Lost';
    case 'UNQUALIFIED': return 'Unqualified';
    default: return status.replace(/_/g, ' ') || 'Unknown';
  }
};

export default exportEnquiriesToCSV;
