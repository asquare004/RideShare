import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Home() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  // Dummy ride request data
  const dummyRequest = {
    id: 1,
    passengerName: "Alex Smith",
    pickupLocation: "123 Main St",
    dropoffLocation: "456 Park Ave",
    estimatedFare: 25.50,
    distance: "3.2 miles",
    estimatedTime: "15 mins"
  };

  const handleToggleStatus = () => {
    setIsOnline(!isOnline);
  };

  const handleAcceptRide = () => {
    // TODO: Implement ride acceptance logic
    console.log('Ride accepted');
    setCurrentRequest(null);
  };

  const handleDeclineRide = () => {
    // TODO: Implement ride decline logic
    console.log('Ride declined');
    setCurrentRequest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Driver Dashboard</h2>
              <p className="text-gray-600">Welcome back!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-block w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-md text-white ${
                  isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } transition-colors`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>

          {isOnline && !currentRequest && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Waiting for ride requests...</p>
            </div>
          )}

          {isOnline && currentRequest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 bg-gray-50 rounded-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">New Ride Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600">Passenger</p>
                  <p className="font-semibold">{dummyRequest.passengerName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Fare</p>
                  <p className="font-semibold">${dummyRequest.estimatedFare}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pickup Location</p>
                  <p className="font-semibold">{dummyRequest.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dropoff Location</p>
                  <p className="font-semibold">{dummyRequest.dropoffLocation}</p>
                </div>
                <div>
                  <p className="text-gray-600">Distance</p>
                  <p className="font-semibold">{dummyRequest.distance}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Time</p>
                  <p className="font-semibold">{dummyRequest.estimatedTime}</p>
                </div>
              </div>
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleAcceptRide}
                  className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  Accept Ride
                </button>
                <button
                  onClick={handleDeclineRide}
                  className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          )}

          {!isOnline && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 text-center">
                You are currently offline. Go online to start receiving ride requests.
              </p>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Earnings</h3>
            <p className="text-3xl font-bold text-blue-600">$145.50</p>
            <p className="text-sm text-gray-600 mt-1">From 6 trips</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating</h3>
            <p className="text-3xl font-bold text-blue-600">4.8</p>
            <p className="text-sm text-gray-600 mt-1">Last 50 trips</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Online</h3>
            <p className="text-3xl font-bold text-blue-600">5.2h</p>
            <p className="text-sm text-gray-600 mt-1">Today</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;
