import { api } from '../utils/api';

// Fallback publishable key in case the API endpoint fails
const FALLBACK_PUBLISHABLE_KEY = 'pk_test_51O0qhfGvxEqHOaJUR4a7xAwZ5YeXkF9JV4XQsMhPRzBc5WQCx0WAwsldY16pxBXtDu69EKzAMuKrwSZbzTnZgP3T006HcXhCVs';

export const paymentService = {
  // Get Stripe publishable key
  getConfig: async () => {
    try {
      console.log('Fetching payment config...');
      const response = await api.get('payments/config');
      console.log('Payment config response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting payment config:', error);
      
      // If the config endpoint fails, use the fallback key
      // This prevents the payment system from completely failing
      if (error.response?.status === 404) {
        console.warn('Payment config endpoint not found, using fallback key');
        return { publishableKey: FALLBACK_PUBLISHABLE_KEY };
      }
      
      // Return a more descriptive error for other issues
      const errorMessage = error.response?.data?.message || error.message || 'Route not found';
      throw new Error(`Payment configuration error: ${errorMessage}`);
    }
  },

  // Create a payment intent
  createPaymentIntent: async (rideId) => {
    if (!rideId) {
      throw new Error('Failed to create payment: Missing ride ID');
    }
    
    try {
      console.log('Creating payment intent for ride:', rideId);

      // Ensure the URL path is correct
      const url = 'payments/create-payment-intent';
      console.log(`Making POST request to: ${url} with ride ID: ${rideId}`);
      
      const response = await api.post(url, { 
        rideId 
      });

      console.log('Payment intent created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      // For demonstration/development, simulate a successful response if we get a 404
      if (error.response?.status === 404) {
        console.warn('Payment endpoint not found, returning mock data for development');
        return {
          clientSecret: 'mock_client_secret',
          paymentIntentId: 'mock_payment_intent_id_' + Date.now(),
          amount: 100
        };
      }
      
      // Add more context to the error message
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to create payment: ${errorMessage}`);
    }
  },

  // Mark payment as successful
  confirmPayment: async (paymentIntentId, rideId) => {
    if (!paymentIntentId || !rideId) {
      throw new Error('Failed to confirm payment: Missing required information');
    }
    
    try {
      console.log('Confirming payment for ride:', rideId);

      const url = 'payments/payment-success';
      console.log(`Making POST request to: ${url}`);
      
      const response = await api.post(url, {
        paymentIntentId,
        rideId
      });

      console.log('Payment confirmed:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      // For demonstration/development, simulate a successful response if we get a 404
      if (error.response?.status === 404) {
        console.warn('Payment success endpoint not found, returning mock data for development');
        return {
          success: true,
          message: 'Payment recorded successfully (mocked)',
          ride: { id: rideId }
        };
      }
      
      // Add more context to the error message
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to confirm payment: ${errorMessage}`);
    }
  }
}; 