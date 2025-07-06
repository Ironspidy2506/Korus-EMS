import { Employee } from "./Employee";
import axios from "axios";

export interface Allowance {
    _id?: string;
    employeeId: Employee;
    client?: string;
    projectNo?: string;
    allowanceMonth: string;
    allowanceYear: string;
    allowanceType: string;
    attachment?: {
        fileName?: string;
        fileType?: string;
        fileData?: Buffer;
    };
    allowanceAmount: number;
    status?: string;
    voucherNo?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const API_BASE_URL = 'http://localhost:5000/api/allowances';

// 
export const getAllAllowances = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching allowances:', error);
        throw error;
    }
};

export const addAllowance = async (allowanceData: Allowance | FormData) => {
    try {
        const token = localStorage.getItem('token');
        let headers: any = { Authorization: `Bearer ${token}` };
        let data = allowanceData;
        if (allowanceData instanceof FormData) {
            // Let axios set the Content-Type including boundary for FormData
        } else {
            headers['Content-Type'] = 'application/json';
        }
        const response = await axios.post(`${API_BASE_URL}/add`, data, {
            headers
        });
        return response;
    } catch (error) {
        console.error('Error adding allowance:', error);
        throw error;
    }
};

// Update an allowance
export const updateAllowance = async (_id: string, allowanceData: Allowance | FormData) => {
    try {
        const token = localStorage.getItem('token');
        let data = allowanceData;
        const response = await axios.put(`${API_BASE_URL}/${_id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (error) {
        console.error('Error updating allowance:', error);
        throw error;
    }
};

// Delete a allowance
export const deleteAllowance = async (_id: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/${_id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting allowance:', error);
        throw error;
    }
};

// Get user fixed allowance
export const getUserAllowances = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/get-user-allowances/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response;
    } catch (error) {
        console.error('Error fetching allowances:', error);
        throw error;
    }
};

// Approve or reject allowance
export const approveOrRejectAllowance = async (action: string, allowanceId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/${action}/${allowanceId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response;
    } catch (error) {
        console.error('Error approving/rejecting allowance:', error);
        throw error;
    }
};

// Handle add voucher
export const updateVoucherNo = async (_id: string, voucherNo: string) => {
    try {
        const token = localStorage.getItem('token');
        let headers: any = { Authorization: `Bearer ${token}` };
        const response = await axios.put(`${API_BASE_URL}/add-voucher/${_id}`, { voucherNo }, {
            headers
        });
        return response;
    } catch (error) {
        console.error('Error updating allowance:', error);
        throw error;
    }
};