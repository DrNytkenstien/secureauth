const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  SEND_OTP: ${API_BASE_URL}/auth/send-otp,
  VERIFY_OTP: ${API_BASE_URL}/auth/verify-otp,
  LOGOUT: ${API_BASE_URL}/auth/logout,
};

export default API_ENDPOINTS;
