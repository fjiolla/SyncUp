import axios from 'axios';
import { env } from '../config/env';

// Create an Axios instance pointing to the Express backend
const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('syncup_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global 401 handling (Auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns a 401 Unauthorized, automatically log the user out
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('syncup_token');
      localStorage.removeItem('syncup_user');
      
      // Dispatch a custom event to notify AuthContext to nuke its state without forcing a hard reload
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
