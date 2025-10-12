import React, { useState, useEffect } from 'react';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import EnquiryCard from './components/common/EnquiryCard';
import SalesInteractionForm from './components/forms/SalesInteractionForm';
import { formatDate, getStatusColor, getInterestLevelIcon } from './utils/helpers';

const SalesPersonForm = ({ enquiries, onEnquiryUpdate, salesPersonName = "Sales Person" }) => {
  const [myEnquiries, setMyEnquiries] = useState([]);
  const [expandedEnquiry, setExpandedEnquiry] = useState(null);

  useEffect(() => {
    // Filter enquiries assigned to this sales person
    const filtered = enquiries.filter(enquiry => 
      enquiry.assignedTo?.name === salesPersonName && 
      enquiry.status !== 'assigned_to_crm'
    );
    setMyEnquiries(filtered);
  }, [enquiries, salesPersonName]);

  const handleInterestChange = (enquiryId, interest) => {
    const updatedEnquiry = myEnquiries.find(e => e.id === enquiryId);
    if (updatedEnquiry) {
      const updated = { ...updatedEnquiry, interest };
      
      // Reset related fields when interest changes
      if (interest === 'not_interested') {
        updated.interestLevel = '';
        updated.bookingProgress = '';
        updated.coldReason = '';
      }
      
      onEnquiryUpdate(updated);
    }
  };

  const handleInterestLevelChange = (enquiryId, interestLevel) => {
    const updatedEnquiry = myEnquiries.find(e => e.id === enquiryId);
    if (updatedEnquiry) {
      const updated = { ...updatedEnquiry, interestLevel };
      
      // Clear cold reason if not cold
      if (interestLevel !== 'cold') {
        updated.coldReason = '';
      }
      
      onEnquiryUpdate(updated);
    }
  };

  const handleColdReasonChange = (enquiryId, coldReason) => {
    const updatedEnquiry = myEnquiries.find(e => e.id === enquiryId);
    if (updatedEnquiry) {
      onEnquiryUpdate({ ...updatedEnquiry, coldReason });
    }
  };

  const handleUnqualifiedChange = (enquiryId, isUnqualified) => {
    const updatedEnquiry = myEnquiries.find(e => e.id === enquiryId);
    if (updatedEnquiry) {
      onEnquiryUpdate({ ...updatedEnquiry, isUnqualified });
    }
  };

  const handleRemarksChange = (enquiryId, remarks) => {
    const updatedEnquiry = myEnquiries.find(e => e.id === enquiryId);
    if (updatedEnquiry) {
      onEnquiryUpdate({ ...updatedEnquiry, remarks });
    }
  };

  const handleBookingProgressChange = (enquiryId, bookingProgress) => {
    const updatedEnquiry = myEnquiries.find(e => e.id === enquiryId);
    if (updatedEnquiry) {
      onEnquiryUpdate({ ...updatedEnquiry, bookingProgress });
    }
  };

  const handleFollowUpDateChange = (enquiryId, followUpDate) => {
    const updatedEnquiry = myEnquiries.find(e => e.id === enquiryId);
    if (updatedEnquiry) {
      onEnquiryUpdate({ ...updatedEnquiry, followUpDate });
    }
  };

  const handleAssignToCRM = (enquiryId) => {
    const updatedEnquiry = myEnquiries.find(e => e.id === enquiryId);
    if (updatedEnquiry) {
      const updated = {
        ...updatedEnquiry,
        status: 'assigned_to_crm',
        assignedToCRMAt: new Date().toISOString()
      };
      onEnquiryUpdate(updated);
      setExpandedEnquiry(null);
    }
  };

  const toggleExpanded = (enquiryId) => {
    setExpandedEnquiry(expandedEnquiry === enquiryId ? null : enquiryId);
  };

  // Statistics
  const totalEnquiries = myEnquiries.length;
  const interestedCount = myEnquiries.filter(e => e.interest === 'interested').length;
  const notInterestedCount = myEnquiries.filter(e => e.interest === 'not_interested').length;
  const pendingCount = myEnquiries.filter(e => !e.interest).length;
  const hotLeads = myEnquiries.filter(e => e.interestLevel === 'hot').length;
  const warmLeads = myEnquiries.filter(e => e.interestLevel === 'warm').length;
  const coldLeads = myEnquiries.filter(e => e.interestLevel === 'cold').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sales Dashboard - {salesPersonName}
        </h1>
        <p className="text-gray-600">
          Manage your assigned enquiries and track customer interactions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{totalEnquiries}</div>
          <div className="text-sm text-gray-600">Total Enquiries</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">{interestedCount}</div>
          <div className="text-sm text-gray-600">Interested</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-red-600">{notInterestedCount}</div>
          <div className="text-sm text-gray-600">Not Interested</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-red-600">{hotLeads}</div>
          <div className="text-sm text-gray-600">🔥 Hot Leads</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">{warmLeads}</div>
          <div className="text-sm text-gray-600">🌡️ Warm Leads</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{coldLeads}</div>
          <div className="text-sm text-gray-600">❄️ Cold Leads</div>
        </Card>
      </div>

      {/* Enquiries List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Assigned Enquiries ({myEnquiries.length})
        </h2>
        
        {myEnquiries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries assigned</h3>
              <p className="text-gray-600">You don't have any enquiries assigned to you yet.</p>
            </div>
          </Card>
        ) : (
          myEnquiries.map((enquiry) => (
            <Card key={enquiry.id} className="overflow-hidden">
              {/* Enquiry Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{enquiry.name}</h3>
                      <Badge variant={getStatusColor(enquiry.status)}>
                        {enquiry.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                      </Badge>
                      {enquiry.interest && (
                        <Badge variant={enquiry.interest === 'interested' ? 'success' : 'danger'}>
                          {enquiry.interest === 'interested' ? '✓ Interested' : '✗ Not Interested'}
                        </Badge>
                      )}
                      {enquiry.interestLevel && (
                        <Badge variant={enquiry.interestLevel === 'hot' ? 'danger' : enquiry.interestLevel === 'warm' ? 'warning' : 'info'}>
                          {getInterestLevelIcon(enquiry.interestLevel)} {enquiry.interestLevel.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Mobile:</span> {enquiry.mobile}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {enquiry.email}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {formatDate(enquiry.submittedAt)}
                      </div>
                    </div>
                    
                    {enquiry.followUpDate && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-purple-600">Follow-up:</span> 
                        <span className="text-gray-600 ml-1">{formatDate(enquiry.followUpDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(enquiry.id)}
                  >
                    {expandedEnquiry === enquiry.id ? 'Collapse' : 'Manage'}
                    <svg 
                      className={`ml-2 h-4 w-4 transform transition-transform ${expandedEnquiry === enquiry.id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedEnquiry === enquiry.id && (
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h4>
                      <EnquiryCard enquiry={enquiry} showActions={false} />
                    </div>

                    {/* Sales Interaction Form */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Sales Interaction</h4>
                      <SalesInteractionForm
                        enquiry={enquiry}
                        onInterestChange={handleInterestChange}
                        onInterestLevelChange={handleInterestLevelChange}
                        onColdReasonChange={handleColdReasonChange}
                        onUnqualifiedChange={handleUnqualifiedChange}
                        onRemarksChange={handleRemarksChange}
                        onBookingProgressChange={handleBookingProgressChange}
                        onFollowUpDateChange={handleFollowUpDateChange}
                        onAssignToCRM={handleAssignToCRM}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SalesPersonForm;
