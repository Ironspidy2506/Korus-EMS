import axios from 'axios';

export interface Appraisal {
    _id?: string;
    employeeId: string;
    employeeName: string;
    department: string;
    accomplishments?: string;
    supervisor: string[];
    supervisorComments?: string;
    ratings: {
        Punctuality?: string;
        JobKnowledge?: string;
        DesignAccuracy?: string;
        SoftwareProficiency?: string;
        DocumentationQuality?: string;
        Timeliness?: string;
        TaskVolume?: string;
        TimeUtilization?: string;
        Initiative?: string;
        Attendance?: string;
    };
    totalRating: number;
}

const API_BASE_URL = 'http://localhost:5000/api/appraisals';

// Get all appraisals
export const getAppraisals = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching appraisals:', error);
        throw error;
    }
};

// Add new appraisal
export const addAppraisal = async (appraisalData: Appraisal) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/add`, appraisalData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding appraisal:', error);
        throw error;
    }
};

// Edit appraisal
export const editAppraisal = async (id: string, appraisalData: Appraisal) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/${id}`, appraisalData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response;
    } catch (error) {
        console.error('Error editing appraisal:', error);
        throw error;
    }
};

// Delete appraisal
export const deleteAppraisal = async (id: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/delete-appraisal/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting appraisal:', error);
        throw error;
    }
};

// Get user appraisals
export const getUserAppraisals = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/get-user-appraisals/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user appraisals:', error);
        throw error;
    }
};

// Get team lead appraisals
export const getTeamLeadAppraisals = async (userId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/view-appraisals-teamlead/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching team lead appraisals:', error);
        throw error;
    }
};
