import axios from 'axios';
import { store } from '../redux/store';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // This is crucial for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a utility function to check cookies
const checkCookies = () => {
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  console.log('All cookies:', cookies);
  const hasAuthCookie = cookies.some(cookie => cookie.startsWith('access_token='));
  console.log('Has auth cookie:', hasAuthCookie);
  return hasAuthCookie;
};

// Add a simple interceptor to add the token from store to headers as backup
api.interceptors.request.use(
  (config) => {
    console.log('Using cookie-based authentication');
    
    // Check if cookies are present
    const hasCookie = checkCookies();
    
    // If no cookie, add token from Redux store to Authorization header as backup
    if (!hasCookie) {
      const state = store.getState();
      const token = state.user.currentUser?.token;
      
      if (token) {
        console.log('No cookie found, adding token to Authorization header as backup');
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('No authentication method available');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const rideService = {
  async createRide(rideData) {
    try {
      console.log('Sending ride data:', rideData);
      console.log('Cookies present:', document.cookie);
      
      // Check auth state
      console.log('Current axios default headers:', api.defaults.headers);
      
      // Set a timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 second timeout
      
      try {
        // Make the API call with the configured instance and timeout
        console.log('Sending request with credentials (cookies)');
        const response = await api.post('/rides/create', rideData, {
          signal: controller.signal,
          withCredentials: true // Ensure cookies are sent
        });
        
        clearTimeout(timeoutId); // Clear the timeout if request succeeds
        return response.data;
      } catch (abortError) {
        if (abortError.name === 'AbortError' || abortError.code === 'ECONNABORTED') {
          throw new Error('Request timed out. The server is taking too long to respond.');
        }
        throw abortError; // Re-throw other errors
      }
    } catch (error) {
      console.error('Error in createRide:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Return a more descriptive error message based on status code
        if (error.response.status === 500) {
          throw new Error(error.response.data.message || 'Server error. Please try again later.');
        } else if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Authentication required. Please sign in again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        throw new Error('No response from server. Please check your internet connection.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create ride');
    }
  },

  async getRides(filters = {}) {
    try {
      const response = await api.get('/rides', { params: filters });
      return response.data.rides; // Return the rides array from the response
    } catch (error) {
      console.error('Error fetching rides:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch rides');
    }
  },

  async getRideStats() {
    try {
      const response = await api.get('/rides');
      return {
        totalUpcoming: response.data.totalUpcoming || 0,
        totalLastMonth: response.data.totalLastMonth || 0
      };
    } catch (error) {
      console.error('Error fetching ride stats:', error);
      return { totalUpcoming: 0, totalLastMonth: 0 };
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
  },

  async joinRide(rideId, bookedSeats = 1) {
    try {
      console.log(`Joining ride ${rideId} with ${bookedSeats} seats`);
      
      // Check if rideId is valid
      if (!rideId) {
        throw new Error('Invalid ride ID');
      }
      
      // Get current user from Redux store
      const state = store.getState();
      const currentUser = state.user.currentUser;
      
      if (!currentUser) {
        throw new Error('You must be logged in to join a ride');
      }
      
      console.log('Current user:', currentUser._id);
      
      // Set a timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 second timeout
      
      try {
        // Make the API call with the configured instance and timeout
        console.log('Sending request with credentials (cookies)');
        
        // Create the request payload
        const payload = { 
          bookedSeats,
          // Include user info to help server authenticate
          userId: currentUser._id
        };
        
        const response = await api.post(`/rides/${rideId}/join`, payload, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId); // Clear the timeout if request succeeds
        return response.data;
      } catch (abortError) {
        if (abortError.name === 'AbortError' || abortError.code === 'ECONNABORTED') {
          throw new Error('Request timed out. The server is taking too long to respond.');
        }
        throw abortError; // Re-throw other errors
      }
    } catch (error) {
      console.error('Error in joinRide:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Return a more descriptive error message based on status code
        if (error.response.status === 500) {
          throw new Error(error.response.data.message || 'Server error. Please try again later.');
        } else if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Authentication required. Please sign in again.');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data.message || 'Invalid request. Check your inputs and try again.');
        } else if (error.response.status === 404) {
          throw new Error('Ride not found. It may have been cancelled or removed.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        throw new Error('No response from server. Please check your internet connection.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to join ride');
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
      // This uses the email filter but returns only rides created by the user
      // (not rides they joined)
      const response = await api.get('/rides', { 
        params: { 
          createdByCurrentUser: true 
        } 
      });
      return response.data.rides;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your rides');
    }
  },

  async getMyJoinedRides() {
    try {
      // This returns only rides the user has joined but not created
      const response = await api.get('/rides', { 
        params: { 
          joinedByCurrentUser: true 
        } 
      });
      return response.data.rides;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your joined rides');
    }
  }
};
