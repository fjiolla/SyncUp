import apiClient from './client';

export const usersApi = {
  getByUsername: (username) => apiClient.get(`/users/${username}`),
};
