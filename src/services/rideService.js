import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // This is crucial for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const rideService = {
  async createRide(rideData) {
    try {
      console.log('Sending ride data:', rideData);
      console.log('Cookies present:', document.cookie);
      
      // Make the API call with the configured instance
      const response = await api.post('/rides/create', rideData);
      
      return response.data;
    } catch (error) {
      console.error('Error in createRide:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(error.response?.data?.message || 'Failed to create ride');
    }
  },

  async getRides(filters = {}) {
    try {
      const response = await api.get('/rides', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch rides');
    }
  },

  async getRideById(rideId) {
    try {
      const response = await api.get(`/rides/${rideId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ride details');
    }
  },

  async updateRide(rideId, updateData) {
    try {
      const response = await api.put(`/rides/${rideId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update ride');
    }
  },

  async deleteRide(rideId) {
    try {
      const response = await api.delete(`/rides/${rideId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete ride');
    }
  }
};
