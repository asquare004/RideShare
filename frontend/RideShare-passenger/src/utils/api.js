import axios from 'axios';
import { store } from '../redux/store';
import { signOutSuccess } from '../redux/user/userSlice';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  // Increase timeout for debugging
  timeout: 10000
});

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Get current state
    const state = store.getState();
    const token = state.user?.currentUser?.token;
    
    // Always add token to headers if available
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Enhanced logging for debugging
    console.log('API Request:', {
      fullUrl: `${config.baseURL}${config.url}`,
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response error:', {
      fullUrl: error.config?.baseURL + error.config?.url,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Dispatch sign out action
      store.dispatch(signOutSuccess());
      // Redirect to sign in page
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export { api }; 