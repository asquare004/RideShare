import axios from 'axios';
import { store } from '../redux/store';
import { signOutSuccess } from '../redux/user/userSlice';

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
  // Try to get token from Redux store
  const state = store.getState();
  const token = state.user?.currentUser?.token;
  
  // Debug Redux state
  console.log('Redux user state for token:', state.user?.currentUser ? 'User present' : 'No user');
  
  if (token) {
    console.log('Using token from Redux (first chars):', token.substring(0, 10) + '...');
    return token;
  }
  
  // Check if we have a token in cookies as fallback
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  console.log('All cookies:', cookies);
  const accessToken = cookies.find(cookie => cookie.startsWith('access_token='));
  
  if (accessToken) {
    const cookieToken = accessToken.split('=')[1];
    console.log('Using token from cookie (first chars):', cookieToken.substring(0, 10) + '...');
    return cookieToken;
  }
  
  // Last resort - check localStorage
  try {
    const localStorageToken = localStorage.getItem('userToken');
    if (localStorageToken) {
      console.log('Using token from localStorage');
      return localStorageToken;
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
  }
  
  console.warn('No authentication token found');
  return null;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    console.log('Making request to:', config.url);
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = config.params || {};
      config.params._t = new Date().getTime();
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
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data ? 'Data received' : 'No data',
    });
    return response;
  },
  (error) => {
    // Log detailed error information in development
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
      console.error('Current user in Redux:', store.getState().user.currentUser ? 'Present' : 'Not present');
    }
    
    return Promise.reject(error);
  }
);

export { api }; 