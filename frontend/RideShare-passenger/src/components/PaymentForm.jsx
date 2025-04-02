import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../services/paymentService';
import { toast } from 'react-toastify';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const PaymentForm = ({ rideId, amount, onSuccess, onCancel, onError }) => {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [error, setError] = useState(null);
  const [isMockPayment, setIsMockPayment] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();

  // Handler for local error state
  const handleError = (errorMsg) => {
    setError(errorMsg);
    if (onError) {
      onError(errorMsg);
    }
  };

  useEffect(() => {
    // Create a payment intent when the component mounts
    const getPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await paymentService.createPaymentIntent(rideId);
        
        // Check if we're using mock data
        if (response.clientSecret && response.clientSecret.startsWith('mock_')) {
          console.log('Using mock payment data for development');
          setIsMockPayment(true);
        }
        
        setClientSecret(response.clientSecret);
        setPaymentIntentId(response.paymentIntentId);
      } catch (err) {
        const errorMessage = err.message || 'Failed to initialize payment';
        handleError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (rideId) {
      getPaymentIntent();
    }
  }, [rideId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // If using mock payment (for development without backend)
      if (isMockPayment) {
        console.log('Processing mock payment...');
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Confirm the payment on the backend
        await paymentService.confirmPayment(paymentIntentId, rideId);
        
        toast.success('Payment successful! (Development mode)');
        onSuccess && onSuccess();
        return;
      }

      if (!stripe || !elements) {
        // Stripe.js has not loaded yet
        handleError('Payment processor not available. Please try again.');
        return;
      }

      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (result.error) {
        // Show error to your customer
        handleError(result.error.message);
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Payment succeeded, update ride status
        await paymentService.confirmPayment(paymentIntentId, rideId);
        
        toast.success('Payment successful!');
        // Call onSuccess to trigger UI update in parent components
        onSuccess && onSuccess();
      }
    } catch (err) {
      const errorMessage = err.message || 'Payment failed';
      handleError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error && onError) {
    // If we have an error and an error handler, don't render the form
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Payment</h2>
        <p className="text-lg font-medium text-blue-600">
          Amount: ₹{(amount).toFixed(2)}
        </p>
        {isMockPayment && (
          <div className="mt-2 bg-blue-50 text-blue-700 p-2 rounded-lg text-sm border border-blue-100">
            Development Mode: Using simulated payment
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Card Details
          </label>
          <div className="bg-white border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            For testing, use card number: 4242 4242 4242 4242
          </p>
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (!isMockPayment && (!stripe || !clientSecret))}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 