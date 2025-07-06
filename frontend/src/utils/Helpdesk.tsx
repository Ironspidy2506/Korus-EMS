import axios from "axios";

export interface Helpdesk {
    _id?: string;
    employeeId: {
        _id?: string;
        userId: string;
        employeeId: number;
        name: string;
        email: string;
    };
    helpId: string;
    date?: string | Date;
    query: string;
    response?: string;
    status: boolean;
}

const BASE_URL = "https://korus-ems-backend.vercel.app/api/helpdesk";

// Fetch all helpdesk tickets
export const getAllHelpdesks = async (): Promise<Helpdesk[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.helps;
};

// Add new helpdesk ticket
export const addHelpdesk = async (helpdesk: { employeeId: string; query: string }): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${BASE_URL}/add`, helpdesk, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

// Update helpdesk ticket
export const updateHelpdesk = async (id: string, helpdesk: Partial<Helpdesk>): Promise<Helpdesk> => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${BASE_URL}/${id}`, helpdesk, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.help;
};

// Resolve helpdesk ticket
export const resolveHelpdesk = async (id: string): Promise<Helpdesk> => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${BASE_URL}/resolve-help/${id}`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.help;
};

// Add response to helpdesk ticket
export const addResponse = async (helpId: string, response: string): Promise<Helpdesk> => {
    const token = localStorage.getItem("token");
    const response_data = await axios.put(`${BASE_URL}/add-response/${helpId}`, { response }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response_data.data.help;
};

// Delete helpdesk ticket
export const deleteHelpdesk = async (id: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// Get user helpdesk tickets
export const getUserHelpdesks = async (userId: string): Promise<Helpdesk[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/get-user-helpdesks/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.helps;
};