import React, { useState } from 'react';
import PaymentForm from './PaymentForm';
import { useStripe } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { paymentService } from '../services/paymentService';

// Create a striped promise instance
const stripePromise = loadStripe('pk_test_51O0qhfGvxEqHOaJUR4a7xAwZ5YeXkF9JV4XQsMhPRzBc5WQCx0WAwsldY16pxBXtDu69EKzAMuKrwSZbzTnZgP3T006HcXhCVs');

const PaymentModal = ({ ride, onClose, onSuccess }) => {
  // Calculate total amount to pay based on ride price and booked seats
  const amount = ride.price * (ride.bookedSeats || 1);
  const [error, setError] = useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full relative overflow-hidden">
        {/* Decorative gradient header */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-6 mt-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pay for Your Ride</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">From</p>
                <p className="font-semibold text-gray-800">{ride.from}</p>
              </div>
              <div>
                <p className="text-gray-500">To</p>
                <p className="font-semibold text-gray-800">{ride.to}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-semibold text-gray-800">{new Date(ride.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Seats</p>
                <p className="font-semibold text-gray-800">{ride.bookedSeats || 1}</p>
              </div>
              <div>
                <p className="text-gray-500">Price per seat</p>
                <p className="font-semibold text-gray-800">₹{ride.price?.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="text-lg font-bold text-blue-600">₹{amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-bold">Error: {error}</p>
            <p className="mt-2">Please try again later or contact support.</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <Elements stripe={stripePromise}>
            <PaymentForm 
              rideId={ride.id} 
              amount={amount}
              onSuccess={onSuccess}
              onCancel={onClose}
              onError={setError}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PaymentModal; 