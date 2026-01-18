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
    const url = config.url || '';
    const method = config.method || 'get';
    
    // Admin-specific endpoints that should use adminToken
    const isAdminRequest = 
      url.includes('/orders/all') ||  // Get all orders (admin only)
      (method !== 'get' && url.match(/\/orders\/[^/]+$/)) ||  // Update order status (admin only - PUT/PATCH /orders/{id})
      (url.includes('/users/') && 
       !url.includes('/login') && 
       !url.includes('/register') && 
       !url.includes('/users/me') &&
       !url.includes('/change-password') &&
       !url.includes('/forgot-password') &&
       !url.includes('/reset-password')) ||  // User management (excluding personal endpoints)
      url.includes('/inventory/') ||  // Inventory management
      url.includes('/categories/') ||  // Categories management
      (method !== 'get' && url.includes('/subcategories/'));  // Subcategory create/update/delete (admin only)
    
    if (isAdminRequest) {
      // Admin request: ONLY use adminToken, do NOT fall back to user token
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] Admin request to ${url} - using adminToken`);
        }
      } else {
        // No admin token available - this is an error condition
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[API] Admin request to ${url} - NO adminToken available! This request will likely fail.`);
        }
      }
    } else {
      // Regular request: Use user token, but fall back to adminToken if user token doesn't exist
      // This handles cases where endpoints support both user and admin access (e.g., /orders/{id}/items)
      const userToken = localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] User request to ${url} - using userToken`);
        }
      } else if (adminToken) {
        // Admin viewing user-accessible endpoints (e.g., viewing specific order items)
        config.headers.Authorization = `Bearer ${adminToken}`;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] User request to ${url} - using adminToken (fallback)`);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and decryption
let isHandlingUnauthorized = false;

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
    isHandlingUnauthorized = false;
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;
      
      // Don't handle 401 for login/register endpoints
      const isLoginEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
      
      if (!isLoginEndpoint) {
        const url = error.config?.url || '';
        const method = error.config?.method || 'get';
        
        // Determine if this was an admin-only request
        const isAdminRequest = 
          url.includes('/orders/all') ||
          (method !== 'get' && url.match(/\/orders\/[^/]+$/)) ||
          (url.includes('/users/') && 
           !url.includes('/login') && 
           !url.includes('/register') && 
           !url.includes('/users/me') &&
           !url.includes('/change-password') &&
           !url.includes('/forgot-password') &&
           !url.includes('/reset-password')) ||
          url.includes('/inventory/') ||
          url.includes('/categories/') ||
          (method !== 'get' && url.includes('/subcategories/'));
        
        if (isAdminRequest) {
          // Clear only admin session
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          
          // Redirect to admin login
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        } else {
          // Clear only user session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirect to user login
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      }
      
      isHandlingUnauthorized = false;
    }
    return Promise.reject(error);
  }
);

export default api;
