import axios from 'axios';
export interface Department {
    _id?: string; // MongoDB document ID (optional when creating new)
    departmentId: string;
    departmentName: string;
    description?: string;
}


import { API_ENDPOINTS } from '@/config/api';

const BASE_URL = API_ENDPOINTS.DEPARTMENTS;

// Fetch all departments
export const getAllDepartments = async (): Promise<Department[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.departments;
};

// Add a new department
export const addDepartment = async (department: Department): Promise<Department> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${BASE_URL}/add`, department, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Update department
export const updateDepartment = async (id: string, department: Partial<Department>): Promise<Department> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${BASE_URL}/${id}`, department, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.department;
};

// Delete department
export const deleteDepartment = async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
