import { api } from '../utils/api';

export const userService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/user/update/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 