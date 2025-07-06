import axios from "axios";


export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "accounts" | "hr" | "employee" | "lead";
    profileImage?: string;
    resetOtp?: string;
    resetOtpExpireAt?: number;
}

const BASE_URL = "https://korus-ems-backend.vercel.app/api/users";

// Fetch all users
export const getAllUsers = async (): Promise<User[]> => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`${BASE_URL}/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw error;
    }
};

// Get user by id
export const getUserById = async (id: string): Promise<any> => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.employee;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
};