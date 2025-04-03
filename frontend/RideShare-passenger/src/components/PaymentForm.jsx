import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { toast } from 'react-toastify';

const PaymentForm = ({ rideId, amount, onSuccess, onCancel, onError }) => {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [error, setError] = useState(null);
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  console.log("PaymentForm initialized with rideId:", rideId, "amount:", amount);

  // Handler for local error state
  const handleError = (errorMsg) => {
    console.error("Payment error:", errorMsg);
    setError(errorMsg);
    if (onError) {
      onError(errorMsg);
    }
  };

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        // Check if already loaded
        if (window.Razorpay) {
          console.log('Razorpay already loaded');
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        console.log('Loading Razorpay script...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay SDK');
          setRazorpayLoaded(false);
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    // Create a payment order when the component mounts
    const createPaymentOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load Razorpay script
        await loadRazorpayScript();
        
        console.log("Creating payment order for ride:", rideId);
        const response = await paymentService.createPaymentIntent(rideId);
        console.log("Payment order created:", response);
        
        if (response && response.orderId) {
          setOrderId(response.orderId);
          setKeyId(response.keyId);
          console.log("Payment initialized with orderId:", response.orderId);
        } else {
          throw new Error('Invalid payment order response');
        }
      } catch (err) {
        const errorMessage = err.message || 'Failed to initialize payment';
        console.error('Payment setup error:', errorMessage, err);
        handleError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (rideId) {
      createPaymentOrder();
    } else {
      handleError('Missing ride ID for payment');
    }
    
    // Cleanup function to remove script if component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript && !window.Razorpay) {
        document.body.removeChild(existingScript);
      }
    };
  }, [rideId]);

  const openRazorpayCheckout = () => {
    console.log("Opening Razorpay checkout...");
    
    // Check if keyId and orderId are available
    if (!keyId || !orderId) {
      handleError('Payment not initialized correctly. Please try again.');
      return;
    }

    // Check if Razorpay is available
    if (!window.Razorpay) {
      console.error('Razorpay SDK not available');
      handleError('Payment system not available. Please try again later.');
      return;
    }

    try {
      const options = {
        key: keyId,
        amount: Math.round(amount * 100), // Amount in paise
        currency: 'INR',
        name: 'RideShare',
        description: 'Payment for ride',
        order_id: orderId,
        handler: function(response) {
          // Handle successful payment
          handlePaymentSuccess(response);
        },
        prefill: {
          name: 'Passenger',
          email: '',
          contact: ''
        },
        theme: {
          color: '#3B82F6' // Blue color
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed by user');
          }
        }
      };

      console.log('Creating Razorpay instance with options:', options);
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        handleError(`Payment failed: ${response.error.description}`);
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      console.log('Opening Razorpay payment modal');
      razorpayInstance.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      handleError(`Payment gateway error: ${error.message}`);
      toast.error(`Payment gateway error: ${error.message}`);
    }
  };

  // Handle payment success from Razorpay
  const handlePaymentSuccess = async (response) => {
    try {
      setLoading(true);
      console.log('Payment successful:', response);
      
      // Verify payment with backend
      const result = await paymentService.verifyPayment(response, rideId);
      
      if (result.success) {
        console.log('Payment verified successfully:', result);
        toast.success('Payment completed successfully!');
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      const errorMessage = error.message || 'Payment processed but verification failed. Please contact support.';
      toast.error(errorMessage);
      handleError(errorMessage);
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
        {!razorpayLoaded && !isMockPayment && (
          <div className="mt-2 bg-yellow-50 text-yellow-700 p-2 rounded-lg text-sm border border-yellow-100">
            Using alternate payment method
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
        <div className="mb-6">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
            <p className="font-medium">
              {razorpayLoaded 
                ? 'Pay securely with Razorpay' 
                : 'Loading payment system...'}
            </p>
            <p className="text-sm mt-1">
              {razorpayLoaded 
                ? "You'll be redirected to Razorpay's secure payment page" 
                : "Please wait while we connect to the payment gateway"}
            </p>
          </div>
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
            type="button"
            onClick={openRazorpayCheckout}
            disabled={loading || !razorpayLoaded || !keyId || !orderId}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 