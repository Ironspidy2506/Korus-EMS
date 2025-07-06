import axios from 'axios';

export interface Leave {
    _id?: string;
    employeeId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    reason: string;
    type: "el" | "sl" | "cl" | "od" | "lwp" | "lhd" | "others";
    days: number;
    status?: string;
    appliedTo?: string[];
    attachment?: {
        fileName?: string;
        fileType?: string;
        fileData?: string; // base64 if you're storing it that way
    };
    approvedBy?: string;
    rejectedBy?: string;
    ror?: string;
}

const API_BASE_URL = 'https://korus-ems-backend.vercel.app/api/leaves';

// Get all leaves
export const getAllLeaves = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching leaves:', error);
        throw error;
    }
};

// Get user leave
export const getUserLeaves = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/get-user-leaves/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching leave attachment:', error);
        throw error;
    }
};

// Get leave for user approvals
export const getLeaveForMyApprovals = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/get-leaves-for-approval/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching leave attachment:', error);
        throw error;
    }
};

// Apply for leave
export const applyForLeave = async (userId: string, leaveData: FormData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/apply/${userId}`, leaveData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (error) {
        console.error('Error applying for leave:', error);
        throw error;
    }
};

// Update leave
export const updateLeave = async (leaveId: string, leaveData: FormData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/edit/${leaveId}`, leaveData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (error) {
        console.error('Error updating leave:', error);
        throw error;
    }
};

// Delete leave
export const deleteLeave = async (leaveId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/${leaveId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting leave:', error);
        throw error;
    }
};

// Approve or reject leave
export const approveOrRejectLeave = async (action: string, leaveId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/${action}/${leaveId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response;
    } catch (error) {
        console.error('Error approving/rejecting leave:', error);
        throw error;
    }
};

// Get leave attachment
export const getLeaveAttachment = async (leaveId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/attachment/${leaveId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching leave attachment:', error);
        throw error;
    }
};

// Approve or reject leave
export const updateReasonOfRejection = async (leaveId: string, response: string) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_BASE_URL}/update/ror/${leaveId}`, { response }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res;
    } catch (error) {
        console.error('Error updating reason of rejection for a leave:', error);
        throw error;
    }
};



