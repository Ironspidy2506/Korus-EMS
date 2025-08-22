import axios from 'axios';
import { Department } from './Department';
import { Employee } from './Employee';

const API_BASE_URL = 'https://korus-ems-backend.vercel.app/api/ltc';

export interface LTC {
  _id: string;
  employeeId: Employee,
  department: Department,
  serviceCompletionFrom: string;
  serviceCompletionTo: string;
  leavePeriodFrom: string;
  leavePeriodTo: string;
  reimbursementAmount: number;
  status: string;
  approvedBy: string;
  adminRemarks?: string;
  accountsRemarks?: string;
  paymentStatus?: 'Fully Paid' | 'Partially Paid';
  attachment?: {
    fileName: string;
    fileType: string;
    fileData: Buffer;
  };
  createdAt: string;
  updatedAt: string;
}

export const getAllLTCs = async (): Promise<LTC[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching LTCs:', error);
    throw error;
  }
};

export const getUserLTCs = async (userId: string): Promise<LTC[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user LTCs:', error);
    throw error;
  }
};

export const addLTC = async (formData: FormData): Promise<LTC> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding LTC:', error);
    throw error;
  }
};

export const updateLTC = async (id: string, formData: FormData): Promise<LTC> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating LTC:', error);
    throw error;
  }
};

export const deleteLTC = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error deleting LTC:', error);
    throw error;
  }
};

export const approveOrRejectLTC = async (action: 'approve' | 'reject', id: string): Promise<LTC> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/${id}/${action}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error approving/rejecting LTC:', error);
    throw error;
  }
};

// Get LTC attachment
export const getLTCAttachment = async (ltcId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/attachment/${ltcId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching LTC attachment:', error);
    throw error;
  }
}; 