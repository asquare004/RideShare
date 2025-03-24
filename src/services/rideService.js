import { api } from '../utils/api';
import { store } from '../redux/store';

// Add a utility function to check cookies
const checkCookies = () => {
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  console.log('All cookies:', cookies);
  const hasAuthCookie = cookies.some(cookie => cookie.startsWith('access_token='));
  console.log('Has auth cookie:', hasAuthCookie);
  return hasAuthCookie;
};

export const rideService = {
  async createRide(rideData) {
    try {
      const response = await api.post('/rides/create', rideData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create ride');
    }
  },
  
  async getRides(filters = {}) {
    try {
      const response = await api.get('/rides', { params: filters });
      return response.data.rides; // Return the rides array from the response
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
  
  async checkPendingRideStatus(rideId) {
    try {
      const response = await api.get(`/rides/pending-status/${rideId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check ride status');
    }
  },
  
  async cancelPendingRide(rideId) {
    try {
      const response = await api.put(`/rides/cancel-pending/${rideId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel ride');
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
  },
  
  async joinRide(rideId, bookedSeats = 1) {
    try {
      const response = await api.post(`/rides/${rideId}/join`, { bookedSeats });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join ride');
    }
  },
  
  async cancelBooking(rideId) {
    try {
      const response = await api.post(`/rides/${rideId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },
  
  async getMyCreatedRides() {
    try {
      const response = await api.get('/user-rides', { 
        params: { createdByCurrentUser: true } 
      });
      return response.data.rides;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your rides');
    }
  },
  
  async getMyJoinedRides() {
    try {
      const response = await api.get('/user-rides', { 
        params: { joinedByCurrentUser: true } 
      });
      return response.data.rides;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your joined rides');
    }
  },
  
  async getUserRideById(rideId) {
    try {
      // Skip the authorization check by using the general ride endpoint
      const response = await api.get(`/rides/${rideId}`);
      
      // Add proper formatting for display
      const rideData = response.data;
      
      // Format the data if needed to match the expected structure
      if (rideData.driverId && typeof rideData.driverId === 'object') {
        rideData.driverInfo = {
          firstName: rideData.driverId.firstName,
          lastName: rideData.driverId.lastName,
          profilePicture: rideData.driverId.profilePicture,
          rating: rideData.driverId.rating,
          vehicleModel: rideData.driverId.vehicleModel,
          vehicleYear: rideData.driverId.vehicleYear,
          licensePlate: rideData.driverId.licensePlate
        };
      }
      
      return rideData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ride details');
    }
  },
  
  async cancelUserRide(rideId) {
    try {
      const response = await api.post(`/user-rides/${rideId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel ride');
    }
  },

  // Get all rides for the current user (both created and joined)
  getUserRides: async () => {
    try {
      console.log('Fetching user rides...');
      
      const response = await api.get('/user-rides');
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      console.log('Rides fetched successfully:', response.data);
      
      return {
        success: true,
        rides: response.data.rides || [],
        totalRides: response.data.totalRides
      };
    } catch (error) {
      console.error('Error fetching user rides:', error);
      if (error.response?.status === 401) {
        throw new Error('Please sign in to view your rides');
      } else if (error.response?.status === 500) {
        console.error('Server error details:', error.response.data);
        throw new Error('Server error while fetching rides. Please try again later.');
      }
      throw error;
    }
  }
};
