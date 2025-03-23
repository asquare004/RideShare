import React from 'react';
import { motion } from 'framer-motion';

function UpcomingTrips() {
  // Dummy data for upcoming trips
  const upcomingTrips = [
    {
      id: 1,
      passengerName: "John Doe",
      pickupLocation: "789 Oak Street",
      dropoffLocation: "321 Pine Avenue",
      scheduledTime: "2025-03-19T14:30:00",
      estimatedFare: 35.00,
      distance: "4.5 miles",
    },
    {
      id: 2,
      passengerName: "Jane Smith",
      pickupLocation: "456 Maple Drive",
      dropoffLocation: "987 Cedar Lane",
      scheduledTime: "2025-03-19T16:15:00",
      estimatedFare: 28.50,
      distance: "3.8 miles",
    }
  ];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Trips</h2>
        
        {upcomingTrips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No upcoming trips scheduled</p>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600">Passenger</p>
                    <p className="font-semibold">{trip.passengerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Scheduled Time</p>
                    <p className="font-semibold">{formatTime(trip.scheduledTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estimated Fare</p>
                    <p className="font-semibold text-blue-600">${trip.estimatedFare.toFixed(2)}</p>
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
                    <p className="text-gray-600">Distance</p>
                    <p className="font-semibold">{trip.distance}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                    onClick={() => console.log('Cancel trip:', trip.id)}
                  >
                    Cancel Trip
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => console.log('View details:', trip.id)}
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

export default UpcomingTrips;
