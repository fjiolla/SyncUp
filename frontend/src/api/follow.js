import apiClient from './client';

export const followApi = {
  follow: (userId) => apiClient.post(`/users/${userId}/follow`),
  unfollow: (userId) => apiClient.delete(`/users/${userId}/follow`),
  cancelRequest: (userId) => apiClient.delete(`/users/${userId}/follow/cancel`),
  accept: (userId) => apiClient.post(`/users/${userId}/follow/accept`),
  decline: (userId) => apiClient.post(`/users/${userId}/follow/decline`),
  getFollowers: (userId, params) => apiClient.get(`/users/${userId}/followers`, { params }),
  getFollowing: (userId, params) => apiClient.get(`/users/${userId}/following`, { params }),
  getMutuals: (userId) => apiClient.get(`/users/${userId}/mutuals`),
  getPendingRequests: (params) => apiClient.get('/follow-requests', { params }),
};
