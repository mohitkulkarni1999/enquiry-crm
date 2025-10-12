import React, { useState, useEffect } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { BusinessIcons, ActionIcons, ContactIcons } from '../ui/Icons';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { commentAPI } from '../../utils/api';

const EnquiryTable = ({ enquiries = [] }) => {
  const { 
    users = [], 
    salesPersons = [], 
    assignSalesPerson, 
    autoAssignSalesPerson,
    loadAvailableSalesPersons,
    getUsersByRole,
    createSalesPerson
  } = useAppContext();
  const { user } = useAuth();
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [fallbackSalesUsers, setFallbackSalesUsers] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [commentModal, setCommentModal] = useState({ isOpen: false, enquiryId: null, enquiry: null });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Only use salesPersons for assignment to avoid ID conflicts
  // The backend expects SalesPerson IDs, not User IDs
  const uniqueSalesPersons = salesPersons.filter(sp => sp.isAvailable !== false && sp.available !== false);
  
  // Debug logging
  console.log('Available sales persons for assignment:', uniqueSalesPersons);

  const handleAssign = async (enquiryId, salesPersonId) => {
    try {
      await assignSalesPerson(enquiryId, salesPersonId);
      setShowAssignModal(false);
      setSelectedEnquiry(null);
    } catch (error) {
      console.error('Error assigning sales person:', error);
    }
  };

  const handleAutoAssign = async (enquiryId) => {
    try {
      await autoAssignSalesPerson(enquiryId);
    } catch (error) {
      console.error('Error auto-assigning:', error);
    }
  };

  const openAssignModal = async (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowAssignModal(true);
    setAssignLoading(true);
    try {
      const available = await loadAvailableSalesPersons();
      if (!available || available.length === 0) {
        // fallback: load users with SALES role for quick onboarding
        const salesUsers = await getUsersByRole('SALES');
        setFallbackSalesUsers(Array.isArray(salesUsers) ? salesUsers : []);
      } else {
        setFallbackSalesUsers([]);
      }
    } catch (e) {
      console.error('Error preparing assignment modal:', e);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCreateAndAssign = async (enquiryId, salesUser) => {
    try {
      setAssignLoading(true);
      const sp = await createSalesPerson({
        name: salesUser.name || salesUser.username,
        email: salesUser.email,
        mobile: salesUser.phone,
        isAvailable: true,
      });
      await assignSalesPerson(enquiryId, sp.id);
      setShowAssignModal(false);
      setSelectedEnquiry(null);
    } catch (error) {
      console.error('Error creating sales person and assigning:', error);
    } finally {
      setAssignLoading(false);
    }
  };

  const canAssign = user?.role === 'CRM_ADMIN' || user?.role === 'SUPER_ADMIN';

  // Load comment counts when enquiries change
  useEffect(() => {
    if (enquiries.length > 0) {
      loadCommentCounts();
    }
  }, [enquiries]);

  const loadCommentCounts = async () => {
    const counts = {};
    for (const enquiry of enquiries) {
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

  const openCommentModal = async (enquiry) => {
    setCommentModal({ isOpen: true, enquiryId: enquiry.id, enquiry });
    setNewComment('');
    
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
      setNewComment('');
      
      // Reload comments
      const updatedComments = await commentAPI.getByEnquiry(commentModal.enquiryId);
      setComments(updatedComments);
      
      // Update comment count
      loadCommentCounts();
      
      closeCommentModal();
    } catch (e) {
      console.error(e);
    }
  };
  const getStatusVariant = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'NEW': return 'primary';
      case 'ASSIGNED': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'INTERESTED': return 'success';
      case 'NOT_INTERESTED': return 'danger';
      case 'UNQUALIFIED': return 'default';
      case 'FINAL_BOOKING': return 'success';
      case 'CLOSED_WON': return 'success';
      case 'CLOSED_LOST': return 'danger';
      default: return 'default';
    }
  };

  const getInterestVariant = (level) => {
    const l = (level || '').toUpperCase();
    switch (l) {
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  const formatPropertyType = (propertyType) => {
    if (!propertyType) return 'N/A';
    return String(propertyType).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatBudgetRange = (budgetRange) => {
    if (!budgetRange) return 'N/A';
    const map = {
      UNDER_5L: 'Under ₹5L',
      FIVE_TO_10L: '₹5-10L',
      TEN_TO_20L: '₹10-20L',
      TWENTY_TO_30L: '₹20-30L',
      THIRTY_TO_50L: '₹30-50L',
      FIFTY_TO_75L: '₹50-75L',
      SEVENTY_FIVE_L_TO_1CR: '₹75L-1Cr',
      ONE_TO_1_5CR: '₹1-1.5Cr',
      ONE_5_TO_2CR: '₹1.5-2Cr',
      TWO_TO_3CR: '₹2-3Cr',
      THREE_TO_5CR: '₹3-5Cr',
      ABOVE_5CR: 'Above ₹5Cr',
    };
    return map[String(budgetRange)] || String(budgetRange).replace(/_/g, ' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
  };

  const getInterestIcon = (level) => {
    switch (level) {
      case 'hot': return '🔥';
      case 'warm': return '🌡️';
      case 'cold': return '❄️';
      default: return '';
    }
  };

  if (enquiries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Leads Found</h3>
          <p className="text-gray-600">No leads match your current filters or search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              {canAssign && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{enquiry.customerName || enquiry.name}</div>
                    <div className="text-sm text-gray-500">{enquiry.customerEmail || enquiry.email}</div>
                    <div className="text-sm text-gray-500">{enquiry.customerMobile || enquiry.customerPhone || enquiry.mobile}</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPropertyType(enquiry.propertyType || enquiry.requirements)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatBudgetRange(enquiry.budgetRange || enquiry.budget)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(enquiry.status)}>
                    {(enquiry.status || '').replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {(enquiry.interestLevel || enquiry.interest) && (
                    <Badge variant={getInterestVariant(enquiry.interestLevel)}>
                      {(enquiry.interestLevel || enquiry.interest).toUpperCase()}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(enquiry.status)}>
                    {(enquiry.status || '').replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {enquiry.nextFollowUpAt ? formatDate(enquiry.nextFollowUpAt) : '-'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openCommentModal(enquiry)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-xs font-medium flex items-center space-x-1"
                    >
                      <ContactIcons.message size={14} />
                      <span>Comments</span>
                    </button>
                    {commentCounts[enquiry.id] > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                        {commentCounts[enquiry.id]}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {enquiry.status === 'CLOSED_WON' ? (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🎉 Booking Complete
                      </span>
                    </div>
                  ) : enquiry.status === 'UNQUALIFIED' ? (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        🚫 Customer Disqualified
                      </span>
                    </div>
                  ) : enquiry.status === 'CLOSED_LOST' ? (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ❌ Not Converted
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🔄 In Progress
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enquiry.assignedTo?.name || enquiry.assignedTo || 'Unassigned'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(enquiry.createdAt || enquiry.submittedAt)}
                </td>
                {canAssign && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!enquiry.assignedTo && (
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => openAssignModal(enquiry)}
                            icon={<BusinessIcons.user size={14} />}
                          >
                            Assign
                          </Button>
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => handleAutoAssign(enquiry.id)}
                            icon={<ActionIcons.refresh size={14} />}
                          >
                            Auto
                          </Button>
                        </>
                      )}
                      {enquiry.assignedTo && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => openAssignModal(enquiry)}
                          icon={<ActionIcons.edit size={14} />}
                        >
                          Reassign
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BusinessIcons.user size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Assign Sales Person</h2>
                  <p className="text-gray-600 text-sm">
                    Assign {selectedEnquiry.customerName} to a sales representative
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEnquiry(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ActionIcons.close size={20} className="text-gray-400" />
              </button>
            </div>
            
            {/* Scrollable Sales Person List */}
            <div className="flex-1 overflow-y-auto p-6">
              {assignLoading && (
                <div className="text-center py-6 text-sm text-gray-500">Loading available sales persons...</div>
              )}
              <div className="space-y-3">
                {uniqueSalesPersons.length > 0 && !assignLoading ? (
                  uniqueSalesPersons.map((salesPerson) => (
                    <div
                      key={salesPerson.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 cursor-pointer transition-all duration-200 group"
                      onClick={() => handleAssign(selectedEnquiry.id, salesPerson.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
                          <BusinessIcons.user size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{salesPerson.name}</p>
                          <p className="text-sm text-gray-600">{salesPerson.email}</p>
                          {salesPerson.designation && (
                            <p className="text-xs text-gray-500">{salesPerson.designation}</p>
                          )}
                          {salesPerson.department && (
                            <p className="text-xs text-gray-500">{salesPerson.department}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(salesPerson.isAvailable !== false && salesPerson.available !== false) && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                        <Button size="xs" variant="primary" className="group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  !assignLoading && (
                    <>
                      <div className="text-center py-4">
                        <p className="text-gray-600 font-medium">No Sales Persons found</p>
                        <p className="text-gray-400 text-sm">You can onboard a SALES user as Sales Person and assign.</p>
                      </div>
                      {fallbackSalesUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{u.name || u.username}</p>
                            <p className="text-sm text-gray-600">{u.email}</p>
                          </div>
                          <Button size="xs" variant="primary" onClick={() => handleCreateAndAssign(selectedEnquiry.id, u)}>
                            Create & Assign
                          </Button>
                        </div>
                      ))}
                    </>
                  )
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedEnquiry(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                  onClick={() => handleAutoAssign(selectedEnquiry.id)}
                  icon={<ActionIcons.refresh size={16} />}
                >
                  Auto Assign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
  );
};

export default EnquiryTable;
