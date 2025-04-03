import axios from 'axios';
import { store } from '../redux/store';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get auth token
const getAuthToken = () => {
  // Check if we have a driver token in cookies
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const driverCookie = cookies.find(cookie => cookie.startsWith('driver_access_token='));
  
  if (driverCookie) {
    return driverCookie.split('=')[1];
  }
  
  // If no cookie, try to get token from Redux store
  const state = store.getState();
  return state.user?.currentUser?.token;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get current cookies for logging
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    // Check for driver-specific cookie for logging
    const hasDriverAuthCookie = cookies.some(cookie => cookie.startsWith('driver_access_token='));
    
    console.log('Request to:', config.url);
    console.log('Has driver auth cookie:', hasDriverAuthCookie);
    
    // Get auth token (either from cookie or Redux store)
    const token = getAuthToken();
    
    // Always add the token to Authorization header if available
    if (token) {
      console.log('Adding token to request (first 10 chars):', token.substring(0, 10) + '...');
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No driver authentication token available');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// Export both as named export and default export for backward compatibility
export { api };
export default api; 