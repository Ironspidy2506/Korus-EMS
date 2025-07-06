import axios from "axios";

export interface Holiday {
    _id?: string;
    name: string;
    date: string | Date,
    type: string,
    description: string,
    isRecurring: boolean,
}

const BASE_URL = "https://korus-ems-backend.vercel.app/api/holiday";

// Fetch all holidays
export const getAllHolidays = async (): Promise<Holiday[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.holidays;
};

// Add a new holiday
export const addHoliday = async (holiday: Holiday): Promise<Holiday> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${BASE_URL}/add`, holiday, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.holiday;
};

// Update a holiday
export const updateHoliday = async (
    id: string,
    holiday: Partial<Holiday>
): Promise<Holiday> => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${BASE_URL}/${id}`, holiday, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.holiday;
};

// Delete a holiday
export const deleteHoliday = async (id: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
