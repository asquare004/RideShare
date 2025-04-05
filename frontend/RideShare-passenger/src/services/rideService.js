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
      
      // Add cache-busting parameter to avoid stale data after deployment
      const timestamp = new Date().getTime();
      const response = await api.get(`/user-rides?_t=${timestamp}`);
      
      // Check for auth issues
      if (response.status === 401 || (response.data && response.data.message === 'Not authenticated')) {
        console.error('Authentication error in getUserRides');
        throw new Error('Please sign in again to view your rides');
      }
      
      if (!response.data) {
        console.error('No data received from server in getUserRides');
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
      
      // Detailed error logging for debugging
      if (error.response) {
        console.error('Error response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Please sign in to view your rides');
      } else if (error.response?.status === 500) {
        console.error('Server error details:', error.response.data);
        throw new Error('Server error while fetching rides. Please try again later.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  },
  
  // Book a ride with specific number of seats
  async bookRide(rideId, bookingData) {
    try {
      console.log(`Booking ride ${rideId} with data:`, bookingData);
      const response = await api.post(`/rides/${rideId}/book`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking ride:', error);
      // Get the specific error message if available
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to book ride';
      throw new Error(errorMessage);
    }
  },
  
  async getAvailableRides(filters = {}) {
    try {
      // Add timestamp to prevent caching issues
      const params = { 
        ...filters,
        _t: new Date().getTime()  // Add timestamp to avoid caching
      };
      
      console.log('Fetching available rides with params:', params);
      const response = await api.get('/rides/available', { params });
      
      // Check if response contains rides data
      if (!response.data || !response.data.rides) {
        console.warn('No rides data in response for available rides:', response);
        return [];
      }
      
      // Log the number of rides found
      console.log(`Received ${response.data.rides.length} available rides`);
      
      // Return empty array if no rides found
      return response.data.rides || [];
    } catch (error) {
      console.error('Error fetching available rides:', error);
      
      // Check for network error
      if (!error.response) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Handle specific error codes
      if (error.response?.status === 401) {
        throw new Error('Please sign in to view available rides');
      }
      
      // Get the specific error message from the backend if available
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to fetch available rides';
      throw new Error(errorMessage);
    }
  },
  
  // Cancel a ride
  async cancelRide(rideId) {
    try {
      console.log(`Cancelling ride ${rideId}`);
      const response = await api.put(`/rides/cancel/${rideId}`, {});
      return response.data;
    } catch (error) {
      console.error('Error cancelling ride:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to cancel ride';
      throw new Error(errorMessage);
    }
  }
};
