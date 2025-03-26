import axios from 'axios';
import { store } from '../redux/store';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from Redux store if cookie is not available
api.interceptors.request.use(
  (config) => {
    // Get current cookies
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    // Check for driver-specific cookie
    const hasDriverAuthCookie = cookies.some(cookie => cookie.startsWith('driver_access_token='));
    
    console.log('All cookies:', cookies);
    console.log('Has driver auth cookie:', hasDriverAuthCookie);
    
    // If no cookie, try to add token from Redux store
    if (!hasDriverAuthCookie) {
      const state = store.getState();
      const token = state.user?.currentUser?.token;
      
      if (token) {
        console.log('Adding token from Redux store to request');
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('No driver authentication method available');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export both as named export and default export for flexibility
export default api; 