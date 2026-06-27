import apiClient from './client';

export const blocksApi = {
  block: (userId) => apiClient.post(`/blocks/${userId}`),
  unblock: (userId) => apiClient.delete(`/blocks/${userId}`),
  list: () => apiClient.get('/blocks'),
};
