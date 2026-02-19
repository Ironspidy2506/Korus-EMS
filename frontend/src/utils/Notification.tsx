import axios from "axios";

export interface Notification {
    _id?: string;
    subject: string;
    message: string;
    priority: 'normal' | 'high' | 'urgent';
    createdAt?: string;
    updatedAt?: string;
}

import { API_ENDPOINTS } from '@/config/api';

const BASE_URL = API_ENDPOINTS.NOTIFICATIONS;

// Fetch all notifications
export const getAllNotifications = async (): Promise<Notification[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/get-all-notifications`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.notifications || [];
};

