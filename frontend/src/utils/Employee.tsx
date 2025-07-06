import axios from "axios";
import { User } from "./User";

export interface LeaveBalance {
    el: number;     // Earned Leave
    sl: number;     // Sick Leave
    cl: number;     // Casual Leave
    od: number;     // On Duty
    lwp: number;    // Leave Without Pay
    lhd: number;    // Leave Half Day
    others: number; // Custom leave
}

export interface Department {
    _id: string;
    departmentId: string;
    departmentName: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Employee {
    _id?: string;
    userId: User;
    employeeId: number;
    name: string;
    email: string;
    korusEmail?: string;
    dob: string;
    gender: string;
    maritalStatus: string;
    designation: string;
    department: Department; // Accepts full object or string ID when submitting
    hod?: string;
    qualification: string;
    yop?: string;
    contactNo: number;
    altContactNo?: number;
    permanentAddress?: string;
    localAddress?: string;
    aadharNo: string;
    pan: string;
    passportNo?: string;
    passportType?: string;
    passportpoi?: string;
    passportdoi?: string;
    passportdoe?: string;
    nationality?: string;
    uan?: string;
    pfNo?: string;
    esiNo?: string;
    bank?: string;
    branch?: string;
    ifsc?: string;
    accountNo?: string;
    repperson?: string;
    role: string;
    password: string;
    doj: string;
    dol?: string;
    profileImage?: File | string;
    leaveBalance: LeaveBalance;
}

const BASE_URL = "https://korus-ems-backend.vercel.app/api/employees";

// Fetch all employees
export const getAllEmployees = async (): Promise<Employee[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.employees;
};

// Add employee
export const addEmployee = async (employee: Employee): Promise<Employee | null> => {
    const token = localStorage.getItem('token');
    try {
        const formData = new FormData();
        Object.entries(employee).forEach(([key, value]) => {
            if (key === 'profileImage' && value instanceof File) {
                formData.append(key, value);
            } else if (key === 'department' && typeof value === 'string') {
                formData.append(key, value);
            } else if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value as any);
            }
        });

        const response = await axios.post(`${BASE_URL}/add`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to add employee:', error);
        return null;
    }
};

// Update employee leave balance
export const updateEmployeeLeaveBalance = async (employeeId: string, leaveBalance: LeaveBalance): Promise<Employee> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${BASE_URL}/edit-leave-balance/${employeeId}`, leaveBalance, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

// Edit employee
export const editEmployee = async (_id: string, employee: Employee): Promise<Employee | null> => {
    const token = localStorage.getItem('token');
    try {
        const formData = new FormData();
        Object.entries(employee).forEach(([key, value]) => {
            if (key === 'profileImage' && value instanceof File) {
                formData.append(key, value);
            } else if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value as any);
            }
        });

        const response = await axios.put(`${BASE_URL}/${_id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Failed to edit employee:', error);
        return null;
    }
};

// Delete employee
export const deleteEmployee = async (_id: string): Promise<boolean> => {
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`${BASE_URL}/${_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return true;
    } catch (error) {
        console.error('Failed to delete employee:', error);
        return false;
    }
};

// Update employee onboarding and offboarding
export const updateEmployeeJourney = async (employeeId: string, payload: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${BASE_URL}/update-journey/${employeeId}`, { payload }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};
