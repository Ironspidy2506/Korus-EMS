import { Department } from "./Department";
import { Employee } from "./Employee";
import axios from "axios";

export interface Expense {
  date: string;
  description: string;
  amount: number;
}

export interface DayCharge {
  date: string;
  description: string;
  amount: number;
}

export interface TravelExpenditure {
  _id?: string;
  employeeId: Employee;
  designation: string;
  department: Department;
  placeOfVisit: string;
  clientName: string;
  projectNo: string;
  startDate: string;
  returnDate: string;
  purposeOfVisit: string;
  travelMode: 'Air' | 'Rail' | 'Other Mode';
  ticketProvidedBy: 'Client' | 'KORUS';
  deputationCharges: 'Yes' | 'No';
  expenses: Expense[];
  dayCharges: DayCharge[];
  totalAmount: number;
  claimedFromClient?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  voucherNo?: string;
  attachment?: {
    fileName?: string;
    fileType?: string;
    fileData?: Buffer;
  };
  approvedBy?: {
    _id: string;
    empName: string;
  };
  approvedAt?: Date;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const API_BASE_URL = 'https://korus-ems-backend.vercel.app/api/travel-expenditures';

// Get all travel expenditures
export const getAllTravelExpenditures = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching travel expenditures:', error);
    throw error;
  }
};

// Add new travel expenditure
export const addTravelExpenditure = async (travelExpenditureData: TravelExpenditure | FormData) => {
  try {
    const token = localStorage.getItem('token');
    let headers: any = { Authorization: `Bearer ${token}` };
    let data = travelExpenditureData;
    if (travelExpenditureData instanceof FormData) {
      // Let axios set the Content-Type including boundary for FormData
    } else {
      headers['Content-Type'] = 'application/json';
    }
    const response = await axios.post(`${API_BASE_URL}/add`, data, {
      headers
    });
    return response;
  } catch (error) {
    console.error('Error adding travel expenditure:', error);
    throw error;
  }
};

// Update travel expenditure
export const updateTravelExpenditure = async (_id: string, travelExpenditureData: TravelExpenditure | FormData) => {
  try {
    const token = localStorage.getItem('token');
    let data = travelExpenditureData;
    const response = await axios.put(`${API_BASE_URL}/${_id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Error updating travel expenditure:', error);
    throw error;
  }
};

// Delete travel expenditure
export const deleteTravelExpenditure = async (_id: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/${_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting travel expenditure:', error);
    throw error;
  }
};

// Get user travel expenditures
export const getUserTravelExpenditures = async (userId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/get-user-travel-expenditures/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error fetching travel expenditures:', error);
    throw error;
  }
};

// Approve or reject travel expenditure
export const approveOrRejectTravelExpenditure = async (action: string, travelExpenditureId: string, remarks?: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/${action}/${travelExpenditureId}`, 
      { remarks }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response;
  } catch (error) {
    console.error('Error approving/rejecting travel expenditure:', error);
    throw error;
  }
};

// Handle add voucher
export const updateVoucherNo = async (_id: string, voucherNo: string) => {
  try {
    const token = localStorage.getItem('token');
    let headers: any = { Authorization: `Bearer ${token}` };
    const response = await axios.put(`${API_BASE_URL}/update-voucher/${_id}`, { voucherNo }, {
      headers
    });
    return response;
  } catch (error) {
    console.error('Error updating voucher number:', error);
    throw error;
  }
}; 