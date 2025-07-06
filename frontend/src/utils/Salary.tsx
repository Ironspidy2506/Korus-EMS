import { Employee } from './Employee.tsx'
import axios from 'axios';

export interface Allowance {
    name: string;
    amount: number;
}

export interface Deduction {
    name: string;
    amount: number;
}

export interface Salary {
    _id?: string;
    employeeId: Employee; // or ObjectId if you're using mongoose.Types.ObjectId
    employeeType: string;
    grossSalary: number;
    basicSalary: number;
    allowances: Allowance[];
    deductions: Deduction[];
    payableDays: number;
    sundays: number;
    netPayableDays: number;
    paymentMonth: string;
    paymentYear: string;
}

const API_BASE_URL = 'https://korus-ems-backend.vercel.app/api/salary';

export const getAllSalaries = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching salaries:', error);
        throw error;
    }
};

export const addSalary = async (salaryData: Salary) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/add`, salaryData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response;
    } catch (error) {
        console.error('Error adding salary:', error);
        throw error;
    }
};

export const updateSalary = async (_id: string, salaryData: Salary) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/${_id}`, salaryData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response;
    } catch (error) {
        console.error('Error updating salary:', error);
        throw error;
    }
};

export const deleteSalary = async (_id: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/${_id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting salary:', error);
        throw error;
    }
};

export const getUserSalaries = async (id: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/get-user-salaries/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching salaries:', error);
        throw error;
    }
};

