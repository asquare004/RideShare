import axios from 'axios';
import { store } from '../redux/store';

// Get the base URL from environment variables or use the development URL as fallback
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Log environment information for debugging
console.log('API initialization - Environment:', import.meta.env.MODE);
console.log('API initialization - Base URL:', baseURL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${baseURL}/api`,
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
  
  // Debug cookie information
  console.log('All cookies:', cookies);
  console.log('Found driver_access_token cookie:', !!driverCookie);
  
  if (driverCookie) {
    const token = driverCookie.split('=')[1];
    console.log('Using token from cookie (first 10 chars):', token.substring(0, 10) + '...');
    return token;
  }
  
  // If no cookie, try to get token from Redux store
  const state = store.getState();
  console.log('Redux user state:', state.user);
  
  // Get token from multiple possible locations in the currentUser object
  const token = state.user?.currentUser?.token || 
                state.user?.currentUser?.accessToken || 
                state.user?.currentUser?._doc?.token;
  
  if (token) {
    console.log('Using token from Redux (first 10 chars):', token.substring(0, 10) + '...');
  } else {
    console.log('No token found in Redux state:', state.user?.currentUser);
  }
  
  return token;
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
      // This might be the issue after deployment - try to get the token from localStorage as a fallback
      try {
        const localStorageToken = localStorage.getItem('driverToken');
        if (localStorageToken) {
          console.log('Found fallback token in localStorage');
          config.headers['Authorization'] = `Bearer ${localStorageToken}`;
        }
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data ? 'Data received' : 'No data',
    });
    return response;
  },
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
    
    // Add deployment-specific debugging
    if (error.response?.status === 401) {
      console.error('Authentication error detected. Current cookies:', document.cookie);
      console.error('Redux state:', store.getState().user);
    }
    
    return Promise.reject(error);
  }
);

// Export both as named export and default export for backward compatibility
export { api };
export default api; 