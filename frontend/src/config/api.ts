// Centralized API Configuration
export const API_BASE_URL = 'https://korus-ems-backend.vercel.app/api';

// Helper function to get full API endpoint
export const getApiEndpoint = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
    SEND_RESET_OTP: `${API_BASE_URL}/auth/send-reset-otp`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },
  // Employees
  EMPLOYEES: `${API_BASE_URL}/employees`,
  // Departments
  DEPARTMENTS: `${API_BASE_URL}/department`,
  // Leaves
  LEAVES: `${API_BASE_URL}/leaves`,
  // Allowances
  ALLOWANCES: `${API_BASE_URL}/allowances`,
  // Fixed Allowances
  FIXED_ALLOWANCES: `${API_BASE_URL}/fixed-allowances`,
  // Salary
  SALARY: `${API_BASE_URL}/salary`,
  // Appraisals
  APPRAISALS: `${API_BASE_URL}/appraisals`,
  // LTC
  LTC: `${API_BASE_URL}/ltc`,
  // Travel Expenditure
  TRAVEL_EXPENDITURE: `${API_BASE_URL}/travel-expenditures`,
  // Helpdesk
  HELPDESK: `${API_BASE_URL}/helpdesk`,
  // Holiday
  HOLIDAY: `${API_BASE_URL}/holiday`,
  // Messages
  MESSAGES: `${API_BASE_URL}/message`,
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notification`,
  // Users
  USERS: `${API_BASE_URL}/users`,
  // Salary Password
  SALARY_PASSWORD: `${API_BASE_URL}/salary-password`,
};

// Helper functions for common endpoints
export const getAttachmentUrl = (endpoint: string, id: string): string => {
  return `${endpoint}/attachment/${id}`;
};

export const getLeaveAttachmentUrl = (id: string): string => {
  return getAttachmentUrl(API_ENDPOINTS.LEAVES, id);
};

export const getLTCAttachmentUrl = (id: string): string => {
  return getAttachmentUrl(API_ENDPOINTS.LTC, id);
};

export const getTravelExpenditureAttachmentUrl = (id: string): string => {
  return getAttachmentUrl(API_ENDPOINTS.TRAVEL_EXPENDITURE, id);
};

export const getAllowanceAttachmentUrl = (id: string): string => {
  return getAttachmentUrl(API_ENDPOINTS.ALLOWANCES, id);
};

export const getFixedAllowanceAttachmentUrl = (id: string): string => {
  return getAttachmentUrl(API_ENDPOINTS.FIXED_ALLOWANCES, id);
};
