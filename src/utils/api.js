import axios from 'axios';
import { store } from '../redux/store';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Get current state
    const state = store.getState();
    const token = state.user?.currentUser?.token;
    
    // If token exists, add it to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors
    if (error.response?.status === 401) {
      // Clear Redux store if needed
      // store.dispatch(signOutSuccess());
      console.error('Authentication error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export { api }; 