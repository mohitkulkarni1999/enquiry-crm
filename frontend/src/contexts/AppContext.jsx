import React, { createContext, useContext, useState, useEffect } from 'react';
import { enquiryAPI, salesPersonAPI, salesActivityAPI, userAPI } from '../utils/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [salesActivities, setSalesActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Removed mock data: all dashboards now rely strictly on backend API data

  // Load initial data
  useEffect(() => {
    loadEnquiries();
    loadSalesPersons();
    loadUsers();
  }, []);

  // Enquiry functions
  const loadEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await enquiryAPI.getAll();
      setEnquiries(response.content || response || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading enquiries:', err);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const createEnquiry = async (enquiryData) => {
    setLoading(true);
    setError(null);
    try {
      const newEnquiry = await enquiryAPI.create(enquiryData);
      setEnquiries(prev => [newEnquiry, ...prev]);
      return newEnquiry;
    } catch (err) {
      setError(err.message);
      console.error('Error creating enquiry:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEnquiry = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedEnquiry = await enquiryAPI.update(id, updateData);
      setEnquiries(prev => 
        prev.map(enquiry => 
          enquiry.id === id ? updatedEnquiry : enquiry
        )
      );
      return updatedEnquiry;
    } catch (err) {
      setError(err.message);
      console.error('Error updating enquiry:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEnquiry = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await enquiryAPI.delete(id);
      setEnquiries(prev => prev.filter(enquiry => enquiry.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting enquiry:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignSalesPerson = async (enquiryId, salesPersonId) => {
    try {
      const updatedEnquiry = await enquiryAPI.assignSalesPerson(enquiryId, salesPersonId);
      setEnquiries(prev => 
        prev.map(enquiry => 
          enquiry.id === enquiryId ? updatedEnquiry : enquiry
        )
      );
      return updatedEnquiry;
    } catch (err) {
      setError(err.message);
      console.error('Error assigning sales person:', err);
      throw err;
    }
  };

  const autoAssignSalesPerson = async (enquiryId) => {
    try {
      const updatedEnquiry = await enquiryAPI.autoAssign(enquiryId);
      setEnquiries(prev => 
        prev.map(enquiry => 
          enquiry.id === enquiryId ? updatedEnquiry : enquiry
        )
      );
      return updatedEnquiry;
    } catch (err) {
      setError(err.message);
      console.error('Error auto-assigning sales person:', err);
      throw err;
    }
  };

  const updateEnquiryStatus = async (enquiryId, status) => {
    try {
      const updatedEnquiry = await enquiryAPI.updateStatus(enquiryId, status);
      setEnquiries(prev => 
        prev.map(enquiry => 
          enquiry.id === enquiryId ? updatedEnquiry : enquiry
        )
      );
      return updatedEnquiry;
    } catch (err) {
      setError(err.message);
      console.error('Error updating enquiry status:', err);
      throw err;
    }
  };

  const updateInterestLevel = async (enquiryId, interestLevel) => {
    try {
      const updatedEnquiry = await enquiryAPI.updateInterestLevel(enquiryId, interestLevel);
      setEnquiries(prev => 
        prev.map(enquiry => 
          enquiry.id === enquiryId ? updatedEnquiry : enquiry
        )
      );
      return updatedEnquiry;
    } catch (err) {
      setError(err.message);
      console.error('Error updating interest level:', err);
      throw err;
    }
  };

  const addEnquiryRemarks = async (enquiryId, remarks) => {
    try {
      const updated = await enquiryAPI.addRemarks(enquiryId, remarks);
      setEnquiries(prev => prev.map(e => (e.id === enquiryId ? updated : e)));
      return updated;
    } catch (err) {
      setError(err.message);
      console.error('Error adding remarks:', err);
      throw err;
    }
  };

  const scheduleEnquiryFollowUp = async (enquiryId, followUpDate) => {
    try {
      const updated = await enquiryAPI.scheduleFollowUp(enquiryId, followUpDate);
      setEnquiries(prev => prev.map(e => (e.id === enquiryId ? updated : e)));
      return updated;
    } catch (err) {
      setError(err.message);
      console.error('Error scheduling follow-up:', err);
      throw err;
    }
  };

  // Sales Person functions
  const loadSalesPersons = async () => {
    try {
      const response = await salesPersonAPI.getAll();
      setSalesPersons(response.content || response || []);
    } catch (err) {
      console.error('Error loading sales persons:', err);
      setSalesPersons([]);
    }
  };

  const loadAvailableSalesPersons = async () => {
    try {
      const response = await salesPersonAPI.getAvailable();
      setSalesPersons(response || []);
      return response || [];
    } catch (err) {
      console.error('Error loading available sales persons:', err);
      setSalesPersons([]);
      return [];
    }
  };

  const createSalesPerson = async (salesPersonData) => {
    setLoading(true);
    setError(null);
    try {
      const newSalesPerson = await salesPersonAPI.create(salesPersonData);
      setSalesPersons(prev => [newSalesPerson, ...prev]);
      return newSalesPerson;
    } catch (err) {
      setError(err.message);
      console.error('Error creating sales person:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSalesPerson = async (id, updateData) => {
    try {
      const updatedSalesPerson = await salesPersonAPI.update(id, updateData);
      setSalesPersons(prev => 
        prev.map(person => 
          person.id === id ? updatedSalesPerson : person
        )
      );
      return updatedSalesPerson;
    } catch (err) {
      setError(err.message);
      console.error('Error updating sales person:', err);
      throw err;
    }
  };

  const deleteSalesPerson = async (id) => {
    try {
      await salesPersonAPI.delete(id);
      setSalesPersons(prev => prev.filter(person => person.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting sales person:', err);
      throw err;
    }
  };

  // Sales Activity functions
  const loadSalesActivities = async (enquiryId = null, salesPersonId = null) => {
    try {
      let response;
      if (enquiryId) {
        response = await salesActivityAPI.getByEnquiry(enquiryId);
      } else if (salesPersonId) {
        response = await salesActivityAPI.getBySalesPerson(salesPersonId);
      } else {
        response = await salesActivityAPI.getAll();
      }
      setSalesActivities(response.content || response || []);
    } catch (err) {
      console.error('Error loading sales activities:', err);
    }
  };

  const createSalesActivity = async (activityData) => {
    try {
      const newActivity = await salesActivityAPI.create(activityData);
      setSalesActivities(prev => [newActivity, ...prev]);
      return newActivity;
    } catch (err) {
      setError(err.message);
      console.error('Error creating sales activity:', err);
      throw err;
    }
  };

  const logQuickActivity = async (activityData) => {
    try {
      const newActivity = await salesActivityAPI.logActivity(activityData);
      setSalesActivities(prev => [newActivity, ...prev]);
      return newActivity;
    } catch (err) {
      setError(err.message);
      console.error('Error logging activity:', err);
      throw err;
    }
  };

  // Search and filter functions
  const searchEnquiries = async (searchTerm) => {
    try {
      const response = await enquiryAPI.search(searchTerm);
      return response.content || response || [];
    } catch (err) {
      console.error('Error searching enquiries:', err);
      return [];
    }
  };

  const getEnquiriesByStatus = async (status) => {
    try {
      const response = await enquiryAPI.getByStatus(status);
      return response || [];
    } catch (err) {
      console.error('Error getting enquiries by status:', err);
      return [];
    }
  };

  const getEnquiriesBySalesPerson = async (salesPersonId) => {
    try {
      const response = await enquiryAPI.getBySalesPerson(salesPersonId);
      return response || [];
    } catch (err) {
      console.error('Error getting enquiries by sales person:', err);
      return [];
    }
  };

  const getUnassignedEnquiries = async () => {
    try {
      const response = await enquiryAPI.getUnassigned();
      return response || [];
    } catch (err) {
      console.error('Error getting unassigned enquiries:', err);
      return [];
    }
  };

  const getHotLeads = async () => {
    try {
      const response = await enquiryAPI.getHotLeads();
      return response || [];
    } catch (err) {
      console.error('Error getting hot leads:', err);
      return [];
    }
  };

  // User Management functions
  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.content || response || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    }
  };

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userAPI.create(userData);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError(err.message);
      console.error('Error creating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, updateData) => {
    try {
      const updatedUser = await userAPI.update(id, updateData);
      setUsers(prev => 
        prev.map(user => 
          user.id === id ? updatedUser : user
        )
      );
      return updatedUser;
    } catch (err) {
      setError(err.message);
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await userAPI.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  const getUsersByRole = async (role) => {
    try {
      const response = await userAPI.getByRole(role);
      return response || [];
    } catch (err) {
      console.error('Error getting users by role:', err);
      return [];
    }
  };


  const value = {
    // State
    enquiries,
    salesPersons,
    salesActivities,
    users,
    loading,
    error,
    
    // Enquiry functions
    loadEnquiries,
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    assignSalesPerson,
    autoAssignSalesPerson,
    updateEnquiryStatus,
    updateInterestLevel,
    
    // Sales Person functions
    loadSalesPersons,
    loadAvailableSalesPersons,
    createSalesPerson,
    updateSalesPerson,
    deleteSalesPerson,
    
    // Sales Activity functions
    loadSalesActivities,
    createSalesActivity,
    logQuickActivity,
    
    // User Management functions
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    
    // Search and filter functions
    searchEnquiries,
    getEnquiriesByStatus,
    getEnquiriesBySalesPerson,
    getUnassignedEnquiries,
    getHotLeads,
    addEnquiryRemarks,
    scheduleEnquiryFollowUp,
    
    // Utility functions
    clearError: () => setError(null),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
