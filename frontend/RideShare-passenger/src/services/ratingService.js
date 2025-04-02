import { api } from '../utils/api';

export const ratingService = {
  // Submit a rating for a ride
  submitRating: async (rideId, rating, comment = '') => {
    try {
      console.log('Submitting rating for ride:', rideId);
      console.log('Rating data:', { rideId, rating, comment });

      // Validate input
      if (!rideId || !rating) {
        throw new Error('Ride ID and rating are required');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const response = await api.post('/ratings/submit', {
        rideId,
        rating,
        comment
      });

      console.log('Submit rating response:', response.data);

      // Return whatever data we get from the API
      return response.data.rating || response.data;
    } catch (error) {
      console.error('Error submitting rating:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data?.message || error.message;
    }
  },

  // Get all ratings for a ride
  getRideRatings: async (rideId) => {
    try {
      console.log('Getting ratings for ride:', rideId);

      if (!rideId) {
        throw new Error('Ride ID is required');
      }

      const response = await api.get(`/ratings/ride/${rideId}`);

      console.log('Get ride ratings response:', response.data);

      // Return the ratings array or an empty array if it doesn't exist
      return response.data.ratings || [];
    } catch (error) {
      console.error('Error getting ride ratings:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data?.message || error.message;
    }
  },

  // Get user's rating for a specific ride
  getUserRating: async (rideId) => {
    try {
      console.log('Getting user rating for ride:', rideId);

      if (!rideId) {
        throw new Error('Ride ID is required');
      }

      const response = await api.get(`/ratings/user/${rideId}`);

      console.log('Get user rating response:', response.data);

      // Return the rating or null if it doesn't exist
      return response.data.rating || null;
    } catch (error) {
      console.error('Error getting user rating:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      // Return null instead of throwing an error for 404s
      if (error.response?.status === 404) {
        console.log('Rating not found, returning null');
        return null;
      }
      throw error.response?.data?.message || error.message;
    }
  }
};