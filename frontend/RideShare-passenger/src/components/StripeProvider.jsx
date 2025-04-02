import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { paymentService } from '../services/paymentService';

// Create a lazy-loaded Stripe promise to avoid unnecessary API calls
let stripePromiseCache = null;

const getStripePromise = async () => {
  if (!stripePromiseCache) {
    try {
      const { publishableKey } = await paymentService.getConfig();
      if (publishableKey) {
        stripePromiseCache = loadStripe(publishableKey);
        return stripePromiseCache;
      }
      throw new Error('No publishable key returned from server');
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      throw error;
    }
  }
  return stripePromiseCache;
};

const StripeProvider = ({ children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const promise = await getStripePromise();
        setStripePromise(promise);
      } catch (error) {
        console.error('Stripe initialization error:', error);
        setError(error.message || 'Failed to initialize payment system');
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading payment system...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <p className="mt-2 text-sm">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="text-center py-10">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning: </strong>
          <span className="block sm:inline">Payment system could not be initialized.</span>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider; 