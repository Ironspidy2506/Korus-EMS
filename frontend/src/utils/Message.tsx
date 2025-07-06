import axios from "axios";

export interface Message {
    _id?: string;
    employeeId?: {
        _id?: string;
        userId: string;
        employeeId: number;
        name: string;
        email: string;
    };
    department?: {
        _id: string;
        departmentId: string;
        departmentName: string;
        description?: string;
    };
    subject: string;
    priority: string;
    message: string;
    reply?: string;
    createdAt: string;
}

const BASE_URL = "https://korus-ems-backend.vercel.app/api/message";

// Fetch all messages
export const getAllMessages = async (): Promise<Message[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/get-all-messages`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.messages;
};

// Add new message
export const addMessage = async (message: Partial<Message>): Promise<Message> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${BASE_URL}/add-message`, message, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.message;
};

// Edit message
export const editMessage = async (messageId: string, message: Partial<Message>): Promise<Message> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${BASE_URL}/edit-message/${messageId}`, message, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.message;
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axios.delete(`${BASE_URL}/delete-message/${messageId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// Get message by ID
export const getMessageById = async (messageId: string): Promise<Message> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/get-message-by-id/${messageId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.message;
};

// Get user's messages
export const getUsersMessage = async (userId: string): Promise<Message[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/get-users-message/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.messages;
};

// Reply to message
export const replyMessage = async (messageId: string, reply: string): Promise<Message> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${BASE_URL}/reply-message/${messageId}`, { reply }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.message;
}; 