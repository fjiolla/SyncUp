import apiClient from './client';

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  listUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserStatus: (userId, accountStatus) => apiClient.patch(`/admin/users/${userId}/status`, { accountStatus }),
};
