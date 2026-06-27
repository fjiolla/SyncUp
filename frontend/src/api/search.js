import apiClient from './client';

export const searchApi = {
  search: (q, type) => apiClient.get('/search', { params: { q, type } }),
};
