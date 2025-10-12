import { toast } from 'react-hot-toast';
import { enquiryAPI } from '../utils/api';

export const createEnquiry = async (enquiryData) => {
  try {
    const response = await enquiryAPI.create(enquiryData);
    toast.success('Enquiry submitted successfully!');
    return response;
  } catch (error) {
    console.error('Error creating enquiry:', error);
    toast.error(error.message || 'Failed to submit enquiry');
    throw error;
  }
};

export const updateEnquiry = async (id, updateData) => {
  try {
    const response = await enquiryAPI.update(id, updateData);
    toast.success('Enquiry updated successfully!');
    return response;
  } catch (error) {
    console.error('Error updating enquiry:', error);
    toast.error('Failed to update enquiry');
    throw error;
  }
};

export const getEnquiryById = async (id) => {
  try {
    return await enquiryAPI.getById(id);
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    toast.error('Failed to fetch enquiry details');
    throw error;
  }
};

export const getAllEnquiries = async () => {
  try {
    return await enquiryAPI.getAll();
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    toast.error('Failed to fetch enquiries');
    throw error;
  }
};
