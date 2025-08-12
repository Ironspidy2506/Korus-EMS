import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://korus-ems-backend.vercel.app/api';

export interface SalaryPwdResponse {
  success: boolean;
  message: string;
  requiresPasswordSet?: boolean;
}

// Verify salary password
export const verifySalaryPassword = async (salaryPassword: string): Promise<SalaryPwdResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/salary-password/verify`,
      { salaryPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as SalaryPwdResponse;
  } catch (error) {
    console.error('Error verifying salary password:', error);
    return { success: false, message: 'Network error occurred' };
  }
};

// Set salary password
export const setSalaryPassword = async (newPassword: string): Promise<SalaryPwdResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/salary-password/set`,
      { newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as SalaryPwdResponse;
  } catch (error) {
    console.error('Error setting salary password:', error);
    return { success: false, message: 'Network error occurred' };
  }
};

// Send salary password reset OTP
export const sendSalaryPasswordResetOtp = async (): Promise<SalaryPwdResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/salary-password/send-reset-otp`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as SalaryPwdResponse;
  } catch (error) {
    console.error('Error sending reset OTP:', error);
    return { success: false, message: 'Network error occurred' };
  }
};

// Reset salary password using OTP
export const resetSalaryPassword = async (otp: string, newPassword: string): Promise<SalaryPwdResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/salary-password/reset`,
      { otp, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as SalaryPwdResponse;
  } catch (error) {
    console.error('Error resetting salary password:', error);
    return { success: false, message: 'Network error occurred' };
  }
};
