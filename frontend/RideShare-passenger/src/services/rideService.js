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
      console.log(`Checking status for pending ride: ${rideId}`);
      
      // Add timestamp to prevent caching issues 
      const timestamp = new Date().getTime();
      const response = await api.get(`/rides/pending-status/${rideId}?_t=${timestamp}`);
      
      // Debug the response
      console.log(`Status response for ride ${rideId}:`, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error checking ride status for ${rideId}:`, error);
      
      // Check for specific error response
      if (error.response?.status === 404) {
        return { status: 'notfound', message: 'Ride not found' };
      }
      
      // Let the caller handle other errors
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
      
      // Get authentication token for logging purposes
      const token = localStorage.getItem('userToken');
      console.log('Token available before user rides request:', !!token);
      
      // Make request with explicit retry mechanism
      const maxRetries = 2;
      let attempts = 0;
      let response;
      
      while (attempts < maxRetries) {
        try {
          // Make the request with a higher limit to ensure we get ALL rides
          response = await api.get(`/user-rides?_t=${timestamp}&limit=200`);
          // If successful, break out of retry loop
          break;
        } catch (retryError) {
          attempts++;
          console.error(`Attempt ${attempts} failed: ${retryError.message}`);
          
          if (attempts >= maxRetries) {
            throw retryError; // Re-throw if we've exhausted retries
          }
          
          // Wait before retrying (500ms, then 1000ms)
          await new Promise(resolve => setTimeout(resolve, attempts * 500));
        }
      }
      
      // Check for auth issues
      if (response.status === 401 || (response.data && response.data.message === 'Not authenticated')) {
        console.error('Authentication error in getUserRides');
        throw new Error('Please sign in again to view your rides');
      }
      
      if (!response.data) {
        console.error('No data received from server in getUserRides');
        throw new Error('No data received from server');
      }

      // Perform additional validation on the received rides data
      const rides = response.data.rides || [];
      
      // Check if rides data is valid
      if (rides.length > 0) {
        console.log(`Received ${rides.length} rides from server`);
        
        // Log the first ride to help with debugging
        console.log('Sample ride:', {
          id: rides[0]._id,
          source: rides[0].source,
          destination: rides[0].destination,
          status: rides[0].status,
          // Check if user is driver, passenger, or both
          isDriver: rides[0].userRole?.isDriver,
          isPassenger: rides[0].userRole?.isPassenger
        });
        
        // Check for rides that might be incorrectly structured
        const problematicRides = rides.filter(ride => 
          !ride.source || !ride.destination || !ride.date || !ride.departureTime
        );
        
        if (problematicRides.length > 0) {
          console.warn(`Found ${problematicRides.length} problematic rides with missing data`);
        }
      } else {
        console.log('No rides returned from the server');
      }
      
      return {
        success: true,
        rides: rides,
        totalRides: response.data.totalRides || rides.length
      };
    } catch (error) {
      console.error('Error in getUserRides:', error);
      
      // Additional context for debugging
      console.error('Request URL:', '/user-rides');
      console.error('Current user in localStorage:', localStorage.getItem('userToken') ? 'Token exists' : 'No token');
      
      // Try to recover with empty response instead of throwing
      return {
        success: false,
        rides: [],
        totalRides: 0,
        message: error.message || 'Failed to fetch your rides'
      };
    }
  },
  
  // Explicitly refresh and fetch a single ride by ID
  refreshRideStatus: async (rideId) => {
    try {
      console.log(`Explicitly refreshing ride status for: ${rideId}`);
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await api.get(`/rides/${rideId}?_t=${timestamp}`);
      
      if (!response.data) {
        throw new Error('No ride data received');
      }
      
      console.log(`Refreshed ride data:`, response.data);
      
      // If the ride is pending, also check if it's been accepted
      if (response.data.status === 'pending') {
        try {
          const statusResponse = await api.get(`/rides/pending-status/${rideId}?_t=${timestamp}`);
          console.log(`Additional status check for pending ride:`, statusResponse.data);
          
          // If the ride has been accepted, update the status
          if (statusResponse.data.status === 'accepted') {
            response.data.status = 'scheduled';
            response.data.driverId = statusResponse.data.driver;
            console.log(`Ride has been accepted, updated status to scheduled`);
          }
        } catch (statusErr) {
          console.error(`Error checking pending status:`, statusErr);
          // Continue with the main ride data
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error refreshing ride ${rideId}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to refresh ride status');
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
