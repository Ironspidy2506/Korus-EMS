import { Employee } from "./Employee";
import axios from "axios";

export interface FixedAllowance {
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

const API_BASE_URL = 'https://korus-ems-backend.vercel.app/api/fixed-allowances';

// Get all fixed allowances
export const getAllFixedAllowances = async () => {
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

// Add a fixed allowance
export const addFixedAllowance = async (fixedallowanceData: FixedAllowance | FormData) => {
    try {
        const token = localStorage.getItem('token');
        let headers: any = { Authorization: `Bearer ${token}` };
        let data = fixedallowanceData;
        if (fixedallowanceData instanceof FormData) {
            headers['Content-Type'] = 'multipart/form-data';
        }
        const response = await axios.post(`${API_BASE_URL}/add`, data, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error('Error adding allowance:', error);
        throw error;
    }
};

// Update a fixed allowance
export const updateFixedAllowance = async (_id: string, fixedallowanceData: FixedAllowance | FormData) => {
    try {
        const token = localStorage.getItem('token');
        let data = fixedallowanceData;
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

// Delete a fixed allowance
export const deleteFixedAllowance = async (_id: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/${_id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response;
    } catch (error) {
        console.error('Error deleting allowance:', error);
        throw error;
    }
};

// Get user fixed allowance
export const getUserFixedAllowances = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/get-user-fixed-allowances/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response;
    } catch (error) {
        console.error('Error fetching allowances:', error);
        throw error;
    }
};


// Handle add voucher
export const updateVoucherNo = async (_id: string, voucherNo: string) => {
    try {
        const token = localStorage.getItem('token');
        let headers: any = { Authorization: `Bearer ${token}` };
        const response = await axios.put(`${API_BASE_URL}/add-voucher/${_id}`, {voucherNo}, {
            headers
        });
        return response;
    } catch (error) {
        console.error('Error updating allowance:', error);
        throw error;
    }
};