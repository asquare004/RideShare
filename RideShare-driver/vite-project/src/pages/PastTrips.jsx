import React, { useState } from 'react';
import { motion } from 'framer-motion';

function PastTrips() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Dummy data for past trips
  const pastTrips = [
    {
      id: 1,
      passengerName: "Emily Johnson",
      pickupLocation: "123 Main Street",
      dropoffLocation: "456 Park Avenue",
      completedTime: "2025-03-18T15:30:00",
      fare: 42.50,
      distance: "5.2 miles",
      duration: "25 mins",
      rating: 5,
      status: 'completed'
    },
    {
      id: 2,
      passengerName: "Michael Brown",
      pickupLocation: "789 Oak Road",
      dropoffLocation: "321 Elm Street",
      completedTime: "2025-03-18T13:15:00",
      fare: 28.75,
      distance: "3.5 miles",
      duration: "18 mins",
      rating: 4,
      status: 'completed'
    },
    {
      id: 3,
      passengerName: "Sarah Wilson",
      pickupLocation: "567 Pine Lane",
      dropoffLocation: "890 Cedar Avenue",
      completedTime: "2025-03-18T11:45:00",
      fare: 35.00,
      distance: "4.1 miles",
      duration: "22 mins",
      rating: null,
      status: 'cancelled'
    }
  ];

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredTrips = pastTrips.filter(trip => {
    if (selectedFilter === 'all') return true;
    return trip.status === selectedFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Past Trips</h2>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-md ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                selectedFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                selectedFilter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No past trips found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow ${
                  trip.status === 'cancelled' ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600">Passenger</p>
                    <p className="font-semibold">{trip.passengerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Completed Time</p>
                    <p className="font-semibold">{formatDateTime(trip.completedTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fare</p>
                    <p className="font-semibold text-blue-600">${trip.fare.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pickup Location</p>
                    <p className="font-semibold">{trip.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dropoff Location</p>
                    <p className="font-semibold">{trip.dropoffLocation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Trip Details</p>
                    <p className="font-semibold">{trip.distance} • {trip.duration}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Rating:</span>
                    {trip.rating ? (
                      <div className="flex items-center">
                        {[...Array(trip.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No rating</span>
                    )}
                  </div>
                  <button
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => console.log('View trip details:', trip.id)}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default PastTrips;
