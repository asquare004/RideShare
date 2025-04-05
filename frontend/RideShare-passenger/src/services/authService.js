import axios from 'axios';
import Cookies from 'js-cookie';

// Get the base URL from environment variables or use the local development URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${baseURL}/api`;

export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  },

  // Login user
  login: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, userData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/signout`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Logout failed';
    }
  },

  // Check if user is logged in
  isAuthenticated: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/check`, {
        withCredentials: true
      });
      return response.data.isAuthenticated;
    } catch (error) {
      return false;
    }
  },

  // Google authentication
  googleAuth: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/google`, credentials, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Google authentication failed';
    }
  }
};
