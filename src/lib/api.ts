import axios from 'axios';
import { decryptData } from './crypto';

// Backend API base URL from environment variable or default to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for admin token first, then regular user token
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and decryption
api.interceptors.response.use(
  (response) => {
    // Check if response contains encrypted data
    if (response.data && response.data.encrypted_response) {
      try {
        const decrypted = decryptData(response.data.encrypted_response);
        response.data = JSON.parse(decrypted);
      } catch (error) {
        console.error('Failed to decrypt response:', error);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't handle 401 for login endpoints
      const isLoginEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
      
      if (!isLoginEndpoint) {
        // Only clear tokens and redirect if we had a token (meaning the token is invalid)
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          localStorage.removeItem('adminUser');
          // Only redirect if not already on auth/admin login page
          if (window.location.pathname !== '/auth' && window.location.pathname !== '/admin/login') {
            if (window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login';
            } else {
              window.location.href = '/auth';
            }
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
