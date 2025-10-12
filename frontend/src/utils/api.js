// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Helper function to handle API requests
let authTokenProvider = () => null; // settable from AuthContext

export function setAuthTokenProvider(fn) {
  authTokenProvider = fn;
}

async function fetchAPI(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const token = authTokenProvider?.();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (config.body) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      let errorMessage = 'Something went wrong';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Enquiry API functions
export const enquiryAPI = {
  // Get all enquiries with pagination
  getAll: (page = 0, size = 100, sortBy = 'createdAt', sortDir = 'desc') => 
    fetchAPI(`/enquiries?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  
  // Get enquiry by ID
  getById: (id) => fetchAPI(`/enquiries/${id}`),
  
  // Create new enquiry
  create: (data) => fetchAPI('/enquiries', {
    method: 'POST',
    body: data,
  }),
  
  // Update enquiry
  update: (id, data) => fetchAPI(`/enquiries/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  // Delete enquiry
  delete: (id) => fetchAPI(`/enquiries/${id}`, {
    method: 'DELETE',
  }),

  // Assign sales person
  assignSalesPerson: (enquiryId, salesPersonId) => fetchAPI(`/enquiries/${enquiryId}/assign/${salesPersonId}`, {
    method: 'POST',
  }),

  // Auto assign sales person
  autoAssign: (enquiryId) => fetchAPI(`/enquiries/${enquiryId}/auto-assign`, {
    method: 'POST',
  }),

  // Update status
  updateStatus: (enquiryId, status) => fetchAPI(`/enquiries/${enquiryId}/status?status=${status}`, {
    method: 'PUT',
  }),

  // Update interest level
  updateInterestLevel: (enquiryId, interestLevel) => fetchAPI(`/enquiries/${enquiryId}/interest-level?interestLevel=${interestLevel}`, {
    method: 'PUT',
  }),

  // Add remarks
  addRemarks: (enquiryId, remarks) => fetchAPI(`/enquiries/${enquiryId}/remarks`, {
    method: 'POST',
    body: remarks,
    headers: { 'Content-Type': 'text/plain' }
  }),

  // Search enquiries
  search: (searchTerm, page = 0, size = 10) => fetchAPI(`/enquiries/search?searchTerm=${searchTerm}&page=${page}&size=${size}`),

  // Get by status
  getByStatus: (status) => fetchAPI(`/enquiries/by-status/${status}`),

  // Get by interest level
  getByInterestLevel: (interestLevel) => fetchAPI(`/enquiries/by-interest-level/${interestLevel}`),

  // Get by sales person
  getBySalesPerson: (salesPersonId) => fetchAPI(`/enquiries/by-sales-person/${salesPersonId}`),

  // Get unassigned
  getUnassigned: () => fetchAPI('/enquiries/unassigned'),

  // Get active enquiries
  getActive: () => fetchAPI('/enquiries/active'),

  // Get hot leads
  getHotLeads: () => fetchAPI('/enquiries/hot-leads'),

  // Schedule follow-up
  scheduleFollowUp: (enquiryId, followUpDate) => fetchAPI(`/enquiries/${enquiryId}/schedule-follow-up?followUpDate=${followUpDate}`, {
    method: 'POST',
  }),

  // Get filtered enquiries
  getFiltered: (filters = {}, page = 0, size = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    return fetchAPI(`/enquiries/filtered?${params}`);
  },

  // Analytics endpoints
  getTotalCount: () => fetchAPI('/enquiries/count/total'),
  getCountByStatus: (status) => fetchAPI(`/enquiries/count/by-status/${status}`),
  getCountByInterestLevel: (interestLevel) => fetchAPI(`/enquiries/count/by-interest-level/${interestLevel}`),
  getCountBySalesPerson: (salesPersonId) => fetchAPI(`/enquiries/count/by-sales-person/${salesPersonId}`),
};

// Sales Person API functions
export const salesPersonAPI = {
  // Get all sales persons with pagination
  getAll: (page = 0, size = 100, sortBy = 'name', sortDir = 'asc') => 
    fetchAPI(`/sales-persons?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  
  // Get sales person by ID
  getById: (id) => fetchAPI(`/sales-persons/${id}`),
  
  // Create new sales person
  create: (data) => fetchAPI('/sales-persons', {
    method: 'POST',
    body: data,
  }),
  
  // Update sales person
  update: (id, data) => fetchAPI(`/sales-persons/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  // Delete sales person
  delete: (id) => fetchAPI(`/sales-persons/${id}`, {
    method: 'DELETE',
  }),

  // Get available sales persons
  getAvailable: () => fetchAPI('/sales-persons/available'),

  // Get sales person with least enquiries
  getLeastEnquiries: () => fetchAPI('/sales-persons/least-enquiries'),

  // Search sales persons
  search: (searchTerm, page = 0, size = 10) => fetchAPI(`/sales-persons/search?searchTerm=${searchTerm}&page=${page}&size=${size}`),

  // Update availability
  updateAvailability: (id, available) => fetchAPI(`/sales-persons/${id}/availability?available=${available}`, {
    method: 'PUT',
  }),

  // Get performance metrics
  getPerformanceMetrics: (id, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchAPI(`/sales-persons/${id}/performance?${params}`);
  },

  // Analytics
  getTotalCount: () => fetchAPI('/sales-persons/count/total'),
  getAvailableCount: () => fetchAPI('/sales-persons/count/available'),
};

// Sales Activity API functions
export const salesActivityAPI = {
  // Get all activities with pagination
  getAll: (page = 0, size = 100, sortBy = 'activityDate', sortDir = 'desc') => 
    fetchAPI(`/sales-activities?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  
  // Get activity by ID
  getById: (id) => fetchAPI(`/sales-activities/${id}`),
  
  // Create new activity
  create: (data) => fetchAPI('/sales-activities', {
    method: 'POST',
    body: data,
  }),
  
  // Update activity
  update: (id, data) => fetchAPI(`/sales-activities/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  // Delete activity
  delete: (id) => fetchAPI(`/sales-activities/${id}`, {
    method: 'DELETE',
  }),

  // Get activities by enquiry
  getByEnquiry: (enquiryId) => fetchAPI(`/sales-activities/by-enquiry/${enquiryId}`),

  // Get activities by sales person
  getBySalesPerson: (salesPersonId) => fetchAPI(`/sales-activities/by-sales-person/${salesPersonId}`),

  // Get activities by type
  getByType: (activityType) => fetchAPI(`/sales-activities/by-type/${activityType}`),

  // Get activities by date range
  getByDateRange: (startDate, endDate, page = 0, size = 10) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      page: page.toString(),
      size: size.toString()
    });
    return fetchAPI(`/sales-activities/by-date-range?${params}`);
  },

  // Quick log activity
  logActivity: (data) => fetchAPI('/sales-activities/log', {
    method: 'POST',
    body: data,
  }),

  // Get recent activities
  getRecent: (limit = 10) => fetchAPI(`/sales-activities/recent?limit=${limit}`),

  // Search activities
  search: (searchTerm, page = 0, size = 10) => fetchAPI(`/sales-activities/search?searchTerm=${searchTerm}&page=${page}&size=${size}`),

  // Analytics
  getTotalCount: () => fetchAPI('/sales-activities/count/total'),
  getCountByType: (activityType) => fetchAPI(`/sales-activities/count/by-type/${activityType}`),
  getCountBySalesPerson: (salesPersonId) => fetchAPI(`/sales-activities/count/by-sales-person/${salesPersonId}`),
};

// Authentication API functions
export const authAPI = {
  login: (credentials) => fetchAPI('/auth/login', {
    method: 'POST',
    body: credentials,
  }),
  
  logout: () => fetchAPI('/auth/logout', {
    method: 'POST',
  }),
  
  register: (userData) => fetchAPI('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  
  // Role-specific registration endpoints
  registerSuperAdmin: (userData) => fetchAPI('/auth/register/super-admin', {
    method: 'POST',
    body: userData,
  }),
  
  registerCrmAdmin: (userData) => fetchAPI('/auth/register/crm-admin', {
    method: 'POST',
    body: userData,
  }),
  
  registerSales: (userData) => fetchAPI('/auth/register/sales', {
    method: 'POST',
    body: userData,
  }),

  // User management endpoints
  updateCrmAdmin: (userId, userData) => fetchAPI(`/auth/update-crm-admin/${userId}`, {
    method: 'PUT',
    body: userData,
  }),

  updateSales: (userId, userData) => fetchAPI(`/auth/update-sales/${userId}`, {
    method: 'PUT',
    body: userData,
  }),

  updateSuperAdmin: (userId, userData) => fetchAPI(`/auth/update-super-admin/${userId}`, {
    method: 'PUT',
    body: userData,
  }),

  deleteUser: (userId) => fetchAPI(`/auth/delete-user/${userId}`, {
    method: 'DELETE',
  }),

  createTestUsers: () => fetchAPI('/auth/create-test-users', {
    method: 'POST',
  }),
  
  getCurrentUser: (username) => fetchAPI(`/auth/me?username=${username}`),
};

// User Management API functions
export const userAPI = {
  getAll: (page = 0, size = 100, sortBy = 'name', sortDir = 'asc') => 
    fetchAPI(`/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  
  getById: (id) => fetchAPI(`/users/${id}`),
  
  create: (data) => fetchAPI('/users', {
    method: 'POST',
    body: data,
  }),
  
  update: (id, data) => fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  delete: (id) => fetchAPI(`/users/${id}`, {
    method: 'DELETE',
  }),
  
  updateStatus: (id, active) => fetchAPI(`/users/${id}/status?active=${active}`, {
    method: 'PUT',
  }),
  
  getByRole: (role) => fetchAPI(`/users/by-role/${role}`),
  
  getActiveUsers: () => fetchAPI('/users/active'),
  
  getActiveUsersByRole: (role) => fetchAPI(`/users/active/by-role/${role}`),
  
  search: (searchTerm, page = 0, size = 10) => fetchAPI(`/users/search?searchTerm=${searchTerm}&page=${page}&size=${size}`),
  
  // Analytics
  getTotalCount: () => fetchAPI('/users/count/total'),
  getActiveCount: () => fetchAPI('/users/count/active'),
  getCountByRole: (role) => fetchAPI(`/users/count/by-role/${role}`),
  getActiveCountByRole: (role) => fetchAPI(`/users/count/active/by-role/${role}`),
};

// Comment API functions
export const commentAPI = {
  // Get comments for an enquiry
  getByEnquiry: (enquiryId) => fetchAPI(`/enquiries/${enquiryId}/comments`),
  
  // Add a new comment
  add: (enquiryId, userId, commentText) => fetchAPI(`/enquiries/${enquiryId}/comments`, {
    method: 'POST',
    body: { userId, commentText },
  }),
  
  // Get comment count for an enquiry
  getCount: (enquiryId) => fetchAPI(`/enquiries/${enquiryId}/comments/count`),
  
  // Delete a comment
  delete: (commentId) => fetchAPI(`/enquiries/comments/${commentId}`, {
    method: 'DELETE',
  }),
};

// Notification API
export const notificationAPI = {
  getFollowUpNotifications: (userId) => fetchAPI(`/notifications/follow-up/${userId}`),
  getUpcomingFollowUps: (userId) => fetchAPI(`/notifications/upcoming/${userId}`),
};

export default {
  auth: authAPI,
  user: userAPI,
  enquiry: enquiryAPI,
  salesPerson: salesPersonAPI,
  salesActivity: salesActivityAPI,
  comment: commentAPI,
  notification: notificationAPI,
};
