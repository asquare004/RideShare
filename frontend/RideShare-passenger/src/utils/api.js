import axios from 'axios';
import { store } from '../redux/store';
import { signOutSuccess } from '../redux/user/userSlice';

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

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
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