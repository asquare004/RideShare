import axios from 'axios';
import { store } from '../redux/store';
import { signOutSuccess } from '../redux/user/userSlice';

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
  // Try to get token from Redux store
  const state = store.getState();
  const token = state.user?.currentUser?.token;
  
  if (token) {
    return token;
  }
  
  // Check if we have a token in cookies as fallback
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const accessToken = cookies.find(cookie => cookie.startsWith('access_token='));
  
  if (accessToken) {
    return accessToken.split('=')[1];
  }
  
  return null;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
    // Log detailed error information in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    return Promise.reject(error);
  }
);

export { api }; 