import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api';

export const userService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_URL}/user/update/${userId}`, userData, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 