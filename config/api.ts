// Base URL for API endpoints
export const API_BASE_URL = 'https://bot.swarnaayu.com';

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login/`,
  REGISTER: `${API_BASE_URL}/auth/register/`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify_otp/`,
  CONVERSATION_HISTORY: `${API_BASE_URL}/conversation/history/`,
  CHAT: `${API_BASE_URL}/conversation/chat/`,
}; 