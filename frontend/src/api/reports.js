import apiClient from './client';

export const reportsApi = {
  create: (data) => apiClient.post('/reports', data),
  list: (params) => apiClient.get('/reports', { params }),
  resolve: (reportId, data) => apiClient.patch(`/reports/${reportId}`, data),
};
