import apiClient from './client';

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.patch('/auth/me', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  sendVerificationEmail: () => apiClient.post('/auth/send-verification-email'),
  verifyEmail: (token) => apiClient.get(`/auth/verify-email/${token}`),
  completeOnboarding: (data) => apiClient.post('/auth/complete-onboarding', data),
};
