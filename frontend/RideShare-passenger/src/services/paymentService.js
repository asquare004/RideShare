import { api } from '../utils/api';

// Fallback key ID in case the API endpoint fails
const FALLBACK_KEY_ID = 'rzp_test_YgWdKrYj6cClno'; // Use actual test key as fallback

export const paymentService = {
  // Get Razorpay key ID
  getConfig: async () => {
    try {
      console.log('Fetching payment config...');
      const response = await api.get('/payments/config');
      console.log('Payment config response:', response.data);
      
      if (!response.data.keyId) {
        throw new Error('Invalid payment configuration: No key ID found');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting payment config:', error);
      throw new Error('Failed to load payment configuration. Please try again later.');
    }
  },

  // Create a payment order
  createPaymentIntent: async (rideId) => {
    if (!rideId) {
      throw new Error('Ride ID is required for payment');
    }
    
    try {
      console.log('Creating payment order for ride:', rideId);

      const response = await api.post('/payments/create-payment-intent', { 
        rideId 
      });

      console.log('Payment order created:', response.data);
      
      if (!response.data.orderId) {
        throw new Error('Invalid payment response: Missing order ID');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in and try again.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Payment service not available. Please try again later.');
      }
      
      // Extract the most descriptive error message
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to create payment order. Please try again.';
      
      throw new Error(errorMessage);
    }
  },

  // Verify payment success
  verifyPayment: async (paymentData, rideId) => {
    if (!paymentData || !rideId) {
      throw new Error('Payment verification requires payment data and ride ID');
    }
    
    try {
      console.log('Verifying payment for ride:', rideId, 'with data:', paymentData);
      
      const response = await api.post('/payments/payment-success', {
        ...paymentData,
        rideId
      });
      
      console.log('Payment verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      
      // Extract descriptive error message
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Payment verification failed. Please contact support.';
      
      throw new Error(errorMessage);
    }
  }
}; 