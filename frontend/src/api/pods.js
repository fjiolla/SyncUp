import apiClient from './client';

export const podsApi = {
  discover: (params) => apiClient.get('/pods/discover', { params }),
  getBySlug: (slug) => apiClient.get(`/pods/${slug}`),
  getMyPods: (params) => apiClient.get('/pods/my-pods', { params }),
  create: (data) => apiClient.post('/pods', data),
  update: (podId, data) => apiClient.patch(`/pods/${podId}`, data),
  remove: (podId) => apiClient.delete(`/pods/${podId}`),
  join: (podId) => apiClient.post(`/pods/${podId}/join`),
  leave: (podId) => apiClient.post(`/pods/${podId}/leave`),
  getMembers: (podId, params) => apiClient.get(`/pods/${podId}/members`, { params }),
  approveMember: (podId, userId) => apiClient.post(`/pods/${podId}/members/${userId}/approve`),
  rejectMember: (podId, userId) => apiClient.post(`/pods/${podId}/members/${userId}/reject`),
  removeMember: (podId, userId) => apiClient.post(`/pods/${podId}/members/${userId}/remove`),
  promoteMember: (podId, userId, role) => apiClient.patch(`/pods/${podId}/members/${userId}/role`, { role }),
  inviteMember: (podId, userId) => apiClient.post(`/pods/${podId}/invite/${userId}`),
};
